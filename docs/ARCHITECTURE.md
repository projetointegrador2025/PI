# Arquitetura do Sistema Escolar

## Visão Geral

Sistema escolar serverless na AWS com três portais: Admin, Professor e Aluno.

## Stack

- Frontend: React (hospedado S3 + CloudFront)
- Backend: Python 3.12 (AWS Lambda)
- Banco de Dados: DynamoDB
- Autenticação: Amazon Cognito
- API: Amazon API Gateway (REST)
- IaC: AWS CDK (TypeScript)
- CI/CD: GitHub Actions

## Estrutura de Pastas

```
/
├── frontend/          # React app
├── backend/           # Lambda functions (Python)
│   ├── handlers/      # Lambda handlers
│   ├── shared/        # Código compartilhado (utils, models)
│   └── requirements.txt
├── infra/             # AWS CDK (TypeScript)
│   ├── lib/           # Stacks CDK
│   └── bin/           # Entry point CDK
├── .github/workflows/ # CI/CD pipelines
└── docs/              # Documentação
```

## Tabelas DynamoDB

| Tabela | PK | SK |
|--------|----|----|
| Users | user_id | - |
| Students | student_id | - |
| Guardians | guardian_id | - |
| StudentGuardians | student_id | guardian_id |
| Teachers | teacher_id | - |
| Grades | student_id | subject_id |
| TeacherNotes | student_id | note_id |
| ClassSchedule | class_id | day_of_week#time |

## Grupos Cognito

- Admin: CRUD completo
- Teacher: notas, anotações, visualizar alunos
- Student: somente leitura (notas e grade)

## Rotas API

| Método | Rota | Lambda | Acesso |
|--------|------|--------|--------|
| GET | /students | StudentManager | Admin, Teacher |
| GET | /students/{id} | StudentManager | Admin, Teacher |
| POST | /students | StudentManager | Admin |
| DELETE | /students/{id} | StudentManager | Admin |
| POST | /guardians | GuardianManager | Admin |
| GET | /guardians?student_id= | GuardianManager | Admin |
| DELETE | /guardians/{id} | GuardianManager | Admin |
| GET | /teachers | TeacherManager | Admin |
| POST | /teachers | TeacherManager | Admin |
| DELETE | /teachers/{id} | TeacherManager | Admin |
| GET | /grades?student_id= | GradeManager | Admin, Teacher, Student |
| POST | /grades | GradeManager | Teacher |
| GET | /teacher-notes?student_id= | TeacherNotesManager | Teacher |
| POST | /teacher-notes | TeacherNotesManager | Teacher |
| GET | /schedule?class_id= | ScheduleManager | All |
