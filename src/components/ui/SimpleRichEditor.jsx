import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Link, AlignLeft, AlignCenter, Eye, Edit3 } from 'lucide-react';

const SimpleRichEditor = ({ value = '', onChange, placeholder = '', error, className = '' }) => {
  const editorRef = useRef(null);
  const isInitialized = useRef(false);
  const [isPreview, setIsPreview] = useState(false);
  const [charCount, setCharCount] = useState(0);

  // Init une seule fois quand la valeur arrive (chargement du service)
  useEffect(() => {
    if (!isInitialized.current && value && editorRef.current) {
      editorRef.current.innerHTML = value;
      setCharCount(value.replace(/<[^>]*>/g, '').length);
      isInitialized.current = true;
    }
  }, [value]);

  // Reset si le composant est réutilisé avec une nouvelle valeur (navigation)
  useEffect(() => {
    return () => { isInitialized.current = false; };
  }, []);

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || '';
    const text = html.replace(/<[^>]*>/g, '');
    setCharCount(text.length);
    onChange?.(html);
  };

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    handleInput();
  };

  const addLink = () => {
    const url = prompt('Entrez l\'URL :');
    if (url) exec('createLink', url);
  };

  const ToolBtn = ({ cmd, icon, title, action }) => (
    <button type="button" title={title}
      onMouseDown={e => { e.preventDefault(); action ? action() : exec(cmd); }}
      className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700">
      {icon}
    </button>
  );

  return (
    <div className={`border rounded-xl overflow-hidden ${error ? 'border-red-300' : 'border-gray-300'} ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200 flex-wrap">
        <ToolBtn cmd="bold"   icon={<Bold className="h-4 w-4" />}        title="Gras" />
        <ToolBtn cmd="italic" icon={<Italic className="h-4 w-4" />}      title="Italique" />
        <ToolBtn cmd="underline" icon={<Underline className="h-4 w-4" />} title="Souligné" />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn cmd="insertUnorderedList" icon={<List className="h-4 w-4" />}        title="Liste à puces" />
        <ToolBtn cmd="insertOrderedList"   icon={<ListOrdered className="h-4 w-4" />} title="Liste numérotée" />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn cmd="justifyLeft"   icon={<AlignLeft className="h-4 w-4" />}   title="Gauche" />
        <ToolBtn cmd="justifyCenter" icon={<AlignCenter className="h-4 w-4" />} title="Centrer" />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn cmd="createLink" icon={<Link className="h-4 w-4" />} title="Ajouter un lien" action={addLink} />
        <div className="flex-1" />
        <button type="button" onClick={() => setIsPreview(p => !p)}
          className={`p-2 rounded transition-colors text-sm font-medium flex items-center gap-1 ${isPreview ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}>
          {isPreview ? <><Edit3 className="h-3.5 w-3.5" />Éditer</> : <><Eye className="h-3.5 w-3.5" />Aperçu</>}
        </button>
      </div>

      {/* Editor / Preview */}
      <div className="relative">
        {isPreview ? (
          <div className="p-4 min-h-[200px] prose max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: editorRef.current?.innerHTML || '<p class="text-gray-400">Aucun contenu</p>' }} />
        ) : (
          <>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              className="p-4 min-h-[200px] outline-none prose max-w-none focus:bg-blue-50/30 transition-colors"
              style={{ lineHeight: 1.7 }}
            />
            {!charCount && (
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none text-sm">{placeholder}</div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 text-right">
        {charCount} caractères
      </div>
    </div>
  );
};

export default SimpleRichEditor;
