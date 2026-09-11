// src/scripts/fixImportedJobs.ts
import 'dotenv/config';
import { Client, Databases, Query } from 'node-appwrite';
import fs from 'fs';
import { join } from 'path';

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
const EMPLOYER_ID = '693a553b00363cf60e6d'; // ID des jobs importés

const BATCH_SIZE = 50; // Nombre de jobs par batch pour les dates
const DELAY_MS = 500; // Délai entre chaque update

// ============ NETTOYAGE REQUIREMENTS ============
function cleanRequirements(requirements: string[]): string[] {
  if (!requirements || !Array.isArray(requirements)) return [];
  
  return requirements
    .filter(req => {
      if (!req || typeof req !== 'string') return false;
      
      // Supprimer si contient des images PortalJob
      if (req.includes('<img') || req.includes('portaljob') || req.includes('src=')) {
        return false;
      }
      
      // Supprimer si contient du HTML invalide
      if (req.match(/<[^>]*$/)) {
        return false;
      }
      
      // Garder seulement si c'est du texte valide
      return req.trim().length > 5;
    })
    .map(req => {
      // Nettoyer les balises HTML restantes
      return req
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
    })
    .filter(req => req.length > 5);
}

// ============ GÉNÉRATION DATE RÉALISTE ============
function generateRealisticDate(batchIndex: number, indexInBatch: number): Date {
  const now = new Date();
  
  // Calculer le nombre de jours à soustraire
  // Batch 0 (0-49): 1-7 jours
  // Batch 1 (50-99): 8-14 jours
  // Batch 2 (100-149): 15-21 jours
  // etc.
  
  const weeksOld = batchIndex;
  const baseDay = weeksOld * 7;
  
  // Ajouter variation dans la semaine (0-6 jours)
  const dayVariation = Math.floor((indexInBatch / BATCH_SIZE) * 7);
  
  // Ajouter variation dans la journée (0-23 heures)
  const hourVariation = indexInBatch % 24;
  
  const totalDaysOld = baseDay + dayVariation;
  
  const date = new Date(now);
  date.setDate(date.getDate() - totalDaysOld);
  date.setHours(date.getHours() - hourVariation);
  
  return date;
}

// ============ CORRECTION PRINCIPALE ============
const fixJobs = async () => {
  try {
    console.log('\n🔧 Correction des jobs importés\n');
    
    // Récupérer tous les jobs de l'employeur
    console.log('📥 Récupération des jobs...');
    
    let allJobs: any[] = [];
    let offset = 0;
    const limit = 100;
    
    while (true) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        JOBS_COLLECTION_ID,
        [
          Query.equal('employer_id', EMPLOYER_ID),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );
      
      allJobs = [...allJobs, ...response.documents];
      
      console.log(`   Chargés: ${allJobs.length}/${response.total}`);
      
      if (response.documents.length < limit) break;
      offset += limit;
    }
    
    console.log(`\n✅ ${allJobs.length} jobs trouvés\n`);
    
    // Statistiques
    let datesUpdated = 0;
    let requirementsFixed = 0;
    let websitesCleared = 0;
    let errors = 0;
    const errorLog: any[] = [];
    
    // Traiter chaque job
    for (let i = 0; i < allJobs.length; i++) {
      const job = allJobs[i];
      
      try {
        const batchIndex = Math.floor(i / BATCH_SIZE);
        const indexInBatch = i % BATCH_SIZE;
        
        // Générer nouvelle date
        const newDate = generateRealisticDate(batchIndex, indexInBatch);
        
        // Nettoyer requirements
        const cleanedRequirements = cleanRequirements(job.requirements || []);
        
        // Préparer mise à jour
        const updateData: any = {
          created_at: newDate.toISOString(),
          company_website: '', // ← VIDER TOUS LES COMPANY_WEBSITE
        };
        
        // Ajouter requirements nettoyés seulement si changement
        if (JSON.stringify(cleanedRequirements) !== JSON.stringify(job.requirements || [])) {
          updateData.requirements = cleanedRequirements;
          requirementsFixed++;
        }
        
        // Compter les websites supprimés
        if (job.company_website && job.company_website.trim() !== '') {
          websitesCleared++;
        }
        
        // Mettre à jour
        await databases.updateDocument(
          DATABASE_ID,
          JOBS_COLLECTION_ID,
          job.$id,
          updateData
        );
        
        datesUpdated++;
        
        const weeksOld = Math.floor((new Date().getTime() - newDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        console.log(`✅ [${i + 1}/${allJobs.length}] ${job.title.substring(0, 50)} (il y a ${weeksOld} semaine${weeksOld > 1 ? 's' : ''})`);
        
        // Progression
        if ((i + 1) % 50 === 0) {
          console.log(`\n📊 Progression: ${i + 1}/${allJobs.length}`);
          console.log(`   Dates mises à jour: ${datesUpdated}`);
          console.log(`   Requirements nettoyés: ${requirementsFixed}`);
          console.log(`   Websites supprimés: ${websitesCleared}\n`);
        }
        
        // Délai pour éviter rate limiting
        await new Promise(r => setTimeout(r, DELAY_MS));
        
      } catch (error: any) {
        errors++;
        errorLog.push({
          id: job.$id,
          title: job.title,
          error: error.message
        });
        console.error(`❌ [${i + 1}/${allJobs.length}] ${job.title}: ${error.message}`);
      }
    }
    
    // Sauvegarder rapport d'erreurs
    if (errors > 0) {
      const errorPath = join(process.cwd(), 'fix-errors.json');
      fs.writeFileSync(errorPath, JSON.stringify(errorLog, null, 2));
      console.log(`\n📝 Erreurs sauvegardées: ${errorPath}`);
    }
    
    // Rapport final
    console.log('\n🎉 ========== TERMINÉ ==========');
    console.log(`✅ Dates mises à jour: ${datesUpdated}`);
    console.log(`🧹 Requirements nettoyés: ${requirementsFixed}`);
    console.log(`🌐 Websites supprimés: ${websitesCleared}`);
    console.log(`❌ Erreurs: ${errors}`);
    
    // Afficher distribution des dates
    console.log('\n📅 Distribution des dates:');
    const batches = Math.ceil(allJobs.length / BATCH_SIZE);
    for (let b = 0; b < Math.min(batches, 10); b++) {
      const start = b * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, allJobs.length);
      const weeksOld = b;
      console.log(`   Batch ${b + 1} (jobs ${start + 1}-${end}): il y a ${weeksOld} semaine${weeksOld !== 1 ? 's' : ''}`);
    }
    
    if (batches > 10) {
      console.log(`   ... et ${batches - 10} autres batches`);
    }
    
  } catch (error) {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  }
};

// ============ SCRIPT DE VÉRIFICATION (OPTIONNEL) ============
const verifyFix = async () => {
  try {
    console.log('\n🔍 Vérification des corrections...\n');
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      JOBS_COLLECTION_ID,
      [
        Query.equal('employer_id', EMPLOYER_ID),
        Query.limit(10)
      ]
    );
    
    console.log('📊 Échantillon de 10 jobs:');
    
    response.documents.forEach((job, i) => {
      const createdDate = new Date(job.created_at || job.$createdAt);
      const now = new Date();
      const daysOld = Math.floor((now.getTime() - createdDate.getTime()) / (24 * 60 * 60 * 1000));
      
      console.log(`\n${i + 1}. ${job.title.substring(0, 50)}`);
      console.log(`   Date: ${createdDate.toLocaleDateString('fr-FR')} (il y a ${daysOld} jours)`);
      console.log(`   Requirements: ${job.requirements?.length || 0} items`);
      console.log(`   Website: ${job.company_website || '(vide)'}`);
      
      if (job.requirements && job.requirements.length > 0) {
        const hasImages = job.requirements.some((req: string) => 
          req.includes('<img') || req.includes('portaljob')
        );
        console.log(`   ⚠️  Contient images: ${hasImages ? 'OUI' : 'NON'}`);
      }
      
      if (job.company_website && job.company_website.includes('portaljob')) {
        console.log(`   ⚠️  Website PortalJob non supprimé!`);
      }
    });
    
  } catch (error) {
    console.error('💥 Erreur vérification:', error);
  }
};

// ============ EXÉCUTION ============
const main = async () => {
  const args = process.argv.slice(2);
  
  if (args.includes('--verify')) {
    await verifyFix();
  } else {
    await fixJobs();
    console.log('\n✨ Pour vérifier les corrections, lancez:');
    console.log('   npm run fix-jobs -- --verify\n');
  }
};

main().catch(console.error);