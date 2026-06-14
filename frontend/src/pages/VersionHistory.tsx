import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import Loader from '../components/ui/Loader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import RenderTiptap from '../components/RenderTiptap';
import { useToast } from '../components/Toast';
import { ArrowLeft, GitCompareArrows, RotateCcw, Eye } from 'lucide-react';

export default function VersionHistory() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [selected, setSelected] = useState<number[]>([]);
  const [preview, setPreview] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['versions', id],
    queryFn: async () => (await api.get(`/posts/${id}/versions`)).data,
  });

  const restore = useMutation({
    mutationFn: async (vid: number) => (await api.post(`/posts/${id}/restore/${vid}`)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['versions', id] });
      qc.invalidateQueries({ queryKey: ['post', 'id', id] });
      toast.push('Restored as new version');
    },
  });

  if (isLoading) return <Loader />;
  const toggle = (vid: number) => {
    setSelected((s) => s.includes(vid) ? s.filter(x => x !== vid) : (s.length < 2 ? [...s, vid] : [s[1], vid]));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={() => nav(`/dashboard/posts/${id}`)}>
          <ArrowLeft size={14} className="inline mr-1" />Back to editor
        </Button>
        <Button
          disabled={selected.length !== 2}
          onClick={() => nav(`/dashboard/posts/${id}/compare?from=${selected[0]}&to=${selected[1]}`)}>
          <GitCompareArrows size={14} className="inline mr-1" />Compare selected
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4">Version History</h1>
      <p className="text-sm text-slate-500 mb-4">Select 2 versions to compare.</p>
      <div className="space-y-2">
        {data.versions.map((v: any, i: number) => {
          const current = v.id === data.currentVersionId;
          return (
            <Card key={v.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selected.includes(v.id)} onChange={() => toggle(v.id)} />
                <div>
                  <div className="font-medium">
                    v{data.versions.length - i} — {v.title}
                    {current && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">current</span>}
                  </div>
                  <div className="text-xs text-slate-500">
                    {v.author?.name} · {new Date(v.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="space-x-1">
                <Button variant="ghost" onClick={() => setPreview(v)}><Eye size={14} /></Button>
                {!current && (
                  <Button variant="ghost" onClick={() => restore.mutate(v.id)}>
                    <RotateCcw size={14} className="inline mr-1" />Restore
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.title || ''}>
        {preview && <RenderTiptap content={preview.contentJson} />}
      </Modal>

      <div className="mt-6">
        <Link to={`/dashboard/posts/${id}`} className="text-sm text-blue-600 hover:underline">← Back to editor</Link>
      </div>
    </div>
  );
}
