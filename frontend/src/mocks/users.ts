// Usuários fake para desenvolvimento local
export interface MockUser {
  email: string;
  password: string;
  name: string;
  groups: string[];
  user_id: string;
}

export const mockUsers: MockUser[] = [
  {
    email: "admin@escola.com",
    password: "admin123",
    name: "Carlos Admin",
    groups: ["Admin"],
    user_id: "user-admin-001",
  },
  {
    email: "professor@escola.com",
    password: "prof123",
    name: "Maria Professora",
    groups: ["Teacher"],
    user_id: "user-teacher-001",
  },
  {
    email: "aluno@escola.com",
    password: "aluno123",
    name: "João Aluno",
    groups: ["Student"],
    user_id: "user-student-001",
  },
];
