// Vercel va monter /api sur ce handler
const app = require('../server');
module.exports = app; // Express est un handler (req,res) => app(req,res)
