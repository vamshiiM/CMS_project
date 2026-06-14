import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import Editor from '../components/Editor';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { useToast } from '../components/Toast';
import { History, ArrowLeft } from 'lucide-react';

export default function PostEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['post', 'id', id],
    queryFn: async () => (await api.get(`/posts/id/${id}`)).data,
  });

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    if (data?.post?.currentVersion) {
      const v = data.post.currentVersion;
      setTitle(v.title);
      setExcerpt(v.excerpt || '');
      setContent(v.contentJson);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: async () =>
      (await api.put(`/posts/${id}`, { title, excerpt, contentJson: content })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post', 'id', id] });
      qc.invalidateQueries({ queryKey: ['my-posts'] });
      toast.push('New version saved');
    },
    onError: (e: any) => toast.push(e?.response?.data?.message || 'Save failed', 'error'),
  });

  if (isLoading || !content) return <Loader />;
  const post = data.post;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => nav('/dashboard')}>
          <ArrowLeft size={14} className="inline mr-1" />Back
        </Button>
        <div className="flex gap-2">
          <Link to={`/dashboard/posts/${id}/versions`}>
            <Button variant="secondary"><History size={14} className="inline mr-1" />Versions</Button>
          </Link>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save (new version)'}
          </Button>
        </div>
      </div>
      <p className="text-xs text-slate-500 mb-4">Slug: /{post.slug} · Status: {post.status}</p>
      <div className="space-y-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea label="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
        <div>
          <span className="block text-sm font-medium text-slate-700 mb-1">Content</span>
          <Editor value={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
