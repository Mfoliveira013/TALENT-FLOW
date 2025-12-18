# 🚀 TALENT-FLOW — Banco de Talentos 

> Plataforma inteligente para gestão de talentos, recrutamento e agendamento de entrevistas, com apoio de IA para classificação automática de currículos.

---

## 📌 Visão Geral

O **BTNEF** é um sistema web de **Banco de Talentos corporativo**, desenvolvido para centralizar currículos, automatizar triagens por setor e facilitar o processo de recrutamento e entrevistas.

A plataforma foi projetada para uso por **RH, recrutadores e assistentes de RH**, com controle de permissões, agenda integrada e notificações automáticas.

---

## 🎯 Objetivos do Projeto

- Centralizar currículos em um único sistema
- Automatizar a separação de candidatos por setor usando IA
- Facilitar o agendamento e controle de entrevistas
- Reduzir tarefas manuais do RH
- Criar uma base escalável de talentos internos e externos

---

## 👥 Tipos de Usuário

| Perfil | Descrição |
|------|----------|
| **RH / Recrutador** | Acesso total aos currículos, agenda e entrevistas |
| **Assistente de RH** | Acesso operacional com permissões limitadas |

---

## 🔄 Fluxo da Plataforma

### 1️⃣ Login / Cadastro
- Login por e-mail e senha
- Login via Google
- Cadastro inicial simples

### 2️⃣ Configuração Inicial (Obrigatória)
Após login ou cadastro, o usuário é direcionado para uma **tela de regras de seleção**, onde define:
- Nome completo
- Setor de trabalho
- Filial
- Cargo / Tipo de conta
- Permissões iniciais

> ⚠️ O acesso ao painel só é liberado após essa configuração.

### 3️⃣ Painel Principal
- Upload de currículos (PDF/DOC)
- Visualização organizada por setor
- Filtros por área profissional

### 4️⃣ IA de Classificação
A IA analisa os currículos e classifica automaticamente em setores como:
- Administrativo
- Jurídico
- Negociador de Cobrança
- Advogado
- RH
- Outros

### 5️⃣ Agenda de Entrevistas
- Calendário integrado
- Agendamento de entrevistas
- Lembretes automáticos via:
  - 📧 E-mail
  - 📱 SMS
  - 💬 WhatsApp

---

## 🧠 Inteligência Artificial

A IA é responsável por:
- Leitura e análise de currículos
- Identificação de área profissional
- Organização automática por setor
- Apoio à triagem inicial de candidatos

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Web responsivo (desktop e mobile)
- **Backend:** API local (localhost)
- **Banco de Dados:** Gerado automaticamente pela plataforma
- **Autenticação:** E-mail/Senha + Google
- **IA:** Classificação de texto (currículos)
- **Notificações:** E-mail / SMS / WhatsApp

---

## 📂 Estrutura do Projeto (exemplo)

```bash
btnef/
├── frontend/
│   ├── login/
│   ├── cadastro/
│   ├── configuracao-inicial/
│   ├── dashboard/
│   └── agenda/
├── backend/
│   ├── auth/
│   ├── curriculos/
│   ├── entrevistas/
│   └── notificacoes/
└── README.md
