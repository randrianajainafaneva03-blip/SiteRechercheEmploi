import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, MapPin, Timer, Eye, Calendar,
  MessageSquare, ExternalLink, Crown, CheckCircle,
  AlertCircle, Edit3, ChevronLeft, ChevronRight,
  Play, Briefcase, User, Star, ZoomIn, ImageIcon, Film, Link,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const CURRENCIES = [
  { code: 'Ar',  label: 'Ariary', rate: 1,       symbol: 'Ar' },
  { code: 'EUR', label: 'Euro',   rate: 1/4600,   symbol: '€'  },
  { code: 'USD', label: 'Dollar', rate: 1/4800,   symbol: '$'  },
];

function convertPrice(priceStr, currency) {
  if (!priceStr) return null;
  const num = parseFloat(priceStr.replace(/\s/g, '').replace(',', '.'));
  if (isNaN(num)) return priceStr;
  const converted = Math.round(num * currency.rate);
  return `${converted.toLocaleString('fr-FR')} ${currency.symbol}`;
}

function getYoutubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]{11})/);
  return m ? m[1] : null;
}

// ── Lightbox pro ──────────────────────────────────────────────────────────────
const Lightbox = ({ images, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const [imgLoaded, setImgLoaded] = useState(false);
  const prev = useCallback(() => { setImgLoaded(false); setIdx(i => (i - 1 + images.length) % images.length); }, [images.length]);
  const next = useCallback(() => { setImgLoaded(false); setIdx(i => (i + 1) % images.length); }, [images.length]);
  useEffect(() => {
    const fn = e => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [prev, next, onClose]);

  const item = images[idx];
  const lines = (item.description || '').split('\n').filter(Boolean);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(5,5,5,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      {/* Close */}
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <X style={{ width: 18, height: 18, color: '#fff' }} />
      </button>

      {/* Counter */}
      <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 99, padding: '4px 14px', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>
        {idx + 1} / {images.length}
      </div>

      <div style={{ display: 'flex', width: '100%', maxWidth: 1100, padding: '0 20px', gap: 32, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
        {/* Prev */}
        <button onClick={prev} style={{ flexShrink: 0, width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
          <ChevronLeft style={{ width: 22, height: 22, color: '#fff' }} />
        </button>

        {/* Image */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{ position: 'relative', width: '100%', maxHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!imgLoaded && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#D4AF37', animation: 'spin 0.8s linear infinite' }} /></div>}
            <img src={item.image_url} alt="" onLoad={() => setImgLoaded(true)} style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.8)', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease', display: 'block' }} />
          </div>

          {/* Description + link */}
          {(lines.length > 0 || item.link) && (
            <div style={{ width: '100%', maxWidth: 700, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px' }}>
              {lines.length > 0 && (
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.75 }}>
                  {lines.map((line, i) => <p key={i} style={{ margin: '0 0 6px' }}>{line}</p>)}
                </div>
              )}
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: lines.length ? 12 : 0, color: '#D4AF37', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                  <Link style={{ width: 14, height: 14 }} />
                  {item.link.replace(/^https?:\/\//, '').slice(0, 60)}
                </a>
              )}
            </div>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 10 }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => { setImgLoaded(false); setIdx(i); }}
                  style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', border: `2px solid ${i === idx ? '#D4AF37' : 'transparent'}`, opacity: i === idx ? 1 : 0.45, cursor: 'pointer', padding: 0, background: 'none', transition: 'all .2s' }}>
                  <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Next */}
        <button onClick={next} style={{ flexShrink: 0, width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background .2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
          <ChevronRight style={{ width: 22, height: 22, color: '#fff' }} />
        </button>
      </div>
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
const ServiceModal = ({ service, isOpen, onClose, isPremiumUser, onContact }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [portfolioActive, setPortfolioActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [ytPlaying, setYtPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setMounted(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setMounted(false);
      setYtPlaying(false);
      document.body.style.overflow = 'unset';
    }
    const fn = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = 'unset'; };
  }, [isOpen, onClose]);

  if (!isOpen || !service) return null;

  const creator = service.profiles || service.creator || {};
  const isOwnService = service.isCurrentUser || user?.id === service.creator_id || user?.$id === service.creator_id;
  const isPremium = isPremiumUser ?? profile?.is_premium;

  // Parse portfolio robustement (peut être string, array, ou JSON string)
  let rawPortfolio = service.portfolio;
  if (typeof rawPortfolio === 'string') { try { rawPortfolio = JSON.parse(rawPortfolio); } catch { rawPortfolio = []; } }
  if (!Array.isArray(rawPortfolio)) rawPortfolio = [];
  const portfolio = rawPortfolio.slice(0, 5).map(item => {
    if (typeof item === 'string') { try { return JSON.parse(item); } catch { return { image_url: item, description: '' }; } }
    return item;
  }).filter(item => item?.image_url);
  const youtubeId = getYoutubeId(service.youtube_url);
  const convertedPrice = convertPrice(service.price_range, currency);

  const statusInfo = !service.is_approved
    ? { label: 'En attente', bg: '#fef3c7', color: '#92400e', border: '#fcd34d', Icon: AlertCircle }
    : service.is_active
    ? { label: 'Actif', bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', Icon: CheckCircle }
    : { label: 'Inactif', bg: '#f3f4f6', color: '#374151', border: '#d1d5db', Icon: AlertCircle };

  // Gold palette
  const G = {
    gold: '#B8860B',
    goldLight: '#D4AF37',
    goldPale: '#F7E7CE',
    goldBg: '#FFFBF0',
    goldBorder: 'rgba(184,134,11,0.18)',
    dark: '#2d1f00',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(15,10,0,0.72)', backdropFilter: 'blur(10px)', opacity: mounted ? 1 : 0, transition: 'opacity 0.4s ease' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-start sm:items-center justify-center p-0 sm:p-4">
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '56rem',
            borderRadius: '24px',
            overflow: 'hidden',
            background: '#ffffff',
            boxShadow: mounted
              ? '0 40px 100px rgba(180,130,0,0.18), 0 8px 32px rgba(0,0,0,0.22), 0 0 0 1px rgba(212,175,55,0.18)'
              : '0 4px 20px rgba(0,0,0,0.1)',
            transform: mounted ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
            opacity: mounted ? 1 : 0,
            transition: 'transform 0.45s cubic-bezier(.22,1,.36,1), opacity 0.35s ease, box-shadow 0.45s ease',
            maxHeight: '100dvh',
            overflowY: 'auto',
          }}
        >
          {/* ── HERO HEADER ──────────────────────────────────────────── */}
          <div style={{ position: 'relative', overflow: 'hidden', padding: '36px 40px 32px', background: `linear-gradient(135deg, ${G.dark} 0%, #4a3200 40%, ${G.goldLight} 80%, ${G.goldPale} 100%)` }}>

            {/* Logo watermark */}
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              style={{ position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%)', height: 220, width: 'auto', opacity: 0.07, pointerEvents: 'none', userSelect: 'none', filter: 'grayscale(1) brightness(5)' }}
            />

            {/* Shimmer */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.06) 50%, transparent 65%)', animation: 'j2m-shimmer 5s ease-in-out infinite', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)`, pointerEvents: 'none' }} />

            {/* Close */}
            <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, padding: 8, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(8px)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.85)' }} />
            </button>

            {/* Creator row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {creator.avatar_url ? (
                  <img src={creator.avatar_url} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid rgba(212,175,55,0.55)', boxShadow: '0 0 18px rgba(212,175,55,0.35)' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(212,175,55,0.18)', border: '2.5px solid rgba(212,175,55,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User style={{ width: 20, height: 20, color: G.goldLight }} />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: 14, lineHeight: 1.3 }}>{creator.full_name || 'Prestataire'}</p>
                {creator.location && <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin style={{ width: 11, height: 11 }} />{creator.location}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {creator.is_premium && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: `rgba(212,175,55,0.2)`, color: G.goldLight, border: `1px solid rgba(212,175,55,0.4)`, fontSize: 11, fontWeight: 800 }}>
                    <Crown style={{ width: 11, height: 11 }} /> PREMIUM
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: statusInfo.bg, color: statusInfo.color, border: `1px solid ${statusInfo.border}`, fontSize: 11, fontWeight: 700 }}>
                  <statusInfo.Icon style={{ width: 11, height: 11 }} />{statusInfo.label}
                </span>
              </div>
            </div>

            {/* Title */}
            <h2 style={{ fontSize: 'clamp(18px, 4vw, 28px)', fontWeight: 900, color: '#fff', lineHeight: 1.25, marginBottom: 16, paddingRight: 32, textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
              {service.title}
            </h2>

            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {service.category && <Badge icon={<Briefcase style={{ width: 11, height: 11 }} />}>{service.category}</Badge>}
              {convertedPrice && <Badge gold>{convertedPrice}</Badge>}
              {service.delivery_time && <Badge icon={<Timer style={{ width: 11, height: 11 }} />}>{service.delivery_time}</Badge>}
              {service.views_count > 0 && <Badge icon={<Eye style={{ width: 11, height: 11 }} />}>{service.views_count} vues</Badge>}
            </div>

            {/* Currency switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Devise :</span>
              {CURRENCIES.map(c => (
                <button key={c.code} onClick={() => setCurrency(c)} style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all .2s',
                  background: currency.code === c.code ? G.goldLight : 'rgba(255,255,255,0.1)',
                  color: currency.code === c.code ? G.dark : 'rgba(255,255,255,0.6)',
                }}>
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>
          </div>

          {/* ── BODY ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', background: G.goldBg }}>
            <div style={{ display: 'flex', flexDirection: 'column' }} className="lg:flex-row">

              {/* LEFT */}
              <div style={{ flex: 1, minWidth: 0, padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Prix', value: convertedPrice, color: G.gold },
                    { label: 'Délai', value: service.delivery_time, color: '#2563eb' },
                    { label: 'Vues', value: service.views_count ?? 0, color: '#7c3aed' },
                  ].map(({ label, value, color }) => value != null && (
                    <div key={label} style={{ borderRadius: 16, padding: '14px 16px', background: '#fff', border: `1px solid ${G.goldBorder}`, boxShadow: '0 2px 8px rgba(180,130,0,0.06)' }}>
                      <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(0,0,0,0.35)', marginBottom: 4 }}>{label}</p>
                      <p style={{ fontWeight: 900, fontSize: 15, color }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <Section title="Description du service" gold>
                  <div
                    style={{ borderRadius: 14, padding: '16px 20px', background: '#fff', border: `1px solid ${G.goldBorder}`, fontSize: 14, lineHeight: 1.7, color: '#374151' }}
                    dangerouslySetInnerHTML={{ __html: service.description || '<p style="color:#9ca3af">Aucune description</p>' }}
                  />
                </Section>

                {/* Skills */}
                {service.skills?.length > 0 && (
                  <Section title="Compétences">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {service.skills.map((skill, i) => (
                        <span key={i} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600, background: `rgba(184,134,11,0.09)`, color: G.gold, border: `1px solid rgba(184,134,11,0.18)` }}>{skill}</span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Portfolio — toujours affiché */}
                <Section title={`Portfolio${portfolio.length > 0 ? ` · ${portfolio.length}/5 photo${portfolio.length > 1 ? 's' : ''}` : ''}`} icon={<ImageIcon style={{ width: 13, height: 13 }} />}>
                  {portfolio.length > 0 ? (
                    <>
                      <div
                        onClick={() => setLightboxIdx(portfolioActive)}
                        style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9', cursor: 'zoom-in', background: '#000', boxShadow: '0 6px 24px rgba(0,0,0,0.15)', marginBottom: 10 }}
                      >
                        <img src={portfolio[portfolioActive].image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s ease', display: 'block' }}
                          onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', opacity: 0, transition: 'opacity .3s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = 1}
                          onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        >
                          {portfolio[portfolioActive].description && <p style={{ position: 'absolute', bottom: 14, left: 14, right: 14, color: '#fff', fontSize: 13, fontWeight: 500 }}>{portfolio[portfolioActive].description}</p>}
                          <div style={{ position: 'absolute', top: 12, right: 12, padding: 8, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
                            <ZoomIn style={{ width: 16, height: 16, color: '#fff' }} />
                          </div>
                        </div>
                      </div>
                      {portfolio.length > 1 && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          {portfolio.map((item, i) => (
                            <button key={i} onClick={() => setPortfolioActive(i)} style={{ flex: 1, aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: `2px solid ${portfolioActive === i ? G.goldLight : 'transparent'}`, opacity: portfolioActive === i ? 1 : 0.55, cursor: 'pointer', transition: 'all .2s', padding: 0, background: 'none' }}>
                              <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    // Placeholder Job2mada
                    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9', background: '#f8f0d8' }}>
                      <img src="/jobmada_template.jpg" alt="Job2mada" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <img src="/logo.png" alt="Job2mada" style={{ height: 48, width: 'auto', opacity: 0.5 }} />
                        <p style={{ color: G.gold, fontSize: 13, fontWeight: 600, opacity: 0.8 }}>Aucune photo de portfolio</p>
                      </div>
                    </div>
                  )}
                </Section>

                {/* Vidéo — toujours affichée */}
                <Section title="Vidéo de présentation" icon={<Film style={{ width: 13, height: 13 }} />}>
                  {youtubeId ? (
                    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9', boxShadow: '0 6px 24px rgba(0,0,0,0.2)', background: '#000', cursor: ytPlaying ? 'default' : 'pointer' }}
                      onClick={() => !ytPlaying && setYtPlaying(true)}>
                      {!ytPlaying ? (
                        <>
                          <img
                            src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                            alt="Aperçu vidéo"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { e.target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`; }}
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}>
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(255,0,0,0.5)', transform: 'scale(1)', transition: 'transform .2s' }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                              <Play style={{ width: 28, height: 28, color: '#fff', fill: '#fff', marginLeft: 4 }} />
                            </div>
                          </div>
                          <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>
                            Cliquer pour lire
                          </div>
                        </>
                      ) : (
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=1`}
                          title="Vidéo du service"
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </div>
                  ) : (
                    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9', background: '#f8f0d8' }}>
                      <img src="/jobmada_template.jpg" alt="Job2mada" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `rgba(184,134,11,0.12)`, border: `2px solid rgba(184,134,11,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play style={{ width: 24, height: 24, color: G.gold, opacity: 0.6 }} />
                        </div>
                        <p style={{ color: G.gold, fontSize: 13, fontWeight: 600, opacity: 0.8 }}>Aucune vidéo de présentation</p>
                      </div>
                    </div>
                  )}

                  {/* Description vidéo */}
                  {youtubeId && service.video_description && (() => {
                    const lines = service.video_description.split('\n').filter(Boolean);
                    return (
                      <div style={{
                        marginTop: 16,
                        borderRadius: 16,
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #fffbf0 0%, #fff8e6 100%)',
                        border: `1px solid ${G.goldBorder}`,
                        boxShadow: '0 2px 12px rgba(184,134,11,0.07)',
                      }}>
                        {/* Barre dorée top */}
                        <div style={{ height: 3, background: `linear-gradient(90deg, ${G.gold}, ${G.goldLight}, transparent)` }} />
                        <div style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(255,0,0,0.3)' }}>
                              <Play style={{ width: 12, height: 12, color: '#fff', fill: '#fff', marginLeft: 2 }} />
                            </div>
                            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', color: G.gold }}>À propos de cette vidéo</p>
                          </div>
                          <div style={{ fontSize: 14, lineHeight: 1.75, color: '#374151' }}>
                            {lines.map((line, i) => <p key={i} style={{ margin: '0 0 6px' }}>{line}</p>)}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </Section>

                {/* Date */}
                <p style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6, borderTop: `1px solid ${G.goldBorder}`, paddingTop: 16 }}>
                  <Calendar style={{ width: 13, height: 13 }} />
                  Publié le {new Date(service.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* RIGHT SIDEBAR */}
              <div style={{ width: 'min(100%, 280px)', flexShrink: 0, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16, borderLeft: `1px solid ${G.goldBorder}` }} className="lg:block">

                {/* Creator card */}
                <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', boxShadow: `0 8px 28px rgba(184,134,11,0.14), 0 0 0 1px ${G.goldBorder}` }}>
                  {/* Gold header */}
                  <div style={{ padding: '20px 20px 0', background: `linear-gradient(135deg, ${G.dark}, #4a3200, ${G.goldLight})`, position: 'relative', overflow: 'hidden' }}>
                    <img src="/logo.png" alt="" style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', height: 80, width: 'auto', opacity: 0.08, filter: 'brightness(5) grayscale(1)', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 20 }}>
                      {creator.avatar_url ? (
                        <img src={creator.avatar_url} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(212,175,55,0.5)', boxShadow: '0 0 20px rgba(212,175,55,0.3)', marginBottom: 10 }} />
                      ) : (
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(212,175,55,0.2)', border: '3px solid rgba(212,175,55,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                          <User style={{ width: 28, height: 28, color: G.goldLight }} />
                        </div>
                      )}
                      <p style={{ fontWeight: 800, color: '#fff', fontSize: 15, textAlign: 'center', lineHeight: 1.3 }}>{creator.full_name || 'Prestataire'}</p>
                      {creator.poste && <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 3, textAlign: 'center' }}>{creator.poste}</p>}
                      {creator.location && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}><MapPin style={{ width: 10, height: 10 }} />{creator.location}</p>}
                    </div>
                  </div>
                  {/* CTA */}
                  <div style={{ padding: '14px 16px', background: '#fff' }}>
                    {!isOwnService ? (
                      isPremium ? (
                        <button onClick={onContact} style={{ width: '100%', padding: '11px 0', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none', background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`, color: '#fff', boxShadow: '0 4px 14px rgba(184,134,11,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                          <MessageSquare style={{ width: 15, height: 15 }} />
                          Contacter le prestataire
                        </button>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, lineHeight: 1.4 }}>Passez en <strong style={{ color: G.gold }}>Premium</strong> pour contacter ce prestataire</p>
                          <button onClick={() => { onClose(); navigate(profile?.user_type === 'candidate' ? '/candidate-premium' : '/premium'); }} style={{ width: '100%', padding: '11px 0', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none', background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`, color: '#fff', boxShadow: '0 4px 14px rgba(184,134,11,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                            <Crown style={{ width: 15, height: 15 }} />
                            Passer au Premium
                          </button>
                        </div>
                      )
                    ) : (
                      <button onClick={() => { onClose(); navigate(`/services/edit/${service.id || service.$id}`); }} style={{ width: '100%', padding: '11px 0', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: 'none', background: `linear-gradient(135deg, ${G.gold}, ${G.goldLight})`, color: '#fff', boxShadow: '0 4px 14px rgba(184,134,11,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                        <Edit3 style={{ width: 15, height: 15 }} />
                        Modifier le service
                      </button>
                    )}
                  </div>
                </div>

                {/* Info card */}
                <div style={{ borderRadius: 16, padding: '16px', background: '#fff', border: `1px solid ${G.goldBorder}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {service.price_range && <InfoRow label="Prix" value={convertedPrice} gold G={G} />}
                  {service.delivery_time && <InfoRow label="Délai" value={service.delivery_time} G={G} />}
                  <InfoRow label="Vues" value={service.views_count ?? 0} G={G} />
                  <InfoRow label="Portfolio" value={`${portfolio.length} photo${portfolio.length !== 1 ? 's' : ''}`} G={G} />
                  {youtubeId && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>Vidéo</span>
                      <a href={service.youtube_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                        YouTube <ExternalLink style={{ width: 11, height: 11 }} />
                      </a>
                    </div>
                  )}
                </div>

                <button onClick={onClose} style={{ width: '100%', padding: '10px 0', borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: 'pointer', background: 'transparent', border: `1px solid ${G.goldBorder}`, color: '#9ca3af' }}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxIdx !== null && (
        <Lightbox images={portfolio} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      <style>{`
        @keyframes j2m-shimmer { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .lg\\:flex-row { flex-direction: column; }
        @media (min-width: 1024px) {
          .lg\\:flex-row { flex-direction: row !important; }
          .lg\\:block { display: block !important; }
        }
      `}</style>
    </>
  );
};

const Badge = ({ children, icon, gold }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700,
    background: gold ? 'rgba(212,175,55,0.28)' : 'rgba(0,0,0,0.32)',
    color: gold ? '#2d1f00' : 'rgba(255,255,255,0.88)',
    border: gold ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.12)',
    backdropFilter: 'blur(6px)',
  }}>
    {icon}{children}
  </span>
);

const Section = ({ title, children, gold, icon }) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      {icon && <span style={{ color: '#B8860B', display: 'flex' }}>{icon}</span>}
      <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: gold ? '#B8860B' : '#6b7280', margin: 0 }}>{title}</h3>
      <div style={{ flex: 1, height: 1, background: 'rgba(184,134,11,0.12)' }} />
    </div>
    {children}
  </div>
);

const InfoRow = ({ label, value, gold, G }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <span style={{ fontSize: 12, color: '#9ca3af' }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 800, color: gold ? G.gold : '#111827' }}>{value}</span>
  </div>
);

export default ServiceModal;
