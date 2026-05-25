import json
import uuid
import sys
import os
import boto3

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.response import success, error
from shared.dynamo import get_table
from shared.auth import require_groups

cognito_client = boto3.client("cognito-idp")
USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "")


def handler(event, context):
    try:
        method = event["httpMethod"]
        path_params = event.get("pathParameters") or {}

        if method == "OPTIONS":
            return success({"message": "ok"})

        if method == "GET":
            return _get_teachers(event, path_params)
        elif method == "POST":
            return _create_teacher(event)
        elif method == "PUT":
            return _update_teacher(event, path_params)
        elif method == "DELETE":
            return _delete_teacher(event, path_params)

        return error("Método não suportado", 405)
    except Exception as e:
        return error(f"Erro interno: {str(e)}", 500)


def _get_teachers(event, path_params):
    table = get_table("TEACHERS_TABLE")

    teacher_id = path_params.get("id")

    # GET /teachers/me - professor logado busca seus próprios dados
    if teacher_id == "me":
        if not require_groups(event, ["Teacher"]):
            return error("Acesso negado", 403)
        from shared.auth import get_user_id
        user_id = get_user_id(event)
        from boto3.dynamodb.conditions import Attr
        response = table.scan(FilterExpression=Attr("user_id").eq(user_id))
        items = response.get("Items", [])
        if not items:
            return error("Professor não encontrado", 404)
        return success({"data": items[0]})

    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    if teacher_id:
        response = table.get_item(Key={"teacher_id": teacher_id})
        item = response.get("Item")
        if not item:
            return error("Professor não encontrado", 404)
        return success({"data": item})

    response = table.scan()
    return success({"data": response.get("Items", [])})


def _create_teacher(event):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    required_fields = ["name", "email", "cpf", "subjects"]
    for field in required_fields:
        if field not in body:
            return error(f"Campo obrigatório ausente: {field}")

    subjects = body["subjects"]
    if not isinstance(subjects, list) or len(subjects) == 0:
        return error("É necessário ao menos uma disciplina")

    users_table = get_table("USERS_TABLE")
    teachers_table = get_table("TEACHERS_TABLE")

    teacher_id = str(uuid.uuid4())

    # Criar usuário no Cognito
    email = body["email"]
    try:
        cognito_response = cognito_client.admin_create_user(
            UserPoolId=USER_POOL_ID,
            Username=email,
            UserAttributes=[
                {"Name": "email", "Value": email},
                {"Name": "email_verified", "Value": "true"},
                {"Name": "name", "Value": body["name"]},
            ],
            DesiredDeliveryMediums=["EMAIL"],
        )
        user_id = cognito_response["User"]["Username"]

        # Adicionar ao grupo Teacher
        cognito_client.admin_add_user_to_group(
            UserPoolId=USER_POOL_ID,
            Username=email,
            GroupName="Teacher",
        )
    except cognito_client.exceptions.UsernameExistsException:
        return error("Já existe um usuário com este email")
    except Exception as e:
        return error(f"Erro ao criar usuário no Cognito: {str(e)}")

    users_table.put_item(Item={
        "user_id": user_id,
        "name": body["name"],
        "email": email,
        "role": "teacher",
    })

    teacher_item = {
        "teacher_id": teacher_id,
        "user_id": user_id,
        "name": body["name"],
        "subjects": subjects,
        "cpf": body["cpf"],
    }

    # Campos opcionais
    if body.get("address"):
        teacher_item["address"] = body["address"]

    if body.get("classes"):
        teacher_item["classes"] = body["classes"]  # Lista de class_ids

    if body.get("schedule"):
        teacher_item["schedule"] = body["schedule"]  # Lista de {class_id, day_of_week, time}

    teachers_table.put_item(Item=teacher_item)

    # Sincronizar horários na tabela de grade
    if body.get("schedule"):
        _sync_schedule(teacher_id, body["name"], subjects, body["schedule"])

    return success({"data": {"teacher_id": teacher_id, "user_id": user_id}}, 201)


def _update_teacher(event, path_params):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    teacher_id = path_params.get("id")
    if not teacher_id:
        return error("ID do professor é obrigatório")

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    table = get_table("TEACHERS_TABLE")

    # Buscar professor existente
    response = table.get_item(Key={"teacher_id": teacher_id})
    item = response.get("Item")
    if not item:
        return error("Professor não encontrado", 404)

    # Atualizar campos fornecidos
    update_fields = ["name", "subjects", "cpf", "address", "classes", "schedule"]
    for field in update_fields:
        if field in body:
            item[field] = body[field]

    table.put_item(Item=item)

    # Sincronizar horários na tabela de grade
    if "schedule" in body:
        teacher_name = item.get("name", "")
        teacher_subjects = item.get("subjects", [])
        _sync_schedule(teacher_id, teacher_name, teacher_subjects, body["schedule"])

    return success({"message": "Professor atualizado com sucesso"})


def _sync_schedule(teacher_id, teacher_name, subjects, schedule_entries):
    """Sincroniza os horários do professor na tabela CLASS_SCHEDULE_TABLE."""
    schedule_table = get_table("CLASS_SCHEDULE_TABLE")

    # Remover horários antigos deste professor
    response = schedule_table.scan()
    existing = response.get("Items", [])
    for item in existing:
        if item.get("teacher_id") == teacher_id:
            schedule_table.delete_item(Key={
                "class_id": item["class_id"],
                "day_time": item["day_time"],
            })

    # Inserir novos horários
    # Determinar a disciplina: usa a primeira do professor se só tem uma
    default_subject = subjects[0] if subjects else ""

    for entry in schedule_entries:
        class_id = entry.get("class_id", "")
        day_of_week = entry.get("day_of_week", "")
        time = entry.get("time", "")
        subject = entry.get("subject", default_subject)

        if not class_id or not day_of_week or not time:
            continue

        day_time = f"{day_of_week}#{time}"
        schedule_table.put_item(Item={
            "class_id": class_id,
            "day_time": day_time,
            "day_of_week": day_of_week,
            "time": time,
            "subject": subject,
            "teacher_id": teacher_id,
            "teacher_name": teacher_name,
        })


def _delete_teacher(event, path_params):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    teacher_id = path_params.get("id")
    if not teacher_id:
        return error("ID do professor é obrigatório")

    teachers_table = get_table("TEACHERS_TABLE")
    users_table = get_table("USERS_TABLE")

    # Buscar professor para obter user_id
    response = teachers_table.get_item(Key={"teacher_id": teacher_id})
    item = response.get("Item")

    if item and item.get("user_id"):
        user_id = item["user_id"]

        # Buscar email na tabela de users
        user_response = users_table.get_item(Key={"user_id": user_id})
        user_item = user_response.get("Item")

        if user_item and user_item.get("email"):
            # Deletar usuário do Cognito
            try:
                cognito_client.admin_delete_user(
                    UserPoolId=USER_POOL_ID,
                    Username=user_item["email"],
                )
            except Exception:
                pass  # Se falhar no Cognito, continua removendo dos bancos

        # Remover da tabela de users
        users_table.delete_item(Key={"user_id": user_id})

    teachers_table.delete_item(Key={"teacher_id": teacher_id})

    # Limpar horários do professor na tabela de grade
    _sync_schedule(teacher_id, "", [], [])

    return success({"message": "Professor removido com sucesso"})
