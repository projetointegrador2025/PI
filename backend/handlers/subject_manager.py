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
            return _get_subjects(event)
        elif method == "POST":
            return _create_subjects(event)

        return error("Método não suportado", 405)
    except Exception as e:
        return error(f"Erro interno: {str(e)}", 500)


def _get_subjects(event):
    if not require_groups(event, ["Admin", "Teacher", "Student"]):
        return error("Acesso negado", 403)

    table = get_table("SUBJECTS_TABLE")
    response = table.scan()
    items = response.get("Items", [])
    subjects = [item.get("name", "") for item in items]

    return success({"data": subjects})


def _create_subjects(event):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    subjects = body.get("subjects", [])
    if not subjects:
        return error("Lista de subjects é obrigatória")

    table = get_table("SUBJECTS_TABLE")
    for subject in subjects:
        table.put_item(Item={"subject_id": subject, "name": subject})

    return success({"data": subjects}, 201)
