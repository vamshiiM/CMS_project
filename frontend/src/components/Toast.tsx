import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

type Toast = { id: number; message: string; kind: 'success' | 'error' };
const Ctx = createContext<{ push: (m: string, k?: Toast['kind']) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((message: string, kind: Toast['kind'] = 'success') => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, message, kind }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3000);
  }, []);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {items.map((t) => (
          <div key={t.id}
            className={`px-4 py-2 rounded shadow text-white text-sm ${t.kind === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast outside provider');
  return v;
}
