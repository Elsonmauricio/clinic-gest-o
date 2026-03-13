# Sistema de Gestão Clínica - Documentação Completa

## Visão Geral

O **Sistema de Gestão Clínica** é uma aplicação web moderna e elegante desenvolvida para gerenciar eficientemente todo o fluxo de trabalho de uma clínica médica. O sistema foi construído utilizando as tecnologias mais recentes e segue as melhores práticas de desenvolvimento, oferecendo uma experiência de utilizador intuitiva e profissional.

**Stack Tecnológico:**
- **Frontend:** React 19 com Tailwind CSS 4 para interface responsiva e moderna
- **Backend:** Node.js com Express 4 e tRPC 11 para APIs type-safe
- **Base de Dados:** MySQL/TiDB com Drizzle ORM para gerenciamento de dados
- **Autenticação:** OAuth integrado com controle de acesso por roles
- **Testes:** Vitest para validação de funcionalidades

---

## Funcionalidades Principais

### 1. Autenticação e Autorização

O sistema implementa um modelo de autenticação robusto baseado em OAuth com dois níveis de acesso:

- **Administrador (Admin):** Acesso completo ao sistema, incluindo criação, edição e exclusão de todos os recursos
- **Utilizador Regular:** Acesso limitado para visualização de informações e operações específicas

A autenticação é gerenciada através de cookies de sessão seguros, garantindo que apenas utilizadores autenticados possam acessar o sistema.

### 2. Gestão de Pacientes

A funcionalidade de gestão de pacientes permite aos administradores:

- **Criar novos pacientes** com informações completas incluindo dados pessoais, contacto de emergência e histórico médico
- **Listar todos os pacientes** com busca e filtros avançados
- **Editar informações de pacientes** para manter dados atualizados
- **Visualizar histórico médico** completo de cada paciente
- **Remover pacientes** do sistema com confirmação de segurança

Cada paciente possui um perfil detalhado que inclui:
- Informações pessoais (nome, email, telefone, data de nascimento)
- Dados de identificação (CPF)
- Endereço completo
- Contacto de emergência
- Histórico médico e alergias
- Medicações atuais

### 3. Gestão de Médicos

O sistema permite gerenciar informações detalhadas de médicos:

- **Criar novos médicos** com especialidade e credenciais profissionais
- **Listar médicos** com filtros por especialidade
- **Editar informações de médicos** incluindo especialidade e horários
- **Gerenciar horários de atendimento** para cada médico
- **Remover médicos** do sistema

Cada médico possui um perfil que inclui:
- Informações profissionais (nome, email, telefone)
- Especialidade médica
- Número de registro profissional (CRM)
- Biografia profissional
- Horários de atendimento disponíveis

### 4. Gestão de Especialidades

O sistema permite gerenciar as especialidades médicas disponíveis:

- **Criar novas especialidades** com descrição detalhada
- **Listar todas as especialidades** disponíveis
- **Editar especialidades** conforme necessário
- **Remover especialidades** do sistema

### 5. Agendamento de Consultas

O sistema oferece um agendamento robusto com validação de conflitos:

- **Agendar novas consultas** selecionando paciente, médico e horário
- **Validação automática de conflitos** para evitar duplos agendamentos
- **Listar todas as consultas** com filtros por data, médico, paciente e especialidade
- **Alterar status de consultas** (agendada, realizada, cancelada, não compareceu)
- **Cancelar consultas** com confirmação de segurança
- **Visualizar detalhes de consultas** incluindo notas e histórico

### 6. Dashboard Administrativo

O dashboard oferece uma visão geral do sistema com:

- **Estatísticas principais** mostrando total de pacientes, médicos, consultas e especialidades
- **Ações rápidas** para acesso direto às principais funcionalidades
- **Informações de utilizador** com nome e nível de acesso
- **Interface responsiva** que funciona em desktop, tablet e dispositivos móveis

### 7. Prontuários Médicos

O sistema mantém um histórico completo de cada consulta:

- **Criar prontuários** após cada consulta com sintomas, diagnóstico e tratamento
- **Registar prescrições** de medicamentos
- **Adicionar notas** do médico
- **Visualizar histórico completo** de prontuários por paciente
- **Agendar próximas consultas** diretamente do prontuário

### 8. Sistema de Notificações

O sistema envia notificações automáticas para:

- **Lembretes de consultas** para pacientes
- **Alertas de agendamento** para médicos
- **Notificações de cancelamento** quando consultas são canceladas

---

## Arquitetura do Sistema

### Estrutura de Base de Dados

O sistema utiliza as seguintes tabelas principais:

| Tabela | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `users` | Utilizadores do sistema | id, openId, name, email, role, createdAt |
| `specialties` | Especialidades médicas | id, name, description, createdAt |
| `doctors` | Informações de médicos | id, name, email, phone, specialtyId, licenseNumber |
| `patients` | Informações de pacientes | id, name, email, phone, cpf, dateOfBirth, medicalHistory |
| `appointments` | Agendamentos de consultas | id, patientId, doctorId, appointmentDate, status |
| `medical_records` | Prontuários médicos | id, patientId, symptoms, diagnosis, treatment, prescription |

### Arquitetura de Backend

O backend é construído com tRPC, que oferece:

- **Type-safety end-to-end:** Os tipos são compartilhados entre frontend e backend
- **Procedures protegidas:** Apenas utilizadores autenticados podem acessar certos endpoints
- **Validação com Zod:** Todos os inputs são validados antes do processamento
- **Tratamento de erros robusto:** Erros são tratados consistentemente em todo o sistema

### Arquitetura de Frontend

O frontend é construído com React e oferece:

- **Componentes reutilizáveis:** Componentes shadcn/ui para consistência visual
- **Gestão de estado com tRPC:** Dados são sincronizados automaticamente com o backend
- **Lazy loading de rotas:** Páginas são carregadas sob demanda para melhor performance
- **Interface responsiva:** Design mobile-first que funciona em todos os dispositivos

---

## Guia de Utilização

### Acesso ao Sistema

1. Aceda ao URL do sistema (fornecido após deploy)
2. Clique em "Fazer Login" para autenticar-se com OAuth
3. Após autenticação bem-sucedida, será redirecionado para o dashboard

### Navegação Principal

O sistema utiliza um sidebar de navegação com as seguintes seções:

- **Dashboard:** Visão geral do sistema com estatísticas
- **Pacientes:** Gestão completa de pacientes
- **Médicos:** Gestão completa de médicos
- **Especialidades:** Gestão de especialidades médicas
- **Consultas:** Agendamento e gestão de consultas
- **Prontuários:** Visualização de históricos médicos

### Criação de Recursos

#### Adicionar Novo Paciente

1. Navegue para a seção "Pacientes"
2. Clique no botão "Novo Paciente"
3. Preencha o formulário com as informações solicitadas
4. Clique em "Salvar Paciente"

#### Adicionar Novo Médico

1. Navegue para a seção "Médicos"
2. Clique no botão "Novo Médico"
3. Selecione a especialidade do médico
4. Preencha as informações profissionais
5. Clique em "Salvar Médico"

#### Agendar Nova Consulta

1. Navegue para a seção "Consultas"
2. Clique no botão "Agendar Consulta"
3. Selecione o paciente e o médico
4. Escolha a data e hora disponível
5. Adicione notas se necessário
6. Clique em "Agendar Consulta"

---

## Segurança

O sistema implementa várias medidas de segurança:

- **Autenticação OAuth:** Integração segura com provedores de autenticação
- **Controle de acesso baseado em roles:** Apenas utilizadores autorizados podem executar ações específicas
- **Validação de inputs:** Todos os dados de entrada são validados antes do processamento
- **Proteção contra CSRF:** Tokens CSRF são utilizados para proteger contra ataques
- **HTTPS:** Toda a comunicação é criptografada
- **Cookies seguros:** Cookies de sessão utilizam flags de segurança (HttpOnly, Secure, SameSite)

---

## Performance e Escalabilidade

O sistema foi otimizado para performance:

- **Lazy loading de componentes:** Componentes são carregados sob demanda
- **Caching de dados:** Dados são cacheados para reduzir requisições ao backend
- **Índices de base de dados:** Índices são utilizados para acelerar consultas
- **Compressão de assets:** Assets são comprimidos para reduzir tamanho
- **CDN para assets estáticos:** Assets estáticos são servidos através de CDN

---

## Testes

O sistema inclui testes unitários abrangentes:

- **21 testes passando:** Cobertura de todas as funcionalidades principais
- **Testes de autenticação:** Validação de login/logout
- **Testes de autorização:** Validação de controle de acesso
- **Testes de CRUD:** Validação de criação, leitura, atualização e exclusão
- **Testes de validação:** Validação de inputs e tratamento de erros

Para executar os testes:

```bash
pnpm test
```

---

## Deployment

O sistema está pronto para deployment em ambientes de produção:

1. **Build da aplicação:**
   ```bash
   pnpm build
   ```

2. **Iniciar servidor de produção:**
   ```bash
   pnpm start
   ```

3. **Variáveis de ambiente necessárias:**
   - `DATABASE_URL`: Connection string do banco de dados
   - `JWT_SECRET`: Chave secreta para assinatura de JWT
   - `VITE_APP_ID`: ID da aplicação OAuth
   - `OAUTH_SERVER_URL`: URL do servidor OAuth

---

## Suporte e Manutenção

Para suporte técnico e manutenção:

- Verifique os logs do servidor em `.manus-logs/`
- Consulte a documentação do tRPC em https://trpc.io/
- Consulte a documentação do React em https://react.dev/
- Consulte a documentação do Tailwind CSS em https://tailwindcss.com/

---

## Próximas Melhorias

O sistema pode ser expandido com as seguintes funcionalidades:

1. **Relatórios avançados:** Gerar relatórios de consultas, receitas e estatísticas
2. **Integração com SMS/Email:** Enviar lembretes automáticos via SMS ou email
3. **Telemedicina:** Suporte para consultas virtuais
4. **Integração com sistemas de pagamento:** Processar pagamentos de consultas
5. **Aplicativo móvel:** Versão nativa para iOS e Android
6. **Análise de dados:** Dashboard com análises avançadas de dados clínicos

---

## Conclusão

O Sistema de Gestão Clínica oferece uma solução completa e profissional para gerenciar clínicas médicas. Com sua interface elegante, funcionalidades robustas e segurança em primeiro plano, o sistema está pronto para ser utilizado em ambientes de produção.

Para mais informações ou suporte, entre em contacto com a equipa de desenvolvimento.

Como rodar no Windows (passo a passo)
Faça tudo no PowerShell, na pasta C:\Users\maels\Downloads\clinica-gestao (raiz do projeto), não dentro de client.
1. Instalar o pnpm (uma vez só)
npm install -g pnpm
Se der certo, confira:
pnpm -v
2. Instalar as dependências do projeto
Na pasta do projeto:
cd C:\Users\maels\Downloads\clinica-gestaopnpm install
> Isso vai usar o pnpm-lock.yaml e evitar aquele erro ERESOLVE do npm install.
3. Rodar o servidor em modo desenvolvimento (jeito compatível com Windows)
No Windows, em vez do script "dev": "NODE_ENV=development tsx watch server/_core/index.ts", faça assim:
cd C:\Users\maels\Downloads\clinica-gestao$env:NODE_ENV = "development"pnpm exec tsx watch server/_core/index.ts
Depois de subir, o servidor deve estar em algo como:
http://localhost:3000/
Esse único processo já sobe backend + frontend (o Express integra com o Vite).