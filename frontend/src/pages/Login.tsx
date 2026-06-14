import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: FormData) => {
    try { await login(d.email, d.password); nav('/dashboard'); toast.push('Logged in'); }
    catch (e: any) { toast.push(e?.response?.data?.message || 'Login failed', 'error'); }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-4">Log in</h1>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
        <p className="text-sm mt-4 text-slate-600">
          No account? <Link to="/register" className="text-blue-600 hover:underline">Sign up</Link>
        </p>
        <p className="text-xs text-slate-500 mt-2">Demo: author1@example.com / password123</p>
      </Card>
    </div>
  );
}
