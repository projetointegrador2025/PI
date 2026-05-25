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
            return _get_schedule(event)

        return error("Método não suportado", 405)
    except Exception as e:
        return error(f"Erro interno: {str(e)}", 500)


def _get_schedule(event):
    if not require_groups(event, ["Admin", "Teacher", "Student"]):
        return error("Acesso negado", 403)

    params = event.get("queryStringParameters") or {}
    class_id = params.get("class_id")

    if not class_id:
        return error("class_id é obrigatório")

    # Resolver "current" para a turma do aluno logado
    if class_id == "current":
        from shared.auth import get_user_id
        from boto3.dynamodb.conditions import Attr
        user_id = get_user_id(event)
        students_table = get_table("STUDENTS_TABLE")
        response = students_table.scan(FilterExpression=Attr("user_id").eq(user_id))
        items = response.get("Items", [])
        if not items:
            return success({"data": []})
        class_id = items[0].get("class_id", "")
        if not class_id:
            return success({"data": []})

    table = get_table("CLASS_SCHEDULE_TABLE")
    from boto3.dynamodb.conditions import Key
    response = table.query(KeyConditionExpression=Key("class_id").eq(class_id))

    return success({"data": response.get("Items", [])})
