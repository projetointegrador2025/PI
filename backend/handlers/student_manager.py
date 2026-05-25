import json
import uuid
import sys
import os
import boto3

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.response import success, error
from shared.dynamo import get_table
from shared.auth import require_groups, get_user_id

cognito_client = boto3.client("cognito-idp")
USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "")


def handler(event, context):
    try:
        method = event["httpMethod"]
        path_params = event.get("pathParameters") or {}

        if method == "OPTIONS":
            return success({"message": "ok"})

        if method == "GET":
            return _get_students(event, path_params)
        elif method == "POST":
            return _create_student(event)
        elif method == "PUT":
            return _update_student(event, path_params)
        elif method == "DELETE":
            return _delete_student(event, path_params)

        return error("Método não suportado", 405)
    except Exception as e:
        return error(f"Erro interno: {str(e)}", 500)


def _get_students(event, path_params):
    if not require_groups(event, ["Admin", "Teacher"]):
        return error("Acesso negado", 403)

    table = get_table("STUDENTS_TABLE")

    student_id = path_params.get("id")
    if student_id:
        response = table.get_item(Key={"student_id": student_id})
        item = response.get("Item")
        if not item:
            return error("Aluno não encontrado", 404)
        return success({"data": item})

    # Suporte a filtro por turma
    params = event.get("queryStringParameters") or {}
    class_id = params.get("class_id")

    if class_id:
        from boto3.dynamodb.conditions import Attr
        response = table.scan(FilterExpression=Attr("class_id").eq(class_id))
    else:
        response = table.scan()

    items = response.get("Items", [])

    return success({"data": items})


def _create_student(event):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    required_fields = ["name", "class_id", "birth_date", "cpf", "ra"]
    for field in required_fields:
        if field not in body:
            return error(f"Campo obrigatório ausente: {field}")

    # Suporte a múltiplos responsáveis
    guardians_data = body.get("guardians", [])
    if not guardians_data and body.get("guardian"):
        guardians_data = [body["guardian"]]

    if not guardians_data:
        return error("É necessário ao menos um responsável")

    guardian_required = ["name", "cpf", "phone", "email", "relationship_type"]
    for i, guardian in enumerate(guardians_data):
        for field in guardian_required:
            if field not in guardian:
                return error(f"Campo do responsável {i+1} ausente: {field}")

    users_table = get_table("USERS_TABLE")
    students_table = get_table("STUDENTS_TABLE")
    guardians_table = get_table("GUARDIANS_TABLE")
    sg_table = get_table("STUDENT_GUARDIANS_TABLE")

    student_id = str(uuid.uuid4())

    # Criar usuário no Cognito
    email = body.get("email", "")
    if not email:
        return error("Campo 'email' é obrigatório para criar acesso do aluno")

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

        # Adicionar ao grupo Student
        cognito_client.admin_add_user_to_group(
            UserPoolId=USER_POOL_ID,
            Username=email,
            GroupName="Student",
        )
    except cognito_client.exceptions.UsernameExistsException:
        return error("Já existe um usuário com este email")
    except Exception as e:
        return error(f"Erro ao criar usuário no Cognito: {str(e)}")

    users_table.put_item(Item={
        "user_id": user_id,
        "name": body["name"],
        "email": email,
        "role": "student",
    })

    student_item = {
        "student_id": student_id,
        "user_id": user_id,
        "name": body["name"],
        "class_id": body["class_id"],
        "birth_date": body["birth_date"],
        "cpf": body["cpf"],
        "ra": body["ra"],
    }

    # Endereço (opcional)
    if body.get("address"):
        student_item["address"] = body["address"]

    students_table.put_item(Item=student_item)

    # Criar responsáveis
    for guardian in guardians_data:
        guardian_id = str(uuid.uuid4())
        guardians_table.put_item(Item={
            "guardian_id": guardian_id,
            "name": guardian["name"],
            "cpf": guardian["cpf"],
            "phone": guardian["phone"],
            "email": guardian["email"],
            "relationship_type": guardian["relationship_type"],
        })
        sg_table.put_item(Item={
            "student_id": student_id,
            "guardian_id": guardian_id,
        })

    return success({"data": {"student_id": student_id, "user_id": user_id}}, 201)


def _update_student(event, path_params):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    student_id = path_params.get("id")
    if not student_id:
        return error("ID do aluno é obrigatório")

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    students_table = get_table("STUDENTS_TABLE")

    # Buscar aluno existente
    response = students_table.get_item(Key={"student_id": student_id})
    item = response.get("Item")
    if not item:
        return error("Aluno não encontrado", 404)

    # Atualizar campos fornecidos
    update_fields = ["name", "class_id", "birth_date", "cpf", "ra", "address"]
    for field in update_fields:
        if field in body:
            item[field] = body[field]

    students_table.put_item(Item=item)

    return success({"message": "Aluno atualizado com sucesso"})


def _delete_student(event, path_params):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    student_id = path_params.get("id")
    if not student_id:
        return error("ID do aluno é obrigatório")

    students_table = get_table("STUDENTS_TABLE")
    users_table = get_table("USERS_TABLE")

    # Buscar aluno para obter user_id
    response = students_table.get_item(Key={"student_id": student_id})
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

    students_table.delete_item(Key={"student_id": student_id})

    return success({"message": "Aluno removido com sucesso"})
