import json
import uuid
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.response import success, error
from shared.dynamo import get_table
from shared.auth import require_groups


def handler(event, context):
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


def _get_teachers(event, path_params):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    table = get_table("TEACHERS_TABLE")

    teacher_id = path_params.get("id")
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

    user_id = str(uuid.uuid4())
    teacher_id = str(uuid.uuid4())

    users_table.put_item(Item={
        "user_id": user_id,
        "name": body["name"],
        "email": body["email"],
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

    return success({"message": "Professor atualizado com sucesso"})


def _delete_teacher(event, path_params):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    teacher_id = path_params.get("id")
    if not teacher_id:
        return error("ID do professor é obrigatório")

    teachers_table = get_table("TEACHERS_TABLE")
    teachers_table.delete_item(Key={"teacher_id": teacher_id})

    return success({"message": "Professor removido com sucesso"})
