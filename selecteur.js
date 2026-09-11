// findSelectors.js
import puppeteer from 'puppeteer';

const findSelectors = async () => {
  console.log('🔍 Analyse de la structure PortailJob...\n');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Ouvrir une offre d'exemple
    const testUrl = 'https://www.portaljob-madagascar.com/emploi/view/ingenosya-madagascar-business-analyst-odoo-ref-494-pj181322';
    
    await page.goto(testUrl, { waitUntil: 'networkidle2' });
    console.log('✅ Page chargée\n');
    
    // Analyser la structure complète
    const analysis = await page.evaluate(() => {
      const results = {
        title_candidates: [],
        company_candidates: [],
        location_candidates: [],
        description_candidates: [],
        all_classes: [],
        all_ids: [],
        item_tab_active_content: null,
        full_structure: {}
      };
      
      // 1. Chercher le titre (h1, h2, etc.)
      const headings = ['h1', 'h2', 'h3', 'h4'];
      headings.forEach(tag => {
        const els = document.querySelectorAll(tag);
        els.forEach(el => {
          if (el.textContent.trim().length > 10) {
            results.title_candidates.push({
              tag: tag,
              text: el.textContent.trim().substring(0, 100),
              class: el.className,
              id: el.id
            });
          }
        });
      });
      
      // 2. Chercher l'entreprise
      const companyKeywords = ['company', 'entreprise', 'societe', 'société'];
      companyKeywords.forEach(keyword => {
        document.querySelectorAll(`[class*="${keyword}"], [id*="${keyword}"]`).forEach(el => {
          results.company_candidates.push({
            text: el.textContent.trim().substring(0, 80),
            class: el.className,
            id: el.id
          });
        });
      });
      
      // 3. Chercher la localisation
      const locationKeywords = ['location', 'ville', 'localisation', 'lieu', 'adresse'];
      locationKeywords.forEach(keyword => {
        document.querySelectorAll(`[class*="${keyword}"], [id*="${keyword}"]`).forEach(el => {
          results.location_candidates.push({
            text: el.textContent.trim().substring(0, 80),
            class: el.className,
            id: el.id
          });
        });
      });
      
      // 4. IMPORTANT : Analyser .item_tab.active
      const activeTab = document.querySelector('.item_tab.active');
      if (activeTab) {
        results.item_tab_active_content = {
          html: activeTab.innerHTML.substring(0, 500),
          text: activeTab.textContent.trim().substring(0, 300),
          children: Array.from(activeTab.children).map(child => ({
            tag: child.tagName,
            class: child.className,
            text: child.textContent.trim().substring(0, 100)
          }))
        };
      }
      
      // 5. Chercher les descriptions possibles
      const descKeywords = ['description', 'desc', 'content', 'contenu', 'detail'];
      descKeywords.forEach(keyword => {
        document.querySelectorAll(`[class*="${keyword}"], [id*="${keyword}"]`).forEach(el => {
          if (el.textContent.trim().length > 100) {
            results.description_candidates.push({
              text: el.textContent.trim().substring(0, 150),
              class: el.className,
              id: el.id,
              tag: el.tagName
            });
          }
        });
      });
      
      // 6. Lister toutes les classes CSS présentes
      const allElements = document.querySelectorAll('[class]');
      allElements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          el.className.split(' ').forEach(cls => {
            if (cls && !results.all_classes.includes(cls)) {
              results.all_classes.push(cls);
            }
          });
        }
      });
      
      // 7. Lister tous les IDs
      document.querySelectorAll('[id]').forEach(el => {
        if (el.id && !results.all_ids.includes(el.id)) {
          results.all_ids.push(el.id);
        }
      });
      
      // 8. Structure globale de la page
      results.full_structure = {
        body_classes: document.body.className,
        main_container: document.querySelector('main, .main, .container, .content')?.className || 'non trouvé',
        nav_tabs: Array.from(document.querySelectorAll('[class*="tab"], [class*="onglet"]')).map(el => ({
          class: el.className,
          text: el.textContent.trim().substring(0, 50)
        }))
      };
      
      return results;
    });
    
    // Afficher les résultats
    console.log('📋 ========== RÉSULTATS DE L\'ANALYSE ==========\n');
    
    console.log('🏆 TITRES POSSIBLES:');
    analysis.title_candidates.forEach((candidate, i) => {
      console.log(`  ${i + 1}. <${candidate.tag}> "${candidate.text}"`);
      console.log(`     Class: ${candidate.class || 'aucune'}`);
      console.log(`     ID: ${candidate.id || 'aucun'}\n`);
    });
    
    console.log('\n🏢 ENTREPRISES POSSIBLES:');
    analysis.company_candidates.slice(0, 5).forEach((candidate, i) => {
      console.log(`  ${i + 1}. "${candidate.text}"`);
      console.log(`     Class: ${candidate.class || 'aucune'}\n`);
    });
    
    console.log('\n📍 LOCALISATIONS POSSIBLES:');
    analysis.location_candidates.slice(0, 5).forEach((candidate, i) => {
      console.log(`  ${i + 1}. "${candidate.text}"`);
      console.log(`     Class: ${candidate.class || 'aucune'}\n`);
    });
    
    console.log('\n📄 CONTENU DE .item_tab.active:');
    if (analysis.item_tab_active_content) {
      console.log('  Texte:', analysis.item_tab_active_content.text);
      console.log('\n  Enfants directs:');
      analysis.item_tab_active_content.children.forEach((child, i) => {
        console.log(`    ${i + 1}. <${child.tag}> class="${child.class}"`);
        console.log(`       "${child.text}"\n`);
      });
    } else {
      console.log('  ❌ Élément .item_tab.active non trouvé !');
    }
    
    console.log('\n📝 DESCRIPTIONS POSSIBLES:');
    analysis.description_candidates.slice(0, 3).forEach((candidate, i) => {
      console.log(`  ${i + 1}. <${candidate.tag}> class="${candidate.class}"`);
      console.log(`     "${candidate.text}"...\n`);
    });
    
    console.log('\n🎨 CLASSES CSS PRÉSENTES (50 premières):');
    console.log(analysis.all_classes.slice(0, 50).join(', '));
    
    console.log('\n\n🆔 IDs PRÉSENTS:');
    console.log(analysis.all_ids.join(', '));
    
    console.log('\n\n🏗️ STRUCTURE GLOBALE:');
    console.log(JSON.stringify(analysis.full_structure, null, 2));
    
    // Sauvegarder dans un fichier
    const fs = await import('fs');
    fs.writeFileSync('analysis.json', JSON.stringify(analysis, null, 2));
    console.log('\n💾 Analyse complète sauvegardée dans analysis.json');
    
    // Prendre un screenshot
    await page.screenshot({ path: 'portaljob-page.png', fullPage: true });
    console.log('📸 Screenshot sauvegardé: portaljob-page.png');
    
    console.log('\n✅ ANALYSE TERMINÉE !');
    console.log('\n📌 Regardez analysis.json et portaljob-page.png pour identifier les bons sélecteurs');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    // NE PAS FERMER pour que vous puissiez inspecter
    console.log('\n⏸️  Navigateur laissé ouvert pour inspection manuelle');
    console.log('💡 Appuyez sur Ctrl+C quand vous avez fini');
  }
};

findSelectors();