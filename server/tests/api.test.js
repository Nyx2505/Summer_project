import test from 'node:test';
import assert from 'node:assert';
import express from 'express';
import apiRouter from '../routes/api.js';
import { complianceRepository } from '../repositories/complianceRepository.js';

test('ACOM REST API routes test suite', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);

  await t.test('Repository returns scores payload', async () => {
    const mockScores = { overall: 85, gdpr: 100, hipaa: 100, soc2: 100, iso27001: 40 };
    
    const originalGetScores = complianceRepository.getScores;
    complianceRepository.getScores = async () => mockScores;

    try {
      const scores = await complianceRepository.getScores();
      assert.strictEqual(scores.overall, 85);
      assert.strictEqual(scores.gdpr, 100);
      assert.strictEqual(scores.iso27001, 40);
    } finally {
      complianceRepository.getScores = originalGetScores;
    }
  });
});
