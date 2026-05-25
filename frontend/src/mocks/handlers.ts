import { http, HttpResponse, delay } from "msw";
import { mockStudents, mockTeachers, mockGuardians, mockStudentGuardians, mockGrades, mockTeacherNotes, mockAbsences, mockTeacherAbsences, mockSubjects, mockClasses } from "./data";
import { mockSchedule } from "./schedule-data";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Estado mutável para simular persistência durante a sessão
let students = [...mockStudents];
let teachers = [...mockTeachers];
let guardians = [...mockGuardians];
let studentGuardians = [...mockStudentGuardians];
let grades = [...mockGrades];
let teacherNotes = [...mockTeacherNotes];
let absences = [...mockAbsences];
let teacherAbsences = [...mockTeacherAbsences];
let subjects = [...mockSubjects];
let classes = [...mockClasses];

export const handlers = [
  // === STUDENTS ===
  http.get(`${API_URL}/students`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const classId = url.searchParams.get("class_id");
    const filtered = classId ? students.filter((s) => s.class_id === classId) : students;
    return HttpResponse.json({ data: filtered });
  }),

  http.get(`${API_URL}/students/:id`, async ({ params }) => {
    await delay(200);
    const student = students.find((s) => s.student_id === params.id);
    if (!student) return HttpResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    return HttpResponse.json({ data: student });
  }),

  http.post(`${API_URL}/students`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as any;
    const newStudent = {
      student_id: `stu-${Date.now()}`,
      user_id: `user-${Date.now()}`,
      class_id: body.class_id,
      birth_date: body.birth_date,
      name: body.name || "Novo Aluno",
      cpf: body.cpf || "",
      ra: body.ra || "",
      address: body.address || "",
    };
    students.push(newStudent);

    // Adiciona todos os responsáveis
    const guardianList = body.guardians || (body.guardian ? [body.guardian] : []);
    for (const g of guardianList) {
      const newGuardian = {
        guardian_id: `gua-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: g.name,
        cpf: g.cpf,
        phone: g.phone,
        email: g.email,
        relationship_type: g.relationship_type,
      };
      guardians.push(newGuardian);
      studentGuardians.push({ student_id: newStudent.student_id, guardian_id: newGuardian.guardian_id });
    }

    return HttpResponse.json({ data: { student_id: newStudent.student_id, user_id: newStudent.user_id } }, { status: 201 });
  }),

  http.delete(`${API_URL}/students/:id`, async ({ params }) => {
    await delay(300);
    students = students.filter((s) => s.student_id !== params.id);
    return HttpResponse.json({ message: "Aluno removido com sucesso" });
  }),

  http.put(`${API_URL}/students/:id`, async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as any;
    students = students.map((s) =>
      s.student_id === params.id ? { ...s, ...body } : s
    );
    return HttpResponse.json({ message: "Aluno atualizado com sucesso" });
  }),

  // === TEACHERS ===
  http.get(`${API_URL}/teachers`, async () => {
    await delay(300);
    return HttpResponse.json({ data: teachers });
  }),

  http.get(`${API_URL}/teachers/me`, async () => {
    await delay(200);
    // O professor logado é user-teacher-001 = tea-001
    const teacher = teachers.find((t) => t.teacher_id === "tea-001");
    if (!teacher) return HttpResponse.json({ error: "Professor não encontrado" }, { status: 404 });
    return HttpResponse.json({ data: teacher });
  }),

  http.get(`${API_URL}/teachers/:id`, async ({ params }) => {
    await delay(200);
    const teacher = teachers.find((t) => t.teacher_id === params.id);
    if (!teacher) return HttpResponse.json({ error: "Professor não encontrado" }, { status: 404 });
    return HttpResponse.json({ data: teacher });
  }),

  http.post(`${API_URL}/teachers`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as any;
    const newTeacher = {
      teacher_id: `tea-${Date.now()}`,
      user_id: `user-${Date.now()}`,
      name: body.name || "Novo Professor",
      subjects: body.subjects || [body.subject || ""],
      cpf: body.cpf || "",
      address: body.address || "",
      classes: body.classes || [],
      schedule: body.schedule || [],
    };
    teachers.push(newTeacher as any);
    return HttpResponse.json({ data: { teacher_id: newTeacher.teacher_id, user_id: newTeacher.user_id } }, { status: 201 });
  }),

  http.delete(`${API_URL}/teachers/:id`, async ({ params }) => {
    await delay(300);
    teachers = teachers.filter((t) => t.teacher_id !== params.id);
    return HttpResponse.json({ message: "Professor removido com sucesso" });
  }),

  http.put(`${API_URL}/teachers/:id`, async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as any;
    teachers = teachers.map((t) =>
      t.teacher_id === params.id ? { ...t, ...body } : t
    );
    return HttpResponse.json({ message: "Professor atualizado com sucesso" });
  }),

  // === TEACHER ABSENCES ===
  http.get(`${API_URL}/teacher-absences`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const teacherId = url.searchParams.get("teacher_id");
    const result = teacherId ? teacherAbsences.filter((a) => a.teacher_id === teacherId) : teacherAbsences;
    return HttpResponse.json({ data: result });
  }),

  http.post(`${API_URL}/teacher-absences`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as any;
    const newAbsence = {
      teacher_id: body.teacher_id,
      date: body.date,
      reason: body.reason || "",
    };
    teacherAbsences.push(newAbsence);
    return HttpResponse.json({ message: "Falta registrada" }, { status: 201 });
  }),

  // === SUBJECTS ===
  http.get(`${API_URL}/subjects`, async () => {
    await delay(200);
    return HttpResponse.json({ data: subjects });
  }),

  http.post(`${API_URL}/subjects`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as any;
    if (body.name && !subjects.includes(body.name)) {
      subjects.push(body.name);
    }
    return HttpResponse.json({ data: subjects }, { status: 201 });
  }),

  // === GUARDIANS ===
  http.get(`${API_URL}/guardians`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const studentId = url.searchParams.get("student_id");
    if (!studentId) return HttpResponse.json({ error: "student_id é obrigatório" }, { status: 400 });

    const links = studentGuardians.filter((sg) => sg.student_id === studentId);
    const result = links.map((l) => guardians.find((g) => g.guardian_id === l.guardian_id)).filter(Boolean);
    return HttpResponse.json({ data: result });
  }),

  http.post(`${API_URL}/guardians`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as any;
    const newGuardian = {
      guardian_id: `gua-${Date.now()}`,
      name: body.name,
      cpf: body.cpf,
      phone: body.phone,
      email: body.email,
      relationship_type: body.relationship_type,
    };
    guardians.push(newGuardian);
    studentGuardians.push({ student_id: body.student_id, guardian_id: newGuardian.guardian_id });
    return HttpResponse.json({ data: { guardian_id: newGuardian.guardian_id } }, { status: 201 });
  }),

  http.delete(`${API_URL}/guardians/:id`, async ({ params, request }) => {
    await delay(300);
    const url = new URL(request.url);
    const studentId = url.searchParams.get("student_id");
    if (!studentId) return HttpResponse.json({ error: "student_id é obrigatório" }, { status: 400 });

    const links = studentGuardians.filter((sg) => sg.student_id === studentId);
    if (links.length <= 1) {
      return HttpResponse.json({ error: "Não é possível remover o último responsável do aluno" }, { status: 400 });
    }

    studentGuardians = studentGuardians.filter(
      (sg) => !(sg.student_id === studentId && sg.guardian_id === params.id)
    );
    return HttpResponse.json({ message: "Responsável removido com sucesso" });
  }),

  // === GRADES ===
  http.get(`${API_URL}/grades`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const studentId = url.searchParams.get("student_id");
    const bimester = url.searchParams.get("bimester");
    // "current" retorna notas do aluno logado (stu-001 como default)
    const id = studentId === "current" ? "stu-001" : studentId;
    let result = grades.filter((g) => g.student_id === id);
    if (bimester) {
      result = result.filter((g) => g.bimester === parseInt(bimester));
    }
    return HttpResponse.json({ data: result });
  }),

  http.post(`${API_URL}/grades`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as any;
    const bimester = body.bimester || 1;
    const newGrade = {
      student_id: body.student_id,
      subject_id: body.subject_id,
      teacher_id: "tea-001",
      bimester,
      grade: String(body.grade),
    };
    // Upsert: substitui se já existe para mesmo aluno+matéria+bimestre
    grades = grades.filter(
      (g) => !(g.student_id === body.student_id && g.subject_id === body.subject_id && g.bimester === bimester)
    );
    grades.push(newGrade);
    return HttpResponse.json({ message: "Nota registrada com sucesso" }, { status: 201 });
  }),

  // === ABSENCES ===
  http.get(`${API_URL}/absences`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const studentId = url.searchParams.get("student_id");
    const result = absences.filter((a) => a.student_id === studentId);
    return HttpResponse.json({ data: result });
  }),

  http.post(`${API_URL}/absences`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as any;
    const studentId = body.entity_id;
    const subjectId = body.subject_id;
    const bimester = body.bimester || 1;

    // Incrementar falta existente ou criar nova
    const existing = absences.find(
      (a) => a.student_id === studentId && a.subject_id === subjectId && a.bimester === bimester
    );
    if (existing) {
      existing.absences += 1;
    } else {
      absences.push({ student_id: studentId, subject_id: subjectId, bimester, absences: 1 });
    }

    return HttpResponse.json({ message: "Falta registrada" }, { status: 201 });
  }),

  // === TEACHER NOTES ===
  http.get(`${API_URL}/teacher-notes`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const studentId = url.searchParams.get("student_id");
    const result = teacherNotes.filter((n) => n.student_id === studentId);
    return HttpResponse.json({ data: result });
  }),

  http.post(`${API_URL}/teacher-notes`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as any;
    const newNote = {
      student_id: body.student_id,
      note_id: `note-${Date.now()}`,
      teacher_id: "tea-001",
      note: body.note,
      created_at: new Date().toISOString(),
    };
    teacherNotes.push(newNote);
    return HttpResponse.json({ data: { note_id: newNote.note_id } }, { status: 201 });
  }),

  // === CLASSES ===
  http.get(`${API_URL}/classes`, async () => {
    await delay(200);
    const result = classes.map((cls) => ({
      ...cls,
      student_count: students.filter((s) => s.class_id === cls.class_id).length,
    }));
    return HttpResponse.json({ data: result });
  }),

  http.post(`${API_URL}/classes`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as any;
    const classId = body.class_id?.trim();
    if (!classId) return HttpResponse.json({ error: "class_id é obrigatório" }, { status: 400 });
    const exists = classes.some((c) => c.class_id === classId);
    if (exists) return HttpResponse.json({ error: "Turma já existe" }, { status: 400 });
    const newClass = {
      class_id: classId,
      name: body.name || `Turma ${classId}`,
      created_at: new Date().toISOString(),
    };
    classes.push(newClass);
    return HttpResponse.json({ data: { class_id: classId } }, { status: 201 });
  }),

  http.delete(`${API_URL}/classes/:id`, async ({ params, request }) => {
    await delay(400);
    const classId = params.id as string;
    const url = new URL(request.url);
    const targetClass = url.searchParams.get("target_class");

    if (!targetClass) {
      return HttpResponse.json({ error: "target_class é obrigatório para realocar alunos" }, { status: 400 });
    }

    if (!classes.some((c) => c.class_id === targetClass)) {
      return HttpResponse.json({ error: "Turma destino não encontrada" }, { status: 404 });
    }

    // Realocar alunos da turma excluída para a turma destino
    students = students.map((s) =>
      s.class_id === classId ? { ...s, class_id: targetClass } : s
    );

    // Remover a turma
    classes = classes.filter((c) => c.class_id !== classId);

    return HttpResponse.json({ message: `Turma ${classId} excluída. Alunos realocados para ${targetClass}.` });
  }),

  // === SCHEDULE ===
  http.get(`${API_URL}/schedule`, async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const classId = url.searchParams.get("class_id");
    const id = classId === "current" ? "1A" : classId;
    const result = mockSchedule.filter((s) => s.class_id === id);
    return HttpResponse.json({ data: result });
  }),

  // === DASHBOARD ===
  http.get(`${API_URL}/dashboard`, async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const classId = url.searchParams.get("class_id");

    const filteredStudents = classId
      ? students.filter((s) => s.class_id === classId)
      : students;

    // Professores da turma (via schedule)
    const classTeacherIds = classId
      ? [...new Set(mockSchedule.filter((s) => s.class_id === classId).map((s) => s.teacher_id))]
      : [];
    const filteredTeachers = classId
      ? teachers.filter((t) => classTeacherIds.includes(t.teacher_id))
      : teachers;

    // Notas dos alunos filtrados
    const studentIds = filteredStudents.map((s) => s.student_id);
    const filteredGrades = grades.filter((g) => studentIds.includes(g.student_id));

    // Média geral
    const allGradeValues = filteredGrades.map((g) => parseFloat(g.grade));
    const averageGeral = allGradeValues.length > 0
      ? (allGradeValues.reduce((a, b) => a + b, 0) / allGradeValues.length).toFixed(1)
      : "0.0";

    // Média por matéria
    const subjects = [...new Set(filteredGrades.map((g) => g.subject_id))];
    const averageBySubject = subjects.map((subject) => {
      const subjectGrades = filteredGrades.filter((g) => g.subject_id === subject).map((g) => parseFloat(g.grade));
      const avg = subjectGrades.reduce((a, b) => a + b, 0) / subjectGrades.length;
      return { subject, average: avg.toFixed(1) };
    });

    // Média por aluno (geral + por matéria, agrupando bimestres)
    const studentAverages = filteredStudents.map((student) => {
      const studentGrades = filteredGrades.filter((g) => g.student_id === student.student_id);
      const gradeValues = studentGrades.map((g) => parseFloat(g.grade));
      const avg = gradeValues.length > 0
        ? (gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length).toFixed(1)
        : "N/A";
      // Agrupar por matéria: média dos bimestres
      const subjectIds = [...new Set(studentGrades.map((g) => g.subject_id))];
      const bySubject = subjectIds.map((subject) => {
        const subGrades = studentGrades.filter((g) => g.subject_id === subject);
        const subAvg = (subGrades.reduce((a, g) => a + parseFloat(g.grade), 0) / subGrades.length).toFixed(1);
        return { subject, grade: subAvg, bimesters: subGrades.map((g) => ({ bimester: g.bimester, grade: g.grade })) };
      });
      return { ...student, average: avg, grades_by_subject: bySubject };
    });

    // Turmas disponíveis
    const availableClasses = classes.map((c) => c.class_id).sort();

    return HttpResponse.json({
      data: {
        total_students: filteredStudents.length,
        total_teachers: filteredTeachers.length,
        average_geral: averageGeral,
        average_by_subject: averageBySubject,
        students: studentAverages,
        teachers: filteredTeachers,
        available_classes: availableClasses,
        selected_class: classId || "all",
      },
    });
  }),
];
