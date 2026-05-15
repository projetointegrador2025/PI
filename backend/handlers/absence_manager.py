import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.response import success, error
from shared.dynamo import get_table
from shared.auth import require_groups, get_user_id


def handler(event, context):
    method = event["httpMethod"]

    if method == "OPTIONS":
        return success({"message": "ok"})

    if method == "GET":
        return _get_absences(event)
    elif method == "POST":
        return _post_absence(event)

    return error("Método não suportado", 405)


def _get_absences(event):
    if not require_groups(event, ["Admin", "Teacher", "Student"]):
        return error("Acesso negado", 403)

    params = event.get("queryStringParameters") or {}
    student_id = params.get("student_id")
    teacher_id = params.get("teacher_id")

    table = get_table("ABSENCES_TABLE")

    if student_id:
        from boto3.dynamodb.conditions import Key
        response = table.query(
            KeyConditionExpression=Key("entity_id").eq(f"STUDENT#{student_id}")
        )
    elif teacher_id:
        from boto3.dynamodb.conditions import Key
        response = table.query(
            KeyConditionExpression=Key("entity_id").eq(f"TEACHER#{teacher_id}")
        )
    else:
        return error("student_id ou teacher_id é obrigatório")

    items = response.get("Items", [])
    # Normalizar resposta
    result = []
    for item in items:
        result.append({
            "subject_id": item.get("subject_id", ""),
            "absences": int(item.get("absences", 0)),
        })

    return success({"data": result})


def _post_absence(event):
    if not require_groups(event, ["Admin", "Teacher"]):
        return error("Acesso negado", 403)

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    entity_type = body.get("entity_type", "student")  # "student" ou "teacher"
    entity_id = body.get("entity_id")
    subject_id = body.get("subject_id")
    absences = body.get("absences")

    if not entity_id or not subject_id or absences is None:
        return error("entity_id, subject_id e absences são obrigatórios")

    table = get_table("ABSENCES_TABLE")

    prefix = "STUDENT" if entity_type == "student" else "TEACHER"

    table.put_item(Item={
        "entity_id": f"{prefix}#{entity_id}",
        "subject_id": subject_id,
        "absences": int(absences),
    })

    return success({"message": "Falta registrada com sucesso"}, 201)
