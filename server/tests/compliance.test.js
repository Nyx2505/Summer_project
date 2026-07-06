import test from 'node:test';
import assert from 'node:assert';
import { complianceService } from '../services/complianceService.js';
import { complianceRepository } from '../repositories/complianceRepository.js';

test('Compliance Assessment scoring engine test suite', async (t) => {
  await t.test('calculateScores successfully aggregates framework status', async () => {
    // 1. Arrange: setup manual mock controls in repository
    const mockControls = [
      { id: 'GDPR-1', framework: 'gdpr', status: 'passed' },
      { id: 'GDPR-2', framework: 'gdpr', status: 'failed' },
      { id: 'HIPAA-1', framework: 'hipaa', status: 'passed' }
    ];

    // Override repository methods for the test
    const originalGetAll = complianceRepository.getAllControls;
    const originalUpdateScores = complianceRepository.updateScores;
    
    complianceRepository.getAllControls = async () => mockControls;
    complianceRepository.updateScores = async (s) => s;

    try {
      // 2. Act
      const scores = await complianceService.recalculateScores();

      // 3. Assert
      // GDPR: 1 of 2 passed = 50%
      assert.strictEqual(scores.gdpr, 50);
      // HIPAA: 1 of 1 passed = 100%
      assert.strictEqual(scores.hipaa, 100);
      // Overall average: (50 + 100 + 0 + 0) / 4 = 38%
      assert.strictEqual(scores.overall, 38);
    } finally {
      // Clean up mock overrides
      complianceRepository.getAllControls = originalGetAll;
      complianceRepository.updateScores = originalUpdateScores;
    }
  });
});
