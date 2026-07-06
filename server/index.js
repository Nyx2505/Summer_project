import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { complianceService } from './services/complianceService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes mapping
app.use('/api', apiRouter);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[ACOM Server Exception Log]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Enterprise Server Error',
    requestId: `req-${Date.now()}`
  });
});

// Setup Azure Functions background runners on boot
complianceService.setupBackgroundJobs();

// Listener
app.listen(PORT, () => {
  console.log(`[ACOM Server] Listening on http://localhost:${PORT}`);
});
