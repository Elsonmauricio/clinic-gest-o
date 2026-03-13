# Sistema de Gestão Clínica - TODO

## Fase 1: Arquitetura e Design
- [x] Analisar requisitos do projeto
- [x] Definir estrutura de base de dados
- [x] Planejar arquitetura de autenticação
- [x] Definir design visual e paleta de cores

## Fase 2: Base de Dados
- [x] Criar tabelas de especialidades
- [x] Criar tabelas de médicos
- [x] Criar tabelas de pacientes
- [x] Criar tabelas de consultas
- [x] Criar tabelas de histórico/prontuários
- [x] Executar migrações SQL

## Fase 3: Backend - Autenticação e Autorização
- [x] Implementar middleware de autenticação
- [x] Criar procedimentos de login/logout
- [x] Implementar controle de acesso por role (admin/user)
- [x] Testar autenticação com vitest

## Fase 3: Backend - CRUD de Especialidades
- [x] Criar procedimento de listagem de especialidades
- [x] Criar procedimento de criação de especialidade
- [x] Criar procedimento de atualização de especialidade
- [x] Criar procedimento de exclusão de especialidade
- [x] Testar com vitest

## Fase 3: Backend - CRUD de Médicos
- [x] Criar procedimento de listagem de médicos
- [x] Criar procedimento de criação de médico
- [x] Criar procedimento de atualização de médico
- [x] Criar procedimento de exclusão de médico
- [x] Criar procedimento de listagem de horários disponíveis
- [x] Testar com vitest

## Fase 3: Backend - CRUD de Pacientes
- [x] Criar procedimento de listagem de pacientes
- [x] Criar procedimento de criação de paciente
- [x] Criar procedimento de atualização de paciente
- [x] Criar procedimento de exclusão de paciente
- [x] Criar procedimento de obtenção de histórico de paciente
- [x] Testar com vitest

## Fase 3: Backend - Agendamento de Consultas
- [x] Criar procedimento de listagem de consultas
- [x] Criar procedimento de agendamento com validação de conflitos
- [x] Criar procedimento de atualização de status de consulta
- [x] Criar procedimento de cancelamento de consulta
- [x] Criar procedimento de filtro de consultas (data, médico, paciente, especialidade)
- [x] Testar com vitest

## Fase 3: Backend - Notificações
- [x] Implementar sistema de notificações para lembretes
- [x] Criar procedimento de envio de notificações

## Fase 4: Frontend - Layout e Navegação
- [x] Configurar DashboardLayout com sidebar
- [x] Implementar navegação principal
- [x] Criar estrutura de rotas
- [x] Implementar autenticação no frontend

## Fase 4: Frontend - Dashboard Administrativo
- [x] Criar página de dashboard com estatísticas
- [x] Implementar gráficos de dados (consultas, pacientes, médicos)
- [x] Criar widgets de informações principais
- [x] Implementar filtros e visualizações

## Fase 4: Frontend - Gestão de Especialidades
- [x] Criar página de listagem de especialidades
- [x] Implementar formulário de criação
- [ ] Implementar formulário de edição
- [x] Implementar exclusão com confirmação

## Fase 4: Frontend - Gestão de Médicos
- [x] Criar página de listagem de médicos
- [x] Implementar formulário de criação com seleção de especialidade
- [ ] Implementar formulário de edição
- [ ] Implementar gestão de horários disponíveis
- [x] Implementar exclusão com confirmação

## Fase 4: Frontend - Gestão de Pacientes
- [x] Criar página de listagem de pacientes
- [x] Implementar formulário de criação com informações pessoais
- [ ] Implementar formulário de edição
- [ ] Implementar visualização de histórico de consultas
- [x] Implementar exclusão com confirmação

## Fase 4: Frontend - Agendamento de Consultas
- [x] Criar página de listagem de consultas
- [x] Implementar formulário de agendamento com validação
- [ ] Implementar calendário de disponibilidade
- [x] Implementar filtros (data, médico, paciente, especialidade)
- [ ] Implementar visualização de detalhes de consulta
- [x] Implementar cancelamento de consulta
- [ ] Implementar edição de consulta

## Fase 4: Frontend - Prontuários Médicos
- [ ] Criar página de visualização de prontuários
- [ ] Implementar adição de notas ao prontuário
- [ ] Implementar histórico de consultas com detalhes

## Fase 5: Integração e Testes
- [ ] Testar fluxo de autenticação completo
- [ ] Testar CRUD de todas as entidades
- [ ] Testar agendamento com conflitos
- [ ] Testar filtros e buscas
- [ ] Testar notificações
- [ ] Testar responsividade em diferentes dispositivos
- [ ] Corrigir bugs e ajustar UI

## Fase 6: Documentação e Entrega
- [ ] Criar documentação técnica
- [ ] Criar guia de utilização
- [ ] Preparar checkpoint final
- [ ] Entregar sistema ao utilizador
