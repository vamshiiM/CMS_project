import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostEditor from './pages/PostEditor';
import VersionHistory from './pages/VersionHistory';
import VersionCompare from './pages/VersionCompare';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/blog" replace />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/posts/:id" element={<ProtectedRoute><PostEditor /></ProtectedRoute>} />
          <Route path="/dashboard/posts/:id/versions" element={<ProtectedRoute><VersionHistory /></ProtectedRoute>} />
          <Route path="/dashboard/posts/:id/compare" element={<ProtectedRoute><VersionCompare /></ProtectedRoute>} />
          <Route path="*" element={<div className="p-10 text-center">Not found</div>} />
        </Routes>
      </main>
    </div>
  );
}
