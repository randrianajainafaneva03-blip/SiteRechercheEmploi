function generatePremiumUpgradeTemplate({
    recipientName,
    senderName,
    senderType
  }) {
    return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Passez Premium | Job2mada</title>
      <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #D4AF37 0%, #F39C12 50%, #AA8C3E 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden; }
          .header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></svg>') repeat; animation: sparkle 3s ease-in-out infinite; }
          @keyframes sparkle { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(180deg); } }
          .crown { font-size: 48px; margin-bottom: 15px; }
          .header h1 { color: white; font-size: 32px; font-weight: bold; margin-bottom: 10px; position: relative; z-index: 1; }
          .header p { color: white; opacity: 0.9; font-size: 18px; position: relative; z-index: 1; }
          .content { padding: 40px 30px; }
          .contact-card { background: linear-gradient(135deg, #fff8dc, #ffeaa7); border: 2px solid #D4AF37; padding: 25px; margin: 25px 0; border-radius: 15px; text-align: center; }
          .sender-avatar { width: 70px; height: 70px; background: linear-gradient(135deg, #3498db, #2980b9); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; margin: 0 auto 15px; }
          .contact-card h3 { color: #AA8C3E; font-size: 20px; margin-bottom: 8px; }
          .contact-badge { display: inline-block; padding: 6px 15px; background: ${senderType === 'recruteur' ? 'linear-gradient(135deg, #3498db, #2980b9)' : 'linear-gradient(135deg, #27ae60, #229954)'}; color: white; border-radius: 20px; font-size: 14px; margin-bottom: 15px; }
          .premium-benefits { margin: 30px 0; }
          .benefit { display: flex; align-items: center; margin: 20px 0; padding: 15px; background: linear-gradient(135deg, #fff, #f8f9fa); border-radius: 10px; border-left: 4px solid #D4AF37; }
          .benefit-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #D4AF37, #F39C12); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 18px; }
          .cta-section { text-align: center; margin: 40px 0; padding: 30px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 15px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #D4AF37, #F39C12); color: white !important; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: bold; font-size: 18px; margin: 20px 0; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3); }
          .cta-button:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4); }
          .pricing { background: white; border: 2px solid #D4AF37; border-radius: 15px; padding: 25px; margin: 20px 0; text-align: center; }
          .price { font-size: 36px; color: #D4AF37; font-weight: bold; margin: 15px 0; }
          .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
          .footer a { color: #D4AF37; text-decoration: none; }
          @media (max-width: 600px) {
              .container { margin: 0; }
              .header, .content { padding: 20px; }
              .cta-button { display: block; text-align: center; }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <div class="crown">👑</div>
              <h1>Quelqu'un souhaite vous contacter !</h1>
              <p>Découvrez qui et passez Premium pour débloquer la conversation</p>
          </div>
          
          <div class="content">
              <h2 style="color: #AA8C3E; margin-bottom: 20px;">Bonjour ${recipientName},</h2>
              
              <div class="contact-card">
                  <div class="sender-avatar">${senderName.charAt(0).toUpperCase()}</div>
                  <h3>${senderName}</h3>
                  <div class="contact-badge">
                      ${senderType === 'recruteur' ? '👔 Recruteur vérifié' : '👤 Candidat talentueux'}
                  </div>
                  <p style="color: #666; font-style: italic;">
                      souhaite entrer en contact avec vous sur Job2mada
                  </p>
              </div>
              
              <div class="cta-section">
                  <h3 style="color: #AA8C3E; margin-bottom: 20px;">
                      🚀 Passez Premium pour débloquer cette opportunité !
                  </h3>
                  <a href="https://job2mada.com/premium" class="cta-button">
                      ✨ Découvrir Premium
                  </a>
              </div>
              
              <div class="premium-benefits">
                  <h3 style="color: #AA8C3E; margin-bottom: 25px; text-align: center;">
                      🎯 Ce que Premium vous apporte :
                  </h3>
                  
                  <div class="benefit">
                      <div class="benefit-icon">💬</div>
                      <div>
                          <strong>Messages illimités</strong><br>
                          <span style="color: #666;">Recevez et répondez à tous les messages sans limite</span>
                      </div>
                  </div>
                  
                  <div class="benefit">
                      <div class="benefit-icon">📞</div>
                      <div>
                          <strong>Contact direct</strong><br>
                          <span style="color: #666;">Accès aux coordonnées des ${senderType === 'recruteur' ? 'candidats' : 'recruteurs'}</span>
                      </div>
                  </div>
                  
                  <div class="benefit">
                      <div class="benefit-icon">✅</div>
                      <div>
                          <strong>Profil vérifié</strong><br>
                          <span style="color: #666;">Badge de confiance et visibilité accrue</span>
                      </div>
                  </div>
                  
                  <div class="benefit">
                      <div class="benefit-icon">🎯</div>
                      <div>
                          <strong>Mise en avant</strong><br>
                          <span style="color: #666;">Votre profil apparaît en priorité dans les recherches</span>
                      </div>
                  </div>
              </div>
              
              <div class="pricing">
                  <h3 style="color: #AA8C3E; margin-bottom: 15px;">Offre de lancement</h3>
                  <div class="price">15 000 Ar<span style="font-size: 18px; color: #666;">/mois</span></div>
                  <p style="color: #666; margin-bottom: 20px;">Premier mois à -50% • Résiliable à tout moment</p>
                  <div style="background: #e8f5e8; padding: 15px; border-radius: 10px; margin: 15px 0;">
                      <strong style="color: #27ae60;">🎁 Bonus de bienvenue :</strong><br>
                      <span style="color: #666;">Guide premium "Réussir sa recherche d'emploi"</span>
                  </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0; padding: 20px; background: #fff3cd; border-radius: 10px;">
                  <p style="color: #856404; font-weight: bold;">
                      ⏰ ${senderName} attend votre réponse
                  </p>
                  <p style="color: #856404; font-size: 14px; margin-top: 5px;">
                      Ne ratez pas cette opportunité !
                  </p>
              </div>
          </div>
          
          <div class="footer">
              <p style="margin-bottom: 15px;">
                  <strong>Job2mada Premium</strong> - Déverrouillez votre potentiel professionnel
              </p>
              <p style="font-size: 14px; opacity: 0.8;">
                  <a href="https://job2mada.com">Accéder au site</a> | 
                  <a href="https://job2mada.com/premium">Découvrir Premium</a> | 
                  <a href="https://job2mada.com/support">Support</a>
              </p>
          </div>
      </div>
  </body>
  </html>
    `;
  }
  
  module.exports = { generatePremiumUpgradeTemplate };