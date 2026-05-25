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
            return _get_absences(event)
        elif method == "POST":
            return _post_absence(event)

        return error("Método não suportado", 405)
    except Exception as e:
        return error(f"Erro interno: {str(e)}", 500)


def _get_absences(event):
    if not require_groups(event, ["Admin", "Teacher", "Student"]):
        return error("Acesso negado", 403)

    params = event.get("queryStringParameters") or {}
    student_id = params.get("student_id")
    teacher_id = params.get("teacher_id")

    table = get_table("ABSENCES_TABLE")

    if student_id:
        # Resolver "current" para o aluno logado
        if student_id == "current":
            from shared.auth import get_user_id
            from boto3.dynamodb.conditions import Attr
            user_id = get_user_id(event)
            students_table = get_table("STUDENTS_TABLE")
            response = students_table.scan(FilterExpression=Attr("user_id").eq(user_id))
            items = response.get("Items", [])
            if not items:
                return success({"data": []})
            student_id = items[0].get("student_id", "")

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
    result = []
    for item in items:
        result.append({
            "subject_id": item.get("subject_id", ""),
            "absences": int(item.get("absences", 0)),
            "bimester": int(item.get("bimester", 1)),
        })

    return success({"data": result})


def _post_absence(event):
    if not require_groups(event, ["Admin", "Teacher"]):
        return error("Acesso negado", 403)

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    entity_type = body.get("entity_type", "student")
    entity_id = body.get("entity_id")
    subject_id = body.get("subject_id")
    bimester = body.get("bimester", 1)

    if not entity_id or not subject_id:
        return error("entity_id e subject_id são obrigatórios")

    table = get_table("ABSENCES_TABLE")
    prefix = "STUDENT" if entity_type == "student" else "TEACHER"
    sort_key = f"{subject_id}#B{bimester}"

    # Incrementar faltas (get + put)
    pk = f"{prefix}#{entity_id}"
    try:
        existing = table.get_item(Key={"entity_id": pk, "sort_key": sort_key})
        current = int(existing.get("Item", {}).get("absences", 0))
    except Exception:
        current = 0

    table.put_item(Item={
        "entity_id": pk,
        "sort_key": sort_key,
        "subject_id": subject_id,
        "bimester": int(bimester),
        "absences": current + 1,
    })

    return success({"message": "Falta registrada com sucesso"}, 201)
