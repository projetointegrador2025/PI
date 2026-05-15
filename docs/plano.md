---
title: "[]{#_9hzf0whaig82 .anchor}Plano de Execução do Projeto de Sistema Escolar - PI3"
---

[**Introdução**](#introdução) **4**

[**Ferramentas Utilizadas no Projeto**](#ferramentas-utilizadas-no-projeto) **5**

> [CI/CD](#cicd) 6
>
> [Linguagem e Framework Frontend](#linguagem-e-framework-frontend) 7
>
> [Linguagem Backend](#linguagem-backend) 7
>
> [DevOps e Infraestrutura na Nuvem AWS](#devops-e-infraestrutura-na-nuvem-aws) 8

[**Serviços AWS Utilizados**](#serviços-aws-utilizados) **9**

> [Amazon S3](#amazon-s3) 9
>
> [Amazon CloudFront](#amazon-cloudfront) 9
>
> [Amazon API Gateway](#amazon-api-gateway) 10
>
> [AWS Lambda](#aws-lambda) 10
>
> [Amazon Cognito](#amazon-cognito) 11
>
> [Amazon DynamoDB](#amazon-dynamodb) 11

[**Estrutura da Aplicação**](#estrutura-da-aplicação) **12**

> [Rotas da API (Amazon API Gateway)](#rotas-da-api-amazon-api-gateway) 12
>
> [Funções AWS Lambda](#funções-aws-lambda) 14
>
> [StudentManager](#studentmanager) 14
>
> [GuardianManager](#guardianmanager) 14
>
> [TeacherManager](#teachermanager) 15
>
> [GradebookManager](#gradebookmanager) 15
>
> [TeacherNotesManager](#teachernotesmanager) 15
>
> [GradeManager](#grademanager) 15
>
> [DashboardService](#dashboardservice) 16
>
> [Banco de Dados (Amazon DynamoDB)](#banco-de-dados-amazon-dynamodb) 16
>
> [Users](#users) 16
>
> [Students](#students) 17
>
> [Guardians](#guardians) 17
>
> [StudentGuardians](#studentguardians) 17
>
> [Teachers](#teachers) 17
>
> [Grades](#grades) 18
>
> [TeacherNotes](#teachernotes) 18
>
> [ClassSchedule](#classschedule) 18
>
> [Autenticação (Amazon Cognito)](#autenticação-amazon-cognito) 19
>
> [Grupos de Usuários](#grupos-de-usuários) 19
>
> [Páginas do Frontend (React)](#páginas-do-frontend-react) 20
>
> [Página de Login](#página-de-login) 20
>
> [Portal do Aluno](#portal-do-aluno) 20
>
> [Portal do Professor](#portal-do-professor) 20
>
> [Portal do Administrador](#portal-do-administrador) 21

# Introdução

Este projeto consiste no desenvolvimento de um sistema escolar web construído utilizando uma arquitetura serverless na AWS. O objetivo do sistema é permitir o gerenciamento de informações acadêmicas de forma simples e organizada, atendendo três tipos principais de usuários: administradores, professores e alunos.

A aplicação possibilita que administradores realizem o cadastro e gerenciamento de alunos e professores, garantindo também o vínculo obrigatório entre alunos e seus responsáveis. Professores podem registrar notas e anotações sobre os alunos, sendo que essas observações são visíveis apenas para o corpo docente. Já os alunos têm acesso a um portal onde podem visualizar suas notas e a grade de aulas, sem permissões para modificar informações.

O sistema foi projetado utilizando serviços gerenciados da AWS, como API Gateway, AWS Lambda, DynamoDB, Amazon Cognito, S3 e CloudFront, garantindo escalabilidade, alta disponibilidade e baixo custo operacional. Além disso, toda a infraestrutura é provisionada utilizando Infraestrutura como Código (IaC) com AWS CDK e CloudFormation, e o processo de build e deploy da aplicação é automatizado por meio de pipelines de CI/CD com GitHub Actions.

Este projeto também tem como objetivo aplicar boas práticas de arquitetura em nuvem, desenvolvimento serverless e automação DevOps, servindo como um estudo prático de implementação de aplicações modernas na AWS.

Arquitetura da solução

![](media/image1.png){width="6.267716535433071in" height="2.638888888888889in"}

# Ferramentas Utilizadas no Projeto

Este projeto será desenvolvido utilizando uma arquitetura serverless na AWS, com foco em escalabilidade, baixo custo (Free Tier) e boas práticas de engenharia de software e DevOps. A seguir estão as principais tecnologias e serviços utilizados.

## CI/CD

GitHub será utilizado para o versionamento do código-fonte, permitindo controle de versões, colaboração e rastreabilidade das alterações realizadas no projeto.

GitHub Actions será responsável pela implementação do pipeline de CI/CD, automatizando o processo de build e deploy tanto do frontend quanto do backend, além do provisionamento da infraestrutura na AWS.

Sempre que houver alterações no repositório (por exemplo, um push na branch principal), o pipeline será executado automaticamente.

Durante a execução do pipeline:

- O frontend React será compilado e publicado em um bucket S3 utilizado para hospedagem do site estático.

- O backend serverless (AWS Lambda) será atualizado com o novo código da aplicação.

- A infraestrutura do projeto será criada ou atualizada utilizando AWS CDK, que gera templates do AWS CloudFormation responsáveis por provisionar e gerenciar os recursos da AWS.

Dessa forma, tanto a aplicação quanto a infraestrutura permanecem versionadas no repositório e implantadas automaticamente.

Documentação:

https://docs.github.com/en/get-started  
https://docs.github.com/en/actions

https://dev.to/aws-builders/provisioning-aws-infrastructure-using-github-actions-and-cloudformation-a-gitops-approach-4830

https://medium.com/@olayinkasamuel44/how-to-deploy-a-static-website-to-s3-bucket-using-github-actions-ci-script-fa1acc932fbd

## Linguagem e Framework Frontend

O frontend da aplicação será desenvolvido utilizando React, uma biblioteca JavaScript amplamente utilizada para construção de interfaces modernas, reativas e baseadas em componentes.

O React facilita a criação de componentes reutilizáveis e o gerenciamento do estado da aplicação, tornando o desenvolvimento de interfaces complexas mais organizado e escalável.

Documentação:

https://pt-br.legacy.reactjs.org/docs/getting-started.html

https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide

## Linguagem Backend

O backend da aplicação será desenvolvido em Python, linguagem amplamente utilizada no desenvolvimento de APIs e aplicações serverless na AWS.

Python será utilizado principalmente na implementação das funções executadas no AWS Lambda, responsáveis pela lógica de negócio da aplicação e pela comunicação com o banco de dados.

Documentação:

https://docs.python.org/pt-br/3.13/

https://docs.aws.amazon.com/pt_br/lambda/latest/dg/lambda-python.html

## DevOps e Infraestrutura na Nuvem AWS

A infraestrutura do projeto será provisionada utilizando o conceito de Infraestrutura como Código (Infrastructure as Code -- IaC).

Para isso será utilizado o AWS CDK (Cloud Development Kit) com TypeScript, permitindo definir toda a infraestrutura da aplicação utilizando código. O CDK gera automaticamente templates do AWS CloudFormation, que são responsáveis por criar e gerenciar os recursos na AWS.

Dessa forma, toda a infraestrutura do sistema fica versionada no repositório e pode ser recriada de forma consistente em qualquer ambiente.

Documentação:  
<https://docs.aws.amazon.com/pt_br/cdk/v2/guide/home.html>

https://docs.aws.amazon.com/pt_br/cdk/v2/guide/work-with-cdk-typescript.html

https://www.typescriptlang.org/pt/docs/

# Serviços AWS Utilizados

Os seguintes serviços da AWS serão utilizados na arquitetura do sistema.

## Amazon S3

O Amazon S3 será utilizado para hospedar o frontend da aplicação como um site estático, armazenando os arquivos gerados pelo build do React, como HTML, CSS e JavaScript.

Documentação:

https://docs.aws.amazon.com/pt_br/AmazonS3/latest/userguide/WebsiteHosting.html

## Amazon CloudFront

O Amazon CloudFront será utilizado como CDN (Content Delivery Network) para distribuir o conteúdo do frontend globalmente com baixa latência e alta disponibilidade.

Além disso, o CloudFront será responsável por fornecer HTTPS para a aplicação e melhorar o desempenho do carregamento da interface.

Documentação:

https://docs.aws.amazon.com/pt_br/AmazonCloudFront/latest/DeveloperGuide/Introduction.html

## 

## Amazon API Gateway

O Amazon API Gateway será utilizado para expor e gerenciar as rotas da API do backend, funcionando como ponto de entrada para as requisições feitas pelo frontend.

Esse serviço será responsável por encaminhar as requisições para as funções AWS Lambda, que executarão a lógica de negócio da aplicação.

Documentação:

https://docs.aws.amazon.com/pt_br/apigateway/latest/developerguide/welcome.html

## AWS Lambda

O AWS Lambda será utilizado para executar a lógica de backend da aplicação em um ambiente totalmente serverless.

Cada funcionalidade principal do sistema será implementada por meio de funções Lambda, responsáveis por processar requisições da API, acessar o banco de dados e retornar as respostas para o frontend.

Documentação:

https://docs.aws.amazon.com/lambda/latest/dg/welcome.html

https://docs.aws.amazon.com/pt_br/lambda/latest/dg/lambda-python.html

## Amazon Cognito

O Amazon Cognito será utilizado como serviço de autenticação e gerenciamento de usuários da aplicação.

Ele permitirá implementar login seguro e controle de acesso baseado em perfis de usuário, como:

- alunos;

- professores;

- administradores.

Documentação:

https://docs.aws.amazon.com/pt_br/cognito/latest/developerguide/what-is-amazon-cognito.html

## Amazon DynamoDB

O Amazon DynamoDB será utilizado como banco de dados da aplicação.

Trata-se de um banco NoSQL totalmente gerenciado, altamente escalável e ideal para aplicações serverless. Ele será utilizado para armazenar dados como:

- usuários;

- alunos;

- responsáveis;

- notas;

- anotações dos professores;

- informações de turmas e aulas.

Documentação:

https://docs.aws.amazon.com/pt_br/amazondynamodb/latest/developerguide/Introduction.html

# Estrutura da Aplicação

A aplicação foi desenvolvida seguindo uma arquitetura serverless, utilizando serviços gerenciados da AWS para garantir escalabilidade, baixo custo e facilidade de manutenção.

- Frontend em React;

- API REST gerenciada pelo Amazon API Gateway;

- Lógica de negócio executada por funções AWS Lambda;

- Banco de dados NoSQL Amazon DynamoDB;

- Autenticação e gerenciamento de usuários com Amazon Cognito.

Cada parte da aplicação possui responsabilidades bem definidas, descritas nas seções a seguir.

## Rotas da API (Amazon API Gateway)

O Amazon API Gateway atua como ponto de entrada para todas as requisições feitas pelo frontend. Cada rota da API é responsável por encaminhar a requisição para uma função AWS Lambda específica, onde a lógica de negócio é executada.

As principais rotas da API são:

- /students

  - Responsável por operações relacionadas aos alunos.

  - Operações disponíveis:

    - GET /students

      - Retorna a lista de alunos cadastrados no sistema.

    - GET /students/{id}

      - Retorna os dados detalhados de um aluno específico.

    - POST /students

      - Cria um novo aluno no sistema.

    - DELETE /students/{id}

      - Remove um aluno do sistema.

<!-- -->

- /guardians

  - Gerencia os responsáveis associados a cada aluno.

  - Operações disponíveis:

    - POST /guardians

      - Cadastra um novo responsável para um aluno.

    - GET /guardians?student_id=

      - Retorna os responsáveis vinculados a um aluno.

    - DELETE /guardians/{id}

      - Remove um responsável de um aluno.

- /teachers

  - Responsável pelo gerenciamento de professores.

  - Operações disponíveis:

    - GET /teachers

      - Lista todos os professores cadastrados.

    - POST /teachers

      - Cadastra um novo professor.

    - DELETE /teachers/{id}

      - Remove um professor do sistema.

<!-- -->

- /grades

  - Responsável pelo gerenciamento das notas dos alunos.

  - Operações disponíveis:

    - GET /grades?student_id=

      - Retorna as notas de um aluno específico.

    - POST /grades

      - Permite que um professor registre ou atualize a nota de um aluno.

- /teacher-notes

  - Gerencia anotações feitas por professores sobre alunos.

  - Operações disponíveis:

    - GET /teacher-notes?student_id=

      - Retorna todas as anotações registradas sobre um aluno.

    - POST /teacher-notes

      - Permite que um professor registre uma nova anotação.

<!-- -->

- /schedule

  - Responsável pela consulta da grade de aulas.

  - Operações disponíveis:

    - GET /schedule?class_id=

      - Retorna a grade de aulas de uma turma específica.

## Funções AWS Lambda

Cada rota da API é atendida por uma função Lambda responsável por executar a lógica de negócio e interagir com o banco de dados.

### StudentManager

Responsável por operações relacionadas aos alunos.

Principais responsabilidades:

- criar alunos

- buscar alunos

- excluir alunos

- validar regras de negócio relacionadas aos responsáveis

### GuardianManager

Responsável pelo gerenciamento dos responsáveis dos alunos.

Funções principais:

- cadastrar responsáveis

- remover responsáveis

- consultar responsáveis de um aluno

- garantir que um aluno nunca fique sem responsável

### TeacherManager

Gerencia os dados dos professores.

Funções principais:

- cadastro de professores

- listagem de professores

- remoção de professores

### GradebookManager

Responsável pela gestão das notas dos alunos.

Funções principais:

- registrar notas

- atualizar notas

- consultar notas de alunos

### TeacherNotesManager

Gerencia as anotações feitas por professores sobre alunos.

Funções principais:

- registrar observações

- consultar histórico de anotações

### GradeManager

Responsável pela gestão da grade de aulas.

Funções principais:

- consulta da grade de aulas por turma

- gerenciamento das disciplinas associadas às turmas

### DashboardService

Função utilizada para consultas agregadas utilizadas nos dashboards do sistema.

Exemplos:

- média de notas de alunos

- quantidade de alunos por turma

- estatísticas gerais do sistema

## Banco de Dados (Amazon DynamoDB)

A aplicação utiliza o Amazon DynamoDB como banco de dados NoSQL para armazenamento das informações do sistema.

As principais tabelas são:

### Users

Armazena informações básicas de todos os usuários do sistema.

Campos principais:

- user_id

- name

- email

- role

Tipos de usuário possíveis:

- student

- teacher

- admin

### Students

Armazena dados específicos dos alunos.

Campos principais:

- student_id

- user_id

- class_id

- birth_date

### Guardians

Armazena os dados dos responsáveis pelos alunos.

Campos principais:

- guardian_id

- name

- cpf

- phone

- email

- relationship_type

### StudentGuardians

Tabela responsável pelo relacionamento entre alunos e responsáveis.

Campos principais:

- student_id

- guardian_id

### Teachers

Armazena informações dos professores.

Campos principais:

- teacher_id

- user_id

- subject

### Grades

Armazena as notas dos alunos.

Campos principais:

- student_id

- subject_id

- teacher_id

<!-- -->

- grade

### TeacherNotes

Armazena anotações feitas por professores sobre alunos.

Campos principais:

- student_id

- note_id

- teacher_id

- note

- created_at

### ClassSchedule

Armazena a grade de aulas das turmas.

Campos principais:

- class_id

- subject

- teacher_id

- day_of_week

- time

## Autenticação (Amazon Cognito)

A autenticação da aplicação é gerenciada pelo Amazon Cognito.

O Cognito é responsável por:

- cadastro de usuários

- autenticação

- emissão de tokens JWT

- controle de acesso baseado em grupos

### Grupos de Usuários

O sistema utiliza três grupos principais no Cognito.

Admin

- Usuários com acesso administrativo ao sistema.

Permissões:

- cadastrar alunos

- cadastrar professores

- gerenciar responsáveis

- visualizar dados gerais do sistema

Teacher

- Usuários responsáveis por gerenciar informações acadêmicas.

Permissões:

- registrar notas

- registrar anotações sobre alunos

- visualizar alunos de suas turmas

Student

- Usuários que representam os alunos da escola.

Permissões:

- visualizar notas

- visualizar grade de aulas

- Alunos não podem modificar dados do sistema.

## Páginas do Frontend (React)

O frontend da aplicação foi desenvolvido em React, com páginas específicas para cada tipo de usuário.

### Página de Login

Funções:

- autenticar o usuário utilizando Amazon Cognito

- redirecionar o usuário para o portal correspondente ao seu perfil

### Portal do Aluno

Após o login, alunos são direcionados para sua página inicial.

Funcionalidades:

- visualizar notas

- visualizar média das disciplinas

- consultar grade de aulas

### Portal do Professor

Área destinada aos professores.

Funcionalidades:

- consultar lista de alunos

- registrar notas

- adicionar anotações sobre alunos

- consultar histórico de anotações

### Portal do Administrador

Área de gerenciamento do sistema.

Funcionalidades:

- cadastrar alunos

- cadastrar professores

- gerenciar responsáveis

- visualizar registros do sistema

- Página de Cadastro de Alunos
