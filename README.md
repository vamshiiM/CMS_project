
# CMS — Take-Home

A production-quality CMS with immutable post versioning, TipTap rich-text editing, JSON-aware diffs, and Postgres full-text search.

## Stack

- **Frontend:** React + TypeScript + Vite, React Router DOM, Tailwind, Axios, TanStack Query, React Hook Form + Zod, TipTap, Lucide React
- **Backend:** Node.js + Express (JavaScript), Sequelize ORM (migrations + seeders), JWT auth, bcryptjs, express-validator
- **Database:** Neon PostgreSQL (any Postgres works)

## Project Structure

```
cms/
├── backend/
│   └── src/
│       ├── config/ models/ migrations/ seeders/
│       ├── middlewares/ controllers/ services/ routes/ utils/
│       └── server.js
├── frontend/
|    └── src/
|        ├── components/ (ui/) pages/ contexts/ lib/ types/
|        ├── App.tsx
|        └── main.tsx
|
├── DECISIONS.md
├── package-lock.json
├── package.json
└── README.md
```

---

## Local Setup

### 1. Database (Neon)

1. Create a free project at https://neon.tech.
2. Copy the connection string.
3. Either fill in `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` **or** paste it into `DATABASE_URL` (preferred — SSL is enabled automatically).

### 2. Backend

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev                
```

Scripts:

| Script | Purpose |
| --- | --- |
| `npm run dev` | nodemon dev server |
| `npm start` | production server |
| `npm run migrate` | run Sequelize migrations |
| `npm run migrate:undo` | undo last migration |
| `npm run seed` | run seeders |
| `npm run seed:undo` | undo seeders |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               
```

---

## Demo Credentials

| Email | Password |
| --- | --- |
| author1@example.com | password123 |
| author2@example.com | password123 |

The seeder creates 5 posts (mix of draft / published). The post **"Welcome to the CMS"** has 3+ versions for testing diff/restore.

---

## API Documentation

Base URL: `/api`

### Auth

| Method | Path | Auth | Body |
| --- | --- | --- | --- |
| POST | `/auth/register` | — | `{ name, email, password }` |
| POST | `/auth/login` | — | `{ email, password }` |
| GET | `/auth/me` | Bearer | — |

### Posts

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/posts` | — | Published posts, |
| GET | `/posts/me` | Bearer | Own posts (drafts + published) |
| GET | `/posts/:slug` | optional | Public slug, drafts only for author |
| GET | `/posts/id/:id` | Bearer | Own post by id (for editor) |
| POST | `/posts` | Bearer | `{ title, excerpt, contentJson }` — creates Post + first PostVersion |
| PUT | `/posts/:id` | Bearer | Creates **new** PostVersion |
| DELETE | `/posts/:id` | Bearer | |
| PATCH | `/posts/:id/publish` | Bearer | |
| PATCH | `/posts/:id/unpublish` | Bearer | |

### Versions

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/posts/:id/versions` | Bearer | Newest first |
| GET | `/posts/:id/versions/:versionId` | Bearer | Full snapshot |
| POST | `/posts/:id/restore/:versionId` | Bearer | Copies old version into a new one |
| GET | `/posts/:id/diff?from=&to=` | Bearer | Structured TipTap diff |

### Search

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/search?q=keyword` | Postgres FTS, ranked, returns `{ title, slug, excerpt, highlight }` |

Send auth as `Authorization: Bearer <token>`.

---

## Deployment

### Backend And Frontend → Render 
- Go to the root of the folder 
```bash
npm run build
npm run start              
```

### Database → Neon
- Create project, copy `DATABASE_URL`, paste into backend env.
- SSL is enabled automatically by `src/config/config.js` when `DATABASE_URL` is set.

---

See `DECISIONS.md` for architectural rationale.
