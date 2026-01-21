# PATRI-TECH 🏢
**Sistema de Gestão de Patrimônio e Ativos**

O **PATRI-TECH** é uma aplicação Full-Stack desenvolvida para o controle eficiente de bens patrimoniais, unidades, categorias e gestão de usuários com permissões específicas.

---

## 🛠 Tecnologias Utilizadas

Este projeto foi construído utilizando uma arquitetura moderna separada em **Backend (API)** e **Frontend (Interface)**.

### 🐍 Backend (Servidor & API)
O núcleo do sistema, responsável pela lógica de negócios, banco de dados e segurança.

* **Linguagem:** Python 3.12+
* **Framework Principal:** Django 5.x
* **API:** Django REST Framework (DRF)
* **Banco de Dados:** SQLite (Desenvolvimento)
* **Autenticação:** JWT (JSON Web Tokens) via `djangorestframework-simplejwt`
* **Segurança de API:** `django-cors-headers` (Controle de acesso CORS)
* **Interface Administrativa:** Customizada com **Jazzmin**
* **Documentação da API:** `drf-spectacular` (Swagger/OpenAPI)

### ⚛️ Frontend (Interface do Usuário)
A interface visual onde o usuário interage com o sistema.

* **Biblioteca Principal:** React.js
* **Gerenciador de Pacotes:** NPM
* **Comunicação HTTP:** Axios (Para consumir a API do Django)
* **Roteamento:** React Router Dom
* **Ícones:** FontAwesome
* **Estilização:** CSS3 Customizado

---

## ⚙️ Funcionalidades Principais

* **Dashboard Interativo:** Visualização rápida do total de bens, unidades, categorias e valor total do patrimônio.
* **Gestão de Unidades:** Cadastro e controle de locais (escolas, prédios, departamentos).
* **Gestão de Bens:** Controle completo de ativos com valores e categorias.
* **Controle de Acesso (Gestores):**
    * Sistema de permissões granulares (checkboxes).
    * Permissões configuráveis: *Pode Cadastrar*, *Pode Editar*, *Pode Dar Baixa*.
* **Segurança:** Proteção contra cadastro duplicado (CPF Único) e rotas protegidas por Token.

---

## 🚀 Como Rodar o Projeto

Para rodar o sistema, é necessário iniciar o servidor Backend e o servidor Frontend em terminais separados.

### 1. Rodando o Backend (Django)
```bash
# Entre na pasta raiz e ative o ambiente virtual
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instale as dependências (se necessário)
pip install -r requirements.txt

# Execute as migrações do banco
python manage.py migrate

# Inicie o servidor
python manage.py runserver

# Entre na pasta do frontend
cd frontend

# Instale as dependências (primeira vez)
npm install

# Inicie o servidor de desenvolvimento
npm start