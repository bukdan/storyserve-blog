'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Undo,
  Redo,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCallback, useRef } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuButton = ({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded transition-colors ${
      active
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:bg-secondary'
    }`}
  >
    {children}
  </button>
);

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
      Link.configure({ openOnClick: false }),
      Underline,
      Placeholder.configure({
        placeholder: 'Mulai menulis artikel... (paste gambar untuk menambahkan)',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'post-content min-h-[400px] outline-none px-4 py-3',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              // For now, use base64 for pasted images
              const reader = new FileReader();
              reader.onload = () => {
                if (editor) {
                  editor.chain().focus().setImage({ src: reader.result as string }).run();
                  toast.success('Gambar berhasil ditambahkan');
                }
              };
              reader.readAsDataURL(file);
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

    // Use base64 for local images
    const reader = new FileReader();
    reader.onload = () => {
      if (editor) {
        editor.chain().focus().setImage({ src: reader.result as string }).run();
        toast.success('Gambar berhasil ditambahkan');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addLink = () => {
    const url = prompt('Masukkan URL link:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-card">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-secondary/50">
        <MenuButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold size={16} />
        </MenuButton>
        <MenuButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic size={16} />
        </MenuButton>
        <MenuButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </MenuButton>
        <MenuButton
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </MenuButton>
        <div className="w-px h-6 bg-border mx-1" />
        <MenuButton
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </MenuButton>
        <MenuButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </MenuButton>
        <MenuButton
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </MenuButton>
        <div className="w-px h-6 bg-border mx-1" />
        <MenuButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List size={16} />
        </MenuButton>
        <MenuButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </MenuButton>
        <MenuButton
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        >
          <Quote size={16} />
        </MenuButton>
        <div className="w-px h-6 bg-border mx-1" />
        <MenuButton onClick={addImage} title="Upload Image">
          <Upload size={16} />
        </MenuButton>
        <MenuButton
          active={editor.isActive('link')}
          onClick={addLink}
          title="Insert Link"
        >
          <LinkIcon size={16} />
        </MenuButton>
        <div className="w-px h-6 bg-border mx-1" />
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo size={16} />
        </MenuButton>
      </div>
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
