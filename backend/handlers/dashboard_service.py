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
        return _get_dashboard(event)

    return error("Método não suportado", 405)


def _get_dashboard(event):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    students_table = get_table("STUDENTS_TABLE")
    teachers_table = get_table("TEACHERS_TABLE")
    grades_table = get_table("GRADES_TABLE")

    students = students_table.scan()
    teachers = teachers_table.scan()

    total_students = students.get("Count", 0)
    total_teachers = teachers.get("Count", 0)

    return success({
        "data": {
            "total_students": total_students,
            "total_teachers": total_teachers,
        }
    })
