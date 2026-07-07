import { localAzureStorage } from '../services/localAzureStorage.js';
import { getSqlPool } from '../config/azure.js';

// In-Memory Database cache for local mock fallback compatibility
let memControls = [
  { id: 'GDPR-1', framework: 'gdpr', name: 'Data Protection Impact Assessment (DPIA)', description: 'Establish system DPIA workflow logs detailing all personal information storage locations.', severity: 'high', status: 'passed', evidence: 'Internal_Privacy_DPIA_V1.pdf', expirationDate: '2027-01-30' },
  { id: 'GDPR-2', framework: 'gdpr', name: 'Encryption of Personal Data in Transit', description: 'Enforce transport layer security (TLS 1.2+) on all web API and database endpoints.', severity: 'high', status: 'passed', evidence: 'Azure_KeyVault_Logging_Config.json', expirationDate: '2026-12-15' },
  { id: 'GDPR-3', framework: 'gdpr', name: 'Right to Be Forgotten Process Integration', description: 'Create data purging pipelines in Azure SQL for deleting customer accounts.', severity: 'medium', status: 'passed', evidence: 'purge_stored_procedure.sql', expirationDate: '2026-11-20' },
  { id: 'HIPAA-1', framework: 'hipaa', name: 'Transmission Security & Telemetry Logging', description: 'Enable diagnostic settings on databases to track unauthorized record reads.', severity: 'high', status: 'failed', evidence: null, expirationDate: null },
  { id: 'HIPAA-2', framework: 'hipaa', name: 'Emergency Access Procedure Replicas', description: 'Maintain read-only data backups in geographically paired regions.', severity: 'high', status: 'passed', evidence: 'geo_replication_policy.json', expirationDate: '2026-09-01' },
  { id: 'HIPAA-3', framework: 'hipaa', name: 'Device and Media Controls Policy', description: 'Configure bitlocker encryption keys in KeyVault for VM disk drives.', severity: 'medium', status: 'passed', evidence: 'disk_encryption_set.tf', expirationDate: '2026-08-10' },
  { id: 'SOC2-1', framework: 'soc2', name: 'Network Security Perimeter Controls', description: 'Configure NSG security rules to restrict port 22/3389 inbound public routes.', severity: 'high', status: 'passed', evidence: 'NSG_Rules_Prod_Audit.txt', expirationDate: '2026-10-05' },
  { id: 'SOC2-2', framework: 'soc2', name: 'Multi-Factor Authentication Enforcement', description: 'Enforce MFA policies across Entra ID administrative roles.', severity: 'high', status: 'passed', evidence: 'mfa_conditional_access.json', expirationDate: '2027-02-01' },
  { id: 'SOC2-3', framework: 'soc2', name: 'Change Management Approval Tracking', description: 'Establish pull request approvals and build verification gates.', severity: 'medium', status: 'passed', evidence: 'release_pipeline_approvals.pdf', expirationDate: '2026-12-01' },
  { id: 'ISO-1', framework: 'iso27001', name: 'Access Control Policy Audit', description: 'Conduct monthly audits to remove inactive user logins from administrative groups.', severity: 'medium', status: 'failed', evidence: null, expirationDate: null },
  { id: 'ISO-2', framework: 'iso27001', name: 'Physical Safeguards for Assets', description: 'Enforce lock-box diagnostic alerts on physical rack assemblies.', severity: 'low', status: 'passed', evidence: 'rack_sensor_telemetry.yaml', expirationDate: '2026-07-28' },
  { id: 'ISO-3', framework: 'iso27001', name: 'Disaster Recovery Operations Plan', description: 'Establish automated failover procedures with simulated annual runs.', severity: 'high', status: 'passed', evidence: 'dr_failover_blueprint.pdf', expirationDate: '2027-05-15' }
];

let memTasks = [
  { id: 't-1', text: 'Configure Diagnostic Log exports for SQL Database to Storage Account', framework: 'hipaa', deadline: '2026-07-15', status: 'pending' },
  { id: 't-2', text: 'Audit admin roles in Microsoft Entra ID and remove inactive users', framework: 'iso27001', deadline: '2026-07-04', status: 'overdue' },
  { id: 't-3', text: 'Conduct review of DPIA mapping rules', framework: 'gdpr', deadline: '2026-07-28', status: 'pending' }
];

let memScores = { overall: 83, gdpr: 100, hipaa: 66, soc2: 100, iso27001: 66 };

export const complianceRepository = {
  // Read operations
  async getAllControls() {
    try {
      const pool = await getSqlPool();
      const result = await pool.request().query('SELECT * FROM ComplianceControls ORDER BY id;');
      if (result.recordset.length > 0) return result.recordset;
    } catch (e) {
      // Fallback
    }
    const controls = await localAzureStorage.read(
    "compliance-controls.json",
    memControls
);

if (controls.length === 0) {
    await localAzureStorage.write(
        "compliance-controls.json",
        memControls
    );
    return memControls;
}

return controls;
  },

  async getControlById(id) {
    try {
      const pool = await getSqlPool();
      const result = await pool.request().query(`SELECT * FROM ComplianceControls WHERE id = '${id}';`);
      if (result.recordset.length > 0) return result.recordset[0];
    } catch (e) {
      // Fallback
    }
    return memControls.find(c => c.id === id);
  },

  // Write/Update operations
  async updateControl(id, fields) {
    try {
      const pool = await getSqlPool();
      let queryStr = `UPDATE ComplianceControls SET `;
      const sets = Object.entries(fields).map(([k, v]) => `${k} = ${v === null ? 'NULL' : `'${v}'`}`);
      queryStr += sets.join(', ') + ` WHERE id = '${id}';`;
      await pool.request().query(queryStr);
    } catch (e) {
      // Fallback
    }
    
    memControls = memControls.map(c => {
      if (c.id === id) {
        return { ...c, ...fields };
      }
      return c;
    });
    return this.getControlById(id);
  },

  async getAllTasks() {
    try {
      const pool = await getSqlPool();
      const result = await pool.request().query('SELECT * FROM Tasks ORDER BY deadline;');
      if (result.recordset.length > 0) return result.recordset;
    } catch (e) {
      // Fallback
    }
    const tasks = await localAzureStorage.read(
    "tasks.json",
    memTasks
);

if (tasks.length === 0) {
    await localAzureStorage.write(
        "tasks.json",
        memTasks
    );
    return memTasks;
}

return tasks;
  },

  async createTask(task) {
    const newTask = {
      id: `t-${Date.now()}`,
      status: 'pending',
      ...task
    };
    try {
      const pool = await getSqlPool();
      await pool.request().query(`
        INSERT INTO Tasks (id, text, framework, deadline, status)
        VALUES ('${newTask.id}', '${newTask.text}', '${newTask.framework}', '${newTask.deadline}', 'pending');
      `);
    } catch (e) {
      // Fallback
    }
    memTasks.push(newTask);
    return newTask;
  },

  async updateTask(id, fields) {
    try {
      const pool = await getSqlPool();
      let queryStr = `UPDATE Tasks SET `;
      const sets = Object.entries(fields).map(([k, v]) => `${k} = '${v}'`);
      queryStr += sets.join(', ') + ` WHERE id = '${id}';`;
      await pool.request().query(queryStr);
    } catch (e) {
      // Fallback
    }
    memTasks = memTasks.map(t => t.id === id ? { ...t, ...fields } : t);
    return memTasks.find(t => t.id === id);
  },

  async deleteTask(id) {
    try {
      const pool = await getSqlPool();
      await pool.request().query(`DELETE FROM Tasks WHERE id = '${id}';`);
    } catch (e) {
      // Fallback
    }
    memTasks = memTasks.filter(t => t.id !== id);
    return true;
  },

  async getScores() {
    try {
      const pool = await getSqlPool();
      const result = await pool.request().query('SELECT TOP 1 * FROM ComplianceScores ORDER BY calculatedAt DESC;');
      if (result.recordset.length > 0) return result.recordset[0];
    } catch (e) {
      // Fallback
    }
   const scores = await localAzureStorage.read(
    "scores.json",
    memScores
);

return scores;
  },

  async updateScores(scores) {
    try {
      const pool = await getSqlPool();
      await pool.request().query(`
        INSERT INTO ComplianceScores (overall, gdpr, hipaa, soc2, iso27001, calculatedAt)
        VALUES (${scores.overall}, ${scores.gdpr}, ${scores.hipaa}, ${scores.soc2}, ${scores.iso27001}, GETDATE());
      `);
    } catch (e) {
      // Fallback
    }
    memScores = { ...memScores, ...scores };
    return memScores;
  }
};
