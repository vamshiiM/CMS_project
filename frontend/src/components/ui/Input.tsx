import { InputHTMLAttributes, forwardRef } from 'react';
type Props = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };
const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className = '', ...rest }, ref) => (
  <label className="block">
    {label && <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>}
    <input ref={ref} {...rest}
      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-slate-900 ${error ? 'border-red-500' : 'border-slate-300'} ${className}`} />
    {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
  </label>
));
export default Input;
