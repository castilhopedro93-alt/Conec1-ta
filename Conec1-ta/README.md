# Conec-ta — Sistema de Reserva de Salas

Sistema web para reservar salas de uma instituição de ensino. Mostra quais salas estão livres, impede reservas no mesmo horário, organiza a agenda de todas as salas num só lugar e guarda o histórico de tudo o que acontece. Os dados ficam num banco de dados online, então todos os usuários veem as mesmas reservas, em qualquer computador ou celular.

Projeto desenvolvido como **Trabalho de Conclusão de Curso (TCC)**, seguindo a metodologia ágil **Scrum**, dividido em **8 sprints**, com melhorias contínuas depois delas.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Como rodar o projeto](#como-rodar-o-projeto)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Banco de dados (Supabase)](#banco-de-dados-supabase)
- [Perfis de acesso](#perfis-de-acesso)
- [Regras de negócio](#regras-de-negócio)
- [Sprints](#sprints)
- [Melhorias depois das sprints](#melhorias-depois-das-sprints)
- [Limitações e próximos passos](#limitações-e-próximos-passos)
- [Equipe](#equipe)

---

## Funcionalidades

### Conta e acesso
- Cadastro com nome, e-mail e senha, com confirmação por e-mail
- Login, com aviso quando o e-mail não existe ou a senha está errada
- Recuperação de senha por e-mail ("Esqueci minha senha")
- Botão de **mostrar/esconder senha** em todos os campos de senha
- Cada pessoa só pode editar ou cancelar **as próprias reservas**

### Salas *(administradores)*
- Cadastro de salas com nome, número, capacidade, descrição e recursos (projetor, computadores, acessibilidade, quadro branco, caixa de som)
- Edição e exclusão de salas, com confirmação
- Não permite repetir o número de uma sala

### Reservas
- Reserva com sala, data, horário de início e fim, número de participantes, responsável e finalidade
- Bloqueio de **conflito de horário** na mesma sala, com aviso explicando o motivo
- Bloqueio de datas e horários que já passaram
- Bloqueio quando o número de participantes passa da **capacidade da sala**
- **Repetição em dias da semana**: escolher os dias (segunda a sexta) e até quando repetir, com o botão "Marcar a semana toda". Sábado e domingo aparecem, mas ficam bloqueados
- Cancelar só uma reserva da repetição ou todas as próximas

### Encontrar e acompanhar
- **Dashboard**: salas livres agora, reservas do dia, ocupação e próximas reservas, com atualização automática a cada minuto
- **Buscar salas**: busca por data, horário, número de pessoas e recursos, mostrando as salas que servem e o motivo das que não servem
- **Agenda**: grade com as salas nas colunas e as horas nas linhas, linha da hora atual e reserva com um clique num horário livre
- **Minhas reservas**: as reservas da pessoa logada, separadas em próximas e anteriores
- **Reservas**: lista de todas as reservas, com busca e filtros

### Histórico e relatórios
- **Histórico**: registro de quem reservou, editou ou cancelou, e o que mudou, mesmo depois que a reserva deixa de existir
  - Filtro por período (**últimos 7 dias**, **últimos 30 dias** ou **todo o histórico**), por tipo de ação, por sala e por texto
- **Relatórios**: reservas no período, horas reservadas, ocupação média, cancelamentos, salas mais usadas, **mapa de calor dos horários de pico**, quem mais reserva e reservas por dia da semana
  - Períodos por semana, mês ou semestre, comparando com o período anterior
  - Botão **Baixar PDF** (folha A4 só com o relatório)

### Configurações da conta
- Editar o nome (atualiza o menu e as próprias reservas)
- Trocar a senha (pede a senha atual)
- **Tamanho do texto**: Normal, Grande ou Extra grande (acessibilidade)
- **Sair de todos os dispositivos**
- **Excluir conta**: cancela as reservas futuras e apaga o usuário (pede a senha e confirmação)

### Interface
- Tema claro e escuro
- Layout responsivo: computador, tablet e celular (menu "☰")
- Adapta-se ao **zoom do navegador** (100% a 300%) sem cortar o menu nem o conteúdo
- Uma cor e um ícone para cada sala em todo o site

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Estrutura | HTML5 |
| Visual | CSS3 (variáveis, grid, flexbox, tema escuro, responsivo) |
| Lógica | JavaScript puro (sem frameworks) |
| Banco de dados | [Supabase](https://supabase.com) (PostgreSQL) |
| Login | Supabase Auth (e-mail e senha) |
| Desenvolvimento | VS Code + extensão Live Server |
| Versionamento | Git e GitHub |

---

## Como rodar o projeto

1. Instale o [Git](https://git-scm.com) e o [VS Code](https://code.visualstudio.com) com a extensão **Live Server**.
2. Clone o repositório:
   ```
   git clone https://github.com/castilhopedro93-alt/Conec1-ta
   ```
   ou, no VS Code: **Ctrl + Shift + P** → `Git: Clone` → cole o endereço acima.
3. Abra a pasta no VS Code.
4. Clique com o botão direito em **`Conec1-ta/html/login.html`** → **Open with Live Server**.
5. Crie uma conta (aba "Ainda não tenho uma conta") ou entre com uma conta existente.

> É preciso estar conectado à internet, porque os dados ficam no Supabase.

**Dica:** para o Live Server já abrir na pasta certa, crie o arquivo `.vscode/settings.json` na raiz do repositório com:
```json
{
    "liveServer.settings.root": "/Conec1-ta"
}
```

---

## Estrutura de pastas

```
Conec1-ta/
├── html/
│   ├── login.html          → login, cadastro e recuperação de senha
│   ├── index.html          → o sistema (todas as telas)
│   ├── redefinir.html      → criar nova senha (link do e-mail)
│   └── confirmado.html     → confirmação do cadastro (link do e-mail)
├── css/
│   ├── style.css           → visual do sistema
│   └── login.css           → visual das telas de login
├── js/
│   ├── bdsupa.js           → conexão com o Supabase
│   ├── sincronizar.js      → carrega e salva salas, reservas e histórico no banco
│   ├── script.js           → telas, regras de reserva, agenda, histórico, relatórios e configurações
│   └── mostrar-senha.js    → botão de mostrar/esconder senha
├── sql/
│   └── excluir-conta.sql   → função do banco usada para excluir a conta
├── fundologin.png          → imagem da tela de login
└── README.md
```

---

## Banco de dados (Supabase)

| Tabela | O que guarda |
|---|---|
| `rooms` | Salas: nome, número, capacidade, descrição e recursos |
| `reservations` | Reservas: sala, data, horário, participantes, responsável, finalidade e quem reservou |
| `history` | Histórico de ações: reserva feita, editada ou cancelada, com data, autor e o que mudou |
| `admins` | E-mails dos administradores |

| Função | Para que serve |
|---|---|
| `email_cadastrado` | No login, diz se o e-mail existe (para mostrar "senha incorreta" ou sugerir o cadastro) |
| `excluir_minha_conta` | Apaga a conta da pessoa logada e as reservas futuras dela. O código está em `sql/excluir-conta.sql` e precisa ser rodado uma vez no **SQL Editor** do Supabase |

> **Atenção:** no plano gratuito, o Supabase **pausa o projeto depois de 7 dias sem uso**. Se o login mostrar "Failed to fetch", entre no painel do Supabase e clique em **Restore project**. Antes de apresentações, abra o site com algumas horas de antecedência.

---

## Perfis de acesso

| Ação | Usuário | Administrador |
|---|:-:|:-:|
| Ver dashboard, agenda, reservas, histórico e relatórios | ✅ | ✅ |
| Buscar sala e fazer reservas | ✅ | ✅ |
| Editar e cancelar as **próprias** reservas | ✅ | ✅ |
| Criar, editar e excluir salas | — | ✅ |
| Configurações da própria conta | ✅ | ✅ |

Uma pessoa vira administradora quando o e-mail dela é adicionado à tabela `admins` no Supabase.

---

## Regras de negócio

- Horário de funcionamento: **08:00 às 18:00**, em intervalos de **30 minutos**
- Uma sala não pode ter duas reservas no mesmo horário
- Não é possível reservar em data ou horário que já passou
- O número de participantes não pode passar da capacidade da sala
- A repetição vale só para dias úteis (**segunda a sexta**) e dura no máximo **26 semanas**
- Só quem fez a reserva pode editá-la ou cancelá-la
- Toda reserva feita, editada ou cancelada fica registrada no histórico

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
| 7 | Funções avançadas de reserva | Repetição, editar sala, recursos e capacidade |
| 8 | Busca de sala livre e acabamento | Busca inteligente, ícones, cores e testes |

### Sprint 1 — Estrutura e identidade visual
**Objetivo:** criar a base do site e a navegação.
- [x] Layout com menu lateral, topo e área de conteúdo
- [x] Navegação entre as telas
- [x] Identidade visual Conec-ta (nome, logo e cores)
- [x] Tema claro e escuro
- [x] Layout responsivo para celular

### Sprint 2 — Cadastro de salas
**Objetivo:** permitir gerenciar as salas disponíveis.
- [x] Tela "Criar Sala" com nome, número, capacidade e descrição
- [x] Validação para não repetir o número da sala
- [x] Lista de salas cadastradas
- [x] Exclusão com modal de confirmação

### Sprint 3 — Reservas básicas
**Objetivo:** permitir reservar uma sala.
- [x] Formulário de reserva (sala, data, responsável e finalidade)
- [x] Tabela com todas as reservas
- [x] Busca e filtros por sala e por data
- [x] Detalhes, edição e cancelamento da reserva

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
- [x] Atualização automática a cada minuto

### Sprint 7 — Funções avançadas de reserva
**Objetivo:** atender casos reais de uso.
- [x] Reserva com repetição, cancelando só uma ou todas
- [x] Editar sala, atualizando o nome nas reservas existentes
- [x] Recursos das salas (projetor, computadores, acessibilidade…)
- [x] Número de participantes, com bloqueio quando passa da capacidade

### Sprint 8 — Busca de sala livre e acabamento
**Objetivo:** facilitar encontrar a sala certa e finalizar o produto.
- [x] Busca por data, horário, número de pessoas e recursos
- [x] Lista das salas que não servem, com o motivo
- [x] Novos ícones e cores por sala em todo o site
- [x] Testes finais de todas as funções e correções

---

## Melhorias depois das sprints

| Melhoria | O que trouxe |
|---|---|
| Login e cadastro | Contas com Supabase Auth, confirmação por e-mail e recuperação de senha |
| Banco de dados online | Salas, reservas e histórico no Supabase, compartilhados entre todos os computadores |
| Administradores | Só administradores gerenciam as salas |
| Minhas reservas | Tela com as reservas da pessoa logada; só o dono edita ou cancela |
| Histórico geral | Registro de todas as ações, com filtros e período (7 dias, 30 dias ou tudo) |
| Relatórios | Indicadores, gráficos, mapa de calor e exportação em PDF |
| Repetição por dias da semana | Escolha de segunda a sexta, com sábado e domingo bloqueados |
| Configurações da conta | Editar nome, trocar senha, tamanho do texto, sair de todos os dispositivos e excluir conta |
| Mostrar senha | Botão de olho em todos os campos de senha |
| Ajuste de zoom | Menu e telas se adaptam ao zoom do navegador sem cortar nada |

---

## Limitações e próximos passos

- **Projeto pausado por inatividade:** o plano gratuito do Supabase pausa o banco depois de 7 dias sem uso (ver [Banco de dados](#banco-de-dados-supabase)).
- **Lembretes:** enviar e-mail antes do horário da reserva exigiria um serviço rodando no servidor.
- **Trocar e-mail e foto de perfil:** possíveis com o Supabase, mas ainda não implementados.
- **Gerenciar administradores pelo site:** hoje é preciso adicionar o e-mail na tabela `admins` direto no Supabase.

---

## Equipe

- **Pedro**
- **André**

Trabalho de Conclusão de Curso — 2026.
