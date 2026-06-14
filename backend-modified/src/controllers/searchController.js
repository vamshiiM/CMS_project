import { sequelize } from '../models/index.js';

// Full-text search over published posts' current versions.
export const search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q) return res.json({ results: [] });

    const [rows] = await sequelize.query(
      `
      SELECT
        p.slug,
        v.title,
        v.excerpt,
        ts_headline(
          'english',
          coalesce(v.title,'') || ' ' || coalesce(v."contentJson"::text,''),
          plainto_tsquery('english', :q),
          'StartSel=<mark>,StopSel=</mark>,MaxFragments=2,MaxWords=20,MinWords=5'
        ) AS highlight,
        ts_rank(
          to_tsvector('english', coalesce(v.title,'') || ' ' || coalesce(v."contentJson"::text,'')),
          plainto_tsquery('english', :q)
        ) AS rank
      FROM posts p
      JOIN post_versions v ON v.id = p."currentVersionId"
      WHERE p.status = 'published'
        AND to_tsvector('english', coalesce(v.title,'') || ' ' || coalesce(v."contentJson"::text,''))
            @@ plainto_tsquery('english', :q)
      ORDER BY rank DESC
      LIMIT 20;
      `,
      { replacements: { q } }
    );
    res.json({ results: rows });
  } catch (e) { next(e); }
};
