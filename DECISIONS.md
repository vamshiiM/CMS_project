# Decisions

## Why TipTap?

TipTap is a headless editor built on ProseMirror. It gives us a structured
document model out of the box, full extensibility (custom marks/nodes), and
a clean React integration. Compared to Quill/Draft.js it has better
TypeScript support, better mobile UX, and — critically — a stable JSON
document representation that is trivial to persist and re-hydrate.

## Why store JSON instead of HTML?

1. **Structure preserved.** JSON keeps the document tree (paragraphs,
   headings, lists, marks). HTML loses that semantic shape after a round
   trip through `innerHTML` sanitization.
2. **Safer.** Rendering JSON via TipTap never executes arbitrary HTML, so
   we avoid an entire class of XSS issues from user content.
3. **Diff-friendly.** Block-level structure makes meaningful diffs
   possible (see below). String-diffing HTML produces noise on every tag
   change.
4. **Future-proof.** Adding custom blocks (callouts, embeds, code blocks
   with metadata) means adding new node types — no schema migration.
5. **Postgres JSONB** lets us query inside the document (e.g. for FTS or
   block-type filters) without leaving the database.

## Why full snapshots instead of deltas?

- **Simplicity & correctness.** Restoring is just copying a row. Deltas
  require replay logic, which is a constant source of bugs as the schema
  evolves.
- **Read performance.** Loading any version is a single row lookup; no
  recomputation over a chain of patches.
- **Storage is cheap.** Posts are small documents. JSONB compresses well
  in Postgres. Even thousands of revisions per post stay well under any
  storage limit.
- **Immutability is the requirement.** Every save creates a new row; we
  never UPDATE an existing version. `Post.currentVersionId` is the only
  mutable pointer.

If documents grew to MB scale we'd revisit this — likely with periodic
snapshots + deltas between them.

## How diffing works

1. The backend walks both TipTap JSON trees and extracts an ordered array
   of **block-level text strings** (one per paragraph, heading, list item,
   blockquote, etc.). Inline formatting marks are collapsed to text — the
   diff is about *content* changes, not styling churn.
2. We run a standard **LCS** (longest common subsequence) algorithm over
   the two arrays.
3. The walk emits a structured array of segments:
   `[{ type: 'unchanged' | 'added' | 'removed', text }]`.
4. The frontend renders the segments with color: green for additions,
   red strikethrough for removals, neutral for unchanged.

This operates on document structure, not raw strings, so a paragraph
re-order shows up as remove + add of whole blocks (which is correct) and
inline formatting changes are deliberately ignored.

## Why Neon Postgres?

- **Serverless Postgres.** Generous free tier, scales to zero, ideal for
  take-home and demo deployments.
- **Branching.** Cheap database branches per PR/preview — useful in CI.
- **Standard Postgres.** All our features (JSONB, `tsvector`,
  `plainto_tsquery`, `ts_rank`, `ts_headline`) are vanilla Postgres, so we
  can swap to RDS / Supabase / self-hosted with zero code changes.
- **SSL by default.** Already wired up in `src/config/config.js` when
  `DATABASE_URL` is present.

## Full-text search

Search is performed in Postgres, not in the app:

```
to_tsvector('english', title || ' ' || contentJson::text)
  @@ plainto_tsquery('english', :q)
```

Results are ordered by `ts_rank(...)`, and `ts_headline(...)` returns a
snippet with `<mark>…</mark>` around matched terms. A GIN index on the
`tsvector` expression (created in the migration) keeps it fast.

We search only the *current* published version of each post, joining
`posts` to `post_versions` via `currentVersionId`. This intentionally
omits draft history from search.

## Future improvements

- **Background diff/index workers.** Move `ts_headline` and large diffs
  to a queue (BullMQ / pg-boss) once docs grow.
- **Inline (word-level) diff.** Today's diff is block-level. Add a
  word-diff pass within unchanged-pair blocks for finer granularity.
- **Comments + suggestions.** TipTap collaboration extensions for
  multi-author review.
- **Image uploads.** S3 (or Cloudflare R2) + a TipTap `Image` node;
  store only the URL in JSON.
- **Role-based access.** Editor vs. Admin separation; per-post
  collaborators.
- **Optimistic UI.** TanStack Query mutations with `onMutate` cache
  updates for save/publish.
- **Rate limiting** on `/api/auth/*` and `/api/search`.
- **Tests.** Vitest for the diff service, Supertest for routes,
  Playwright for the editor flow.
- **Soft delete** on posts + retention policy on old versions.
