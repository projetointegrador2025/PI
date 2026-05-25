import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.response import success, error
from shared.dynamo import get_table
from shared.auth import require_groups


def handler(event, context):
    try:
        method = event["httpMethod"]

        if method == "OPTIONS":
            return success({"message": "ok"})

        if method == "GET":
            return _get_teacher_absences(event)
        elif method == "POST":
            return _post_teacher_absence(event)

        return error("Método não suportado", 405)
    except Exception as e:
        return error(f"Erro interno: {str(e)}", 500)


def _get_teacher_absences(event):
    if not require_groups(event, ["Admin", "Teacher"]):
        return error("Acesso negado", 403)

    params = event.get("queryStringParameters") or {}
    teacher_id = params.get("teacher_id")

    table = get_table("TEACHER_ABSENCES_TABLE")

    if teacher_id:
        from boto3.dynamodb.conditions import Key
        response = table.query(KeyConditionExpression=Key("teacher_id").eq(teacher_id))
    else:
        response = table.scan()

    return success({"data": response.get("Items", [])})


def _post_teacher_absence(event):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    required_fields = ["teacher_id", "date"]
    for field in required_fields:
        if field not in body:
            return error(f"Campo obrigatório ausente: {field}")

    table = get_table("TEACHER_ABSENCES_TABLE")

    table.put_item(Item={
        "teacher_id": body["teacher_id"],
        "date": body["date"],
        "reason": body.get("reason", ""),
    })

    return success({"message": "Falta registrada"}, 201)
