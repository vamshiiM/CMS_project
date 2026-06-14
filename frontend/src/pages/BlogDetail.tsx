import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import RenderTiptap from '../components/RenderTiptap';
import Loader from '../components/ui/Loader';

export default function BlogDetail() {
  const { slug } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: async () => (await api.get(`/posts/${slug}`)).data,
  });
  if (isLoading) return <Loader />;
  if (error) return <div className="p-10 text-center text-red-600">Failed to load.</div>;
  const post = data.post;
  const v = post.currentVersion;
  return (
    <article className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-2">{v?.title}</h1>
      <p className="text-sm text-slate-500 mb-6">
        By {post.author?.name} · {new Date(post.updatedAt).toLocaleDateString()}
      </p>
      <RenderTiptap content={v?.contentJson} />
    </article>
  );
}
