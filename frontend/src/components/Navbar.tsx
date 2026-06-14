import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, PenSquare } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg flex items-center gap-2">
          <PenSquare size={20} /> CMS
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/blog" className="hover:underline">Blog</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <span className="text-slate-500">{user.email}</span>
              <button onClick={() => { logout(); nav('/login'); }}
                className="flex items-center gap-1 text-red-600 hover:underline">
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="px-3 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-700">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
