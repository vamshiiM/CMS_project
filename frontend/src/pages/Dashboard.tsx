import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { api } from '../lib/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Table, THead, TH, TR, TD } from '../components/ui/Table';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { useToast } from '../components/Toast';
import type { Post } from '../types';
import { Edit, Eye, EyeOff, Trash2, History, Plus } from 'lucide-react';

export default function Dashboard() {
  const qc = useQueryClient();
  const toast = useToast();
  const nav = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-posts'],
    queryFn: async () => (await api.get('/posts/me')).data,
  });

  const create = useMutation({
    mutationFn: async () =>
      (await api.post('/posts', {
        title, excerpt,
        contentJson: { type: 'doc', content: [{ type: 'paragraph' }] },
      })).data,
    onSuccess: (d) => { setShowNew(false); setTitle(''); setExcerpt(''); nav(`/dashboard/posts/${d.post.id}`); },
    onError: (e: any) => toast.push(e?.response?.data?.message || 'Failed', 'error'),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, op }: { id: number; op: 'publish' | 'unpublish' }) =>
      (await api.patch(`/posts/${id}/${op}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-posts'] }); toast.push('Updated'); },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/posts/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-posts'] }); toast.push('Deleted'); },
  });

  if (isLoading) return <Loader />;
  const posts: Post[] = data?.posts || [];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Posts</h1>
        <Button onClick={() => setShowNew(true)}><Plus size={14} className="inline -mt-0.5 mr-1" />New Post</Button>
      </div>

      <Card className="!p-0">
        <Table>
          <THead>
            <TR>
              <TH>Title</TH><TH>Status</TH><TH>Updated</TH><TH>Actions</TH>
            </TR>
          </THead>
          <tbody>
            {posts.map((p) => (
              <TR key={p.id}>
                <TD>
                  <Link to={`/dashboard/posts/${p.id}`} className="font-medium hover:underline">
                    {p.currentVersion?.title || '(untitled)'}
                  </Link>
                  <div className="text-xs text-slate-500">/{p.slug}</div>
                </TD>
                <TD>
                  <span className={`px-2 py-0.5 rounded text-xs ${p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {p.status}
                  </span>
                </TD>
                <TD>{new Date(p.updatedAt).toLocaleString()}</TD>
                <TD className="space-x-1">
                  <Button variant="ghost" onClick={() => nav(`/dashboard/posts/${p.id}`)}><Edit size={14} /></Button>
                  <Button variant="ghost" onClick={() => nav(`/dashboard/posts/${p.id}/versions`)}><History size={14} /></Button>
                  {p.status === 'published' ? (
                    <Button variant="ghost" onClick={() => setStatus.mutate({ id: p.id, op: 'unpublish' })}><EyeOff size={14} /></Button>
                  ) : (
                    <Button variant="ghost" onClick={() => setStatus.mutate({ id: p.id, op: 'publish' })}><Eye size={14} /></Button>
                  )}
                  <Button variant="ghost" onClick={() => { if (confirm('Delete this post?')) remove.mutate(p.id); }}>
                    <Trash2 size={14} className="text-red-600" />
                  </Button>
                </TD>
              </TR>
            ))}
            {posts.length === 0 && (
              <TR><TD className="text-center text-slate-500 py-8">No posts yet. Create your first.</TD></TR>
            )}
          </tbody>
        </Table>
      </Card>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Post">
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} />
          <Button onClick={() => create.mutate()} disabled={!title || create.isPending}>
            {create.isPending ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
