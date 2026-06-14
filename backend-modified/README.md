# CMS Backend (ESM)

Node.js + Express + Sequelize + PostgreSQL. Application code is pure ES modules (`"type": "module"`).

## Setup

```bash
npm install
cp .env.example .env   # then edit JWT_SECRET and DB credentials / DATABASE_URL
npm run migrate
npm run seed
npm run dev
```

Seeded users: `author1@example.com`, `author2@example.com` (password: `password123`).

## ESM notes

- `package.json` has `"type": "module"` — all `src/**/*.js` files use `import` / `export`.
- All relative imports include the `.js` extension (required by Node ESM).
- Sequelize CLI (migrations, seeders, config) needs CommonJS, so those files use the `.cjs` extension:
  - `src/config/config.cjs` (referenced by `.sequelizerc`)
  - `src/migrations/*.cjs`
  - `src/seeders/*.cjs`
- App code imports the same config via the ESM wrapper `src/config/config.js`.

## API

| Method | Path                              | Auth | Description                         |
|-------:|-----------------------------------|:----:|-------------------------------------|
| POST   | /api/auth/register                |  -   | Register                            |
| POST   | /api/auth/login                   |  -   | Login                               |
| GET    | /api/auth/me                      |  Y   | Current user                        |
| GET    | /api/posts                        |  -   | List published (paginated)          |
| GET    | /api/posts/me                     |  Y   | My posts                            |
| POST   | /api/posts                        |  Y   | Create draft                        |
| PUT    | /api/posts/:id                    |  Y   | Update (new version)                |
| DELETE | /api/posts/:id                    |  Y   | Delete                              |
| PATCH  | /api/posts/:id/publish            |  Y   | Publish                             |
| PATCH  | /api/posts/:id/unpublish          |  Y   | Unpublish                           |
| GET    | /api/posts/id/:id                 |  Y   | Get own post by id                  |
| GET    | /api/posts/:id/versions           |  Y   | List versions                       |
| GET    | /api/posts/:id/versions/:vid      |  Y   | Get one version                     |
| POST   | /api/posts/:id/restore/:vid       |  Y   | Restore (creates a new version)     |
| GET    | /api/posts/:id/diff?from=&to=     |  Y   | Diff between two versions           |
| GET    | /api/posts/:slug                  |  -   | Public post by slug                 |
| GET    | /api/search?q=...                 |  -   | Full-text search                    |
