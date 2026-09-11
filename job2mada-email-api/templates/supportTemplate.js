const generateSupportTemplate = ({
    name,
    email,
    category,
    subject,
    message,
    priority,
    timestamp
  }) => {
    const getPriorityColor = (priority) => {
      switch(priority) {
        case 'critical': return '#ef4444';
        case 'high': return '#f97316'; 
        case 'normal': return '#3b82f6';
        case 'low': return '#22c55e';
        default: return '#3b82f6';
      }
    };
  
    const getPriorityLabel = (priority) => {
      switch(priority) {
        case 'critical': return 'CRITIQUE';
        case 'high': return 'ÉLEVÉE';
        case 'normal': return 'NORMALE'; 
        case 'low': return 'FAIBLE';
        default: return 'NORMALE';
      }
    };
  
    return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ticket Support Job2mada</title>
  </head>
  <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          
          <!-- Header doré -->
          <div style="background: linear-gradient(135deg, #D4AF37, #F7DC6F, #AE8625); padding: 40px 30px; text-align: center; position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 30% 70%, rgba(255,255,255,0.2) 0%, transparent 50%);"></div>
              <h1 style="color: #1a202c; margin: 0; font-size: 32px; font-weight: 900; text-shadow: 0 2px 4px rgba(0,0,0,0.1); position: relative; z-index: 1;">
                  🎫 Demande assistance
              </h1>
              <p style="color: #1a202c; margin: 15px 0 0 0; font-size: 16px; font-weight: 600; position: relative; z-index: 1;">
                  Job2mada Support System
              </p>
              <div style="background: rgba(26, 32, 44, 0.1); color: #1a202c; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-top: 15px; font-size: 14px; font-weight: 600; position: relative; z-index: 1;">
                  ${timestamp}
              </div>
          </div>
  
          <!-- Badge priorité flottant -->
          <div style="position: relative; margin-top: -20px; text-align: center; z-index: 10;">
              <span style="background: ${getPriorityColor(priority)}; color: white; padding: 12px 24px; border-radius: 25px; font-size: 14px; font-weight: bold; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: inline-block;">
                  Priorité: ${getPriorityLabel(priority)}
              </span>
          </div>
  
          <!-- Contenu principal -->
          <div style="padding: 40px 30px;">
              
              <!-- Informations client -->
              <div style="background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 25px; border-radius: 16px; margin-bottom: 25px; border-left: 6px solid #D4AF37; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: -50%; right: -20px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                  <h3 style="color: #1a202c; margin: 0 0 20px 0; font-size: 20px; font-weight: 700; display: flex; align-items: center; position: relative; z-index: 1;">
                      <span style="background: #D4AF37; color: #1a202c; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">👤</span>
                      Informations du client
                  </h3>
                  <div style="position: relative; z-index: 1;">
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                          <span style="color: #64748b; font-weight: 600; font-size: 14px;">Nom complet:</span>
                          <span style="color: #1a202c; font-weight: 700; font-size: 16px;">${name}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.1);">
                          <span style="color: #64748b; font-weight: 600; font-size: 14px;">Email:</span>
                          <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none; font-weight: 700; font-size: 16px; transition: all 0.2s ease;">${email}</a>
                      </div>
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                          <span style="color: #64748b; font-weight: 600; font-size: 14px;">Catégorie:</span>
                          <span style="background: #e0f2fe; color: #0277bd; padding: 6px 12px; border-radius: 12px; font-weight: 700; font-size: 14px;">${category}</span>
                      </div>
                  </div>
              </div>
  
              <!-- Sujet -->
              <div style="background: linear-gradient(135deg, #fff7ed, #fed7aa); padding: 25px; border-radius: 16px; margin-bottom: 25px; border-left: 6px solid #F7DC6F; position: relative; overflow: hidden;">
                  <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(247, 220, 111, 0.2) 0%, transparent 70%); border-radius: 50%;"></div>
                  <h3 style="color: #1a202c; margin: 0 0 15px 0; font-size: 20px; font-weight: 700; display: flex; align-items: center; position: relative; z-index: 1;">
                      <span style="background: #F7DC6F; color: #1a202c; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">📋</span>
                      Sujet
                  </h3>
                  <p style="color: #1a202c; margin: 0; font-size: 18px; font-weight: 700; line-height: 1.4; position: relative; z-index: 1;">${subject}</p>
              </div>
  
              <!-- Message -->
              <div style="background: linear-gradient(135deg, #f0f9ff, #dbeafe); padding: 25px; border-radius: 16px; margin-bottom: 30px; border-left: 6px solid #AE8625; position: relative; overflow: hidden;">
                  <div style="position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(174, 134, 37, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                  <h3 style="color: #1a202c; margin: 0 0 20px 0; font-size: 20px; font-weight: 700; display: flex; align-items: center; position: relative; z-index: 1;">
                      <span style="background: #AE8625; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 16px;">💬</span>
                      Message détaillé
                  </h3>
                  <div style="background: white; padding: 20px; border-radius: 12px; border: 2px solid rgba(174, 134, 37, 0.2); position: relative; z-index: 1;">
                      <p style="color: #1a202c; margin: 0; line-height: 1.7; white-space: pre-wrap; font-size: 16px;">${message}</p>
                  </div>
              </div>
  
              <!-- Action requise -->
              <div style="background: linear-gradient(135deg, #1e40af, #3b82f6, #60a5fa); padding: 30px; border-radius: 16px; text-align: center; box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3); position: relative; overflow: hidden;">
                  <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: conic-gradient(from 0deg, transparent, rgba(255,255,255,0.1), transparent); animation: rotate 10s linear infinite;"></div>
                  <h3 style="color: white; margin: 0 0 15px 0; font-size: 24px; font-weight: 800; position: relative; z-index: 1;">⚡ Action Requise</h3>
                  <p style="color: rgba(255,255,255,0.9); margin: 0 0 25px 0; font-size: 16px; line-height: 1.5; position: relative; z-index: 1;">
                      Répondre à <strong>${email}</strong> dans les <strong>24 heures ouvrables</strong>
                  </p>
                  <a href="mailto:${email}?subject=Re: ${subject}" 
                     style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #F7DC6F); color: #1a202c; padding: 16px 32px; border-radius: 30px; text-decoration: none; font-weight: 800; font-size: 16px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4); transition: all 0.3s ease; position: relative; z-index: 1;">
                      📧 Répondre Maintenant
                  </a>
              </div>
  
          </div>
  
          <!-- Footer -->
          <div style="background: linear-gradient(135deg, #1a202c, #2d3748); padding: 25px; text-align: center; position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #D4AF37, #F7DC6F, #AE8625, #D4AF37);"></div>
              <p style="color: #9ca3af; margin: 0; font-size: 14px; font-weight: 500;">
                  Job2mada Support System • ${new Date().getFullYear()} • Réponse sous 24h garantie
              </p>
              <div style="margin-top: 15px;">
                  <span style="background: rgba(212, 175, 55, 0.2); color: #D4AF37; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                      Ticket généré automatiquement
                  </span>
              </div>
          </div>
      </div>
  
      <style>
          @keyframes rotate {
              100% { transform: rotate(360deg); }
          }
      </style>
  </body>
  </html>
    `;
  };
  
  module.exports = { generateSupportTemplate };