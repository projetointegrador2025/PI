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
            return _get_dashboard(event)

        return error("Método não suportado", 405)
    except Exception as e:
        return error(f"Erro interno: {str(e)}", 500)


def _get_dashboard(event):
    if not require_groups(event, ["Admin"]):
        return error("Acesso negado", 403)

    params = event.get("queryStringParameters") or {}
    class_id = params.get("class_id")

    students_table = get_table("STUDENTS_TABLE")
    teachers_table = get_table("TEACHERS_TABLE")
    grades_table = get_table("GRADES_TABLE")
    schedule_table = get_table("CLASS_SCHEDULE_TABLE")

    all_students = students_table.scan().get("Items", [])
    all_teachers = teachers_table.scan().get("Items", [])
    all_grades = grades_table.scan().get("Items", [])

    # Turmas disponíveis (da tabela de turmas + das que têm alunos)
    classes_from_students = set(s.get("class_id", "") for s in all_students if s.get("class_id"))
    try:
        classes_table = get_table("CLASSES_TABLE")
        classes_items = classes_table.scan().get("Items", [])
        classes_from_table = set(c.get("class_id", "") for c in classes_items if c.get("class_id"))
    except Exception:
        classes_from_table = set()
    available_classes = sorted(classes_from_students | classes_from_table)

    # Filtrar por turma se especificado
    if class_id and class_id not in ("all", "current"):
        filtered_students = [s for s in all_students if s.get("class_id") == class_id]
    else:
        filtered_students = all_students
        class_id = "all"

    student_ids = [s.get("student_id") for s in filtered_students]
    filtered_grades = [g for g in all_grades if g.get("student_id") in student_ids]

    # Professores da turma (via schedule)
    if class_id != "all":
        schedule_items = schedule_table.scan().get("Items", [])
        teacher_ids = set(
            s.get("teacher_id") for s in schedule_items if s.get("class_id") == class_id
        )
        filtered_teachers = [t for t in all_teachers if t.get("teacher_id") in teacher_ids]
    else:
        filtered_teachers = all_teachers

    # Média geral
    grade_values = []
    for g in filtered_grades:
        try:
            grade_values.append(float(g.get("grade", 0)))
        except (ValueError, TypeError):
            pass

    average_geral = "0.0"
    if grade_values:
        average_geral = f"{sum(grade_values) / len(grade_values):.1f}"

    # Média por matéria
    subjects = set()
    for g in filtered_grades:
        sid = g.get("subject_id", "")
        # Remove bimester suffix if present (e.g. "Math#B1" -> "Math")
        base_subject = sid.split("#")[0] if "#" in sid else sid
        subjects.add(base_subject)

    average_by_subject = []
    for subject in sorted(subjects):
        subj_grades = [
            float(g.get("grade", 0))
            for g in filtered_grades
            if (g.get("subject_id", "").split("#")[0] if "#" in g.get("subject_id", "") else g.get("subject_id", "")) == subject
        ]
        if subj_grades:
            avg = sum(subj_grades) / len(subj_grades)
            average_by_subject.append({"subject": subject, "average": f"{avg:.1f}"})

    # Média por aluno
    student_averages = []
    for student in filtered_students:
        sid = student.get("student_id")
        student_grades = [g for g in filtered_grades if g.get("student_id") == sid]
        gvals = []
        for g in student_grades:
            try:
                gvals.append(float(g.get("grade", 0)))
            except (ValueError, TypeError):
                pass
        avg = f"{sum(gvals) / len(gvals):.1f}" if gvals else "N/A"

        # Por matéria
        subj_ids = set()
        for g in student_grades:
            s = g.get("subject_id", "")
            subj_ids.add(s.split("#")[0] if "#" in s else s)

        grades_by_subject = []
        for subj in sorted(subj_ids):
            subj_grades_list = [
                g for g in student_grades
                if (g.get("subject_id", "").split("#")[0] if "#" in g.get("subject_id", "") else g.get("subject_id", "")) == subj
            ]
            sg_values = []
            bimesters = []
            for g in subj_grades_list:
                try:
                    val = float(g.get("grade", 0))
                    sg_values.append(val)
                    bimesters.append({"bimester": int(g.get("bimester", 1)), "grade": str(g.get("grade", "0"))})
                except (ValueError, TypeError):
                    pass
            if sg_values:
                grades_by_subject.append({
                    "subject": subj,
                    "grade": f"{sum(sg_values)/len(sg_values):.1f}",
                    "bimesters": sorted(bimesters, key=lambda x: x["bimester"]),
                })

        student_averages.append({
            "student_id": sid,
            "name": student.get("name", ""),
            "class_id": student.get("class_id", ""),
            "average": avg,
            "grades_by_subject": grades_by_subject,
        })

    return success({
        "data": {
            "total_students": len(filtered_students),
            "total_teachers": len(filtered_teachers),
            "average_geral": average_geral,
            "average_by_subject": average_by_subject,
            "students": student_averages,
            "teachers": [{"teacher_id": t.get("teacher_id", ""), "name": t.get("name", ""), "subject": t.get("subjects", [])} for t in filtered_teachers],
            "available_classes": available_classes,
            "selected_class": class_id,
        }
    })
