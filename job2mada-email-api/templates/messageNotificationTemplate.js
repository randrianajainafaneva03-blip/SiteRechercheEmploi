function generateMessageNotificationTemplate({
    recipientName,
    senderName,
    senderType,
    messagePreview,
    // champs potentiellement présents selon le payload
    message,
    jobTitle,
    conversationId
  }) {
    const safe = (v) => (v ?? '').toString();
    const name = safe(recipientName) || 'Cher utilisateur';
    const sender = safe(senderName) || 'Utilisateur';
    const firstLetter = sender.charAt(0).toUpperCase() || 'U';
  
    // fallback messagePreview -> message -> texte par défaut
    const previewRaw = safe(messagePreview) || safe(message);
    const preview = previewRaw ? previewRaw : 'Vous avez reçu un nouveau message.';
  
    // normaliser le type pour afficher le bon badge
    const t = safe(senderType).toLowerCase();
    const isRecruiter = t === 'recruteur' || t === 'recruiter' || t === 'employer' || t === 'employeur';
    const roleLabel = isRecruiter ? '👔 Recruteur' : '👤 Candidat';
  
    // construire un lien vers la conversation si disponible
    const messagesUrl = `https://job2mada.com/messages${conversationId ? `?cid=${conversationId}` : ''}`;
  
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>Nouveau message | Job2mada</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height:1.6; color:#333; background:#f8f9fa; }
      .container { max-width:600px; margin:0 auto; background:#fff; }
      .header { background:linear-gradient(135deg,#D4AF37 0%,#F39C12 50%,#AA8C3E 100%); padding:40px 30px; text-align:center; }
      .CTA { background:linear-gradient(135deg,#D4AF37 0%,#F39C12 50%,#AA8C3E 100%); padding:40px 30px; text-align:center; }
      .header h1 { color:#fff; font-size:28px; font-weight:bold; margin-bottom:10px; }
      .header p { color:#fff; opacity:.9; font-size:16px; }
      .content { padding:40px 30px; }
      .message-card { background:linear-gradient(135deg,#fff3cd,#ffeaa7); border-left:5px solid #D4AF37; padding:25px; margin:25px 0; border-radius:10px; }
      .sender-info { display:flex; align-items:center; margin-bottom:20px; }
      .avatar { width:50px; height:50px; background:linear-gradient(135deg,#D4AF37,#F39C12); border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:18px; margin-right:15px; }
      .sender-details h3 { color:#AA8C3E; font-size:18px; margin-bottom:5px; }
      .sender-details span { color:#666; font-size:14px; padding:4px 12px; background:#f8f9fa; border-radius:20px; }
      .subtle { color:#777; font-size:14px; margin-top:6px; }
      .message-preview { color:#555; font-style:italic; line-height:1.6; }
      .cta-button { display:inline-block; background:linear-gradient(135deg,#D4AF37,#F39C12); color:#fff !important; text-decoration:none; padding:15px 35px; border-radius:50px; font-weight:bold; font-size:16px; margin:25px 0; transition:transform .3s ease; }
      .cta-button:hover { transform:translateY(-2px); }
      .features { margin:30px 0; }
      .feature { display:flex; align-items:center; margin:15px 0; }
      .feature-icon { width:35px; height:35px; background:linear-gradient(135deg,#D4AF37,#F39C12); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-right:15px; }
      .footer { background:#2c3e50; color:#fff; padding:30px; text-align:center; }
      .footer a { color:#D4AF37; text-decoration:none; }
      @media (max-width:600px){ .container{margin:0;} .header,.content{padding:20px;} .cta-button{display:block; text-align:center;} }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>💬 Nouveau Message</h1>
        <p>Vous avez reçu un message sur Job2mada</p>
      </div>
  
      <div class="content">
        <h2 style="color:#AA8C3E; margin-bottom:20px;">Bonjour ${name},</h2>
  
        <div class="message-card">
          <div class="sender-info">
            <div class="avatar">${firstLetter}</div>
            <div class="sender-details">
              <h3>${sender}</h3>
              <span>${roleLabel}</span>
              ${jobTitle ? `<div class="subtle">À propos de : <strong>${jobTitle}</strong></div>` : ''}
            </div>
          </div>
          <div class="message-preview">
            "${preview}"
          </div>
        </div>
  
        <div style="text-align:center; margin:30px 0;">
          <a href="${messagesUrl}" class="cta-button">📨 Voir mes messages</a>
        </div>

        <div class="features">
          <h3 style="color:#AA8C3E; margin-bottom:20px;">Gérez vos messages facilement :</h3>
          <div class="feature">
            <div class="feature-icon">💬</div>
            <div><strong>Réponse rapide</strong><br><span style="color:#666;">Interface intuitive pour répondre instantanément</span></div>
          </div>
          <div class="feature">
            <div class="feature-icon">🔔</div>
            <div><strong>Notifications en temps réel</strong><br><span style="color:#666;">Soyez alerté de chaque nouveau message</span></div>
          </div>
          <div class="feature">
            <div class="feature-icon">🛡️</div>
            <div><strong>Messagerie sécurisée</strong><br><span style="color:#666;">Vos conversations sont protégées</span></div>
          </div>
        </div>
      </div>
  
      <div class="footer">
        <p style="margin-bottom:15px;"><strong>Job2mada</strong> - La plateforme de recrutement de référence à Madagascar</p>
        <p style="font-size:14px; opacity:.8;">
          <a href="https://job2mada.com">Accéder au site</a> |
          <a href="https://job2mada.com/support">Support</a> |
          <a href="https://job2mada.com/unsubscribe">Se désabonner</a>
        </p>
      </div>
    </div>
  </body>
  </html>
    `;
  }
  module.exports = { generateMessageNotificationTemplate };
  