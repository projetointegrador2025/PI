import json
import uuid
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.response import success, error
from shared.dynamo import get_table
from shared.auth import require_groups


def handler(event, context):
    try:
        method = event["httpMethod"]
        path_params = event.get("pathParameters") or {}

        if method == "OPTIONS":
            return success({"message": "ok"})

        if method == "GET":
            return _get_guardians(event)
        elif method == "POST":
            return _create_guardian(event)
        elif method == "DELETE":
            return _delete_guardian(event, path_params)

        return error("Método não suportado", 405)
    except Exception as e:
        return error(f"Erro interno: {str(e)}", 500)


def _get_guardians(event):
    if not require_groups(event, ["Admin", "Teacher"]):
        return error("Acesso negado", 403)

    params = event.get("queryStringParameters") or {}
    student_id = params.get("student_id")

    if not student_id:
        return error("student_id é obrigatório")

    sg_table = get_table("STUDENT_GUARDIANS_TABLE")
    guardians_table = get_table("GUARDIANS_TABLE")

    from boto3.dynamodb.conditions import Key
    response = sg_table.query(KeyConditionExpression=Key("student_id").eq(student_id))
    links = response.get("Items", [])

    guardians = []
    for link in links:
        g = guardians_table.get_item(Key={"guardian_id": link["guardian_id"]})
        if "Item" in g:
            guardians.append(g["Item"])

    return success({"data": guardians})


def _create_guardian(event):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    required_fields = ["student_id", "name", "cpf", "phone", "email", "relationship_type"]
    for field in required_fields:
        if field not in body:
            return error(f"Campo obrigatório ausente: {field}")

    guardians_table = get_table("GUARDIANS_TABLE")
    sg_table = get_table("STUDENT_GUARDIANS_TABLE")

    guardian_id = str(uuid.uuid4())

    guardians_table.put_item(Item={
        "guardian_id": guardian_id,
        "name": body["name"],
        "cpf": body["cpf"],
        "phone": body["phone"],
        "email": body["email"],
        "relationship_type": body["relationship_type"],
    })

    sg_table.put_item(Item={
        "student_id": body["student_id"],
        "guardian_id": guardian_id,
    })

    return success({"data": {"guardian_id": guardian_id}}, 201)


def _delete_guardian(event, path_params):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    guardian_id = path_params.get("id")
    if not guardian_id:
        return error("ID do responsável é obrigatório")

    params = event.get("queryStringParameters") or {}
    student_id = params.get("student_id")
    if not student_id:
        return error("student_id é obrigatório para remoção")

    # Verificar se o aluno ficará sem responsável
    sg_table = get_table("STUDENT_GUARDIANS_TABLE")
    from boto3.dynamodb.conditions import Key
    response = sg_table.query(KeyConditionExpression=Key("student_id").eq(student_id))
    links = response.get("Items", [])

    if len(links) <= 1:
        return error("Não é possível remover o último responsável do aluno")

    sg_table.delete_item(Key={"student_id": student_id, "guardian_id": guardian_id})

    return success({"message": "Responsável removido com sucesso"})
