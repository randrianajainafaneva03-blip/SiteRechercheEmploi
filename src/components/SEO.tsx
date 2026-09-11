// components/SEO.tsx
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = "Job2mada - Offres d'emploi à Madagascar",
  description = "Job2mada, la plateforme leader d'offres d'emploi à Madagascar. Trouvez votre emploi idéal ou recrutez les meilleurs talents malgaches.",
  keywords = "job2mada, emploi madagascar, offres emploi madagascar, recrutement madagascar",
  image = "https://job2mada.com/images/job2mada-social.jpg",
  url = "https://job2mada.com"
}) => {
  useEffect(() => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined' || !document) return;
    
    try {
      // Titre de la page
      document.title = title;
      
      // Fonction helper pour mettre à jour les meta tags
      const updateMetaTag = (name: string, content: string, property = false) => {
        if (!document.head) return; // Protection supplémentaire
        
        const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;
        
        if (!meta) {
          meta = document.createElement('meta');
          if (property) {
            meta.setAttribute('property', name);
          } else {
            meta.setAttribute('name', name);
          }
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      // Mettre à jour les meta tags avec protection
      updateMetaTag('description', description);
      updateMetaTag('keywords', keywords);
      updateMetaTag('og:title', title, true);
      updateMetaTag('og:description', description, true);
      updateMetaTag('og:image', image, true);
      updateMetaTag('og:url', url, true);
      
      // Canonical URL avec protection
      if (document.head) {
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.setAttribute('rel', 'canonical');
          document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', url);
      }

    } catch (error) {
      console.error('Erreur SEO:', error);
    }

  }, [title, description, keywords, image, url]);

  return null;
};