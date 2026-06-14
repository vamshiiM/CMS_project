import { TextareaHTMLAttributes, forwardRef } from 'react';
type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string };
const Textarea = forwardRef<HTMLTextAreaElement, Props>(({ label, error, className = '', ...rest }, ref) => (
  <label className="block">
    {label && <span className="block text-sm font-medium text-slate-700 mb-1">{label}</span>}
    <textarea ref={ref} {...rest}
      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-slate-900 ${error ? 'border-red-500' : 'border-slate-300'} ${className}`} />
    {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
  </label>
));
export default Textarea;
