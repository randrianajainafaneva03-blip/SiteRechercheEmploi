// src/components/ui/TiptapEditor.jsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Undo,
  Redo
} from 'lucide-react';

const TiptapEditor = ({ value, onChange, placeholder, error }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Écrivez votre contenu...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();

  return (
    <div className={`border rounded-xl overflow-hidden ${error ? 'border-red-300' : 'border-gray-300'}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center space-x-2">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('bold') 
              ? 'bg-purple-100 text-purple-600' 
              : 'hover:bg-gray-200 text-gray-600'
          }`}
        >
          <Bold className="h-4 w-4" />
        </button>
        
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('italic') 
              ? 'bg-purple-100 text-purple-600' 
              : 'hover:bg-gray-200 text-gray-600'
          }`}
        >
          <Italic className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        <button
          type="button"
          onClick={toggleBulletList}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('bulletList') 
              ? 'bg-purple-100 text-purple-600' 
              : 'hover:bg-gray-200 text-gray-600'
          }`}
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={toggleOrderedList}
          className={`p-2 rounded-lg transition-colors ${
            editor.isActive('orderedList') 
              ? 'bg-purple-100 text-purple-600' 
              : 'hover:bg-gray-200 text-gray-600'
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="p-4 min-h-[200px]">
        <EditorContent 
          editor={editor}
          className="prose prose-sm max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
};

export default TiptapEditor;