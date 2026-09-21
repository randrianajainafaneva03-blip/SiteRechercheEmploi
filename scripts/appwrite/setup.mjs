// Crée (ou complète) la base, les tables (collections), colonnes (attributs), index et buckets sur Appwrite.
// Idempotent : peut être relancé sans risque.  Usage : npm run appwrite:setup
import 'dotenv/config';
import { Client, TablesDB, Storage, Query } from 'node-appwrite';
import { collections, buckets } from './schema.mjs';

const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } = process.env;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'job2mada-db';
if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  throw new Error('APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID et APPWRITE_API_KEY doivent être définis dans .env');
}

const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY);
const tables = new TablesDB(client);
const storage = new Storage(client);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isConflict = (e) => e?.code === 409;

// Exécute fn ; ignore un 409 (déjà existant) ; retente en cas de rate-limit (429).
async function safe(label, fn) {
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      await fn();
      return 'created';
    } catch (e) {
      if (isConflict(e)) return 'exists';
      if (e?.code === 429) { await sleep(2000 * (attempt + 1)); continue; }
      console.error(`   ✗ ${label}: ${e.message}`);
      return 'error';
    }
  }
  return 'error';
}

function createAttribute(collectionId, a) {
  const base = { databaseId: DATABASE_ID, tableId: collectionId, key: a.key, required: false, array: !!a.array };
  switch (a.type) {
    case 'string': return tables.createStringColumn({ ...base, size: a.size, ...(a.default !== undefined && { xdefault: a.default }) });
    case 'boolean': return tables.createBooleanColumn({ ...base, ...(a.default !== undefined && !a.array && { xdefault: a.default }) });
    case 'integer': return tables.createIntegerColumn({ ...base, ...(a.default !== undefined && { xdefault: a.default }) });
    case 'datetime': return tables.createDatetimeColumn(base);
    default: throw new Error(`Type inconnu: ${a.type}`);
  }
}

// Attend que tous les attributs soient "available" avant de créer les index.
async function waitForAttributes(collectionId, keys) {
  for (let i = 0; i < 90; i++) {
    const { columns: attributes } = await tables.listColumns({ databaseId: DATABASE_ID, tableId: collectionId, queries: [Query.limit(100)] });
    const byKey = new Map(attributes.map((a) => [a.key, a]));
    const failed = keys.filter((k) => byKey.get(k)?.status === 'failed');
    if (failed.length) throw new Error(`Attributs en échec sur ${collectionId}: ${failed.join(', ')}`);
    if (keys.every((k) => byKey.get(k)?.status === 'available')) return;
    await sleep(1000);
  }
  throw new Error(`Timeout en attendant les attributs de ${collectionId}`);
}

async function setupCollection(c) {
  console.log(`\n📁 ${c.id}`);
  await safe(`collection ${c.id}`, () =>
    tables.createTable({
      databaseId: DATABASE_ID,
      tableId: c.id,
      name: c.id,
      permissions: c.permissions,
      rowSecurity: true,
    }),
  );
  // Met à jour les permissions même si la collection existait déjà
  await tables.updateTable({
    databaseId: DATABASE_ID, tableId: c.id, name: c.id, permissions: c.permissions, rowSecurity: true,
  });

  let created = 0;
  for (const a of c.attributes) {
    const r = await safe(`${c.id}.${a.key}`, () => createAttribute(c.id, a));
    if (r === 'created') created++;
  }
  console.log(`   ${created} attribut(s) créé(s) sur ${c.attributes.length}`);
  await waitForAttributes(c.id, c.attributes.map((a) => a.key));

  let idx = 0;
  for (const i of c.indexes) {
    const r = await safe(`${c.id}/${i.key}`, () =>
      tables.createIndex({
        databaseId: DATABASE_ID, tableId: c.id, key: i.key, type: i.type, columns: i.attributes,
        orders: i.attributes.map(() => 'ASC'),
      }),
    );
    if (r === 'created') idx++;
  }
  console.log(`   ${idx} index créé(s) sur ${c.indexes.length}`);
}

async function setupBuckets() {
  console.log('\n🪣 Buckets');
  for (const b of buckets) {
    const params = {
      bucketId: b.id, name: b.name, permissions: b.permissions, fileSecurity: b.fileSecurity,
      maximumFileSize: b.maximumFileSize, allowedFileExtensions: b.allowedFileExtensions,
    };
    let exists = true;
    try { await storage.getBucket({ bucketId: b.id }); } catch (e) { if (e?.code !== 404) throw e; exists = false; }
    if (exists) await storage.updateBucket(params);
    else await storage.createBucket(params);
    console.log(`   ${b.id}: ${exists ? 'mis à jour' : 'créé'}`);
  }
}

console.log(`🚀 Appwrite ${APPWRITE_ENDPOINT} — projet ${APPWRITE_PROJECT_ID} — base ${DATABASE_ID}`);
try {
  await tables.get({ databaseId: DATABASE_ID });
} catch (e) {
  if (e?.code !== 404) throw e;
  await tables.create({ databaseId: DATABASE_ID, name: 'Job2Mada' });
}
for (const c of collections) await setupCollection(c);
await setupBuckets();
console.log('\n✅ Schéma prêt.');
