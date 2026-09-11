import React, { useState, useEffect, useRef } from 'react';
import TiptapEditor from '@/components/ui/TiptapEditor';

const TiptapEditorWrapper = ({ 
  value, 
  onChange, 
  placeholder, 
  error,
  forceRerenderKey 
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const prevValueRef = useRef();

  // ✅ Initialiser l'éditeur avec la valeur reçue
  useEffect(() => {
    if (value !== undefined && value !== prevValueRef.current) {
      console.log('TiptapEditorWrapper: Nouvelle valeur reçue:', value);
      setInternalValue(value);
      setIsInitialized(true);
      prevValueRef.current = value;
    }
  }, [value, forceRerenderKey]);

  // ✅ Gérer les changements internes
  const handleChange = (newValue) => {
    console.log('TiptapEditorWrapper: Changement interne:', newValue);
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  // ✅ Ne pas afficher l'éditeur tant que les données ne sont pas chargées
  if (!isInitialized && !value) {
    return (
      <div className="w-full h-40 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-300">
        <div className="text-gray-500 animate-pulse">
          ⏳ Chargement de l'éditeur...
        </div>
      </div>
    );
  }

  return (
    <div className="tiptap-wrapper">
      <TiptapEditor
        key={`tiptap-${forceRerenderKey}-${isInitialized ? 'ready' : 'loading'}`}
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        error={error}
      />
      
      {/* ✅ Debug info en mode développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <div><strong>Wrapper Debug:</strong></div>
          <div>• Value prop: {value?.length || 0} caractères</div>
          <div>• Internal value: {internalValue?.length || 0} caractères</div>
          <div>• Initialized: {isInitialized ? '✅' : '❌'}</div>
          <div>• Force key: {forceRerenderKey}</div>
        </div>
      )}
    </div>
  );
};

export default TiptapEditorWrapper;