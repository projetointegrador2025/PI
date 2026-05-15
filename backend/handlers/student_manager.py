import json
import uuid
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.response import success, error
from shared.dynamo import get_table
from shared.auth import require_groups, get_user_id


def handler(event, context):
    method = event["httpMethod"]
    path_params = event.get("pathParameters") or {}

    if method == "OPTIONS":
        return success({"message": "ok"})

    if method == "GET":
        return _get_students(event, path_params)
    elif method == "POST":
        return _create_student(event)
    elif method == "DELETE":
        return _delete_student(event, path_params)

    return error("Método não suportado", 405)


def _get_students(event, path_params):
    if not require_groups(event, ["Admin", "Teacher"]):
        return error("Acesso negado", 403)

    table = get_table("STUDENTS_TABLE")

    student_id = path_params.get("id")
    if student_id:
        response = table.get_item(Key={"student_id": student_id})
        item = response.get("Item")
        if not item:
            return error("Aluno não encontrado", 404)
        return success({"data": item})

    # Suporte a filtro por turma
    params = event.get("queryStringParameters") or {}
    class_id = params.get("class_id")

    if class_id:
        from boto3.dynamodb.conditions import Attr
        response = table.scan(FilterExpression=Attr("class_id").eq(class_id))
    else:
        response = table.scan()

    return success({"data": response.get("Items", [])})


def _create_student(event):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    required_fields = ["name", "class_id", "birth_date", "cpf", "ra"]
    for field in required_fields:
        if field not in body:
            return error(f"Campo obrigatório ausente: {field}")

    # Suporte a múltiplos responsáveis
    guardians_data = body.get("guardians", [])
    if not guardians_data and body.get("guardian"):
        guardians_data = [body["guardian"]]

    if not guardians_data:
        return error("É necessário ao menos um responsável")

    guardian_required = ["name", "cpf", "phone", "email", "relationship_type"]
    for i, guardian in enumerate(guardians_data):
        for field in guardian_required:
            if field not in guardian:
                return error(f"Campo do responsável {i+1} ausente: {field}")

    users_table = get_table("USERS_TABLE")
    students_table = get_table("STUDENTS_TABLE")
    guardians_table = get_table("GUARDIANS_TABLE")
    sg_table = get_table("STUDENT_GUARDIANS_TABLE")

    user_id = str(uuid.uuid4())
    student_id = str(uuid.uuid4())

    users_table.put_item(Item={
        "user_id": user_id,
        "name": body["name"],
        "email": body.get("email", ""),
        "role": "student",
    })

    student_item = {
        "student_id": student_id,
        "user_id": user_id,
        "name": body["name"],
        "class_id": body["class_id"],
        "birth_date": body["birth_date"],
        "cpf": body["cpf"],
        "ra": body["ra"],
    }

    # Endereço (opcional)
    if body.get("address"):
        student_item["address"] = body["address"]

    students_table.put_item(Item=student_item)

    # Criar responsáveis
    for guardian in guardians_data:
        guardian_id = str(uuid.uuid4())
        guardians_table.put_item(Item={
            "guardian_id": guardian_id,
            "name": guardian["name"],
            "cpf": guardian["cpf"],
            "phone": guardian["phone"],
            "email": guardian["email"],
            "relationship_type": guardian["relationship_type"],
        })
        sg_table.put_item(Item={
            "student_id": student_id,
            "guardian_id": guardian_id,
        })

    return success({"data": {"student_id": student_id, "user_id": user_id}}, 201)


def _delete_student(event, path_params):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    student_id = path_params.get("id")
    if not student_id:
        return error("ID do aluno é obrigatório")

    students_table = get_table("STUDENTS_TABLE")
    students_table.delete_item(Key={"student_id": student_id})

    return success({"message": "Aluno removido com sucesso"})
