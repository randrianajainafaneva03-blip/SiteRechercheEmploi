// Schéma Appwrite de Job2Mada : collections, attributs, index et buckets.
// Déduit des services du front (src/lib/appwrite.ts, pages, hooks) et du serveur Stripe (server/routes/stripe.js).

// --- mini DSL pour décrire les attributs ---
const str = (key, size = 255, opts = {}) => ({ type: 'string', key, size, ...opts });
const strs = (key, size = 255) => ({ type: 'string', key, size, array: true });
const bool = (key, def = false) => ({ type: 'boolean', key, default: def });
const int = (key, def) => ({ type: 'integer', key, ...(def !== undefined ? { default: def } : {}) });
const dt = (key) => ({ type: 'datetime', key });

const ts = [dt('created_at'), dt('updated_at')];
const key = (attr, type = 'key') => ({ key: `idx_${attr}`, type, attributes: [attr] });

// Permissions au niveau collection (le front ne passe pas de permissions à createDocument :
// le créateur reçoit alors automatiquement les droits sur son document, d'où documentSecurity = true).
const PUBLIC_READ = ['read("any")', 'create("users")'];
const USERS_READ = ['read("users")', 'create("users")'];
const OWNER_ONLY = ['create("users")'];

export const collections = [
  {
    id: 'profiles',
    permissions: PUBLIC_READ,
    attributes: [
      str('full_name'), str('email'), str('user_type', 50), bool('is_active', true), str('phone', 50),
      str('location'), str('bio', 3000), strs('skills', 100), int('experience_years'),
      str('poste'), str('disponibilite', 100),
      bool('is_premium'), str('premium_type', 50), dt('premium_activated_at'), dt('premium_deactivated_at'),
      str('verification_status', 50, { default: 'unverified' }), bool('is_verified'), bool('onboarding_completed'),
      str('company_name'), str('company_category'), str('company_description', 3000),
      str('company_size', 100), str('industry'),
      str('website', 500), str('website_url', 500), str('linkedin_url', 500), str('portfolio_url', 500),
      str('company_logo_url', 500), str('avatar_url', 500), str('profile_picture', 500), str('cv_url', 500),
      str('google_id'), str('oauth_provider', 100),
      ...ts,
    ],
    indexes: [key('user_type'), key('is_active'), key('email'), key('is_premium'), key('verification_status'), key('created_at')],
  },
  {
    id: 'jobs',
    permissions: PUBLIC_READ,
    attributes: [
      str('title', 500), str('company_name'), str('category'), str('description', 100000),
      str('employment_type', 50), str('contract_type', 50), str('experience_level', 50),
      str('location'), bool('remote_work'),
      strs('benefits', 500), strs('requirements', 500),
      dt('application_deadline'), str('contact_email'), str('company_website', 500),
      str('application_instructions', 2000),
      int('salary_min'), int('salary_max'), str('salary_currency', 10),
      bool('is_featured'), bool('is_urgent'), bool('is_draft'), bool('is_active', true),
      str('moderation_status', 50, { default: 'approved' }), int('views_count', 0),
      bool('linkedin_auto_posted'), str('employer_id', 64),
      ...ts,
    ],
    indexes: [
      key('is_active'), key('is_draft'), key('is_featured'), key('category'), key('employment_type'),
      key('contract_type'), key('experience_level'), key('location'), key('remote_work'),
      key('employer_id'), key('moderation_status'), key('created_at'),
      key('title', 'fulltext'),
    ],
  },
  {
    id: 'services',
    permissions: PUBLIC_READ,
    attributes: [
      str('title'), str('description', 10000), str('category', 100), str('price_range', 50), str('delivery_time', 50),
      strs('skills', 100), str('creator_id', 64), str('youtube_url', 500), str('video_description', 2000),
      strs('portfolio', 2000),
      bool('is_active'), bool('is_approved'), str('approval_status', 50, { default: 'pending' }), int('views_count', 0),
      ...ts,
    ],
    indexes: [
      key('is_active'), key('is_approved'), key('creator_id'), key('category'), key('price_range'),
      key('delivery_time'), key('created_at'), key('title', 'fulltext'),
    ],
  },
  {
    id: 'applications',
    // Le front liste les candidatures côté employeur puis filtre : lecture ouverte aux connectés.
    permissions: USERS_READ,
    attributes: [
      str('job_id', 64), str('candidate_id', 64), str('cover_letter', 10000), str('cv_url', 500),
      strs('additional_documents', 500), str('status', 50, { default: 'pending' }), dt('applied_at'), ...ts,
    ],
    indexes: [
      key('job_id'), key('candidate_id'), key('status'), key('created_at'),
      { key: 'idx_candidate_job', type: 'key', attributes: ['candidate_id', 'job_id'] },
    ],
  },
  {
    id: 'saved_jobs',
    permissions: OWNER_ONLY,
    attributes: [str('candidate_id', 64), str('job_id', 64), dt('created_at')],
    indexes: [key('candidate_id'), key('job_id'), key('created_at')],
  },
  {
    id: 'saved_services',
    permissions: OWNER_ONLY,
    attributes: [str('employer_id', 64), str('service_id', 64), dt('created_at')],
    indexes: [key('employer_id'), key('service_id'), key('created_at')],
  },
  {
    id: 'conversations',
    permissions: USERS_READ,
    attributes: [
      str('conversation_key'),
      str('participant1_id', 64), str('participant1_name'), str('participant1_avatar', 500), str('participant1_type', 50),
      str('participant2_id', 64), str('participant2_name'), str('participant2_avatar', 500), str('participant2_type', 50),
      str('last_message_id', 64), dt('last_message_date'), ...ts,
    ],
    indexes: [key('conversation_key'), key('participant1_id'), key('participant2_id'), key('last_message_date'), key('updated_at')],
  },
  {
    id: 'messages',
    permissions: USERS_READ,
    attributes: [
      str('conversation_id', 64), str('sender_id', 64), str('receiver_id', 64), str('subject'), str('content', 10000),
      str('message_type', 50), bool('is_premium'), str('status', 50, { default: 'sent' }), bool('is_read'),
      str('context_type', 50), str('context_id', 64), str('context_title'), str('attachments', 5000), ...ts,
    ],
    indexes: [key('conversation_id'), key('sender_id'), key('receiver_id'), key('status'), key('is_read'), key('created_at')],
  },
  {
    id: 'job_categories',
    permissions: ['read("any")'],
    attributes: [str('name'), str('slug'), str('description', 1000), str('icon', 100), bool('is_active', true), ...ts],
    indexes: [key('name'), key('is_active')],
  },
  {
    id: 'verification_documents',
    permissions: OWNER_ONLY,
    attributes: [
      str('profile_id', 64), str('document_type', 50), str('document_name'), str('document_url', 500),
      str('status', 50, { default: 'pending' }), dt('submitted_at'), dt('reviewed_at'), str('rejection_reason', 1000),
    ],
    indexes: [key('profile_id'), key('status')],
  },
  {
    id: 'profile_views',
    permissions: USERS_READ,
    attributes: [str('profile_id', 64), str('viewer_id', 64), dt('created_at')],
    indexes: [key('profile_id'), key('viewer_id')],
  },
  {
    id: 'favorites',
    permissions: OWNER_ONLY,
    attributes: [str('profile_id', 64), str('user_id', 64), dt('created_at')],
    indexes: [key('profile_id'), key('user_id')],
  },
  {
    id: 'education',
    permissions: PUBLIC_READ,
    attributes: [
      str('user_id', 64), str('degree'), str('institution'), str('field_of_study'),
      dt('start_date'), dt('end_date'), str('description', 2000), ...ts,
    ],
    indexes: [key('user_id')],
  },
  {
    id: 'professional_experience',
    permissions: PUBLIC_READ,
    attributes: [
      str('user_id', 64), str('job_title'), str('company_name'), str('location'),
      dt('start_date'), dt('end_date'), bool('is_current'), str('description', 3000), ...ts,
    ],
    indexes: [key('user_id')],
  },
  {
    // Champs alignés sur server/routes/stripe.js (activatePremiumSubscription)
    id: 'subscriptions',
    permissions: ['read("users")'],
    attributes: [
      str('user_id', 64), str('user_type', 50), str('subscription_type', 50), str('plan_name'),
      str('billing_period', 50), int('amount_mga'), int('amount'), str('status', 50, { default: 'active' }),
      str('payment_method', 50), str('transaction_id'), str('last_transaction_id'),
      dt('start_date'), dt('end_date'), dt('last_payment_date'), dt('cancelled_at'),
      str('activated_by', 100), str('activated_by_name'), bool('auto_renew'), ...ts,
    ],
    indexes: [key('user_id'), key('status'), key('subscription_type'), { key: 'idx_user_status', type: 'key', attributes: ['user_id', 'status'] }],
  },
  {
    id: 'subscription_quotas',
    permissions: ['read("users")'],
    attributes: [
      str('subscription_id', 64), str('user_id', 64), str('user_type', 50), dt('reset_date'),
      int('messages_quota', 0), int('messages_used', 0),
      int('featured_jobs_quota', 0), int('featured_jobs_used', 0), int('featured_days', 0), ...ts,
    ],
    indexes: [key('user_id'), key('created_at')],
  },
  {
    id: 'premium_analytics',
    permissions: ['read("users")'],
    attributes: [str('user_id', 64), str('job_id', 64), str('metric_type', 100), int('metric_value', 0), dt('date'), str('additional_data', 2000)],
    indexes: [key('user_id'), key('job_id'), key('metric_type')],
  },
  {
    id: 'premium_contacts',
    permissions: ['read("users")'],
    attributes: [str('employer_id', 64), str('candidate_id', 64), str('job_id', 64), str('contact_type', 50), str('message', 2000), dt('contacted_at')],
    indexes: [key('employer_id'), key('candidate_id')],
  },
];

// Stockage : le plan Appwrite ne permet qu'UN bucket. Il est partagé par toutes les catégories de fichiers
// (images, CV, pièces de vérification) ; les permissions sont posées fichier par fichier par le front
// (voir l'adaptateur "storage" dans src/lib/appwrite.ts, activé par VITE_APPWRITE_SINGLE_BUCKET).
export const buckets = [
  {
    id: 'images',
    name: 'Fichiers Job2Mada',
    permissions: ['create("users")'],
    fileSecurity: true,
    maximumFileSize: 10 * 1024 * 1024,
    allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx'],
  },
];
