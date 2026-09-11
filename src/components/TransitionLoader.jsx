// ✅ NOUVEAU COMPOSANT - TransitionLoader.jsx

import React, { useState, useEffect } from 'react';
import { CheckCircle, Crown, Star, Zap } from 'lucide-react';

const TransitionLoader = ({ isVisible, message = "Finalisation de votre connexion..." }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Vérification de votre session", icon: <CheckCircle />, delay: 500 },
    { label: "Chargement de votre profil", icon: <Star />, delay: 800 },
    { label: "Préparation de votre espace", icon: <Crown />, delay: 1200 },
    { label: "Redirection en cours", icon: <Zap />, delay: 1500 }
  ];

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2; // Progression fluide
      });
    }, 50);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div 
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '32px',
          padding: '48px',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Effet de brillance en arrière-plan */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: `-100%`,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent)',
            animation: 'shimmer 3s infinite'
          }}
        />

        {/* Logo/Icône principale */}
        <div 
          style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 32px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #D4AF37, #F39C12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            animation: 'pulse 2s infinite'
          }}
        >
          <div 
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #F39C12, #D4AF37)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2.5rem',
              fontWeight: 'bold'
            }}
          >
            J2M
          </div>
          
          {/* Anneaux animés */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                border: '2px solid rgba(212, 175, 55, 0.3)',
                borderRadius: '50%',
                width: `${130 + i * 20}px`,
                height: `${130 + i * 20}px`,
                animation: `rotate ${3 + i}s linear infinite reverse`
              }}
            />
          ))}
        </div>

        {/* Titre principal */}
        <h2 
          style={{
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '16px',
            background: 'linear-gradient(145deg, #D4AF37, #F39C12)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Connexion réussie !
        </h2>

        <p 
          style={{
            color: '#6b7280',
            marginBottom: '32px',
            fontSize: '1.1rem'
          }}
        >
          {message}
        </p>

        {/* Barre de progression élégante */}
        <div 
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            overflow: 'hidden',
            marginBottom: '32px',
            position: 'relative'
          }}
        >
          <div 
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #D4AF37, #F39C12, #D4AF37)',
              borderRadius: '6px',
              transition: 'width 0.3s ease-out',
              position: 'relative'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                animation: 'shimmer 1.5s infinite'
              }}
            />
          </div>
        </div>

        {/* Étapes de chargement */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {steps.map((step, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: index <= currentStep ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                transition: 'all 0.5s ease-out',
                opacity: index <= currentStep ? 1 : 0.4
              }}
            >
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: index <= currentStep ? '#D4AF37' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  transition: 'all 0.3s ease-out'
                }}
              >
                {index < currentStep ? (
                  <CheckCircle style={{ width: '16px', height: '16px' }} />
                ) : (
                  React.cloneElement(step.icon, { style: { width: '16px', height: '16px' } })
                )}
              </div>
              
              <span 
                style={{
                  color: index <= currentStep ? '#1f2937' : '#9ca3af',
                  fontWeight: index <= currentStep ? '600' : '400',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease-out'
                }}
              >
                {step.label}
              </span>
              
              {index === currentStep && (
                <div 
                  style={{
                    marginLeft: 'auto',
                    width: '20px',
                    height: '20px',
                    border: '2px solid #D4AF37',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Message de progression */}
        <div style={{ marginTop: '24px' }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#9ca3af',
            margin: 0
          }}>
            {progress < 100 ? `${Math.round(progress)}% terminé` : 'Redirection...'}
          </p>
        </div>
      </div>

      {/* Styles CSS intégrés */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 0 0 0 10px rgba(212, 175, 55, 0);
          }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TransitionLoader;