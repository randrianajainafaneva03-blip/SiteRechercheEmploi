// src/scripts/importPortailJob.ts
import 'dotenv/config';
import { Client, Databases, ID } from 'node-appwrite';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!process.env.APPWRITE_API_KEY) {
  throw new Error('APPWRITE_API_KEY manquant dans .env');
}

// ⚠️ CONFIGURATION
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://appwrite.dat-articles.com/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'job2mada')
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'job2mada-db';
const JOBS_COLLECTION_ID = 'jobs';
const EMPLOYER_ID = '693a553b00363cf60e6d';
const EMAIL_CONTACT = 'ramiliarilalamiarisoa@gmail.com';

const TEST_MODE = false;
const BATCH_SIZE = TEST_MODE ? 10 : 1092;

// ============ NETTOYAGE TEXTE ============
function cleanText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\u00C0-\u00FF]/g, '')
    .trim();
}

// ============ NETTOYAGE HTML ============
function cleanHtml(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/<img[^>]*>/gi, '')
    .replace(/src="[^"]*\\n[^"]*"/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============ CONSTRUCTION DESCRIPTION ============
function buildDescription(job: any): string {
  const presentation = cleanHtml(job.presentation_entreprise || '');
  const missions = cleanHtml(job.missions_principales || '');
  const profil = cleanHtml(job.profil_recherche || '');
  const avantages = cleanHtml(job.avantages_offerts || '');
  
  let description = '';
  
  if (presentation) {
    description += `<div><h3>🏢 Présentation de l'entreprise</h3>\n${presentation}\n</div>\n\n`;
  }
  
  if (missions) {
    description += `<div><h3>🎯 Missions principales</h3>\n${missions}\n</div>\n\n`;
  }
  
  if (profil) {
    description += `<div><h3>👤 Profil recherché</h3>\n${profil}\n</div>\n\n`;
  }
  
  if (avantages) {
    description += `<div><h3>✨ Avantages</h3>\n${avantages}\n</div>\n\n`;
  }
  
  if (!description) {
    description = cleanHtml(job.description_complete || '<p>Consultez l\'annonce pour plus de détails.</p>');
  }
  
  return description;
}

// ============ EXTRACTION BENEFITS (ARRAY) ============
function extractList(html: string | undefined): string[] {
  if (!html) return [];
  
  const cleaned = cleanText(html);
  return cleaned
    .split(/[-•\n]/)
    .map(l => l.trim())
    .filter(l => l.length > 5 && l.length < 200)
    .slice(0, 10);
}

// ============ LOCATION PROPRE ============
function cleanLocation(loc: string | undefined): string {
    if (!loc) return 'Antananarivo';
    
    const clean = loc
      .replace(/Voir toutes.*$/i, '')
      .replace(/\n/g, ' ')
      .trim();
    
    return clean.length < 3 ? 'Antananarivo' : clean;
  }

// ============ CATÉGORISATION ============
function mapCategory(titre: string, missions: string): string {
  const text = `${titre} ${missions}`.toLowerCase();
  
  if (text.match(/développ|code|software|web|mobile|python|javascript|odoo|business analyst|informatique/)) 
    return 'Informatique & Technologies';
  if (text.match(/marketing|communication|digital|social media|commercial|vente/)) 
    return 'Marketing & Communication';
  if (text.match(/comptable|finance|audit|contrôle|trésor/)) 
    return 'Finance & Comptabilité';
  if (text.match(/rh|ressources humaines|recrutement|talent|paie/)) 
    return 'Ressources Humaines';
  if (text.match(/juridique|juriste|droit|avocat|légal/)) 
    return 'Juridique';
  if (text.match(/ingénieur|technique|électrique|mécanique|civil/)) 
    return 'Ingénierie';
  if (text.match(/achat|appro|supply|logistique|transport/)) 
    return 'Transport & Logistique';
  if (text.match(/secrétaire|assistant|admin|bureau/)) 
    return 'Administration';
  
  return 'Autres';
}

// ============ NIVEAU EXPÉRIENCE ============
function guessExperienceLevel(titre: string, profil: string, missions: string): string {
  const text = `${titre} ${profil} ${missions}`.toLowerCase();
  
  if (text.match(/junior|débutant|stage|sans exp[ée]rience/)) return 'entry';
  if (text.match(/senior|expert|confirm[ée]|chef|lead/)) return 'senior';
  if (text.match(/directeur|responsable|manager|head of/)) return 'executive';
  
  return 'mid';
}

// ============ TYPE CONTRAT ============
function mapContractType(type: string | undefined): string {
  if (!type) return 'cdi';
  const t = type.toLowerCase();
  if (t.includes('cdi')) return 'cdi';
  if (t.includes('cdd')) return 'cdd';
  if (t.includes('stage')) return 'stage';
  if (t.includes('freelance')) return 'freelance';
  return 'cdi';
}

// ============ EMPLOYMENT TYPE ============
function mapEmploymentType(type: string | undefined): string {
  if (!type) return 'full-time';
  const t = type.toLowerCase();
  if (t.includes('temps partiel')) return 'part-time';
  if (t.includes('freelance')) return 'freelance';
  if (t.includes('stage')) return 'internship';
  return 'full-time';
}

// ============ IMPORT PRINCIPAL ============
const importJobs = async () => {
  try {
    console.log('\n🚀 Import PortailJob → Job2Mada\n');
    
    // Chercher fichier JSON
    const possiblePaths = [
      join(process.cwd(), 'portaljob-complete-1765449079662.json'),
      join(process.cwd(), 'data', 'portaljob-complete-1765449079662.json'),
      join(__dirname, '../../portaljob-complete-1765449079662.json'),
    ];
    
    let jsonPath = '';
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        jsonPath = path;
        break;
      }
    }
    
    if (!jsonPath) {
      console.error('❌ Fichier JSON introuvable !');
      process.exit(1);
    }
    
    console.log(`📂 Fichier: ${jsonPath}\n`);
    
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const allJobs = JSON.parse(rawData);
    
    console.log(`📊 Total: ${allJobs.length} offres`);
    
    // Filtrer offres valides
    const validJobs = allJobs.filter((job: any) => 
      job.titre && job.entreprise
    );
    
    console.log(`✅ Valides: ${validJobs.length}\n`);
    
    if (TEST_MODE) {
      console.log(`⚠️  MODE TEST: ${BATCH_SIZE} offres\n`);
    }
    
    const jobsToImport = validJobs.slice(0, BATCH_SIZE);
    
    let imported = 0;
    let errors = 0;
    const errorLog: any[] = [];
    
    for (let i = 0; i < jobsToImport.length; i++) {
      const job = jobsToImport[i];
      
      try {
        const description = buildDescription(job);
        const category = mapCategory(job.titre || '', job.missions_principales || '');
        const experienceLevel = guessExperienceLevel(
          job.titre || '',
          job.profil_recherche || '',
          job.missions_principales || ''
        );
        const contractType = mapContractType(job.type_contrat);
        const employmentType = mapEmploymentType(job.type_contrat);
        const benefits = extractList(job.avantages_offerts);
        const requirements = extractList(job.profil_recherche);
        
        // Deadline 60 jours
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 60);
        
        await databases.createDocument(
            DATABASE_ID,
            JOBS_COLLECTION_ID,
            ID.unique(),
            {
              title: cleanText(job.titre),
              company_name: cleanText(job.entreprise),
              category,
              description,
              
              employment_type: employmentType,
              contract_type: contractType,
              experience_level: experienceLevel,
              
              location: cleanLocation(job.localisation), // ← STRING pas array
              remote_work: false,
              
              benefits,
              requirements,
              
              application_deadline: deadline.toISOString(),
              contact_email: job.email_contact || EMAIL_CONTACT,
              company_website: job.url || '',
              application_instructions: 'Envoyez votre CV et lettre de motivation par email.',
              
              is_featured: false,
              is_urgent: false,
              
              employer_id: EMPLOYER_ID,
            }
          );
        
        imported++;
        console.log(`✅ [${i + 1}/${jobsToImport.length}] ${cleanText(job.titre).substring(0, 60)}`);
        
        if ((i + 1) % 50 === 0) {
          console.log(`\n📊 Progression: ${i + 1}/${jobsToImport.length}\n`);
        }
        
        await new Promise(r => setTimeout(r, 500));
        
      } catch (error: any) {
        errors++;
        errorLog.push({ job: job.titre, error: error.message });
        console.error(`❌ [${i + 1}/${jobsToImport.length}] ${job.titre}: ${error.message}`);
      }
    }
    
    // Sauvegarder erreurs
    if (errors > 0) {
      fs.writeFileSync(
        join(process.cwd(), 'import-errors.json'),
        JSON.stringify(errorLog, null, 2)
      );
    }
    
    console.log('\n🎉 ========== TERMINÉ ==========');
    console.log(`✅ ${imported} offres importées`);
    console.log(`❌ ${errors} erreurs`);
    
  } catch (error) {
    console.error('💥 Erreur:', error);
    process.exit(1);
  }
};

importJobs().catch(console.error);