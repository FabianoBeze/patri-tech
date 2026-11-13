# Roadmap — PATRI-TECH

Planned work for the upcoming cycles. Estimates are development effort, including tests
and documentation, and exist to make the next steps visible.

**Current state:** CRUD for assets, units, rooms, and categories; per-manager permissions;
movement history; JWT authentication; OpenAPI docs; 21 backend tests.

## Next 90 days (~73h)

### 1. Reliability and engineering — 17h

- [ ] **GitHub Actions CI** (~4h): run `manage.py test`, `manage.py check --deploy`, and
      the frontend build on every pull request.
- [ ] **Test coverage ≥70%** (~6h): cover rooms, categories, units, list filters, and the
      asset write-off flow.
- [ ] **Automated lint and formatting** (~3h): `ruff` + `black` for the backend,
      `eslint` + `prettier` for the frontend, enforced in CI.
- [ ] **Docker Compose environment** (~4h): Django + PostgreSQL + frontend with a single
      `docker compose up`, reducing setup friction.

### 2. Product — 26h

- [ ] **Pagination, search, and ordering** (~6h): list endpoints currently return the
      whole collection; add DRF pagination and server-side search by name/tag.
- [ ] **CSV import and export** (~6h): migrate existing spreadsheet inventories and export
      data for verification.
- [ ] **Inventory report in PDF** (~6h): filters by unit/room, totals, and space for the
      responsible party's signature.
- [ ] **Barcode scanning** (~8h): the dashboard button already exists; implement camera
      scanning to look up an asset by its tag.

### 3. Security and privacy — 12h

- [ ] **Separate CPF from `username`** (~4h): create a dedicated login field and keep the
      CPF as registration data only.
- [ ] **Mask CPF in API responses** (~2h): expose only the last digits in lists and
      reports.
- [ ] **Refresh token rotation + blacklist** (~3h): invalidate tokens from closed sessions.
- [ ] **Login rate limiting** (~3h): protection against password brute force.

### 4. Audit — 5h

- [ ] **History for Django admin changes** (~5h): today only API calls generate entries;
      centralize auditing so every write path is covered.

### 5. User experience — 8h

- [ ] **Accessibility** (~4h): labels bound to inputs, visible focus, and keyboard
      navigation on the main screens.
- [ ] **Loading and error states** (~2h): consistent feedback instead of isolated console
      messages.
- [ ] **Responsiveness review** (~2h): check form screens and tables on small viewports.

### 6. Operations — 5h

- [ ] **Documented deployment** (~3h): demo environment with PostgreSQL and S3, including
      an environment variable checklist.
- [ ] **Backup and restore** (~2h): script and documented procedure for the database.

## Medium-term ideas

- Email notifications for idle assets or assets without an assigned responsible person.
- Responsibility term generated per unit.
- Mobile app or PWA for on-site inventory counting.
- Multi-tenant: one installation serving several organizations with data isolation.

## Done

- [x] Removed duplicate entries in the movement history.
- [x] Configurable manager initial password via environment variable.
- [x] Sensitive configuration isolated in environment variables (`.env.example`).
- [x] Frontend API base URL centralized in `REACT_APP_API_URL`.
- [x] Initial backend test suite (21 tests).
- [x] Dedicated edit permission flags for units, categories, and rooms.
- [x] Global history endpoint requires authentication.
- [x] Documentation rewritten in English.
