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
        return _get_grades(event)
    elif method == "POST":
        return _post_grade(event)

    return error("Método não suportado", 405)


def _get_grades(event):
    if not require_groups(event, ["Admin", "Teacher", "Student"]):
        return error("Acesso negado", 403)

    params = event.get("queryStringParameters") or {}
    student_id = params.get("student_id")

    if not student_id:
        return error("student_id é obrigatório")

    table = get_table("GRADES_TABLE")
    from boto3.dynamodb.conditions import Key
    response = table.query(KeyConditionExpression=Key("student_id").eq(student_id))

    return success({"data": response.get("Items", [])})


def _post_grade(event):
    if not require_groups(event, ["Teacher"]):
        return error("Acesso negado", 403)

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    required_fields = ["student_id", "subject_id", "grade"]
    for field in required_fields:
        if field not in body:
            return error(f"Campo obrigatório ausente: {field}")

    teacher_id = get_user_id(event)
    table = get_table("GRADES_TABLE")

    table.put_item(Item={
        "student_id": body["student_id"],
        "subject_id": body["subject_id"],
        "teacher_id": teacher_id,
        "grade": str(body["grade"]),
    })

    return success({"message": "Nota registrada com sucesso"}, 201)
