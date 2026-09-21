import React, { useRef, useState } from 'react';
import { Plus, X, Image, Loader2, Link, ChevronDown, ChevronUp } from 'lucide-react';
import { storage, BUCKETS, ID, getFileUrl } from '@/lib/appwrite';

// portfolio = [{image_url, description, link}, ...]  (max 5)
const PortfolioEditor = ({ portfolio = [], onChange }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [expanded, setExpanded] = useState({});

  const addFromUrl = () => {
    const url = prompt('Coller le lien URL de l\'image :');
    if (!url?.trim()) return;
    if (portfolio.length >= 5) { alert('Maximum 5 images'); return; }
    onChange([...portfolio, { image_url: url.trim(), description: '', link: '' }]);
  };

  const remove = (i) => onChange(portfolio.filter((_, idx) => idx !== i));

  const update = (i, field, value) => {
    const updated = [...portfolio];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  const toggleExpand = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = '';
    const remaining = 5 - portfolio.length;
    const toUpload = files.slice(0, remaining);
    if (!toUpload.length) return;

    setUploading(true);
    const newItems = [];
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      setUploadProgress(`Upload ${i + 1}/${toUpload.length} — ${file.name}`);
      try {
        const uploaded = await storage.createFile(BUCKETS.IMAGES, ID.unique(), file);
        const url = getFileUrl(BUCKETS.IMAGES, uploaded.$id);
        newItems.push({ image_url: url, description: '', link: '' });
      } catch (err) {
        console.error('Erreur upload:', err);
        alert(`Erreur upload ${file.name}: ${err.message}`);
      }
    }
    setUploading(false);
    setUploadProgress('');
    if (newItems.length) onChange([...portfolio, ...newItems]);
  };

  return (
    <div className="space-y-3">
      {portfolio.map((item, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Image row */}
          <div className="flex gap-3 p-3">
            <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 cursor-pointer" onClick={() => toggleExpand(i)}>
              <img src={item.image_url} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-gray-500">Photo {i + 1}</p>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => toggleExpand(i)} className="text-xs text-purple-600 font-semibold flex items-center gap-1 hover:text-purple-800">
                    {expanded[i] ? <><ChevronUp className="h-3 w-3" />Moins</> : <><ChevronDown className="h-3 w-3" />Description & lien</>}
                  </button>
                  <button type="button" onClick={() => remove(i)} className="p-1 text-gray-300 hover:text-red-500 rounded-lg transition-colors ml-1">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={item.description?.split('\n')[0] || ''}
                onChange={e => update(i, 'description', e.target.value)}
                placeholder="Titre / description courte…"
                maxLength={120}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 bg-gray-50"
              />
            </div>
          </div>

          {/* Expandable rich section */}
          {expanded[i] && (
            <div className="border-t border-gray-100 px-3 pb-3 space-y-2 bg-gray-50">
              <div className="pt-2">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Description détaillée <span className="font-normal text-gray-400">(mise en forme, retours à la ligne…)</span></label>
                <textarea
                  value={item.description || ''}
                  onChange={e => update(i, 'description', e.target.value)}
                  placeholder={"Décrivez cette réalisation en détail.\n\nVous pouvez utiliser plusieurs paragraphes, lister les technologies, le contexte, les résultats…"}
                  rows={5}
                  maxLength={1500}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-400 bg-white resize-y"
                  style={{ minHeight: 100 }}
                />
                <p className="text-right text-xs text-gray-400 mt-0.5">{(item.description || '').length}/1500</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><Link className="h-3 w-3" />Lien externe <span className="font-normal text-gray-400">(site, GitHub, Behance…)</span></label>
                <input
                  type="url"
                  value={item.link || ''}
                  onChange={e => update(i, 'link', e.target.value)}
                  placeholder="https://…"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-400 bg-white"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {uploading && (
        <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3">
          <Loader2 className="h-5 w-5 text-purple-600 animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-purple-700">Upload en cours…</p>
            <p className="text-xs text-purple-500">{uploadProgress}</p>
          </div>
        </div>
      )}

      {portfolio.length < 5 && !uploading && (
        <div className="flex gap-2">
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 text-purple-600 rounded-xl py-3 text-sm font-semibold transition-all">
            <Image className="h-4 w-4" />Depuis mon appareil
          </button>
          <button type="button" onClick={addFromUrl}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-600 rounded-xl py-3 text-sm font-semibold transition-all">
            <Plus className="h-4 w-4" />Par lien URL
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400">{portfolio.length}/5 photo{portfolio.length !== 1 ? 's' : ''}</p>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
    </div>
  );
};

export default PortfolioEditor;
