function generateCandidateConfirmationTemplate({ candidateName, jobData, applicationDate }) {
    return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de candidature - Job2mada</title>
      <style>
          body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Arial', sans-serif;
              background-color: #f8f9fa;
              line-height: 1.6;
              color: #2c3e50;
          }
          .email-container {
              width: 100%;
              background-color: #f8f9fa;
              padding: 30px 0;
          }
          .container {
              max-width: 700px;
              margin: 0 auto;
              background-color: #ffffff;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
              border-radius: 12px;
              overflow: hidden;
              border: 1px solid #e1e8ed;
          }
          .header {
              background: linear-gradient(135deg, #10B981 0%, #059669 100%);
              color: white;
              text-align: center;
              padding: 40px 30px;
              position: relative;
          }
          .header::before {
              content: '✅';
              position: absolute;
              font-size: 60px;
              top: -10px;
              right: 30px;
              opacity: 0.3;
          }
          .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
          }
          .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.95;
          }
          .content {
              padding: 40px 30px;
          }
          .success-section {
              background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
              border: 2px solid #10B981;
              border-radius: 12px;
              padding: 30px;
              margin-bottom: 30px;
              text-align: center;
              position: relative;
          }
          .success-section::before {
              content: '🎯';
              position: absolute;
              font-size: 40px;
              top: 15px;
              right: 20px;
              opacity: 0.5;
          }
          .success-section h2 {
              margin: 0 0 15px 0;
              font-size: 24px;
              font-weight: 700;
              color: #065F46;
          }
          .success-section p {
              margin: 0;
              font-size: 16px;
              color: #047857;
          }
          .job-summary {
              background: #fafbfc;
              border: 2px solid #D4AF37;
              border-radius: 8px;
              padding: 25px;
              margin: 25px 0;
          }
          .job-summary h3 {
              margin: 0 0 15px 0;
              color: #2c3e50;
              font-size: 20px;
              font-weight: 700;
              border-bottom: 2px solid #D4AF37;
              padding-bottom: 10px;
          }
          .job-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin: 20px 0;
          }
          .job-detail {
              background: white;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #e1e8ed;
              border-left: 4px solid #D4AF37;
          }
          .job-detail strong {
              display: block;
              margin-bottom: 5px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #7f8c8d;
              font-weight: 600;
          }
          .job-detail-value {
              font-size: 15px;
              font-weight: 600;
              color: #2c3e50;
          }
          .next-steps {
              background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
              border: 2px solid #F59E0B;
              border-radius: 8px;
              padding: 25px;
              margin: 25px 0;
          }
          .next-steps h3 {
              margin: 0 0 15px 0;
              color: #92400E;
              font-size: 18px;
              font-weight: 700;
          }
          .next-steps ul {
              margin: 0;
              padding-left: 20px;
              color: #B45309;
          }
          .next-steps li {
              margin: 8px 0;
              font-weight: 500;
          }
          .tips-section {
              background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
              border: 2px solid #3B82F6;
              border-radius: 8px;
              padding: 25px;
              margin: 25px 0;
              position: relative;
          }
          .tips-section::before {
              content: '💡';
              position: absolute;
              font-size: 30px;
              top: 20px;
              right: 25px;
              opacity: 0.7;
          }
          .tips-section h3 {
              margin: 0 0 15px 0;
              color: #1E40AF;
              font-size: 18px;
              font-weight: 700;
          }
          .tips-section p {
              margin: 0;
              color: #1D4ED8;
              font-weight: 500;
          }
          .cta-section {
              background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
              color: white;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
              border-radius: 8px;
          }
          .cta-section h3 {
              margin: 0 0 15px 0;
              font-size: 20px;
              font-weight: 700;
          }
          .cta-section p {
              margin: 0 0 20px 0;
              opacity: 0.9;
          }
          .btn {
              display: inline-block;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              text-align: center;
              margin: 8px 10px 8px 0;
              font-size: 14px;
              background: white;
              color: #B8860B;
              border: 2px solid white;
          }
          .footer {
              background: #2c3e50;
              color: white;
              padding: 30px;
              text-align: center;
          }
          .footer h4 {
              font-size: 18px;
              font-weight: 700;
              margin: 0 0 15px 0;
          }
          .footer p {
              margin: 8px 0;
              font-size: 14px;
          }
          .footer a {
              color: #D4AF37;
              text-decoration: none;
          }
          .timeline {
              background: white;
              border: 1px solid #e1e8ed;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
          }
          .timeline-item {
              display: flex;
              align-items: center;
              margin: 15px 0;
              padding: 10px;
              border-radius: 6px;
              background: #f8f9fa;
          }
          .timeline-icon {
              width: 30px;
              height: 30px;
              border-radius: 50%;
              background: #D4AF37;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
              font-weight: bold;
              font-size: 14px;
          }
          @media (max-width: 768px) {
              .container {
                  margin: 0 15px;
                  max-width: calc(100% - 30px);
              }
              .job-details {
                  grid-template-columns: 1fr;
              }
              .content, .footer {
                  padding: 25px 20px;
              }
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="container">
              <div class="header">
                  <h1>Job2mada</h1>
                  <p>Confirmation de candidature</p>
              </div>
  
              <div class="content">
                  <div class="success-section">
                      <h2>Candidature envoyée avec succès !</h2>
                      <p>Bonjour ${candidateName}, votre candidature a été transmise au recruteur</p>
                  </div>
  
                  <div class="job-summary">
                      <h3>Récapitulatif de votre candidature</h3>
                      <div class="job-details">
                          <div class="job-detail">
                              <strong>Poste</strong>
                              <div class="job-detail-value">${jobData.title}</div>
                          </div>
                          <div class="job-detail">
                              <strong>Entreprise</strong>
                              <div class="job-detail-value">${jobData.company_name}</div>
                          </div>
                          <div class="job-detail">
                              <strong>Date de candidature</strong>
                              <div class="job-detail-value">${new Date(applicationDate).toLocaleDateString('fr-FR')}</div>
                          </div>
                          <div class="job-detail">
                              <strong>Statut</strong>
                              <div class="job-detail-value">En attente de review</div>
                          </div>
                      </div>
                  </div>
  
                  <div class="timeline">
                      <h3 style="margin: 0 0 20px 0; color: #2c3e50;">Processus de candidature</h3>
                      <div class="timeline-item">
                          <div class="timeline-icon">✓</div>
                          <div>
                              <strong>Candidature envoyée</strong><br>
                              <small>Votre candidature a été transmise au recruteur</small>
                          </div>
                      </div>
                      <div class="timeline-item" style="opacity: 0.6;">
                          <div class="timeline-icon" style="background: #6b7280;">2</div>
                          <div>
                              <strong>Review en cours</strong><br>
                              <small>Le recruteur examine votre profil</small>
                          </div>
                      </div>
                      <div class="timeline-item" style="opacity: 0.6;">
                          <div class="timeline-icon" style="background: #6b7280;">3</div>
                          <div>
                              <strong>Réponse du recruteur</strong><br>
                              <small>Vous recevrez une réponse sous 7-10 jours</small>
                          </div>
                      </div>
                  </div>
  
                  <div class="next-steps">
                      <h3>Prochaines étapes</h3>
                      <ul>
                          <li><strong>Patience</strong> : Le recruteur va examiner votre candidature</li>
                          <li><strong>Suivi</strong> : Vous recevrez une réponse par email</li>
                          <li><strong>Préparation</strong> :<strong> VOUS POUVEZ AUSSI PASSER EN PREMIUM POUR ENVOYER UN MESSAGE DIRECT AU RECRUTEUR DEPUIS LE SITE</strong></li>
                          <li><strong>Autres opportunités</strong> : Continuez à postuler sur d'autres offres</li>
                      </ul>
                  </div>
  
                  <div class="tips-section">
                      <h3>Conseil professionnel</h3>
                      <p>Pendant l'attente, continuez à améliorer votre profil et explorez d'autres opportunités sur Job2mada. La persévérance est la clé du succès !</p>
                  </div>
  
                  <div class="cta-section">
                      <h3>Continuez votre recherche</h3>
                      <p>Découvrez d'autres opportunités qui correspondent à votre profil</p>
                      
                      <a href="${process.env.FRONTEND_URL || 'https://job2mada.com'}/jobs" class="btn">
                          Voir plus d'offres
                      </a>
                      
                      <a href="${process.env.FRONTEND_URL || 'https://job2mada.com'}/dashboard" class="btn">
                          Mon tableau de bord
                      </a>
                  </div>
              </div>
  
              <div class="footer">
                  <h4>Job2mada - Votre partenaire emploi</h4>
                  <p>
                      <a href="${process.env.FRONTEND_URL || 'https://job2mada.com'}">Visiter le site</a> | 
                      <a href="${process.env.FRONTEND_URL || 'https://job2mada.com'}/dashboard">Mon espace</a> |
                      <a href="${process.env.FRONTEND_URL || 'https://job2mada.com'}/contact">Support</a>
                  </p>
                  <p style="font-size: 12px; opacity: 0.8; margin-top: 20px;">
                      Email automatique de confirmation Job2mada<br>
                      Vous recevez cet email car vous avez postulé à une offre d'emploi
                  </p>
              </div>
          </div>
      </div>
  </body>
  </html>
    `;
  }
  
  module.exports = { generateCandidateConfirmationTemplate };