// scrapePortailJob-FINAL.js
import puppeteer from 'puppeteer';
import fs from 'fs';

const scrapePortailJob = async () => {
  console.log('🚀 Scraping PortailJob Madagascar - VERSION FINALE\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const allJobs = [];
  const baseUrl = 'https://www.portaljob-madagascar.com/emploi/liste';
  
  // ⚙️ CONFIGURATION
  const START_PAGE = 3;
  const END_PAGE = 30; // Test d'abord
  const DELAY_BETWEEN_PAGES = 3000;
  const DELAY_BETWEEN_JOBS = 2000;
  
  try {
    for (let pageNum = START_PAGE; pageNum <= END_PAGE; pageNum++) {
      console.log(`\n📄 ========== PAGE ${pageNum}/${END_PAGE} ==========`);
      
      const listUrl = pageNum === 1 ? baseUrl : `${baseUrl}?page=${pageNum}`;
      
      try {
        await page.goto(listUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForSelector('a[href*="/emploi/view/"]', { timeout: 10000 });
        
        const jobLinks = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/emploi/view/"]'));
          return [...new Set(links.map(link => link.href))];
        });
        
        console.log(`🔗 Trouvé ${jobLinks.length} offres`);
        
        if (jobLinks.length === 0) break;
        
        for (let i = 0; i < jobLinks.length; i++) {
          const jobUrl = jobLinks[i];
          console.log(`\n  📌 [${i + 1}/${jobLinks.length}] ${jobUrl}`);
          
          try {
            await page.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 20000 });
            await page.waitForSelector('.item_tab.active', { timeout: 5000 });
            
            // 🎯 EXTRACTION COMPLÈTE
            const jobData = await page.evaluate(() => {
              const activeTab = document.querySelector('.item_tab.active');
              if (!activeTab) return null;
              
              // 1️⃣ TITRE
              const titre = activeTab.querySelector('h2')?.textContent.trim() || '';
              
              // 2️⃣ INFOS PRINCIPALES (premier item_detail)
              const firstDetail = activeTab.querySelector('.item_detail');
              const firstText = firstDetail?.textContent || '';
              
              // Parser la première ligne : "DATE | ENTREPRISE | Contrat TYPE | VILLE"
              const parts = firstText.split('|').map(s => s.trim());
              const date_publication = parts[0] || '';
              const entreprise = parts[1] || '';
              
              // Extraire type de contrat
              const contratMatch = firstText.match(/Contrat\s+([A-Z]+)/i);
              const type_contrat = contratMatch ? contratMatch[1] : '';
              
              // Localisation = dernier élément non-vide
              let localisation = '';
              for (let i = parts.length - 1; i >= 0; i--) {
                const cleaned = parts[i].replace(/Contrat\s+[A-Z]+/i, '').trim();
                if (cleaned && cleaned !== '' && !cleaned.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
                  localisation = cleaned;
                  break;
                }
              }
              
              // Logo
              const logo_url = firstDetail?.querySelector('img')?.src || '';
              
              // 3️⃣ TOUTES LES SECTIONS SUIVANTES
              const allDetails = Array.from(activeTab.querySelectorAll('.item_detail, section.item_detail'));
              
              // Structure pour stocker les sections
              const sections = {
                presentation: '',
                missions: '',
                profil: '',
                avantages: '',
                autres: []
              };
              
              allDetails.forEach((section, idx) => {
                if (idx === 0) return; // Skip la première (déjà traitée)
                
                const html = section.innerHTML.trim();
                const text = section.textContent.trim().toLowerCase();
                
                // Ignorer les sections inutiles
                if (text.includes('référence') || 
                    text.includes('postuler') || 
                    text.includes('sauvegarder') ||
                    text.includes('contacter')) {
                  return;
                }
                
                // Classifier par mots-clés
                if (text.includes('présentation') || 
                    text.includes('société') || 
                    text.includes('entreprise') ||
                    text.includes('spécialisée dans')) {
                  sections.presentation = html;
                }
                else if (text.includes('mission') || 
                         text.includes('responsabilité') || 
                         text.includes('tâche') ||
                         text.includes('• développ') ||
                         text.includes('• particip')) {
                  sections.missions = html;
                }
                else if (text.includes('profil') || 
                         text.includes('requis') || 
                         text.includes('compétence') ||
                         text.includes('expérience') ||
                         text.includes('formation')) {
                  sections.profil = html;
                }
                else if (text.includes('avantage') || 
                         text.includes('bénéfice') ||
                         text.includes('package')) {
                  sections.avantages = html;
                }
                else {
                  // Tout le reste
                  sections.autres.push(html);
                }
              });
              
              // Combiner "autres" en une seule description
              const description_generale = sections.autres.join('\n<br>\n');
              
              // 4️⃣ RÉFÉRENCE
              const refElement = Array.from(allDetails).find(el => 
                el.textContent.toLowerCase().includes('référence')
              );
              const reference = refElement?.textContent
                .replace(/référence/gi, '')
                .trim() || '';
              
              // 5️⃣ EMAIL & TÉLÉPHONE
              const allHTML = activeTab.innerHTML;
              const emailMatch = allHTML.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/);
              const phoneMatch = allHTML.match(/(?:\+261|261|0)\s*\d{2}\s*\d{2}\s*\d{3}\s*\d{2}/);
              
              const email_contact = emailMatch ? emailMatch[0] : '';
              const telephone = phoneMatch ? phoneMatch[0] : '';
              
              // 6️⃣ CONSTRUIRE LA DESCRIPTION COMPLÈTE
              let description_complete = '';
              if (sections.presentation) description_complete += `<h3>Présentation</h3>\n${sections.presentation}\n\n`;
              if (sections.missions) description_complete += `<h3>Missions</h3>\n${sections.missions}\n\n`;
              if (sections.profil) description_complete += `<h3>Profil recherché</h3>\n${sections.profil}\n\n`;
              if (sections.avantages) description_complete += `<h3>Avantages</h3>\n${sections.avantages}\n\n`;
              if (description_generale) description_complete += description_generale;
              
              return {
                titre,
                entreprise,
                localisation,
                type_contrat,
                date_publication,
                logo_url,
                reference,
                
                // Sections séparées
                presentation_entreprise: sections.presentation,
                missions_principales: sections.missions,
                profil_recherche: sections.profil,
                avantages_offerts: sections.avantages,
                
                // Description complète HTML
                description_complete,
                
                // Contact
                email_contact,
                telephone,
                
                // Métadonnées
                url: window.location.href,
                id_portaljob: window.location.pathname.split('/').pop(),
                scraped_at: new Date().toISOString()
              };
            });
            
            if (!jobData) {
              console.log('    ⚠️  Pas de données (structure différente)');
              continue;
            }
            
            // Nettoyage HTML (supprimer scripts dangereux)
            const fieldsToClean = [
              'presentation_entreprise', 
              'missions_principales', 
              'profil_recherche', 
              'avantages_offerts',
              'description_complete'
            ];
            
            fieldsToClean.forEach(field => {
              if (jobData[field]) {
                jobData[field] = jobData[field]
                  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                  .replace(/javascript:/gi, '');
              }
            });
            
            allJobs.push(jobData);
            
            console.log(`    ✅ ${jobData.titre}`);
            console.log(`    🏢 ${jobData.entreprise}`);
            console.log(`    📍 ${jobData.localisation}`);
            console.log(`    📋 ${jobData.type_contrat}`);
            console.log(`    📄 Description: ${jobData.description_complete ? '✓' : '✗'}`);
            console.log(`    📧 Email: ${jobData.email_contact || '✗'}`);
            
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_JOBS));
            
          } catch (error) {
            console.error(`    ❌ ${error.message}`);
          }
        }
        
        // Backup progressif
        fs.writeFileSync(`backup-page-${pageNum}.json`, JSON.stringify(allJobs, null, 2));
        console.log(`\n💾 Backup: ${allJobs.length} offres`);
        
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_PAGES));
        
      } catch (error) {
        console.error(`❌ Page ${pageNum}: ${error.message}`);
      }
    }
    
    // 💾 SAUVEGARDE FINALE
    console.log('\n\n🎉 ========== TERMINÉ ==========');
    console.log(`📊 Total: ${allJobs.length} offres`);
    
    const jsonFile = `portaljob-complete-${Date.now()}.json`;
    fs.writeFileSync(jsonFile, JSON.stringify(allJobs, null, 2));
    console.log(`✅ JSON: ${jsonFile}`);
    
    const csvFile = `portaljob-complete-${Date.now()}.csv`;
    fs.writeFileSync(csvFile, convertToCSV(allJobs));
    console.log(`✅ CSV: ${csvFile}`);
    
    // Statistiques
    console.log('\n📈 Statistiques:');
    console.log(`  - Avec description complète: ${allJobs.filter(j => j.description_complete).length}`);
    console.log(`  - Avec missions: ${allJobs.filter(j => j.missions_principales).length}`);
    console.log(`  - Avec profil: ${allJobs.filter(j => j.profil_recherche).length}`);
    console.log(`  - Avec email: ${allJobs.filter(j => j.email_contact).length}`);
    console.log(`  - Avec téléphone: ${allJobs.filter(j => j.telephone).length}`);
    console.log(`  - CDI: ${allJobs.filter(j => j.type_contrat === 'CDI').length}`);
    console.log(`  - CDD: ${allJobs.filter(j => j.type_contrat === 'CDD').length}`);
    
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
  } finally {
    await browser.close();
  }
};

const convertToCSV = (data) => {
  if (!data.length) return '';
  
  const headers = [
    'titre', 'entreprise', 'localisation', 'type_contrat', 
    'date_publication', 'reference', 'email_contact', 'telephone',
    'logo_url', 'url', 'id_portaljob'
  ];
  
  const rows = data.map(job => {
    return headers.map(h => {
      let v = job[h] || '';
      if (typeof v === 'string') {
        v = v.replace(/"/g, '""');
        if (v.includes(',') || v.includes('\n')) v = `"${v}"`;
      }
      return v;
    }).join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
};

scrapePortailJob();