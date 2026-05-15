# Sistema Escolar - PI3

Sistema escolar serverless na AWS com portais para Admin, Professor e Aluno.

## Stack

- Frontend: React 18 + Vite + TypeScript + Tailwind CSS 4
- Backend: Python 3.12 (AWS Lambda)
- Banco: DynamoDB
- Auth: Amazon Cognito
- API: API Gateway
- IaC: AWS CDK (TypeScript)
- CI/CD: GitHub Actions
- Mocks: MSW (Mock Service Worker) para desenvolvimento local

## Rodar Localmente

O frontend roda 100% local com mocks — não precisa de backend, banco ou AWS.

### Pré-requisitos

- Node.js 18+
- npm

### Passos

```bash
cd frontend
npm install
npm run dev
```

O servidor abre em `http://localhost:5173`. O `.env.development` já vem configurado com `VITE_MOCK_ENABLED=true`.

### Usuários de teste

| Perfil     | Email                 | Senha     |
|------------|-----------------------|-----------|
| Admin      | admin@escola.com      | admin123  |
| Professor  | professor@escola.com  | prof123   |
| Aluno      | aluno@escola.com      | aluno123  |

## Funcionalidades

### Admin
- Dashboard com filtro por turma (total alunos, professores, média geral, média por matéria)
- Gestão de alunos (cadastro com CPF, RA, endereço via CEP, múltiplos responsáveis)
- Gestão de professores (múltiplas disciplinas, CPF, endereço, turmas, horários, faltas)
- Grade de aulas (visualização por turma com professor)
- Gerenciamento de turmas (criar/excluir com realocação de alunos)

### Professor
- Dashboard com filtro por turma
- Lista de alunos com modal de detalhes (notas por bimestre, faltas, responsáveis)
- Registro de notas por bimestre (apenas nas suas disciplinas)
- Chamada (registro de presença/falta por turma, disciplina, bimestre e data)
- Anotações sobre alunos

### Aluno
- Dashboard com notas por bimestre e status (Aprovado/Recuperação/Reprovado)
- Faltas por bimestre com indicador de limite
- Grade de aulas

## Infraestrutura (Deploy AWS)

```bash
cd infra
npm install
npx cdk synth
npx cdk deploy --all
```

## Deploy

Push para `main` dispara o pipeline automaticamente via GitHub Actions.

### Secrets necessários no GitHub:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `API_URL`
- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`
- `FRONTEND_BUCKET`
- `CLOUDFRONT_DISTRIBUTION_ID`
