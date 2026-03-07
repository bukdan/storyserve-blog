import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3, List, ListOrdered, Quote, ImageIcon, Link as LinkIcon, Undo, Redo, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCallback, useRef } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuButton = ({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded transition-colors ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
  >
    {children}
  </button>
);

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 5MB');
      return null;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return null;
    }
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/inline-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('post-covers').upload(filePath, file);
    if (error) {
      toast.error('Gagal upload: ' + error.message);
      return null;
    }
    const { data: { publicUrl } } = supabase.storage.from('post-covers').getPublicUrl(filePath);
    return publicUrl;
  }, [user]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image,
      Link.configure({ openOnClick: false }),
      Underline,
      Placeholder.configure({ placeholder: 'Mulai menulis artikel... (drag & drop gambar untuk upload)' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'post-content min-h-[400px] outline-none px-4 py-3',
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files.length) return false;
        const file = event.dataTransfer.files[0];
        if (!file.type.startsWith('image/')) return false;
        
        event.preventDefault();
        uploadImage(file).then(url => {
          if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
            toast.success('Gambar berhasil diupload');
          }
        });
        return true;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              uploadImage(file).then(url => {
                if (url && editor) {
                  editor.chain().focus().setImage({ src: url }).run();
                  toast.success('Gambar berhasil diupload');
                }
              });
            }
            return true;
          }
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      toast.success('Gambar berhasil diupload');
    }
    e.target.value = '';
  };

  const addLink = () => {
    const url = prompt('Masukkan URL link:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-card">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-secondary/50">
        <MenuButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold size={16} />
        </MenuButton>
        <MenuButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic size={16} />
        </MenuButton>
        <MenuButton active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <UnderlineIcon size={16} />
        </MenuButton>
        <MenuButton active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Strikethrough size={16} />
        </MenuButton>
        <div className="w-px h-6 bg-border mx-1" />
        <MenuButton active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
          <Heading1 size={16} />
        </MenuButton>
        <MenuButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
          <Heading2 size={16} />
        </MenuButton>
        <MenuButton active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
          <Heading3 size={16} />
        </MenuButton>
        <div className="w-px h-6 bg-border mx-1" />
        <MenuButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
          <List size={16} />
        </MenuButton>
        <MenuButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List">
          <ListOrdered size={16} />
        </MenuButton>
        <MenuButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Quote">
          <Quote size={16} />
        </MenuButton>
        <div className="w-px h-6 bg-border mx-1" />
        <MenuButton onClick={addImage} title="Upload Image">
          <Upload size={16} />
        </MenuButton>
        <MenuButton active={editor.isActive('link')} onClick={addLink} title="Insert Link">
          <LinkIcon size={16} />
        </MenuButton>
        <div className="w-px h-6 bg-border mx-1" />
        <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo size={16} />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo size={16} />
        </MenuButton>
      </div>
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
