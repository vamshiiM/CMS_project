import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Quote, Heading1, Heading2, Link2,
} from 'lucide-react';

interface Props {
  value: any;
  onChange: (json: any) => void;
}

export default function Editor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value || { type: 'doc', content: [{ type: 'paragraph' }] },
    editorProps: {
      attributes: { class: 'tiptap-content prose max-w-none p-4 border rounded min-h-[300px] bg-white' },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  // Hydrate when external value changes (e.g., after fetch)
  useEffect(() => {
    if (!editor || !value) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(value);
    if (current !== incoming) editor.commands.setContent(value, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const Btn = ({ active, onClick, children }: any) => (
    <button type="button" onClick={onClick}
      className={`p-1.5 rounded hover:bg-slate-200 ${active ? 'bg-slate-200' : ''}`}>
      {children}
    </button>
  );

  return (
    <div className="border rounded bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-slate-50">
        <Btn active={editor.isActive('heading', { level: 1 })}
             onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={16} /></Btn>
        <Btn active={editor.isActive('heading', { level: 2 })}
             onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></Btn>
        <Btn active={editor.isActive('bold')}
             onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></Btn>
        <Btn active={editor.isActive('italic')}
             onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></Btn>
        <Btn active={editor.isActive('underline')}
             onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon size={16} /></Btn>
        <Btn active={editor.isActive('bulletList')}
             onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></Btn>
        <Btn active={editor.isActive('orderedList')}
             onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></Btn>
        <Btn active={editor.isActive('blockquote')}
             onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={16} /></Btn>
        <Btn active={editor.isActive('link')} onClick={() => {
          const url = window.prompt('URL');
          if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          else editor.chain().focus().unsetLink().run();
        }}><Link2 size={16} /></Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
