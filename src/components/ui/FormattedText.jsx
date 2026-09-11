// src/components/ui/FormattedText.jsx
import React from 'react';
import DOMPurify from 'dompurify';

const FormattedText = ({ content, className = "" }) => {
  const sanitizedContent = DOMPurify.sanitize(content);
  
  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      style={{
        lineHeight: '1.6',
      }}
    />
  );
};

export default FormattedText;