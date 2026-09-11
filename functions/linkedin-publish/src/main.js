import { Client, Databases } from 'node-appwrite';
import fetch from 'node-fetch';

const DATABASE_ID = 'job2mada-db';
const JOBS_COLLECTION_ID = 'jobs';
const SITE_URL = 'https://job2mada.com';
const DESCRIPTION_SNIPPET_LENGTH = 200;

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/\s+\S*$/, '')}…`;
}

// Déclenchée par l'event Appwrite: databases.job2mada-db.collections.jobs.documents.*.update
export default async ({ req, res, log, error }) => {
  let job;
  try {
    job = req.bodyJson;
  } catch (e) {
    error(`Payload JSON invalide: ${e.message}`);
    return res.json({ success: false, reason: 'invalid_payload' });
  }

  if (!job || !job.$id) {
    return res.json({ success: false, reason: 'no_document' });
  }

  if (!job.is_active) {
    log(`Job ${job.$id} non actif, on ignore.`);
    return res.json({ success: true, skipped: 'not_active' });
  }

  if (job.linkedin_posted_at) {
    log(`Job ${job.$id} déjà publié sur LinkedIn (${job.linkedin_posted_at}), on ignore.`);
    return res.json({ success: true, skipped: 'already_posted' });
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    error("MAKE_WEBHOOK_URL manquant dans les variables d'environnement de la fonction.");
    return res.json({ success: false, reason: 'missing_webhook_url' });
  }

  const jobUrl = `${SITE_URL}/jobs/${job.$id}`;
  const payload = {
    job_id: job.$id,
    title: job.title || '',
    company_name: job.company_name || '',
    location: job.location || '',
    remote_work: job.remote_work || '',
    employment_type: job.employment_type || '',
    contract_type: job.contract_type || '',
    description_snippet: truncate(stripHtml(job.description || ''), DESCRIPTION_SNIPPET_LENGTH),
    url: jobUrl,
  };

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!webhookResponse.ok) {
      error(`Webhook make.com a répondu ${webhookResponse.status}`);
      return res.json({ success: false, reason: 'webhook_failed', status: webhookResponse.status });
    }
  } catch (e) {
    error(`Erreur d'appel au webhook make.com: ${e.message}`);
    return res.json({ success: false, reason: 'webhook_error' });
  }

  try {
    const client = new Client()
      .setEndpoint('https://appwrite.dat-articles.com/v1')
      .setProject('job2mada')
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    await databases.updateDocument(DATABASE_ID, JOBS_COLLECTION_ID, job.$id, {
      linkedin_posted_at: new Date().toISOString(),
    });

    log(`Job ${job.$id} publié sur LinkedIn via make.com et marqué comme posté.`);
  } catch (e) {
    error(`Post envoyé à make.com mais échec de la mise à jour du flag linkedin_posted_at pour ${job.$id}: ${e.message}`);
    return res.json({ success: true, warning: 'flag_update_failed' });
  }

  return res.json({ success: true });
};
