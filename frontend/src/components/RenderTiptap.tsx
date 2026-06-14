import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';

export default function RenderTiptap({ content }: { content: any }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link],
    content: content || { type: 'doc', content: [] },
    editable: false,
    editorProps: { attributes: { class: 'tiptap-content prose max-w-none' } },
  });
  useEffect(() => { if (editor && content) editor.commands.setContent(content, false); }, [content, editor]);
  if (!editor) return null;
  return <EditorContent editor={editor} />;
}
