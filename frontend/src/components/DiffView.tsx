import type { DiffSegment } from '../types';

export default function DiffView({ segments }: { segments: DiffSegment[] }) {
  return (
    <div className="space-y-2 font-mono text-sm">
      {segments.map((s, i) => {
        const cls =
          s.type === 'added' ? 'bg-emerald-100 text-emerald-900 border-l-4 border-emerald-500' :
          s.type === 'removed' ? 'bg-red-100 text-red-900 line-through border-l-4 border-red-500' :
          'bg-slate-50 text-slate-700 border-l-4 border-slate-200';
        const prefix = s.type === 'added' ? '+ ' : s.type === 'removed' ? '- ' : '  ';
        return (
          <div key={i} className={`px-3 py-2 rounded ${cls} whitespace-pre-wrap`}>
            <span className="opacity-60 mr-1">{prefix}</span>{s.text}
          </div>
        );
      })}
    </div>
  );
}
