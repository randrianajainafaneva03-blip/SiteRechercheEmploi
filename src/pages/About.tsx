import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';

const About = () => {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation de compteur
    const animateCounter = (element: HTMLElement, target: number, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          element.textContent = target.toLocaleString();
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(start).toLocaleString();
        }
      }, 16);
    };

    // Animation de révélation au scroll
    const revealOnScroll = () => {
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add('active');
          
          const statNumber = element.querySelector('[data-count]') as HTMLElement;
          if (statNumber && !statNumber.classList.contains('animated')) {
            statNumber.classList.add('animated');
            const target = parseInt(statNumber.getAttribute('data-count') || '0');
            animateCounter(statNumber, target);
          }
        }
      });
    };

    // Particules interactives
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth > 1024) {
        const particles = document.querySelectorAll('.particle');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        particles.forEach((particle, index) => {
          const speed = (index + 1) * 0.5;
          const x = mouseX * speed;
          const y = mouseY * speed;
          (particle as HTMLElement).style.transform = `translate(${x}px, ${y}px)`;
        });
      }
    };

    window.addEventListener('scroll', revealOnScroll);
    document.addEventListener('mousemove', handleMouseMove);
    
    // Initial check
    revealOnScroll();

    return () => {
      window.removeEventListener('scroll', revealOnScroll);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      <SEO 
        title="À propos de Job2mada - Notre mission pour l'emploi à Madagascar"
        description="Découvrez Job2mada, la plateforme qui révolutionne l'emploi à Madagascar. Notre équipe connecte les talents malgaches aux meilleures opportunités."
        keywords="job2mada, à propos, équipe, mission, emploi madagascar, plateforme recrutement"
        url="https://job2mada.com/about"
      />
    <div className="about-page">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="particles">
          {Array.from({ length: 9 }, (_, i) => (
            <div 
              key={i}
              className="particle" 
              style={{ 
                left: `${(i + 1) * 10}%`, 
                animationDelay: `${i * 0.5}s` 
              }}
            />
          ))}
        </div>
        
        <div className="hero-content">
          <h1>À propos de Job2mada</h1>
          <p className="subtitle">La plateforme qui révolutionne l'emploi à Madagascar</p>
          <a href="#mission" className="cta-button">
            <span>Découvrir notre mission</span>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </a>
        </div>
      </section>

    
      {/* Mission Section */}
      <section id="mission" className="about-section dark">
        <div className="container">
          <div className="mission-content reveal">
            <h2 className="section-title">Notre Mission</h2>
            <p className="mission-text">
              Chez Job2mada, nous croyons que chaque talent mérite sa chance. Notre mission est de connecter les meilleurs professionnels de Madagascar avec les opportunités qui leur permettront de s'épanouir et de contribuer au développement du pays.
            </p>
            <p className="mission-text">
              Nous révolutionnons le marché de l'emploi malgache en offrant une plateforme moderne, intuitive et accessible, qui facilite les rencontres entre employeurs visionnaires et candidats ambitieux.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="about-section dark">
        <div className="container">
          <h2 className="section-title reveal">Ce Qui Nous Rend Uniques</h2>
          <div className="features-grid">
            <div className="feature-card reveal">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">Plateforme Moderne</h3>
              <p className="feature-description">
                Interface intuitive et design moderne pour une expérience utilisateur exceptionnelle. Navigation simplifiée et fonctionnalités avancées.
              </p>
            </div>
            
            <div className="feature-card reveal">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">Messagerie Premium</h3>
              <p className="feature-description">
                Communication directe entre recruteurs et candidats. Messages sécurisés, notifications en temps réel et suivi des conversations.
              </p>
            </div>
            
            <div className="feature-card reveal">
              <div className="feature-icon">⭐</div>
              <h3 className="feature-title">Profils Complets</h3>
              <p className="feature-description">
                Candidats et recruteurs peuvent créer des profils détaillés, publier leurs services et showcaser leurs compétences professionnelles.
              </p>
            </div>
            
            <div className="feature-card reveal">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Matching Intelligent</h3>
              <p className="feature-description">
                Algorithme de recommandation avancé qui connecte automatiquement les profils compatibles selon les critères et préférences.
              </p>
            </div>
            
            <div className="feature-card reveal">
              <div className="feature-icon">🏆</div>
              <h3 className="feature-title">Qualité Garantie</h3>
              <p className="feature-description">
                Processus de vérification rigoureux, modération active et système de notation pour maintenir la qualité des interactions.
              </p>
            </div>
            
            <div className="feature-card reveal">
              <div className="feature-icon">🌍</div>
              <h3 className="feature-title">Impact Local</h3>
              <p className="feature-description">
                Conçu spécialement pour le marché malgache avec une compréhension profonde des enjeux locaux de l'emploi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title reveal">Notre Équipe</h2>
          <div className="team-card reveal">
            <div className="team-avatar">J2M</div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '16px' }}>
              L'Équipe Job2mada
            </h3>
            <p style={{ color: 'var(--navy)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Une équipe passionnée et déterminée à transformer le paysage de l'emploi à Madagascar. Nous combinons expertise technique, connaissance du marché local et vision innovante pour créer la meilleure expérience possible.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="about-section dark">
        <div className="container">
          <div className="mission-content reveal">
            <h2 className="section-title">Rejoignez l'Aventure</h2>
            <p className="mission-text">
              Que vous soyez un professionnel en recherche d'opportunités ou une entreprise à la recherche de talents exceptionnels, Job2mada est votre partenaire idéal pour réussir.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '40px' }}>
              <Link to="/register?type=candidate" className="cta-button">
                <span>Je suis candidat</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </Link>
              <Link to="/register?type=employer" className="cta-button">
                <span>Je recrute</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
};

export default About;