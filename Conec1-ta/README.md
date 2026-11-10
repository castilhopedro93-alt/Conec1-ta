# Conec-ta — Sistema de Reserva de Salas

Sistema web para reservar salas: mostra quais salas estão livres, evita reservas no mesmo horário e organiza a agenda de todas as salas num só lugar.

Projeto desenvolvido como Trabalho de Conclusão de Curso (TCC), seguindo a metodologia ágil **Scrum**, dividido em **8 sprints**.

## Como abrir

1. Baixe ou clone este repositório.
2. Abra o arquivo `index.html` no navegador (ou use a extensão **Live Server** do VS Code).

Não precisa instalar nada. Os dados ficam salvos no próprio navegador (`localStorage`).

## Tecnologias

- HTML5
- CSS3 (layout responsivo, tema claro e escuro)
- JavaScript puro (sem bibliotecas)
- `localStorage` para guardar salas e reservas

## Funcionalidades

- Dashboard com salas livres agora, reservas do dia, ocupação e próximas reservas
- Agenda visual por sala e horário, com linha da hora atual
- Cadastro, edição e exclusão de salas, com recursos (projetor, ar-condicionado…) e capacidade
- Reservas com horário de início e fim, bloqueio de conflitos e de horários que já passaram
- Reserva semanal (repetição), com opção de cancelar uma ou todas
- Busca de sala livre por data, horário, número de pessoas e recursos
- Exportação das reservas para planilha (CSV)

---

## Sprints

| Sprint | Tema | Principal entrega |
|:-:|---|---|
| 1 | Estrutura e identidade visual | Layout, menu e navegação entre telas |
| 2 | Cadastro de salas | Criar, listar e excluir salas |
| 3 | Reservas básicas | Reservar, listar, filtrar e cancelar |
| 4 | Regras de horário | Início/fim, conflitos e horários passados |
| 5 | Agenda visual | Grade por sala e hora, reservar com um clique |
| 6 | Dashboard e status das salas | Situação das salas em tempo real |
| 7 | Funções avançadas de reserva | Reserva semanal, editar sala, recursos e capacidade |
| 8 | Busca de sala livre e acabamento | Busca inteligente, ícones, cores e testes |

### Sprint 1 — Estrutura e identidade visual
**Objetivo:** criar a base do site e a navegação.
- [x] Layout com menu lateral, topo e área de conteúdo
- [x] Navegação entre Dashboard, Agenda, Salas e Reservas
- [x] Identidade visual Conec-ta (nome, logo e cores)
- [x] Tema claro e escuro
- [x] Layout responsivo para celular

### Sprint 2 — Cadastro de salas
**Objetivo:** permitir gerenciar as salas disponíveis.
- [x] Tela "Criar Sala" com nome, número, capacidade e descrição
- [x] Validação para não repetir o número da sala
- [x] Lista de salas cadastradas
- [x] Exclusão com modal de confirmação
- [x] Dados salvos no navegador (`localStorage`)

### Sprint 3 — Reservas básicas
**Objetivo:** permitir reservar uma sala.
- [x] Formulário de reserva (sala, data, responsável e finalidade)
- [x] Tabela com todas as reservas
- [x] Busca e filtros por sala e por data
- [x] Detalhes, edição e cancelamento da reserva
- [x] Exportação das reservas para CSV

### Sprint 4 — Regras de horário
**Objetivo:** garantir que as reservas façam sentido.
- [x] Horário de início e de término (de 30 em 30 minutos)
- [x] Bloqueio de conflito quando dois horários se sobrepõem na mesma sala
- [x] Bloqueio de datas e horários que já passaram
- [x] Aviso explicando por que não é possível reservar

### Sprint 5 — Agenda visual
**Objetivo:** mostrar a ocupação das salas de forma visual.
- [x] Grade com as salas nas colunas e as horas nas linhas
- [x] Blocos de reserva com altura proporcional à duração
- [x] Clique num horário livre para abrir a reserva já preenchida
- [x] Navegação entre dias e linha da hora atual
- [x] Uma cor para cada sala

### Sprint 6 — Dashboard e status das salas
**Objetivo:** mostrar a situação no momento.
- [x] Indicadores: total de salas, salas livres agora, reservas do dia e ocupação
- [x] Agenda do dia e próximas reservas
- [x] Status de cada sala: Ocupada, Reservada ou Livre
- [x] Próximas reservas de cada sala
- [x] Atualização automática a cada minuto

### Sprint 7 — Funções avançadas de reserva
**Objetivo:** atender casos reais de uso.
- [x] Reserva semanal, com opção de cancelar só uma ou todas da série
- [x] Editar sala, atualizando o nome nas reservas existentes
- [x] Recursos das salas (projetor, ar-condicionado, computadores…)
- [x] Número de participantes, com bloqueio quando passa da capacidade

### Sprint 8 — Busca de sala livre e acabamento
**Objetivo:** facilitar encontrar a sala certa e finalizar o produto.
- [x] Busca por data, horário, número de pessoas e recursos
- [x] Lista das salas que não servem, com o motivo
- [x] Atalhos quando a data ou o horário escolhido já passou
- [x] Novos ícones e cores por sala em todo o site
- [x] Testes finais de todas as funções e correções

---

## Limitações e próximos passos

- Os dados ficam salvos só no navegador de cada computador. Um próximo passo seria usar um banco de dados (por exemplo, Firebase) para compartilhar as reservas entre computadores.
- Ainda não há login. Com login, cada pessoa poderia cancelar apenas as próprias reservas, e só administradores gerenciariam as salas.
