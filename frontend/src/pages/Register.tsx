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
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});
type FormData = z.infer<typeof schema>;

export default function Register() {
  const { register: signup } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: FormData) => {
    try { await signup(d.name, d.email, d.password); nav('/dashboard'); toast.push('Welcome!'); }
    catch (e: any) { toast.push(e?.response?.data?.message || 'Sign up failed', 'error'); }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <h1 className="text-2xl font-bold mb-4">Sign up</h1>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating…' : 'Create account'}
          </Button>
        </form>
        <p className="text-sm mt-4 text-slate-600">
          Have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
