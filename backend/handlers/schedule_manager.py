import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.response import success, error
from shared.dynamo import get_table
from shared.auth import require_groups


def handler(event, context):
    method = event["httpMethod"]

    if method == "OPTIONS":
        return success({"message": "ok"})

    if method == "GET":
        return _get_schedule(event)

    return error("Método não suportado", 405)


def _get_schedule(event):
    if not require_groups(event, ["Admin", "Teacher", "Student"]):
        return error("Acesso negado", 403)

    params = event.get("queryStringParameters") or {}
    class_id = params.get("class_id")

    if not class_id:
        return error("class_id é obrigatório")

    table = get_table("CLASS_SCHEDULE_TABLE")
    from boto3.dynamodb.conditions import Key
    response = table.query(KeyConditionExpression=Key("class_id").eq(class_id))

    return success({"data": response.get("Items", [])})
