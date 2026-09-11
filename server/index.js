import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import stripeRoutes from './routes/stripe.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());

// Raw body pour le webhook Stripe (doit être AVANT express.json)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON pour toutes les autres routes
app.use(express.json());

// Routes
app.use('/api/stripe', stripeRoutes);

app.listen(PORT, () => {
  console.log(`Serveur API démarré sur le port ${PORT}`);
});