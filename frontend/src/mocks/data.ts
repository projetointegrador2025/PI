// Dados fake completos para simular as tabelas DynamoDB

export const mockStudents = [
  { student_id: "stu-001", user_id: "user-student-001", class_id: "1A", birth_date: "2008-03-15", name: "João Silva", cpf: "123.456.789-09", ra: "2024000001", address: "Rua A, 10 - Bairro Centro" },
  { student_id: "stu-002", user_id: "user-student-002", class_id: "1A", birth_date: "2008-07-22", name: "Maria Oliveira", cpf: "987.654.321-00", ra: "2024000002", address: "Rua B, 20 - Bairro Jardim" },
  { student_id: "stu-003", user_id: "user-student-003", class_id: "1A", birth_date: "2008-01-10", name: "Lucas Santos", cpf: "111.222.333-96", ra: "2024000003", address: "Av. C, 300 - Vila Nova" },
  { student_id: "stu-004", user_id: "user-student-004", class_id: "2B", birth_date: "2007-11-10", name: "Ana Costa", cpf: "444.555.666-72", ra: "2024000004", address: "Rua D, 45 - Centro" },
  { student_id: "stu-005", user_id: "user-student-005", class_id: "2B", birth_date: "2007-05-03", name: "Pedro Almeida", cpf: "777.888.999-00", ra: "2024000005", address: "Rua E, 78 - Liberdade" },
  { student_id: "stu-006", user_id: "user-student-006", class_id: "2B", birth_date: "2007-09-28", name: "Juliana Ferreira", cpf: "222.333.444-05", ra: "2024000006", address: "Av. F, 150 - Parque" },
  { student_id: "stu-007", user_id: "user-student-007", class_id: "3A", birth_date: "2006-09-18", name: "Gabriel Lima", cpf: "555.666.777-35", ra: "2024000007", address: "Rua G, 200 - Industrial" },
  { student_id: "stu-008", user_id: "user-student-008", class_id: "3A", birth_date: "2006-04-12", name: "Beatriz Souza", cpf: "888.999.000-12", ra: "2024000008", address: "Rua H, 33 - Centro" },
  { student_id: "stu-009", user_id: "user-student-009", class_id: "3A", birth_date: "2006-12-05", name: "Rafael Pereira", cpf: "333.444.555-67", ra: "2024000009", address: "Av. I, 500 - Jardim" },
  { student_id: "stu-010", user_id: "user-student-010", class_id: "1A", birth_date: "2008-06-20", name: "Camila Rodrigues", cpf: "666.777.888-90", ra: "2024000010", address: "Rua J, 12 - Vila Nova" },
  { student_id: "stu-011", user_id: "user-student-011", class_id: "2B", birth_date: "2007-02-14", name: "Thiago Martins", cpf: "999.000.111-23", ra: "2024000011", address: "Rua K, 88 - Liberdade" },
  { student_id: "stu-012", user_id: "user-student-012", class_id: "3A", birth_date: "2006-08-30", name: "Larissa Gomes", cpf: "000.111.222-34", ra: "2024000012", address: "Av. L, 400 - Parque" },
];

export const mockTeachers = [
  { teacher_id: "tea-001", user_id: "user-teacher-001", subjects: ["Matemática"], name: "Maria Professora", cpf: "111.111.111-11", address: "Rua das Flores, 100 - Centro", classes: ["1A", "2B", "3A"] },
  { teacher_id: "tea-002", user_id: "user-teacher-002", subjects: ["Português"], name: "Roberto Carvalho", cpf: "222.222.222-22", address: "Av. Brasil, 500 - Jardim", classes: ["1A", "2B", "3A"] },
  { teacher_id: "tea-003", user_id: "user-teacher-003", subjects: ["Ciências"], name: "Fernanda Ribeiro", cpf: "333.333.333-33", address: "Rua Paraná, 250 - Vila Nova", classes: ["1A", "2B", "3A"] },
  { teacher_id: "tea-004", user_id: "user-teacher-004", subjects: ["História"], name: "Carlos Mendes", cpf: "444.444.444-44", address: "Rua São Paulo, 80 - Centro", classes: ["1A", "2B", "3A"] },
  { teacher_id: "tea-005", user_id: "user-teacher-005", subjects: ["Geografia"], name: "Patrícia Nunes", cpf: "555.555.555-55", address: "Av. Independência, 320 - Liberdade", classes: ["1A", "2B", "3A"] },
  { teacher_id: "tea-006", user_id: "user-teacher-006", subjects: ["Educação Física"], name: "André Barbosa", cpf: "666.666.666-66", address: "Rua dos Esportes, 15 - Parque", classes: ["1A", "2B"] },
  { teacher_id: "tea-007", user_id: "user-teacher-007", subjects: ["Inglês", "Espanhol"], name: "Juliana Moreira", cpf: "777.777.777-77", address: "Rua Londres, 42 - Internacional", classes: ["1A", "2B", "3A"] },
];

export const mockGuardians = [
  { guardian_id: "gua-001", name: "Ana Silva", cpf: "123.456.789-00", phone: "(11) 99999-0001", email: "ana.silva@email.com", relationship_type: "Mãe" },
  { guardian_id: "gua-002", name: "Pedro Silva", cpf: "987.654.321-00", phone: "(11) 99999-0002", email: "pedro.silva@email.com", relationship_type: "Pai" },
  { guardian_id: "gua-003", name: "Márcia Oliveira", cpf: "111.222.333-44", phone: "(11) 98888-0003", email: "marcia.oliveira@email.com", relationship_type: "Mãe" },
  { guardian_id: "gua-004", name: "José Santos", cpf: "555.666.777-88", phone: "(11) 97777-0004", email: "jose.santos@email.com", relationship_type: "Pai" },
  { guardian_id: "gua-005", name: "Regina Costa", cpf: "222.333.444-55", phone: "(11) 96666-0005", email: "regina.costa@email.com", relationship_type: "Mãe" },
];

export const mockStudentGuardians = [
  { student_id: "stu-001", guardian_id: "gua-001" },
  { student_id: "stu-001", guardian_id: "gua-002" },
  { student_id: "stu-002", guardian_id: "gua-003" },
  { student_id: "stu-003", guardian_id: "gua-004" },
  { student_id: "stu-004", guardian_id: "gua-005" },
  { student_id: "stu-005", guardian_id: "gua-004" },
  { student_id: "stu-006", guardian_id: "gua-003" },
];

export const mockGrades = [
  // Aluno stu-001 (João Silva - 1A)
  { student_id: "stu-001", subject_id: "Matemática", teacher_id: "tea-001", bimester: 1, grade: "8.5" },
  { student_id: "stu-001", subject_id: "Matemática", teacher_id: "tea-001", bimester: 2, grade: "7.0" },
  { student_id: "stu-001", subject_id: "Português", teacher_id: "tea-002", bimester: 1, grade: "7.0" },
  { student_id: "stu-001", subject_id: "Português", teacher_id: "tea-002", bimester: 2, grade: "7.5" },
  { student_id: "stu-001", subject_id: "Ciências", teacher_id: "tea-003", bimester: 1, grade: "9.2" },
  { student_id: "stu-001", subject_id: "História", teacher_id: "tea-004", bimester: 1, grade: "6.5" },
  { student_id: "stu-001", subject_id: "Geografia", teacher_id: "tea-005", bimester: 1, grade: "7.8" },
  { student_id: "stu-001", subject_id: "Inglês", teacher_id: "tea-007", bimester: 1, grade: "8.0" },
  { student_id: "stu-001", subject_id: "Inglês", teacher_id: "tea-007", bimester: 2, grade: "8.5" },
  // Aluno stu-002 (Maria Oliveira - 1A)
  { student_id: "stu-002", subject_id: "Matemática", teacher_id: "tea-001", bimester: 1, grade: "5.5" },
  { student_id: "stu-002", subject_id: "Matemática", teacher_id: "tea-001", bimester: 2, grade: "6.0" },
  { student_id: "stu-002", subject_id: "Português", teacher_id: "tea-002", bimester: 1, grade: "9.0" },
  { student_id: "stu-002", subject_id: "Ciências", teacher_id: "tea-003", bimester: 1, grade: "7.5" },
  { student_id: "stu-002", subject_id: "História", teacher_id: "tea-004", bimester: 1, grade: "8.8" },
  { student_id: "stu-002", subject_id: "Geografia", teacher_id: "tea-005", bimester: 1, grade: "6.0" },
  { student_id: "stu-002", subject_id: "Inglês", teacher_id: "tea-007", bimester: 1, grade: "9.5" },
  // Aluno stu-003 (Lucas Santos - 1A)
  { student_id: "stu-003", subject_id: "Matemática", teacher_id: "tea-001", bimester: 1, grade: "4.5" },
  { student_id: "stu-003", subject_id: "Matemática", teacher_id: "tea-001", bimester: 2, grade: "5.0" },
  { student_id: "stu-003", subject_id: "Português", teacher_id: "tea-002", bimester: 1, grade: "6.0" },
  { student_id: "stu-003", subject_id: "Ciências", teacher_id: "tea-003", bimester: 1, grade: "5.8" },
  { student_id: "stu-003", subject_id: "História", teacher_id: "tea-004", bimester: 1, grade: "7.2" },
  // Aluno stu-004 (Ana Costa - 2B)
  { student_id: "stu-004", subject_id: "Matemática", teacher_id: "tea-001", bimester: 1, grade: "9.0" },
  { student_id: "stu-004", subject_id: "Matemática", teacher_id: "tea-001", bimester: 2, grade: "9.5" },
  { student_id: "stu-004", subject_id: "Português", teacher_id: "tea-002", bimester: 1, grade: "8.5" },
  { student_id: "stu-004", subject_id: "Ciências", teacher_id: "tea-003", bimester: 1, grade: "9.8" },
  { student_id: "stu-004", subject_id: "História", teacher_id: "tea-004", bimester: 1, grade: "9.2" },
  { student_id: "stu-004", subject_id: "Geografia", teacher_id: "tea-005", bimester: 1, grade: "8.7" },
  // Aluno stu-005 (Pedro Almeida - 2B)
  { student_id: "stu-005", subject_id: "Matemática", teacher_id: "tea-001", bimester: 1, grade: "6.0" },
  { student_id: "stu-005", subject_id: "Português", teacher_id: "tea-002", bimester: 1, grade: "5.0" },
  { student_id: "stu-005", subject_id: "Ciências", teacher_id: "tea-003", bimester: 1, grade: "6.5" },
  { student_id: "stu-005", subject_id: "História", teacher_id: "tea-004", bimester: 1, grade: "4.8" },
  // Aluno stu-007 (Gabriel Lima - 3A)
  { student_id: "stu-007", subject_id: "Matemática", teacher_id: "tea-001", bimester: 1, grade: "7.5" },
  { student_id: "stu-007", subject_id: "Matemática", teacher_id: "tea-001", bimester: 2, grade: "8.0" },
  { student_id: "stu-007", subject_id: "Português", teacher_id: "tea-002", bimester: 1, grade: "8.2" },
  { student_id: "stu-007", subject_id: "Ciências", teacher_id: "tea-003", bimester: 1, grade: "7.0" },
  { student_id: "stu-007", subject_id: "História", teacher_id: "tea-004", bimester: 1, grade: "8.5" },
  { student_id: "stu-007", subject_id: "Geografia", teacher_id: "tea-005", bimester: 1, grade: "9.0" },
  { student_id: "stu-007", subject_id: "Inglês", teacher_id: "tea-007", bimester: 1, grade: "7.8" },
];

export const mockAbsences = [
  // Aluno stu-001 (João Silva - 1A)
  { student_id: "stu-001", subject_id: "Matemática", bimester: 1, absences: 1 },
  { student_id: "stu-001", subject_id: "Matemática", bimester: 2, absences: 1 },
  { student_id: "stu-001", subject_id: "Português", bimester: 1, absences: 2 },
  { student_id: "stu-001", subject_id: "Português", bimester: 2, absences: 2 },
  { student_id: "stu-001", subject_id: "Ciências", bimester: 1, absences: 1 },
  { student_id: "stu-001", subject_id: "História", bimester: 1, absences: 4 },
  { student_id: "stu-001", subject_id: "História", bimester: 2, absences: 2 },
  { student_id: "stu-001", subject_id: "Geografia", bimester: 1, absences: 3 },
  { student_id: "stu-001", subject_id: "Inglês", bimester: 1, absences: 0 },
  { student_id: "stu-001", subject_id: "Inglês", bimester: 2, absences: 0 },
  // Aluno stu-002 (Maria Oliveira - 1A)
  { student_id: "stu-002", subject_id: "Matemática", bimester: 1, absences: 3 },
  { student_id: "stu-002", subject_id: "Matemática", bimester: 2, absences: 2 },
  { student_id: "stu-002", subject_id: "Português", bimester: 1, absences: 1 },
  { student_id: "stu-002", subject_id: "Ciências", bimester: 1, absences: 2 },
  { student_id: "stu-002", subject_id: "História", bimester: 1, absences: 0 },
  { student_id: "stu-002", subject_id: "Geografia", bimester: 1, absences: 3 },
  { student_id: "stu-002", subject_id: "Inglês", bimester: 1, absences: 1 },
  // Aluno stu-003 (Lucas Santos - 1A)
  { student_id: "stu-003", subject_id: "Matemática", bimester: 1, absences: 5 },
  { student_id: "stu-003", subject_id: "Matemática", bimester: 2, absences: 3 },
  { student_id: "stu-003", subject_id: "Português", bimester: 1, absences: 4 },
  { student_id: "stu-003", subject_id: "Português", bimester: 2, absences: 2 },
  { student_id: "stu-003", subject_id: "Ciências", bimester: 1, absences: 4 },
  { student_id: "stu-003", subject_id: "História", bimester: 1, absences: 3 },
  // Aluno stu-004 (Ana Costa - 2B)
  { student_id: "stu-004", subject_id: "Matemática", bimester: 1, absences: 0 },
  { student_id: "stu-004", subject_id: "Matemática", bimester: 2, absences: 0 },
  { student_id: "stu-004", subject_id: "Português", bimester: 1, absences: 1 },
  { student_id: "stu-004", subject_id: "Ciências", bimester: 1, absences: 0 },
  { student_id: "stu-004", subject_id: "História", bimester: 1, absences: 1 },
  { student_id: "stu-004", subject_id: "Geografia", bimester: 1, absences: 0 },
  // Aluno stu-005 (Pedro Almeida - 2B)
  { student_id: "stu-005", subject_id: "Matemática", bimester: 1, absences: 4 },
  { student_id: "stu-005", subject_id: "Matemática", bimester: 2, absences: 3 },
  { student_id: "stu-005", subject_id: "Português", bimester: 1, absences: 5 },
  { student_id: "stu-005", subject_id: "Português", bimester: 2, absences: 4 },
  { student_id: "stu-005", subject_id: "Ciências", bimester: 1, absences: 5 },
  { student_id: "stu-005", subject_id: "História", bimester: 1, absences: 4 },
  { student_id: "stu-005", subject_id: "História", bimester: 2, absences: 4 },
  // Aluno stu-007 (Gabriel Lima - 3A)
  { student_id: "stu-007", subject_id: "Matemática", bimester: 1, absences: 1 },
  { student_id: "stu-007", subject_id: "Matemática", bimester: 2, absences: 1 },
  { student_id: "stu-007", subject_id: "Português", bimester: 1, absences: 1 },
  { student_id: "stu-007", subject_id: "Ciências", bimester: 1, absences: 2 },
  { student_id: "stu-007", subject_id: "Ciências", bimester: 2, absences: 1 },
  { student_id: "stu-007", subject_id: "História", bimester: 1, absences: 0 },
  { student_id: "stu-007", subject_id: "Geografia", bimester: 1, absences: 1 },
  { student_id: "stu-007", subject_id: "Inglês", bimester: 1, absences: 1 },
  { student_id: "stu-007", subject_id: "Inglês", bimester: 2, absences: 1 },
];

export const mockTeacherAbsences = [
  { teacher_id: "tea-001", date: "2024-03-10", reason: "Consulta médica" },
  { teacher_id: "tea-001", date: "2024-04-05", reason: "Licença pessoal" },
  { teacher_id: "tea-002", date: "2024-03-22", reason: "Doença" },
  { teacher_id: "tea-002", date: "2024-03-23", reason: "Doença" },
  { teacher_id: "tea-002", date: "2024-04-12", reason: "Compromisso familiar" },
  { teacher_id: "tea-003", date: "2024-04-01", reason: "Consulta médica" },
  { teacher_id: "tea-004", date: "2024-03-15", reason: "Licença pessoal" },
  { teacher_id: "tea-004", date: "2024-03-28", reason: "Congresso acadêmico" },
  { teacher_id: "tea-004", date: "2024-04-10", reason: "Congresso acadêmico" },
  { teacher_id: "tea-005", date: "2024-04-08", reason: "Doença" },
  { teacher_id: "tea-007", date: "2024-03-18", reason: "Viagem profissional" },
  { teacher_id: "tea-007", date: "2024-03-19", reason: "Viagem profissional" },
];

export const mockSubjects = [
  "Matemática",
  "Português",
  "Ciências",
  "História",
  "Geografia",
  "Educação Física",
  "Inglês",
  "Espanhol",
  "Artes",
  "Filosofia",
  "Sociologia",
];

export const mockTeacherNotes = [
  // Notas sobre stu-001 (João Silva)
  { student_id: "stu-001", note_id: "note-001", teacher_id: "tea-001", note: "Aluno participativo, excelente desempenho em cálculos e resolução de problemas. Demonstra interesse genuíno pela matéria.", created_at: "2024-03-15T10:30:00Z" },
  { student_id: "stu-001", note_id: "note-002", teacher_id: "tea-002", note: "Precisa melhorar a escrita dissertativa. Sugestão: praticar redações semanais com temas variados.", created_at: "2024-03-18T14:00:00Z" },
  { student_id: "stu-001", note_id: "note-003", teacher_id: "tea-003", note: "Destaque no laboratório de ciências. Apresentou projeto sobre energia solar muito acima da média.", created_at: "2024-04-02T09:45:00Z" },
  { student_id: "stu-001", note_id: "note-004", teacher_id: "tea-004", note: "Faltou na prova de recuperação. Entrar em contato com responsáveis.", created_at: "2024-04-10T16:20:00Z" },
  // Notas sobre stu-002 (Maria Oliveira)
  { student_id: "stu-002", note_id: "note-005", teacher_id: "tea-001", note: "Dificuldade com frações e números decimais. Recomendo aulas de reforço às terças.", created_at: "2024-03-20T09:15:00Z" },
  { student_id: "stu-002", note_id: "note-006", teacher_id: "tea-002", note: "Excelente leitora! Terminou todos os livros da lista antes do prazo. Sugerir livros avançados.", created_at: "2024-03-25T11:00:00Z" },
  { student_id: "stu-002", note_id: "note-007", teacher_id: "tea-007", note: "Fluência em inglês acima da média. Considerar participação em olimpíada de idiomas.", created_at: "2024-04-05T13:30:00Z" },
  // Notas sobre stu-003 (Lucas Santos)
  { student_id: "stu-003", note_id: "note-008", teacher_id: "tea-001", note: "Aluno com muita dificuldade em matemática básica. Precisa de acompanhamento individual.", created_at: "2024-03-22T08:00:00Z" },
  { student_id: "stu-003", note_id: "note-009", teacher_id: "tea-003", note: "Comportamento disperso em aula. Conversar com coordenação sobre possível TDAH.", created_at: "2024-04-01T10:00:00Z" },
  // Notas sobre stu-004 (Ana Costa)
  { student_id: "stu-004", note_id: "note-010", teacher_id: "tea-001", note: "Aluna exemplar. Ajuda colegas com dificuldade e sempre entrega atividades antes do prazo.", created_at: "2024-03-28T14:30:00Z" },
  { student_id: "stu-004", note_id: "note-011", teacher_id: "tea-004", note: "Apresentação sobre Revolução Francesa foi excepcional. Indicar para feira de ciências humanas.", created_at: "2024-04-08T15:00:00Z" },
  // Notas sobre stu-005 (Pedro Almeida)
  { student_id: "stu-005", note_id: "note-012", teacher_id: "tea-002", note: "Muitas faltas nas últimas semanas. Responsáveis foram notificados mas não responderam.", created_at: "2024-04-12T09:00:00Z" },
  { student_id: "stu-005", note_id: "note-013", teacher_id: "tea-004", note: "Notas em queda. Possível problema familiar afetando desempenho. Encaminhar para orientação.", created_at: "2024-04-15T11:30:00Z" },
];
