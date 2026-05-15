# Convenções do Projeto

## Frontend (React + TypeScript + Tailwind + shadcn/ui)

### Stack Visual
- React 18 + TypeScript
- Vite como bundler
- Tailwind CSS v4 (via @tailwindcss/vite)
- shadcn/ui como base de componentes
- Lucide React para ícones
- Framer Motion para animações
- Recharts para gráficos

### Design System
- Inspiração: Soft UI Dashboard, Discord, Linear, Vercel
- Bordas arredondadas (rounded-lg, rounded-xl)
- Sombras suaves (shadow-sm, hover:shadow-md)
- Transições fluidas (transition-all duration-200)
- Hover effects sutis
- Loading skeletons em todas as listas
- Dark/Light mode via classe CSS no html root
- Cores via CSS custom properties (@theme)
- Tipografia: Inter (Google Fonts)

### Estrutura de Pastas
```
src/
├── components/
│   ├── ui/          # Componentes base (shadcn-style)
│   └── layout/      # Sidebar, Topbar, DashboardLayout
├── contexts/        # AuthContext, ThemeContext
├── pages/
│   ├── admin/       # Portal do administrador
│   ├── teacher/     # Portal do professor
│   └── student/     # Portal do aluno
├── services/        # api.ts, auth.ts
├── lib/             # utils.ts (cn helper)
├── config.ts
├── App.tsx
└── main.tsx
```

### Padrões de Código
- Componentes em PascalCase
- Hooks prefixados com `use`
- Imports com alias `@/` (resolve para src/)
- Componentes UI são genéricos e reutilizáveis
- Páginas específicas por portal/role
- Context API para estado global (auth, theme)
- Axios com interceptors para auth

### Padrões Visuais
- Cards com `rounded-xl border shadow-sm hover:shadow-md`
- Tabelas com hover em linhas
- Badges coloridos por status
- Stat cards com ícone em fundo primary/10
- Sidebar fixa com collapse
- Topbar com blur backdrop
- Formulários em grid responsivo
- Mensagens de feedback com cores semânticas

## Backend (Python)
- Python 3.12
- Handlers em `backend/handlers/`
- Shared em `backend/shared/`
- Respostas padronizadas via shared/response.py
- snake_case para funções/variáveis
- Variáveis de ambiente para nomes de tabelas

## Infraestrutura (CDK TypeScript)
- Uma stack por domínio
- Prefixo: `school-system-`
- PAY_PER_REQUEST billing
- RemovalPolicy.DESTROY (dev)

## Git & CI/CD
- Branch principal: `main`
- GitHub Actions para deploy automático
- Secrets para credenciais AWS e IDs Cognito
