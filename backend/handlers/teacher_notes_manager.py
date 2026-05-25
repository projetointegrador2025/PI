import json
import uuid
import sys
import os
from datetime import datetime, timezone, timedelta

BRT = timezone(timedelta(hours=-3))

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.response import success, error
from shared.dynamo import get_table
from shared.auth import require_groups, get_user_id


def handler(event, context):
    try:
        method = event["httpMethod"]

        if method == "OPTIONS":
            return success({"message": "ok"})

        if method == "GET":
            return _get_notes(event)
        elif method == "POST":
            return _create_note(event)

        return error("Método não suportado", 405)
    except Exception as e:
        return error(f"Erro interno: {str(e)}", 500)


def _get_notes(event):
    if not require_groups(event, ["Teacher"]):
        return error("Acesso negado", 403)

    params = event.get("queryStringParameters") or {}
    student_id = params.get("student_id")

    if not student_id:
        return error("student_id é obrigatório")

    table = get_table("TEACHER_NOTES_TABLE")
    from boto3.dynamodb.conditions import Key
    response = table.query(KeyConditionExpression=Key("student_id").eq(student_id))

    return success({"data": response.get("Items", [])})


def _create_note(event):
    if not require_groups(event, ["Teacher"]):
        return error("Acesso negado", 403)

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    required_fields = ["student_id", "note"]
    for field in required_fields:
        if field not in body:
            return error(f"Campo obrigatório ausente: {field}")

    teacher_id = get_user_id(event)
    note_id = str(uuid.uuid4())
    table = get_table("TEACHER_NOTES_TABLE")

    table.put_item(Item={
        "student_id": body["student_id"],
        "note_id": note_id,
        "teacher_id": teacher_id,
        "note": body["note"],
        "created_at": datetime.now(BRT).isoformat(),
    })

    return success({"data": {"note_id": note_id}}, 201)
