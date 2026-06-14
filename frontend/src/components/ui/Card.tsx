import { ReactNode } from 'react';
export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white border border-slate-200 rounded-lg p-4 shadow-sm ${className}`}>{children}</div>;
}
