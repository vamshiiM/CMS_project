import { ReactNode } from 'react';
export function Table({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto"><table className="min-w-full text-sm">{children}</table></div>;
}
export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-100 text-left text-slate-600">{children}</thead>;
}
export function TH({ children }: { children: ReactNode }) {
  return <th className="px-3 py-2 font-medium">{children}</th>;
}
export function TR({ children }: { children: ReactNode }) {
  return <tr className="border-b last:border-0">{children}</tr>;
}
export function TD({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
