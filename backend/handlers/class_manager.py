import json
import sys
import os
from datetime import datetime, timezone, timedelta

BRT = timezone(timedelta(hours=-3))

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from shared.response import success, error
from shared.dynamo import get_table
from shared.auth import require_groups


def handler(event, context):
    try:
        method = event["httpMethod"]
        path_params = event.get("pathParameters") or {}

        if method == "OPTIONS":
            return success({"message": "ok"})

        if method == "GET":
            return _get_classes(event)
        elif method == "POST":
            return _create_class(event)
        elif method == "DELETE":
            return _delete_class(event, path_params)

        return error("Método não suportado", 405)
    except Exception as e:
        return error(f"Erro interno: {str(e)}", 500)


def _get_classes(event):
    if not require_groups(event, ["Admin", "Teacher", "Student"]):
        return error("Acesso negado", 403)

    classes_table = get_table("CLASSES_TABLE")
    students_table = get_table("STUDENTS_TABLE")

    # Buscar todas as turmas da tabela dedicada
    classes_response = classes_table.scan()
    classes_items = classes_response.get("Items", [])

    # Buscar alunos para contar por turma
    students_response = students_table.scan()
    student_items = students_response.get("Items", [])

    result = []
    for cls in classes_items:
        class_id = cls.get("class_id", "")
        count = sum(1 for s in student_items if s.get("class_id") == class_id)
        result.append({
            "class_id": class_id,
            "name": cls.get("name", f"Turma {class_id}"),
            "student_count": count,
            "created_at": cls.get("created_at", ""),
        })

    result.sort(key=lambda x: x["class_id"])
    return success({"data": result})


def _create_class(event):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return error("Body inválido")

    class_id = (body.get("class_id") or "").strip()
    if not class_id:
        return error("class_id é obrigatório")

    classes_table = get_table("CLASSES_TABLE")

    # Verificar se a turma já existe
    existing = classes_table.get_item(Key={"class_id": class_id})
    if "Item" in existing:
        return error("Turma já existe", 400)

    # Salvar na tabela dedicada de turmas
    classes_table.put_item(Item={
        "class_id": class_id,
        "name": body.get("name", f"Turma {class_id}"),
        "created_at": datetime.now(BRT).isoformat(),
    })

    return success({"data": {"class_id": class_id}}, 201)


def _delete_class(event, path_params):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    class_id = path_params.get("id")
    if not class_id:
        return error("ID da turma é obrigatório")

    params = event.get("queryStringParameters") or {}
    target_class = params.get("target_class")

    if not target_class:
        return error("target_class é obrigatório para realocar alunos")

    classes_table = get_table("CLASSES_TABLE")
    students_table = get_table("STUDENTS_TABLE")

    # Verificar se a turma existe
    existing = classes_table.get_item(Key={"class_id": class_id})
    if "Item" not in existing:
        return error("Turma não encontrada", 404)

    # Verificar se a turma destino existe
    target = classes_table.get_item(Key={"class_id": target_class})
    if "Item" not in target:
        return error("Turma destino não encontrada", 404)

    # Realocar alunos da turma excluída para a turma destino
    response = students_table.scan()
    items = response.get("Items", [])
    students_in_class = [item for item in items if item.get("class_id") == class_id]

    for student in students_in_class:
        students_table.update_item(
            Key={"student_id": student["student_id"]},
            UpdateExpression="SET class_id = :new_class",
            ExpressionAttributeValues={":new_class": target_class},
        )

    # Remover a turma da tabela
    classes_table.delete_item(Key={"class_id": class_id})

    return success({
        "message": f"Turma {class_id} excluída. {len(students_in_class)} aluno(s) realocado(s) para {target_class}."
    })
