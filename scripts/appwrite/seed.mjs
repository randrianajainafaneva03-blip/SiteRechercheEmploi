// Injecte des données de démonstration (comptes, offres, services, candidatures, messages...).
// Idempotent : les documents ont des IDs fixes et sont mis à jour s'ils existent déjà.
// Usage : npm run appwrite:seed   (après npm run appwrite:setup)
import 'dotenv/config';
import { Client, TablesDB, Users } from 'node-appwrite';

const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } = process.env;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'job2mada-db';
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  throw new Error('APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID et APPWRITE_API_KEY doivent être définis dans .env');
}

const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY);
const tables = new TablesDB(client);
const users = new Users(client);

const DEMO_PASSWORD = 'Demo@2026!';
const EMAIL_DOMAIN = 'demo.job2mada.mg';
const now = Date.now();
const daysAgo = (n) => new Date(now - n * 86400000).toISOString();
const daysAhead = (n) => new Date(now + n * 86400000).toISOString();
const avatar = (name, bg) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bg}&color=fff&size=256&bold=true`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function retry(fn) {
  for (let i = 0; i < 6; i++) {
    try { return await fn(); } catch (e) { if (e?.code === 429) { await sleep(2000 * (i + 1)); continue; } throw e; }
  }
  return fn();
}

// Upsert : crée le document, ou le met à jour s'il existe déjà.
async function upsert(collectionId, documentId, data, ownerId) {
  const permissions = ownerId ? [`read("user:${ownerId}")`, `update("user:${ownerId}")`, `delete("user:${ownerId}")`] : undefined;
  try {
    await retry(() => tables.createRow({ databaseId: DATABASE_ID, tableId: collectionId, rowId: documentId, data, permissions }));
  } catch (e) {
    if (e?.code !== 409) throw new Error(`${collectionId}/${documentId}: ${e.message}`);
    await retry(() => tables.updateRow({ databaseId: DATABASE_ID, tableId: collectionId, rowId: documentId, data }));
  }
}

async function seedAll(collectionId, rows, ownerOf) {
  for (const { $id, ...data } of rows) await upsert(collectionId, $id, data, ownerOf?.(data, $id));
  console.log(`   ✓ ${collectionId}: ${rows.length}`);
}

// ------------------------------------------------------------------ COMPTES
const employers = [
  { id: 'demo_emp_baobab', name: 'Baobab Tech', contact: 'Hery Rakoto', email: `rh@baobabtech.${EMAIL_DOMAIN}`, location: 'Antananarivo', industry: 'Informatique & Technologies', size: '50-200', phone: '+261 34 11 000 01', bg: '0d9488',
    desc: 'Studio de développement logiciel malgache, spécialisé en applications web et mobiles pour des clients en Afrique et en Europe.' },
  { id: 'demo_emp_ravinala', name: 'Ravinala Consulting', contact: 'Voahangy Andrianasolo', email: `recrutement@ravinala.${EMAIL_DOMAIN}`, location: 'Antananarivo', industry: 'Finance & Comptabilité', size: '10-50', phone: '+261 34 11 000 02', bg: '7c3aed',
    desc: "Cabinet de conseil en gestion, audit et ressources humaines accompagnant les PME et les institutions à Madagascar." },
  { id: 'demo_emp_vanille', name: 'Vanille & Co', contact: 'Tiana Razafy', email: `jobs@vanilleco.${EMAIL_DOMAIN}`, location: 'Toamasina', industry: 'Agriculture & Agroalimentaire', size: '200-500', phone: '+261 34 11 000 03', bg: 'ea580c',
    desc: "Exportateur de vanille, girofle et épices de Madagascar, engagé dans une filière durable et équitable." },
  { id: 'demo_emp_nosybe', name: 'Nosy Be Resorts', contact: 'Fanja Randria', email: `careers@nosybe-resorts.${EMAIL_DOMAIN}`, location: 'Antsiranana', industry: 'Tourisme & Hôtellerie', size: '200-500', phone: '+261 34 11 000 04', bg: '0284c7',
    desc: "Groupe hôtelier proposant des établissements de charme dans le nord de Madagascar." },
  { id: 'demo_emp_zebu', name: 'Zebu Logistics', contact: 'Mamy Rasolofo', email: `rh@zebulogistics.${EMAIL_DOMAIN}`, location: 'Mahajanga', industry: 'Transport & Logistique', size: '50-200', phone: '+261 34 11 000 05', bg: '65a30d',
    desc: "Transitaire et opérateur logistique : fret maritime, transport routier et entreposage." },
];

const candidates = [
  { id: 'demo_cand_lalaina', name: 'Lalaina Rakotoarisoa', poste: 'Développeuse Full Stack', location: 'Antananarivo', years: 4, avail: 'Immédiate', skills: ['React', 'Node.js', 'TypeScript', 'Appwrite', 'PostgreSQL'], premium: true, verified: true, bg: '0d9488',
    bio: "Développeuse full stack passionnée par les produits web à impact. J'ai livré des plateformes e-commerce et RH pour des clients malgaches et européens." },
  { id: 'demo_cand_nirina', name: 'Nirina Andriamahefa', poste: 'Comptable confirmé', location: 'Toamasina', years: 6, avail: 'Sous 1 mois', skills: ['Sage', 'Excel avancé', 'Fiscalité', 'Audit', 'Paie'], premium: false, verified: true, bg: '7c3aed',
    bio: "Comptable avec 6 ans d'expérience en cabinet et en entreprise industrielle. Rigoureux, orienté résultats." },
  { id: 'demo_cand_hasina', name: 'Hasina Rabemananjara', poste: 'Community Manager', location: 'Antananarivo', years: 3, avail: 'Immédiate', skills: ['Social media', 'Canva', 'Copywriting', 'Meta Ads', 'Photographie'], premium: false, verified: false, bg: 'db2777',
    bio: "Je fais grandir les marques locales sur les réseaux sociaux : stratégie éditoriale, création de contenu et publicité." },
  { id: 'demo_cand_tokiniaina', name: 'Tokiniaina Ratsimba', poste: 'Ingénieur civil', location: 'Fianarantsoa', years: 8, avail: 'Sous 3 mois', skills: ['AutoCAD', 'Revit', 'Gestion de chantier', 'Topographie'], premium: false, verified: true, bg: 'ca8a04',
    bio: "Ingénieur civil expérimenté en routes et bâtiments, habitué à piloter des chantiers d'envergure avec des bailleurs internationaux." },
  { id: 'demo_cand_mialy', name: 'Mialy Razanamalala', poste: 'Responsable RH', location: 'Antananarivo', years: 7, avail: 'Sous 1 mois', skills: ['Recrutement', 'Droit du travail', 'Paie', 'Formation', 'SIRH'], premium: true, verified: true, bg: '2563eb',
    bio: "Responsable RH généraliste : recrutement, développement des talents et relations sociales." },
  { id: 'demo_cand_fenitra', name: 'Fenitra Randrianarisoa', poste: 'Designer graphique & UI', location: 'Antananarivo', years: 5, avail: 'Freelance', skills: ['Figma', 'Illustrator', 'Photoshop', 'Branding', 'Motion design'], premium: false, verified: false, bg: 'e11d48',
    bio: "Designer indépendant : identité visuelle, interfaces web et mobiles, supports print." },
  { id: 'demo_cand_jean', name: 'Jean-Luc Rakotomalala', poste: 'Chauffeur-livreur / Logisticien', location: 'Mahajanga', years: 5, avail: 'Immédiate', skills: ['Permis B/C', 'Gestion de stock', 'Manutention', 'Planification'], premium: false, verified: false, bg: '15803d',
    bio: "Expérience en logistique portuaire et distribution régionale. Ponctuel et polyvalent." },
  { id: 'demo_cand_sitraka', name: 'Sitraka Ramanantsoa', poste: 'Guide touristique & réceptionniste', location: 'Antsiranana', years: 2, avail: 'Immédiate', skills: ['Français', 'Anglais', 'Italien', 'Accueil', 'Réservations'], premium: false, verified: true, bg: '0891b2',
    bio: "Trilingue, passionné par l'accueil et la découverte du nord de Madagascar." },
];

candidates.forEach((c) => { c.email = `${c.id.replace('demo_cand_', '')}@${EMAIL_DOMAIN}`; });
const admin = { id: 'demo_admin', name: 'Admin Job2Mada', email: `admin@${EMAIL_DOMAIN}` };

async function seedUsers() {
  const accounts = [
    ...employers.map((e) => ({ id: e.id, name: e.contact, email: e.email, label: 'employer' })),
    ...candidates.map((c) => ({ id: c.id, name: c.name, email: c.email, label: 'candidate' })),
    { id: admin.id, name: admin.name, email: admin.email, label: 'admin' },
  ];
  for (const a of accounts) {
    try {
      await retry(() => users.create({ userId: a.id, email: a.email, password: DEMO_PASSWORD, name: a.name }));
    } catch (e) {
      if (e?.code !== 409) throw new Error(`user ${a.id}: ${e.message}`);
      await retry(() => users.updatePassword({ userId: a.id, password: DEMO_PASSWORD }));
    }
    await retry(() => users.updateEmailVerification({ userId: a.id, emailVerification: true }));
    await retry(() => users.updateLabels({ userId: a.id, labels: [a.label] }));
  }
  console.log(`   ✓ comptes Auth: ${accounts.length}`);
}

function profileDocs() {
  const emp = employers.map((e) => ({
    $id: e.id, full_name: e.contact, email: e.email, user_type: 'employer', is_active: true, phone: e.phone, location: e.location,
    company_name: e.name, company_category: e.industry, industry: e.industry, company_size: e.size, company_description: e.desc,
    website: `https://www.${e.name.toLowerCase().replace(/[^a-z]/g, '')}.mg`, avatar_url: avatar(e.name, e.bg), company_logo_url: avatar(e.name, e.bg),
    is_premium: e.id === 'demo_emp_baobab', premium_type: e.id === 'demo_emp_baobab' ? 'employer_pro' : null,
    verification_status: 'verified', is_verified: true, onboarding_completed: true, created_at: daysAgo(90), updated_at: daysAgo(2),
  }));
  const cand = candidates.map((c, i) => ({
    $id: c.id, full_name: c.name, email: c.email, user_type: 'candidate', is_active: true, phone: `+261 32 22 000 0${i + 1}`,
    location: c.location, bio: c.bio, skills: c.skills, experience_years: c.years, poste: c.poste, disponibilite: c.avail,
    linkedin_url: 'https://www.linkedin.com/in/demo', avatar_url: avatar(c.name, c.bg), profile_picture: avatar(c.name, c.bg),
    is_premium: c.premium, premium_type: c.premium ? 'candidate_premium' : null,
    verification_status: c.verified ? 'verified' : 'unverified', is_verified: c.verified, onboarding_completed: true,
    created_at: daysAgo(60 - i * 5), updated_at: daysAgo(1),
  }));
  const adm = [{
    $id: admin.id, full_name: admin.name, email: admin.email, user_type: 'admin', is_active: true, verification_status: 'verified',
    is_verified: true, onboarding_completed: true, created_at: daysAgo(120), updated_at: daysAgo(1),
  }];
  return [...emp, ...cand, ...adm];
}

// ------------------------------------------------------------------ CATÉGORIES
const categoryDefs = [
  ['Informatique & Technologies', '💻'], ['Marketing & Communication', '📣'], ['Finance & Comptabilité', '📊'],
  ['Ressources Humaines', '👥'], ['Juridique', '⚖️'], ['Ingénierie', '🏗️'], ['Transport & Logistique', '🚚'],
  ['Administration', '🗂️'], ['Santé', '🩺'], ['Éducation & Formation', '🎓'], ['Tourisme & Hôtellerie', '🏨'],
  ['Commerce & Vente', '🛍️'], ['Agriculture & Agroalimentaire', '🌾'], ['Autres', '✨'],
];
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const categoryDocs = () => categoryDefs.map(([name, icon]) => ({
  $id: slug(name).slice(0, 36), name, slug: slug(name), icon, description: `Offres d'emploi ${name.toLowerCase()} à Madagascar`, is_active: true,
  created_at: daysAgo(120), updated_at: daysAgo(120),
}));

// ------------------------------------------------------------------ OFFRES
const li = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
const jobDescription = (j) => `<div><h3>🏢 Présentation de l'entreprise</h3><p>${j.about}</p></div>
<div><h3>🎯 Missions principales</h3>${li(j.missions)}</div>
<div><h3>👤 Profil recherché</h3>${li(j.requirements)}</div>
<div><h3>🎁 Avantages</h3>${li(j.benefits)}</div>`;

// [emp, title, category, employment, contract, level, location, remote, sal_min, sal_max, featured, urgent, ageDays, missions, requirements, benefits]
const jobRows = [
  ['baobab', 'Développeur Full Stack React / Node.js', 'Informatique & Technologies', 'full-time', 'cdi', 'mid', 'Antananarivo', true, 2500000, 4000000, true, false, 1,
    ['Concevoir et développer des fonctionnalités web de bout en bout', 'Participer aux revues de code et à l\'amélioration continue', 'Collaborer avec les équipes produit et design'],
    ['3 ans minimum en React et Node.js', 'TypeScript, REST, bases de données SQL/NoSQL', 'Anglais technique'], ['Télétravail 2 jours/semaine', 'Mutuelle santé', 'Formation continue']],
  ['baobab', 'UI/UX Designer', 'Informatique & Technologies', 'full-time', 'cdi', 'mid', 'Antananarivo', true, 1800000, 3000000, false, false, 3,
    ['Concevoir des maquettes et prototypes Figma', 'Maintenir le design system', 'Mener des tests utilisateurs'],
    ['Portfolio solide', 'Maîtrise de Figma', '2 ans d\'expérience'], ['Matériel fourni', 'Ambiance startup']],
  ['baobab', 'Stagiaire Développeur Mobile Flutter', 'Informatique & Technologies', 'internship', 'stage', 'entry', 'Antananarivo', false, 400000, 600000, false, false, 6,
    ['Développer des écrans mobiles sous Flutter', 'Corriger des bugs et écrire des tests'], ['Étudiant en informatique (Bac+3/+5)', 'Bases de Dart/Flutter'], ['Encadrement par un senior', 'Possibilité d\'embauche']],
  ['baobab', 'DevOps Engineer', 'Informatique & Technologies', 'full-time', 'cdi', 'senior', 'Antananarivo', true, 4000000, 6500000, true, true, 2,
    ['Automatiser les déploiements CI/CD', 'Superviser l\'infrastructure cloud', 'Garantir la sécurité et la disponibilité'], ['5 ans d\'expérience DevOps', 'Docker, Kubernetes, Terraform', 'Linux avancé'], ['Salaire attractif', 'Télétravail complet possible']],
  ['ravinala', 'Comptable Senior', 'Finance & Comptabilité', 'full-time', 'cdi', 'senior', 'Antananarivo', false, 2000000, 3200000, true, false, 2,
    ['Tenir la comptabilité générale et analytique', 'Établir les états financiers et déclarations fiscales', 'Superviser un assistant comptable'], ['Bac+4 en comptabilité', '5 ans d\'expérience', 'Maîtrise de Sage et Excel'], ['13e mois', 'Assurance santé']],
  ['ravinala', 'Auditeur Junior', 'Finance & Comptabilité', 'full-time', 'cdd', 'entry', 'Antananarivo', false, 1200000, 1800000, false, false, 5,
    ['Participer aux missions d\'audit légal et contractuel', 'Rédiger des rapports de synthèse'], ['Bac+3/+5 en audit ou finance', 'Rigueur et esprit d\'analyse'], ['Formation aux normes IFRS', 'Évolution rapide']],
  ['ravinala', 'Responsable Recrutement', 'Ressources Humaines', 'full-time', 'cdi', 'senior', 'Antananarivo', false, 2500000, 3800000, false, true, 4,
    ['Piloter le sourcing et les entretiens', 'Développer la marque employeur', 'Suivre les indicateurs de recrutement'], ['5 ans en recrutement', 'Excellente communication', 'Maîtrise d\'un ATS'], ['Voiture de fonction', 'Primes sur objectifs']],
  ['ravinala', 'Juriste d\'entreprise', 'Juridique', 'full-time', 'cdi', 'mid', 'Antananarivo', false, 2200000, 3400000, false, false, 9,
    ['Rédiger et relire les contrats commerciaux', 'Assurer la veille juridique', 'Conseiller les équipes internes'], ['Master en droit des affaires', '3 ans d\'expérience'], ['Environnement international']],
  ['vanille', 'Responsable Qualité Agroalimentaire', 'Agriculture & Agroalimentaire', 'full-time', 'cdi', 'senior', 'Toamasina', false, 2800000, 4200000, true, false, 3,
    ['Piloter le système qualité (HACCP, ISO 22000)', 'Auditer les fournisseurs et coopératives', 'Former les équipes de production'], ['Ingénieur agroalimentaire', '5 ans en industrie', 'Anglais courant'], ['Logement de fonction', 'Assurance famille']],
  ['vanille', 'Technicien Agricole', 'Agriculture & Agroalimentaire', 'full-time', 'cdd', 'mid', 'Sambava', false, 900000, 1400000, false, false, 7,
    ['Accompagner les planteurs de vanille', 'Collecter et contrôler les données de traçabilité'], ['Diplôme agricole', 'Permis moto', 'Aisance en zone rurale'], ['Moto de service', 'Primes de déplacement']],
  ['vanille', 'Commercial Export', 'Commerce & Vente', 'full-time', 'cdi', 'mid', 'Toamasina', true, 1800000, 3000000, false, false, 8,
    ['Développer le portefeuille clients à l\'international', 'Négocier les contrats et suivre les expéditions'], ['3 ans en vente export', 'Anglais et français courants', 'Sens du service'], ['Commissions', 'Voyages professionnels']],
  ['vanille', 'Chef de projet Supply Chain', 'Transport & Logistique', 'full-time', 'cdi', 'senior', 'Toamasina', false, 3000000, 4500000, false, false, 10,
    ['Optimiser la chaîne logistique de la récolte à l\'export', 'Coordonner transitaires et transporteurs'], ['Ingénieur logistique', '5 ans d\'expérience', 'Bonne maîtrise d\'Excel/ERP'], ['Package attractif']],
  ['nosybe', 'Réceptionniste bilingue', 'Tourisme & Hôtellerie', 'full-time', 'cdi', 'entry', 'Antsiranana', false, 800000, 1200000, false, true, 1,
    ['Accueillir et enregistrer les clients', 'Gérer les réservations et les demandes', 'Renseigner sur les activités locales'], ['Français et anglais courants', 'Sens de l\'accueil', 'Première expérience appréciée'], ['Repas fournis', 'Pourboires partagés']],
  ['nosybe', 'Chef de cuisine', 'Tourisme & Hôtellerie', 'full-time', 'cdi', 'senior', 'Antsiranana', false, 2500000, 3800000, true, false, 4,
    ['Concevoir les menus avec produits locaux', 'Encadrer une brigade de 10 personnes', 'Garantir les normes d\'hygiène'], ['8 ans en restauration', 'Expérience en hôtel 4*', 'Créativité'], ['Logement sur site', 'Primes saisonnières']],
  ['nosybe', 'Community Manager saisonnier', 'Marketing & Communication', 'part-time', 'cdd', 'mid', 'Antsiranana', true, 700000, 1100000, false, false, 6,
    ['Animer les réseaux sociaux des hôtels', 'Produire photos et vidéos', 'Suivre l\'e-réputation'], ['2 ans en community management', 'Sens visuel', 'Anglais correct'], ['Missions flexibles']],
  ['nosybe', 'Guide touristique', 'Tourisme & Hôtellerie', 'freelance', 'freelance', 'entry', 'Antsiranana', false, 600000, 1000000, false, false, 12,
    ['Guider des groupes sur les sites naturels', 'Assurer la sécurité des visiteurs'], ['Carte de guide', 'Français + anglais (italien un plus)'], ['Missions à la carte']],
  ['zebu', 'Responsable Logistique Portuaire', 'Transport & Logistique', 'full-time', 'cdi', 'senior', 'Mahajanga', false, 2600000, 4000000, false, false, 5,
    ['Superviser les opérations d\'import/export au port', 'Gérer les relations douanes et armateurs', 'Piloter l\'équipe d\'exploitation'], ['5 ans en transit/logistique', 'Connaissance des procédures douanières'], ['Prime de résultat', 'Assurance santé']],
  ['zebu', 'Chauffeur poids lourd', 'Transport & Logistique', 'full-time', 'cdi', 'mid', 'Mahajanga', false, 900000, 1300000, false, true, 2,
    ['Transporter des marchandises entre Mahajanga et Antananarivo', 'Contrôler le véhicule et les chargements'], ['Permis C/EC', '3 ans minimum', 'Casier judiciaire vierge'], ['Primes kilométriques']],
  ['zebu', 'Assistant(e) administratif(ve)', 'Administration', 'full-time', 'cdd', 'entry', 'Mahajanga', false, 700000, 1000000, false, false, 11,
    ['Gérer le courrier, les factures et le classement', 'Assurer l\'accueil téléphonique'], ['Bac+2 en secrétariat/gestion', 'Maîtrise de Word/Excel'], ['Horaires de bureau']],
  ['zebu', 'Ingénieur Maintenance', 'Ingénierie', 'full-time', 'cdi', 'mid', 'Mahajanga', false, 2000000, 3200000, false, false, 13,
    ['Planifier la maintenance préventive de la flotte', 'Suivre les coûts et les pièces détachées'], ['Ingénieur mécanique/électromécanique', '3 ans d\'expérience'], ['Formation constructeur']],
  ['baobab', 'Chargé de Marketing Digital', 'Marketing & Communication', 'full-time', 'cdi', 'mid', 'Antananarivo', true, 1800000, 2800000, false, false, 15,
    ['Piloter les campagnes SEA/SEO et emailing', 'Analyser les performances et rendre compte'], ['3 ans en marketing digital', 'Google Ads, Meta Ads, GA4'], ['Télétravail partiel']],
  ['ravinala', 'Consultant Formation & Développement', 'Éducation & Formation', 'contract', 'mission', 'mid', 'Dans tout Madagascar', true, 1500000, 2500000, false, false, 14,
    ['Concevoir et animer des formations en entreprise', 'Évaluer l\'impact des programmes'], ['Expérience en ingénierie pédagogique', 'Excellent sens de l\'animation'], ['Missions à distance ou sur site']],
  ['vanille', 'Infirmier(ère) d\'entreprise', 'Santé', 'full-time', 'cdi', 'mid', 'Toamasina', false, 1300000, 1900000, false, false, 16,
    ['Assurer les soins de première urgence', 'Suivre la santé au travail du personnel'], ['Diplôme d\'État d\'infirmier', '2 ans d\'expérience'], ['Poste stable', 'Formation continue']],
];

const empKey = { baobab: 'demo_emp_baobab', ravinala: 'demo_emp_ravinala', vanille: 'demo_emp_vanille', nosybe: 'demo_emp_nosybe', zebu: 'demo_emp_zebu' };
const jobId = (i) => `demo_job_${String(i + 1).padStart(2, '0')}`;

function jobDocs() {
  return jobRows.map((r, i) => {
    const [emp, title, category, employment_type, contract_type, experience_level, location, remote_work, salary_min, salary_max, is_featured, is_urgent, age, missions, requirements, benefits] = r;
    const e = employers.find((x) => x.id === empKey[emp]);
    return {
      $id: jobId(i), title, company_name: e.name, category,
      description: jobDescription({ about: e.desc, missions, requirements, benefits }),
      employment_type, contract_type, experience_level, location, remote_work, benefits, requirements,
      application_deadline: daysAhead(45 - age), contact_email: e.email, company_website: `https://www.${e.name.toLowerCase().replace(/[^a-z]/g, '')}.mg`,
      application_instructions: 'Envoyez votre CV et une lettre de motivation via la plateforme Job2Mada.',
      salary_min, salary_max, salary_currency: 'MGA',
      is_featured, is_urgent, is_draft: false, is_active: true, moderation_status: 'approved',
      views_count: 40 + ((i * 37) % 260), linkedin_auto_posted: false, employer_id: e.id,
      created_at: daysAgo(age), updated_at: daysAgo(age),
    };
  });
}

// ------------------------------------------------------------------ SERVICES
const serviceRows = [
  ['demo_cand_lalaina', 'Création de site web vitrine & e-commerce', 'Développement Web', '500000-1000000', '2 semaines', ['React', 'Node.js', 'SEO'], "Je conçois votre site sur mesure : rapide, responsive et optimisé pour Google. Livraison avec formation à l'utilisation.", 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
  ['demo_cand_lalaina', 'Application web sur mesure (MVP)', 'Développement Web', '1000000+', '1 mois', ['TypeScript', 'Appwrite', 'API'], 'De l\'idée au MVP : je développe votre application web avec un back-end sécurisé et évolutif.', null],
  ['demo_cand_fenitra', 'Identité visuelle complète (logo + charte)', 'Design Graphique', '100000-500000', '1 semaine', ['Logo', 'Branding', 'Illustrator'], 'Logo, palette, typographies et déclinaisons pour donner une image professionnelle à votre entreprise.', null],
  ['demo_cand_fenitra', 'Maquettes UI/UX Figma pour app mobile', 'Design Graphique', '500000-1000000', '2 semaines', ['Figma', 'UX', 'Prototype'], 'Parcours utilisateur, wireframes et maquettes haute fidélité prêtes pour le développement.', null],
  ['demo_cand_hasina', 'Gestion de vos réseaux sociaux (1 mois)', 'Marketing Digital', '100000-500000', '1 mois', ['Community management', 'Canva', 'Meta Ads'], 'Calendrier éditorial, création de visuels, publication et reporting mensuel pour Facebook, Instagram et TikTok.', null],
  ['demo_cand_nirina', 'Tenue de comptabilité & déclarations fiscales', 'Comptabilité', '100000-500000', '1 mois', ['Sage', 'Fiscalité', 'Paie'], 'Comptabilité externalisée pour TPE/PME : saisie, bilans, déclarations et conseils.', null],
  ['demo_cand_sitraka', 'Traduction français / anglais / italien', 'Traduction', '0-100000', '3 jours', ['Traduction', 'Relecture', 'Sous-titrage'], 'Traductions professionnelles de documents, sites web et supports touristiques.', null],
  ['demo_cand_mialy', 'Audit RH & accompagnement au recrutement', 'Conseil', '500000-1000000', '2 semaines', ['RH', 'Recrutement', 'Formation'], 'Diagnostic de votre organisation RH, structuration des process de recrutement et coaching des managers.', null],
];

const serviceDocs = () => serviceRows.map(([creator, title, category, price_range, delivery_time, skills, description, youtube_url], i) => ({
  $id: `demo_svc_${String(i + 1).padStart(2, '0')}`, title, description, category, price_range, delivery_time, skills,
  creator_id: creator, youtube_url, video_description: youtube_url ? 'Présentation de mes réalisations' : null, portfolio: [],
  is_active: true, is_approved: true, approval_status: 'approved', views_count: 25 + i * 17,
  created_at: daysAgo(30 - i * 3), updated_at: daysAgo(30 - i * 3),
}));

// ------------------------------------------------------------------ ACTIVITÉ
const applicationRows = [
  ['demo_cand_lalaina', 1, 'accepted', 'Bonjour, ma pratique de React/Node.js et de plateformes SaaS correspond exactement à vos besoins.'],
  ['demo_cand_lalaina', 4, 'reviewing', 'Je serais ravie de contribuer à votre infrastructure grâce à mon expérience CI/CD.'],
  ['demo_cand_nirina', 5, 'pending', 'Comptable confirmé, je maîtrise Sage et les déclarations fiscales locales.'],
  ['demo_cand_nirina', 6, 'rejected', "Intéressé par une évolution vers l'audit, je souhaite rejoindre votre cabinet."],
  ['demo_cand_hasina', 15, 'pending', 'Passionnée par le tourisme, je peux dynamiser vos réseaux sociaux dès la saison.'],
  ['demo_cand_mialy', 7, 'reviewing', "Mon expérience de 7 ans en RH me permettra de structurer votre recrutement."],
  ['demo_cand_fenitra', 2, 'pending', 'Portfolio disponible sur demande : identité visuelle, UI web et mobile.'],
  ['demo_cand_sitraka', 13, 'reviewing', 'Trilingue avec expérience d\'accueil, je suis disponible immédiatement.'],
  ['demo_cand_jean', 18, 'pending', 'Permis C, expérience du trajet Mahajanga–Antananarivo.'],
  ['demo_cand_tokiniaina', 19, 'pending', 'Ingénieur civil, je peux évoluer vers la maintenance et le suivi de flotte.'],
];
const applicationDocs = () => applicationRows.map(([cand, jobNum, status, letter], i) => ({
  $id: `demo_app_${String(i + 1).padStart(2, '0')}`, job_id: jobId(jobNum - 1), candidate_id: cand, cover_letter: letter,
  cv_url: null, additional_documents: [], status, applied_at: daysAgo(10 - i), created_at: daysAgo(10 - i), updated_at: daysAgo(Math.max(0, 8 - i)),
}));

const savedJobDocs = () => [
  ['demo_cand_lalaina', 4], ['demo_cand_lalaina', 20], ['demo_cand_nirina', 12], ['demo_cand_hasina', 2], ['demo_cand_mialy', 7], ['demo_cand_sitraka', 14],
].map(([c, n], i) => ({ $id: `demo_sj_${i + 1}`, candidate_id: c, job_id: jobId(n - 1), created_at: daysAgo(5 - (i % 4)) }));

const savedServiceDocs = () => [
  ['demo_emp_baobab', 'demo_svc_03'], ['demo_emp_baobab', 'demo_svc_05'], ['demo_emp_nosybe', 'demo_svc_05'], ['demo_emp_vanille', 'demo_svc_07'],
].map(([e, s], i) => ({ $id: `demo_ss_${i + 1}`, employer_id: e, service_id: s, created_at: daysAgo(4 - i) }));

function conversationsAndMessages() {
  const nameOf = (id) => employers.find((e) => e.id === id)?.contact ?? candidates.find((c) => c.id === id)?.name;
  const typeOf = (id) => (id.startsWith('demo_emp') ? 'employer' : 'candidate');
  const avatarOf = (id) => (profileDocs().find((p) => p.$id === id) || {}).avatar_url ?? '';
  const threads = [
    ['demo_emp_baobab', 'demo_cand_lalaina', 'Développeur Full Stack React / Node.js', [
      ['demo_emp_baobab', "Bonjour Lalaina, votre profil nous intéresse beaucoup. Seriez-vous disponible pour un entretien jeudi ?", 4],
      ['demo_cand_lalaina', 'Bonjour ! Avec plaisir, jeudi à 10h me convient parfaitement.', 4],
      ['demo_emp_baobab', 'Parfait, je vous envoie le lien de la visio dans la journée.', 3],
    ]],
    ['demo_emp_ravinala', 'demo_cand_mialy', 'Responsable Recrutement', [
      ['demo_cand_mialy', "Bonjour, j'ai postulé au poste de Responsable Recrutement. Puis-je avoir des précisions sur l'équipe ?", 5],
      ['demo_emp_ravinala', "Bonjour Mialy, l'équipe compte 3 personnes. Nous reviendrons vers vous d'ici la fin de semaine.", 4],
    ]],
    ['demo_emp_nosybe', 'demo_cand_sitraka', 'Réceptionniste bilingue', [
      ['demo_emp_nosybe', 'Bonjour Sitraka, pouvez-vous commencer début du mois prochain ?', 2],
    ]],
  ];
  const convs = [];
  const msgs = [];
  threads.forEach(([a, b, subject, list], t) => {
    const convId = `demo_conv_${t + 1}`;
    const [p1, p2] = [a, b];
    const last = list[list.length - 1];
    convs.push({
      $id: convId, conversation_key: [p1, p2].sort().join('_'),
      participant1_id: p1, participant1_name: nameOf(p1), participant1_avatar: avatarOf(p1), participant1_type: typeOf(p1),
      participant2_id: p2, participant2_name: nameOf(p2), participant2_avatar: avatarOf(p2), participant2_type: typeOf(p2),
      last_message_id: `demo_msg_${t + 1}_${list.length}`, last_message_date: daysAgo(last[2]), created_at: daysAgo(list[0][2]), updated_at: daysAgo(last[2]),
    });
    list.forEach(([sender, content, age], m) => {
      msgs.push({
        $id: `demo_msg_${t + 1}_${m + 1}`, conversation_id: convId, sender_id: sender, receiver_id: sender === p1 ? p2 : p1,
        subject, content, message_type: 'direct_message', is_premium: sender === 'demo_emp_baobab', status: 'sent',
        is_read: m < list.length - 1, created_at: daysAgo(age), updated_at: daysAgo(age),
      });
    });
  });
  return { convs, msgs };
}

const subscriptionDocs = () => [
  { $id: 'demo_sub_lalaina', user_id: 'demo_cand_lalaina', user_type: 'candidate', subscription_type: 'candidate_premium', plan_name: 'Candidat Premium', billing_period: 'monthly', amount_mga: 25000, amount: 25000, status: 'active', payment_method: 'stripe', transaction_id: 'demo_txn_001', start_date: daysAgo(10), end_date: daysAhead(20), activated_by: 'stripe_auto', activated_by_name: 'Stripe (Automatique)', auto_renew: false, created_at: daysAgo(10), updated_at: daysAgo(10) },
  { $id: 'demo_sub_mialy', user_id: 'demo_cand_mialy', user_type: 'candidate', subscription_type: 'candidate_premium', plan_name: 'Candidat Premium', billing_period: 'annual', amount_mga: 250000, amount: 250000, status: 'active', payment_method: 'mvola', transaction_id: 'demo_txn_002', start_date: daysAgo(60), end_date: daysAhead(305), activated_by: 'admin', activated_by_name: 'Admin Job2Mada', auto_renew: false, created_at: daysAgo(60), updated_at: daysAgo(60) },
  { $id: 'demo_sub_baobab', user_id: 'demo_emp_baobab', user_type: 'employer', subscription_type: 'employer_pro', plan_name: 'Recruteur Pro', billing_period: 'monthly', amount_mga: 150000, amount: 150000, status: 'active', payment_method: 'orange_money', transaction_id: 'demo_txn_003', start_date: daysAgo(5), end_date: daysAhead(25), activated_by: 'admin', activated_by_name: 'Admin Job2Mada', auto_renew: false, created_at: daysAgo(5), updated_at: daysAgo(5) },
];
const quotaDocs = () => [
  { $id: 'demo_quota_lalaina', subscription_id: 'demo_sub_lalaina', user_id: 'demo_cand_lalaina', user_type: 'candidate', reset_date: daysAhead(20), messages_quota: 15, messages_used: 1, featured_jobs_quota: 0, featured_jobs_used: 0, featured_days: 0, created_at: daysAgo(10), updated_at: daysAgo(4) },
  { $id: 'demo_quota_mialy', subscription_id: 'demo_sub_mialy', user_id: 'demo_cand_mialy', user_type: 'candidate', reset_date: daysAhead(20), messages_quota: 30, messages_used: 1, featured_jobs_quota: 0, featured_jobs_used: 0, featured_days: 0, created_at: daysAgo(60), updated_at: daysAgo(5) },
  { $id: 'demo_quota_baobab', subscription_id: 'demo_sub_baobab', user_id: 'demo_emp_baobab', user_type: 'employer', reset_date: daysAhead(25), messages_quota: 50, messages_used: 1, featured_jobs_quota: 10, featured_jobs_used: 2, featured_days: 7, created_at: daysAgo(5), updated_at: daysAgo(2) },
];

const extraDocs = {
  profile_views: [
    ['demo_cand_lalaina', 'demo_emp_baobab'], ['demo_cand_lalaina', 'demo_emp_ravinala'], ['demo_cand_mialy', 'demo_emp_ravinala'],
    ['demo_cand_fenitra', 'demo_emp_nosybe'], ['demo_cand_sitraka', 'demo_emp_nosybe'],
  ].map(([p, v], i) => ({ $id: `demo_pv_${i + 1}`, profile_id: p, viewer_id: v, created_at: daysAgo(i + 1) })),
  favorites: [['demo_cand_lalaina', 'demo_emp_baobab'], ['demo_cand_mialy', 'demo_emp_ravinala'], ['demo_cand_sitraka', 'demo_emp_nosybe']]
    .map(([p, u], i) => ({ $id: `demo_fav_${i + 1}`, profile_id: p, user_id: u, created_at: daysAgo(i + 2) })),
  verification_documents: [
    { $id: 'demo_vd_1', profile_id: 'demo_cand_hasina', document_type: 'id_card', document_name: "Carte d'identité nationale", document_url: 'https://example.com/demo-cin.jpg', status: 'pending', submitted_at: daysAgo(1) },
    { $id: 'demo_vd_2', profile_id: 'demo_cand_lalaina', document_type: 'id_card', document_name: "Carte d'identité nationale", document_url: 'https://example.com/demo-cin.jpg', status: 'approved', submitted_at: daysAgo(30), reviewed_at: daysAgo(28) },
  ],
  education: [
    { $id: 'demo_edu_1', user_id: 'demo_cand_lalaina', degree: 'Master en Informatique', institution: "Université d'Antananarivo", field_of_study: 'Génie logiciel', start_date: daysAgo(3000), end_date: daysAgo(1600), description: 'Mention Bien', created_at: daysAgo(60), updated_at: daysAgo(60) },
    { $id: 'demo_edu_2', user_id: 'demo_cand_nirina', degree: 'Licence en Comptabilité', institution: 'ESCA Madagascar', field_of_study: 'Comptabilité & Gestion', start_date: daysAgo(3400), end_date: daysAgo(2300), description: '', created_at: daysAgo(60), updated_at: daysAgo(60) },
  ],
  professional_experience: [
    { $id: 'demo_exp_1', user_id: 'demo_cand_lalaina', job_title: 'Développeuse Full Stack', company_name: 'Digital Mada', location: 'Antananarivo', start_date: daysAgo(1500), end_date: null, is_current: true, description: 'Développement de plateformes web (React, Node.js).', created_at: daysAgo(60), updated_at: daysAgo(60) },
    { $id: 'demo_exp_2', user_id: 'demo_cand_nirina', job_title: 'Comptable', company_name: 'Société Industrielle de Toamasina', location: 'Toamasina', start_date: daysAgo(2100), end_date: null, is_current: true, description: 'Comptabilité générale, paie et déclarations fiscales.', created_at: daysAgo(60), updated_at: daysAgo(60) },
  ],
  premium_analytics: [
    { $id: 'demo_pa_1', user_id: 'demo_emp_baobab', job_id: jobId(0), metric_type: 'views', metric_value: 212, date: daysAgo(1), additional_data: '{}' },
    { $id: 'demo_pa_2', user_id: 'demo_emp_baobab', job_id: jobId(0), metric_type: 'applications', metric_value: 9, date: daysAgo(1), additional_data: '{}' },
  ],
  premium_contacts: [
    { $id: 'demo_pc_1', employer_id: 'demo_emp_baobab', candidate_id: 'demo_cand_lalaina', job_id: jobId(0), contact_type: 'message', message: 'Invitation à un entretien', contacted_at: daysAgo(4) },
  ],
};

// ------------------------------------------------------------------ MAIN
if (process.env.DRY_RUN) {
  const { convs, msgs } = conversationsAndMessages();
  const jobs = jobDocs();
  const bad = applicationDocs().filter((x) => !jobs.some((j) => j.$id === x.job_id));
  const badSaved = savedJobDocs().filter((x) => !jobs.some((j) => j.$id === x.job_id));
  console.log({ profiles: profileDocs().length, jobs: jobs.length, services: serviceDocs().length, applications: applicationDocs().length, convs: convs.length, msgs: msgs.length, danglingApplications: bad.length, danglingSavedJobs: badSaved.length });
  process.exit(0);
}

console.log(`🌱 Seed Appwrite ${APPWRITE_ENDPOINT} — projet ${APPWRITE_PROJECT_ID} — base ${DATABASE_ID}\n`);
await seedUsers();

// Le propriétaire (droits read/update/delete) est déduit d'un champ selon la collection.
await seedAll('profiles', profileDocs(), (_d, id) => id);
await seedAll('job_categories', categoryDocs());
await seedAll('jobs', jobDocs(), (d) => d.employer_id);
await seedAll('services', serviceDocs(), (d) => d.creator_id);
await seedAll('applications', applicationDocs(), (d) => d.candidate_id);
await seedAll('saved_jobs', savedJobDocs(), (d) => d.candidate_id);
await seedAll('saved_services', savedServiceDocs(), (d) => d.employer_id);
const { convs, msgs } = conversationsAndMessages();
await seedAll('conversations', convs, (d) => d.participant1_id);
await seedAll('messages', msgs, (d) => d.sender_id);
await seedAll('subscriptions', subscriptionDocs());
await seedAll('subscription_quotas', quotaDocs());
for (const [collection, rows] of Object.entries(extraDocs)) await seedAll(collection, rows);

console.log(`\n✅ Données démo prêtes.\n\nComptes de démonstration (mot de passe : ${DEMO_PASSWORD})`);
console.log(`   Employeurs : ${employers.map((e) => e.email).join('\n                ')}`);
console.log(`   Candidats  : ${candidates.map((c) => c.email).join('\n                ')}`);
console.log(`   Admin      : ${admin.email}`);
