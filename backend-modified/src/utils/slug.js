import slugify from 'slugify';
import { Post } from '../models/index.js';

export async function uniqueSlug(title) {
  const base = slugify(title, { lower: true, strict: true }) || 'post';
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Post.findOne({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}
