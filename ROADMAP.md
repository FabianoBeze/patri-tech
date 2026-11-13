# Roadmap — PATRI-TECH

Trabalho planejado para os próximos ciclos. As estimativas são de esforço de
desenvolvimento (incluindo testes e documentação) e servem para dar visibilidade do que
vem depois do estado atual do projeto.

**Estado atual:** CRUD de bens, unidades, salas e categorias; permissões por gestor;
histórico de movimentações; autenticação JWT; documentação OpenAPI; 17 testes de backend.

## Próximos 90 dias (~66h)

### 1. Confiabilidade e engenharia — 16h

- [ ] **CI no GitHub Actions** (~4h): rodar `manage.py test`, `manage.py check --deploy` e
      o build do frontend em cada pull request.
- [ ] **Cobertura de testes ≥70%** (~6h): cobrir salas, categorias, unidades, filtros de
      listagem e o fluxo de baixa de bens.
- [ ] **Lint e formatação automatizados** (~3h): `ruff` + `black` no backend,
      `eslint` + `prettier` no frontend, com verificação no CI.
- [ ] **Ambiente com Docker Compose** (~4h): Django + PostgreSQL + frontend em um único
      `docker compose up`, reduzindo o atrito de setup.

### 2. Produto — 26h

- [ ] **Paginação, busca e ordenação** (~6h): hoje as listagens devolvem todos os
      registros; adicionar paginação no DRF e busca por nome/tombo no frontend.
- [ ] **Importação e exportação CSV** (~6h): migrar inventários existentes em planilha e
      exportar o patrimônio para conferência.
- [ ] **Relatório de inventário em PDF** (~6h): filtros por unidade/sala, com totais e
      assinatura do responsável.
- [ ] **Leitura de código de barras** (~8h): o botão já existe no dashboard; implementar
      leitura pela câmera para localizar o bem pelo tombo.

### 3. Segurança e privacidade — 12h

- [ ] **Separar CPF de `username`** (~4h): criar campo de login próprio e manter o CPF
      apenas como dado cadastral.
- [ ] **Mascarar CPF nas respostas da API** (~2h): exibir apenas os últimos dígitos em
      listagens e relatórios.
- [ ] **Rotação de refresh token + blacklist** (~3h): invalidar tokens de sessões
      encerradas.
- [ ] **Rate limiting no login** (~3h): proteção contra tentativa exaustiva de senha.

### 4. Auditoria — 5h

- [ ] **Histórico também para o Django Admin** (~5h): hoje só as alterações feitas pela
      API geram registro; centralizar a auditoria para cobrir qualquer origem de alteração.

### 5. Experiência de uso — 8h

- [ ] **Acessibilidade** (~4h): labels associados aos inputs, foco visível e navegação por
      teclado nas telas principais.
- [ ] **Estados de carregamento e erro** (~2h): feedback consistente em vez de mensagens
      isoladas no console.
- [ ] **Revisão de responsividade** (~2h): conferir telas de cadastro e tabelas em telas
      pequenas.

### 6. Operação — 5h

- [ ] **Deploy documentado** (~3h): ambiente de demonstração com PostgreSQL e S3,
      incluindo checklist de variáveis de ambiente.
- [ ] **Backup e restauração** (~2h): script e procedimento documentado para o banco.

## Ideias de médio prazo

- Notificações por e-mail para bens ociosos ou sem responsável.
- Termo de responsabilidade gerado por unidade.
- App mobile ou PWA para inventário em campo.
- Multi-tenant: uma instalação atendendo vários órgãos/empresas com isolamento de dados.

## Concluído

- [x] Remoção de duplicidade no histórico de movimentações.
- [x] Senha inicial de gestor configurável por variável de ambiente.
- [x] Configuração sensível isolada em variáveis de ambiente (`.env.example`).
- [x] Centralização da URL da API no frontend (`REACT_APP_API_URL`).
- [x] Suíte inicial de testes de backend.
