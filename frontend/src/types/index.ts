export interface User { id: number; name: string; email: string; }
export interface PostVersion {
  id: number; postId: number; authorId: number;
  title: string; excerpt: string | null; contentJson: any;
  createdAt: string; updatedAt: string;
  author?: User;
}
export interface Post {
  id: number; authorId: number; slug: string;
  status: 'draft' | 'published';
  currentVersionId: number | null;
  createdAt: string; updatedAt: string;
  currentVersion?: PostVersion;
  author?: User;
}
export interface DiffSegment { type: 'added' | 'removed' | 'unchanged'; text: string; }
