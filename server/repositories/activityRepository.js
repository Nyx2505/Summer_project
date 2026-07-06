import { getSqlPool } from '../config/azure.js';

let memActivities = [
  { id: 'act-1', timestamp: '2026-07-06 15:30', operation: 'Recalculate Compliance Scores', caller: 'Azure Functions Engine', resource: 'Azure SQL / compliance-db', status: 'Success' },
  { id: 'act-2', timestamp: '2026-07-06 14:15', operation: 'Upload Evidence File (Azure_KeyVault_Logging_Config.json)', caller: 'Security-Audit-User', resource: 'Azure Blob Storage / EvidenceLocker', status: 'Success' },
  { id: 'act-3', timestamp: '2026-07-06 11:22', operation: 'Update NSG Rule Configuration', caller: 'Deployer-CI-CD', resource: 'Azure Policy / NetworkSettings', status: 'Success' }
];

export const activityRepository = {
  async getAllActivities() {
    try {
      const pool = await getSqlPool();
      const result = await pool.request().query('SELECT * FROM ActivityLogs ORDER BY timestamp DESC;');
      if (result.recordset.length > 0) return result.recordset;
    } catch (e) {
      // Fallback
    }
    return memActivities;
  },

  async logActivity(activity) {
    const newAct = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      ...activity
    };

    try {
      const pool = await getSqlPool();
      await pool.request().query(`
        INSERT INTO ActivityLogs (id, timestamp, operation, caller, resource, status)
        VALUES ('${newAct.id}', '${newAct.timestamp}', '${newAct.operation}', '${newAct.caller}', '${newAct.resource}', '${newAct.status}');
      `);
    } catch (e) {
      // Fallback
    }

    memActivities.unshift(newAct);
    return newAct;
  }
};
