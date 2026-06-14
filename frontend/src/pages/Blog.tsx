import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../lib/api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Loader, { Skeleton } from '../components/ui/Loader';
import type { Post } from '../types';

export default function Blog() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');

  const list = useQuery({
    queryKey: ['posts', page],
    queryFn: async () => (await api.get('/posts', { params: { page, limit: 10 } })).data,
    enabled: !query,
  });

  const search = useQuery({
    queryKey: ['search', query],
    queryFn: async () => (await api.get('/search', { params: { q: query } })).data,
    enabled: !!query,
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <form className="flex gap-2 mb-6" onSubmit={(e) => { e.preventDefault(); setQuery(q); }}>
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts…" className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
        {query && <Button variant="ghost" onClick={() => { setQuery(''); setQ(''); }}>Clear</Button>}
      </form>

      {query ? (
        search.isLoading ? <Loader /> : (
          <div className="space-y-3">
            {search.data?.results?.length ? search.data.results.map((r: any) => (
              <Card key={r.slug}>
                <Link to={`/blog/${r.slug}`} className="text-lg font-semibold hover:underline">{r.title}</Link>
                <p className="text-sm text-slate-600 mt-1">{r.excerpt}</p>
                <p className="text-xs text-slate-500 mt-2"
                   dangerouslySetInnerHTML={{ __html: r.highlight }} />
              </Card>
            )) : <p className="text-slate-500">No results.</p>}
          </div>
        )
      ) : list.isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : (
        <>
          <div className="space-y-3">
            {list.data?.posts?.map((p: Post) => (
              <Card key={p.id}>
                <Link to={`/blog/${p.slug}`} className="text-lg font-semibold hover:underline">
                  {p.currentVersion?.title}
                </Link>
                <p className="text-sm text-slate-600 mt-1">{p.currentVersion?.excerpt}</p>
                <p className="text-xs text-slate-500 mt-2">
                  By {p.author?.name} · {new Date(p.updatedAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
            {list.data?.posts?.length === 0 && <p className="text-slate-500">No published posts yet.</p>}
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <span className="text-sm text-slate-500 self-center">Page {page}</span>
            <Button variant="secondary"
              disabled={list.data && page * list.data.limit >= list.data.total}
              onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </>
      )}
    </div>
  );
}
