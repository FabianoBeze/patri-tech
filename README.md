# PATRI-TECH

Sistema web de **gestão de patrimônio e ativos**: cadastro de bens, unidades, salas e
categorias, controle de baixas, permissões por gestor e histórico de movimentações.

Feito para quem precisa saber *o que existe, onde está e quanto vale*: setores de
patrimônio de órgãos públicos, escolas, pequenas empresas e escritórios que ainda
controlam bens em planilhas. O sistema é **white-label** — a identidade visual pode ser
trocada por cliente sem mexer no código de negócio.

> **English summary:** PATRI-TECH is a full-stack asset/inventory management app for
> organizations that still track equipment in spreadsheets. It handles assets, sites,
> rooms, categories, write-offs, per-user permissions and a movement history. Built with
> Django REST Framework (JWT auth, OpenAPI docs) and React. See
> [Getting started](#-como-rodar) for setup; the codebase and docs are in Portuguese.

---

## Sumário

- [Funcionalidades](#-funcionalidades)
- [Stack](#-stack)
- [Arquitetura](#-arquitetura)
- [Como rodar](#-como-rodar)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Endpoints da API](#-endpoints-da-api)
- [Testes](#-testes)
- [Qualidade e segurança](#-qualidade-e-segurança)
- [Limitações conhecidas](#-limitações-conhecidas)
- [Roadmap](#-roadmap)
- [Licença](#-licença)

## Funcionalidades

- **Dashboard** com totais de bens, unidades, categorias e valor estimado dos ativos.
- **Bens**: tombamento único, número de série, valor, situação, estado de conservação,
  origem (próprio, doação, alugado), categoria, unidade e sala.
- **Baixa de bens** com data e justificativa, mantendo o registro no histórico.
- **Unidades, salas e categorias** com relacionamentos protegidos (`PROTECT`), evitando
  exclusões que quebrem o inventário.
- **Permissões granulares por gestor**: cadastrar, editar e dar baixa em bens; cadastrar
  unidades, categorias, salas e gestores; editar categorias e salas.
- **Histórico de movimentações** por bem, com autor e data — mostra transferências entre
  salas e entre unidades.
- **Autenticação JWT** (access + refresh) e rotas protegidas no frontend.
- **Documentação OpenAPI** navegável em `/docs/`.

## Stack

**Backend**

- Python 3.12+ / Django 5.2
- Django REST Framework 3.16
- SimpleJWT (autenticação)
- drf-spectacular (OpenAPI/Swagger)
- django-cors-headers
- SQLite em desenvolvimento; PostgreSQL em produção via `DATABASE_URL`

**Frontend**

- React 19 (Create React App)
- React Router 7
- Axios
- Recharts (gráficos)
- FontAwesome / React Icons
- CSS próprio (sem framework de UI)

## Arquitetura

```
patri-tech/
├── core/                     # App Django: models, serializers, views, permissions, testes
│   ├── management/commands/  # seed_demo: popula dados fictícios
│   ├── migrations/
│   └── tests.py
├── projeto/                  # Configuração do projeto Django (settings, urls, wsgi/asgi)
├── frontend/                 # Aplicação React
│   ├── public/
│   └── src/                  # Telas, componentes e cliente da API (src/api.js)
├── .env.example              # Variáveis do backend
├── requirements.txt
└── manage.py
```

O backend expõe uma API REST consumida pelo frontend. O token JWT fica no
`localStorage` e é renovado automaticamente pelo cliente quando expira.

## Como rodar

Pré-requisitos: **Python 3.12+**, **Node.js 18+** e **npm**.

### 1. Backend

```bash
# na raiz do repositório
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/macOS

pip install -r requirements.txt

# configure as variáveis de ambiente
copy .env.example .env         # Windows
# cp .env.example .env         # Linux/macOS

python manage.py migrate
python manage.py createsuperuser

# opcional: dados fictícios para explorar a interface
python manage.py seed_demo

python manage.py runserver
```

- API: <http://127.0.0.1:8000/api/>
- Swagger: <http://127.0.0.1:8000/docs/>
- Admin: <http://127.0.0.1:8000/admin/>

### 2. Frontend

```bash
cd frontend
npm install

copy .env.example .env         # Windows
# cp .env.example .env         # Linux/macOS

npm start
```

A interface abre em <http://localhost:3000>.

### 3. Dados de demonstração

`seed_demo` cria unidades, categorias, salas, bens e usuários **fictícios** (CPF
`000.000.001-00`, patrimônios inventados). A senha é gerada aleatoriamente e exibida no
terminal; use `--password` para definir uma:

```bash
python manage.py seed_demo --password minha-senha
```

## Variáveis de ambiente

Backend (`.env`, baseado em `.env.example`):

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | chave de desenvolvimento | **Obrigatória em produção.** Gere uma nova com `python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"` |
| `DJANGO_DEBUG` | `True` | Use `False` em produção |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Hosts aceitos, separados por vírgula |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Origens do frontend |
| `DEFAULT_GESTOR_PASSWORD` | vazio | Senha inicial para gestores criados sem senha; se vazio, o campo passa a ser obrigatório |
| `JWT_ACCESS_MINUTES` | `60` | Validade do access token |
| `JWT_REFRESH_DAYS` | `7` | Validade do refresh token |
| `DATABASE_URL` | — | Opcional; PostgreSQL em produção |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME` | — | Opcional; armazenamento de mídia em S3 |

Frontend (`frontend/.env`):

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `REACT_APP_API_URL` | `http://127.0.0.1:8000` | URL base da API do Django |

> Nenhum arquivo `.env` é versionado. Os arquivos `.env.example` contêm apenas
> placeholders.

## Endpoints da API

Autenticação: `POST /api/token/` (usuário e senha) e `POST /api/token/refresh/`.
Envie o access token no header `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/dashboard-stats/` | Totais do dashboard |
| `CRUD` | `/api/unidades/` | Unidades |
| `CRUD` | `/api/categorias/` | Categorias |
| `CRUD` | `/api/bens/` | Bens (filtro `?sala=<id>`) |
| `GET` | `/api/bens/{id}/historico/` | Histórico do bem |
| `CRUD` | `/api/salas/` | Salas (filtro `?unidade=<id>`) |
| `CRUD` | `/api/gestores/` | Gestores e suas permissões |
| `GET` | `/api/historicos/` | Histórico geral (filtro `?bem=<id>`) |
| `GET` | `/schema/`, `/docs/` | Schema OpenAPI e Swagger UI |

Regras de escrita: administradores (`is_staff`) podem tudo; gestores precisam da
permissão específica da ação (`pode_cadastrar`, `pode_editar`, `pode_dar_baixa`, ...).

## Testes

**Backend** — 17 testes cobrindo autenticação, CRUD de bens, unicidade de tombo,
histórico de transferências, permissões de gestor e criação de usuários:

```bash
python manage.py test
```

**Frontend**:

```bash
cd frontend
npm test -- --watchAll=false
```

## Qualidade e segurança

- Sem credenciais no repositório: configuração via variáveis de ambiente, `.env` fora
  do Git e `.env.example` com placeholders.
- Senha inicial de gestor não é mais fixa no código: vem de
  `DEFAULT_GESTOR_PASSWORD` ou é exigida no cadastro.
- Permissões de escrita verificadas no backend (não apenas escondidas na interface).
- Senhas armazenadas com o hash do Django; autenticação por JWT com expiração curta.
- Toda movimentação de bem gera um registro de histórico com autor e data.
- Dados de demonstração são fictícios. **Não use dados pessoais reais** em
  desenvolvimento.

## Limitações conhecidas

Itens que já estão mapeados no [ROADMAP](ROADMAP.md):

- Listagens sem paginação — com muitos bens a resposta fica pesada.
- O CPF é usado como `username` do usuário do gestor (herança do modelo inicial).
- Sem CI configurada; os testes rodam localmente.
- Edições feitas pelo Django Admin não geram registro de histórico.
- Sem container/Docker para subir o ambiente completo.

## Roadmap

As próximas entregas estão em [ROADMAP.md](ROADMAP.md), organizadas por tema e com
estimativa de esforço.

## Licença

Distribuído sob a licença **MIT**. Veja [LICENSE](LICENSE).

## Independência

Este é um projeto pessoal e independente, sem vínculo com órgãos públicos, empresas ou
instituições. Brasões e marcas de terceiros usados em protótipos foram removidos; o
produto é white-label e qualquer identidade visual é configurada por quem o utiliza.
