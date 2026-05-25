import json
import sys
import os

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
            return _get_grades(event)
        elif method == "POST":
            return _post_grade(event)

        return error("Método não suportado", 405)
    except Exception as e:
        return error(f"Erro interno: {str(e)}", 500)


def _get_grades(event):
    if not require_groups(event, ["Admin", "Teacher", "Student"]):
        return error("Acesso negado", 403)

    params = event.get("queryStringParameters") or {}
    student_id = params.get("student_id")

    if not student_id:
        return error("student_id é obrigatório")

    # Resolver "current" para o aluno logado
    if student_id == "current":
        from boto3.dynamodb.conditions import Attr
        user_id = get_user_id(event)
        students_table = get_table("STUDENTS_TABLE")
        response = students_table.scan(FilterExpression=Attr("user_id").eq(user_id))
        items = response.get("Items", [])
        if not items:
            return success({"data": []})
        student_id = items[0].get("student_id", "")

    table = get_table("GRADES_TABLE")
    from boto3.dynamodb.conditions import Key
    response = table.query(KeyConditionExpression=Key("student_id").eq(student_id))

    items = response.get("Items", [])

    # Limpar subject_id (remover sufixo de bimestre #B1, #B2, etc.)
    for item in items:
        raw_subject = item.get("subject_id", "")
        if "#B" in raw_subject:
            item["subject_id"] = raw_subject.rsplit("#B", 1)[0]

    # Filtro por bimestre
    bimester = params.get("bimester")
    if bimester:
        items = [i for i in items if str(i.get("bimester", "")) == bimester]

    return success({"data": items})


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

    bimester = body.get("bimester", 1)

    table.put_item(Item={
        "student_id": body["student_id"],
        "subject_id": f"{body['subject_id']}#B{bimester}",
        "teacher_id": teacher_id,
        "grade": str(body["grade"]),
        "bimester": int(bimester),
    })

    return success({"message": "Nota registrada com sucesso"}, 201)
