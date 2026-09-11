function generateCandidatureTemplate({ recruiterName, candidateData, jobData }) {
    return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouvelle candidature - Job2mada</title>
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
              max-width: 800px;
              margin: 0 auto;
              background-color: #ffffff;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
              border-radius: 12px;
              overflow: hidden;
              border: 1px solid #e1e8ed;
          }
          .header {
              background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
              color: white;
              text-align: center;
              padding: 40px 30px;
          }
          .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 700;
              letter-spacing: -0.5px;
          }
          .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.95;
          }
          .content {
              padding: 40px 30px;
          }
          .alert-section {
              background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
              border: 2px solid #D4AF37;
              border-radius: 8px;
              padding: 30px;
              margin-bottom: 30px;
              text-align: center;
          }
          .alert-section h2 {
              margin: 0 0 10px 0;
              font-size: 24px;
              font-weight: 700;
              color: #2c3e50;
          }
          .section {
              margin: 30px 0;
              background: #ffffff;
              border: 1px solid #e1e8ed;
              border-radius: 8px;
              overflow: hidden;
          }
          .section-header {
              background: linear-gradient(135deg, #D4AF37 0%, #B8860B 100%);
              color: white;
              padding: 20px 25px;
              font-size: 18px;
              font-weight: 600;
          }
          .section-content {
              padding: 25px;
          }
          .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              gap: 20px;
              margin: 20px 0;
          }
          .info-item {
              background: #f8f9fa;
              border: 1px solid #e1e8ed;
              padding: 20px;
              border-radius: 6px;
              border-left: 4px solid #D4AF37;
          }
          .info-item strong {
              display: block;
              margin-bottom: 8px;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              color: #7f8c8d;
              font-weight: 600;
          }
          .info-value {
              font-size: 16px;
              font-weight: 600;
              color: #2c3e50;
          }
          .candidate-section {
              background: #fafbfc;
              border: 2px solid #D4AF37;
              border-radius: 8px;
              padding: 30px;
              margin: 30px 0;
          }
          .candidate-section h3 {
              margin: 0 0 20px 0;
              color: #2c3e50;
              font-size: 20px;
              font-weight: 700;
              padding-bottom: 10px;
              border-bottom: 2px solid #D4AF37;
          }
          .cover-letter {
              background: white;
              border: 1px solid #e1e8ed;
              border-left: 4px solid #D4AF37;
              padding: 20px;
              border-radius: 6px;
              margin: 20px 0;
              color: #2c3e50;
              max-height: 300px;
              overflow-y: auto;
          }
          .btn {
              display: inline-block;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              text-align: center;
              margin: 8px 10px 8px 0;
              font-size: 14px;
              background: linear-gradient(135deg, #D4AF37, #B8860B);
              color: white;
          }
          .footer {
              background: #2c3e50;
              color: white;
              padding: 30px;
              text-align: center;
          }
          .footer a {
              color: #D4AF37;
              text-decoration: none;
          }
          @media (max-width: 768px) {
              .container {
                  margin: 0 15px;
                  max-width: calc(100% - 30px);
              }
              .info-grid {
                  grid-template-columns: 1fr;
              }
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <div class="container">
              <div class="header">
                  <h1>Job2mada</h1>
                  <p>Plateforme de recrutement professionnelle à Madagascar</p>
              </div>
  
              <div class="content">
                  <div class="alert-section">
                      <h2>Nouvelle Candidature Reçue</h2>
                      <p>Bonjour ${recruiterName}, vous avez reçu une nouvelle candidature pour votre offre d'emploi</p>
                  </div>
  
                  <div class="section">
                      <div class="section-header">
                          Détails de l'Offre d'Emploi
                      </div>
                      <div class="section-content">
                          <div class="info-grid">
                              <div class="info-item">
                                  <strong>Poste</strong>
                                  <div class="info-value">${jobData.title}</div>
                              </div>
                              <div class="info-item">
                                  <strong>Entreprise</strong>
                                  <div class="info-value">${jobData.company_name}</div>
                              </div>
                              <div class="info-item">
                                  <strong>Date de candidature</strong>
                                  <div class="info-value">${new Date().toLocaleDateString('fr-FR')}</div>
                              </div>
                              <div class="info-item">
                                  <strong>Documents reçus</strong>
                                  <div class="info-value">${candidateData.cvUrl ? '1 CV' : '0 CV'} + ${candidateData.additionalDocsCount || 0} doc(s)</div>
                              </div>
                          </div>
                      </div>
                  </div>
  
                  <div class="candidate-section">
                      <h3>Profil du Candidat</h3>
                      <div class="info-grid">
                          <div class="info-item">
                              <strong>Nom complet</strong>
                              <div class="info-value">${candidateData.name}</div>
                          </div>
                          <div class="info-item">
                              <strong>Téléphone</strong>
                              <div class="info-value">${candidateData.phone || 'Non renseigné'}</div>
                          </div>
                      </div>
  
                      ${candidateData.coverLetter ? `
                      <div class="cover-letter">
                          <strong style="color: #B8860B; font-size: 16px; display: block; margin-bottom: 12px;">Lettre de Motivation</strong>
                          <div>${candidateData.coverLetter}</div>
                      </div>
                      ` : ''}
  
                      ${candidateData.cvUrl ? `
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 30px; margin: 25px 0; text-align: center; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3); position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; animation: pulse 2s infinite;"></div>
                            
                            <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border-radius: 12px; padding: 25px; margin: 20px 0; border: 1px solid rgba(255,255,255,0.2);">
                                <div style="font-size: 48px; margin-bottom: 15px;">📄</div>
                                <h3 style="color: white; font-size: 24px; font-weight: 700; margin: 0 0 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                    CV du Candidat
                                </h3>
                                <p style="color: rgba(255,255,255,0.9); margin: 15px 0; font-size: 16px; line-height: 1.5;">
                                    📎 Document joint en pièce jointe ET disponible via le lien ci-dessous
                                </p>
                                
                                <a href="${candidateData.cvUrl}" 
                                   style="display: inline-block; background: linear-gradient(45deg, #ff6b6b, #ee5a24); color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; margin: 15px 0; box-shadow: 0 5px 15px rgba(238, 90, 36, 0.4); transition: all 0.3s ease; border: 2px solid rgba(255,255,255,0.3);"
                                   onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(238, 90, 36, 0.6)';"
                                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 5px 15px rgba(238, 90, 36, 0.4)';">
                                    🚀 Télécharger le CV
                                </a>
                                
                                <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 15px; margin-top: 20px;">
                                    <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0; font-weight: 500;">
                                        💡 Le CV est également disponible dans les pièces jointes de cet email pour un accès hors ligne
                                    </p>
                                </div>
                            </div>
                        </div>
                        ` : `
                        <div style="background: linear-gradient(135deg, #ffa726 0%, #fb8c00 100%); border-radius: 16px; padding: 30px; margin: 25px 0; text-align: center; box-shadow: 0 10px 30px rgba(255, 167, 38, 0.3);">
                            <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
                            <h3 style="color: white; font-size: 20px; font-weight: 700; margin: 0 0 10px 0;">Aucun CV fourni</h3>
                            <p style="color: rgba(255,255,255,0.9); margin: 0;">Le candidat n'a pas joint de CV à sa candidature</p>
                        </div>
                        `}
                        
                        ${candidateData.additionalDocsCount > 0 ? `
                        <div style="background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; color: white;">
                            <div style="font-size: 32px; margin-bottom: 10px;">📎</div>
                            <h4 style="margin: 0 0 8px 0; font-size: 18px;">Documents supplémentaires</h4>
                            <p style="margin: 0; opacity: 0.9;">${candidateData.additionalDocsCount} document(s) joint(s) en pièce jointe</p>
                        </div>
                        ` : ''}
                  </div>
  
                  <div style="text-align: center; margin: 30px 0; padding: 30px; background: #fafbfc; border-radius: 8px;">
                      <h3 style="color: #2c3e50;">Actions de Gestion</h3>
                      <p style="color: #7f8c8d;">Gérez cette candidature depuis votre espace recruteur</p>
                      
                      <a href="${process.env.FRONTEND_URL || 'https://job2mada.com'}/dashboard" class="btn">
                          Tableau de Bord
                      </a>
                      
                      <a href="${process.env.FRONTEND_URL || 'https://job2mada.com'}/jobs/${jobData.id}" class="btn">
                          Voir l'Offre
                      </a>
                  </div>
              </div>
  
              <div class="footer">
                  <h4>Job2mada - Emploi & Talents Madagascar</h4>
                  <p>
                      <a href="${process.env.FRONTEND_URL || 'https://job2mada.com'}">Visiter le site</a> | 
                      <a href="${process.env.FRONTEND_URL || 'https://job2mada.com'}/dashboard">Tableau de bord</a>
                  </p>
                  <p style="font-size: 12px; opacity: 0.8; margin-top: 20px;">
                      Email automatique généré par Job2mada<br>
                      Vous recevez cet email suite à la publication d'une offre d'emploi
                  </p>
              </div>
          </div>
      </div>
  </body>
  </html>
    `;
  }
  
  module.exports = { generateCandidatureTemplate };