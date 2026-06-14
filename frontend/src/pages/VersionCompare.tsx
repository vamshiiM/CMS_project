import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import Loader from '../components/ui/Loader';
import DiffView from '../components/DiffView';
import Button from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function VersionCompare() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const from = sp.get('from');
  const to = sp.get('to');
  const { data, isLoading, error } = useQuery({
    queryKey: ['diff', id, from, to],
    queryFn: async () => (await api.get(`/posts/${id}/diff`, { params: { from, to } })).data,
    enabled: !!from && !!to,
  });

  if (isLoading) return <Loader />;
  if (error) return <div className="p-10 text-red-600">Failed to load diff.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="ghost" onClick={() => nav(`/dashboard/posts/${id}/versions`)} className="mb-4">
        <ArrowLeft size={14} className="inline mr-1" />Back to versions
      </Button>
      <h1 className="text-2xl font-bold mb-2">Compare versions</h1>
      <p className="text-sm text-slate-500 mb-6">
        From: <b>{data.from.title}</b> → To: <b>{data.to.title}</b>
      </p>
      <DiffView segments={data.segments} />
    </div>
  );
}
