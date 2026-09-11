const { Client, Databases, Query } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION APPWRITE =====
const client = new Client();
client
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://appwrite.dat-articles.com/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID || 'job2mada');

const databases = new Databases(client);
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID || 'job2mada-db';

// ===== FONCTION PRINCIPALE =====
async function generateAllSitemaps() {
  console.log('🚀 Génération des sitemaps Job2mada...\n');

  try {
    // 1. RÉCUPÉRER TOUTES LES OFFRES ACTIVES
    console.log('📊 Connexion à Appwrite...');
    const response = await databases.listDocuments(
      DATABASE_ID,
      'jobs',
      [
        Query.equal('is_active', true),
        Query.orderDesc('$createdAt'),
        Query.limit(2000)
      ]
    );

    const jobs = response.documents;
    console.log(`✅ ${jobs.length} offres actives récupérées\n`);

    if (jobs.length === 0) {
      console.warn('⚠️  Aucune offre active trouvée !');
      return;
    }

    // 2. AFFICHER UN ÉCHANTILLON DES DONNÉES
    console.log('📋 Échantillon des offres récupérées:\n');
    jobs.slice(0, 5).forEach((job, i) => {
      console.log(`${i + 1}. ID: ${job.$id}`);
      console.log(`   Titre: ${job.title}`);
      console.log(`   Entreprise: ${job.company_name}`);
      console.log(`   Localisation: ${job.location}`);
      console.log(`   Date: ${new Date(job.$createdAt).toLocaleDateString('fr-FR')}`);
      console.log('');
    });

    // 3. DÉTERMINER LE CHEMIN PUBLIC
    // Puisque le script est à la racine, __dirname = racine du projet
    const projectRoot = __dirname;
    const publicPath = path.join(projectRoot, 'public');
    
    console.log('🔍 DEBUG - Chemins:');
    console.log(`   __dirname (racine projet): ${__dirname}`);
    console.log(`   publicPath: ${publicPath}`);
    console.log('');

    // Créer le dossier public s'il n'existe pas
    if (!fs.existsSync(publicPath)) {
      fs.mkdirSync(publicPath, { recursive: true });
      console.log('📁 Dossier public/ créé à:', publicPath);
    } else {
      console.log('✅ Dossier public/ existe déjà à:', publicPath);
    }

    // 4. GÉNÉRER LE SITEMAP DES OFFRES
    console.log('\n📝 Génération du sitemap-jobs.xml...');
    let jobsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

    jobs.forEach(job => {
      const lastmod = new Date(job.$updatedAt || job.$createdAt)
        .toISOString()
        .split('T')[0];
      
      const priority = job.is_featured ? '0.9' : job.is_urgent ? '0.85' : '0.8';

      jobsSitemap += `  <url>
    <loc>https://job2mada.com/jobs/${job.$id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
    });

    jobsSitemap += `</urlset>`;

    // 5. SAUVEGARDER LE FICHIER
    const sitemapJobsPath = path.join(publicPath, 'sitemap-jobs.xml');
    fs.writeFileSync(sitemapJobsPath, jobsSitemap, 'utf-8');
    console.log(`✅ sitemap-jobs.xml créé à:`);
    console.log(`   ${sitemapJobsPath}`);
    console.log(`   Taille: ${(jobsSitemap.length / 1024).toFixed(2)} KB`);

    // 6. CRÉER/METTRE À JOUR LE SITEMAP PRINCIPAL
    console.log('\n📝 Mise à jour du sitemap.xml principal...');
    const mainSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://job2mada.com/sitemap-main.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://job2mada.com/sitemap-jobs.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://job2mada.com/sitemap-services.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

    const sitemapIndexPath = path.join(publicPath, 'sitemap.xml');
    fs.writeFileSync(sitemapIndexPath, mainSitemap, 'utf-8');
    console.log(`✅ sitemap.xml (index) créé à:`);
    console.log(`   ${sitemapIndexPath}`);

    // 7. GÉNÉRER LA LISTE DES URLs POUR INDEXATION MANUELLE
    console.log('\n📝 Génération du fichier urls-to-index.txt...');
    const urlsList = jobs
      .sort((a, b) => {
        // Trier par priorité : featured > urgent > récent
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        if (a.is_urgent && !b.is_urgent) return -1;
        if (!a.is_urgent && b.is_urgent) return 1;
        return new Date(b.$createdAt) - new Date(a.$createdAt);
      })
      .map((job, i) => {
        const priority = job.is_featured ? '⭐ FEATURED' : job.is_urgent ? '🚨 URGENT' : '';
        return `${i + 1}. https://job2mada.com/jobs/${job.$id} ${priority}
   ${job.title} - ${job.company_name} (${job.location})`;
      })
      .join('\n\n');

    const urlsFilePath = path.join(projectRoot, 'urls-to-index.txt');
    fs.writeFileSync(urlsFilePath, urlsList, 'utf-8');
    console.log(`✅ urls-to-index.txt créé à:`);
    console.log(`   ${urlsFilePath}`);

    // 8. LISTER LES FICHIERS DANS PUBLIC/
    console.log('\n📁 Contenu du dossier public/ après génération:');
    const publicFiles = fs.readdirSync(publicPath);
    publicFiles
      .filter(file => file.startsWith('sitemap'))
      .forEach(file => {
        const filePath = path.join(publicPath, file);
        const stats = fs.statSync(filePath);
        const size = `(${(stats.size / 1024).toFixed(2)} KB)`;
        const modifiedDate = stats.mtime.toLocaleString('fr-FR');
        console.log(`   • ${file} ${size} - Modifié: ${modifiedDate}`);
      });

    // 9. RÉSUMÉ FINAL
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ TERMINÉ !');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 Statistiques:`);
    console.log(`   • ${jobs.length} offres dans le sitemap`);
    console.log(`   • ${jobs.filter(j => j.is_featured).length} offres mises en avant (⭐)`);
    console.log(`   • ${jobs.filter(j => j.is_urgent).length} offres urgentes (🚨)`);
    console.log('');
    console.log('📁 Fichiers générés dans:', publicPath);
    console.log(`   • sitemap.xml (index principal)`);
    console.log(`   • sitemap-jobs.xml (${jobs.length} offres)`);
    console.log('');
    console.log('📌 Prochaines étapes:');
    console.log('   1. Ouvre public/sitemap-jobs.xml pour vérifier');
    console.log('   2. Deploy ton site (git push)');
    console.log('   3. Vérifie: https://job2mada.com/sitemap-jobs.xml');
    console.log('   4. Soumets dans Google Search Console (Domain Property)');
    console.log('   5. Indexe les 20 URLs prioritaires (voir urls-to-index.txt)');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    if (error.code) console.error('Code:', error.code);
    if (error.type) console.error('Type:', error.type);
    console.error('\nStack:', error.stack);
    throw error;
  }
}

// ===== EXÉCUTION =====
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('         GÉNÉRATEUR DE SITEMAP JOB2MADA');
console.log('         1161 offres actives détectées');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

generateAllSitemaps()
  .then(() => {
    console.log('✅ Script terminé avec succès\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Le script a échoué\n');
    console.error(err);
    process.exit(1);
  });