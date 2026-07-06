import express from 'express';
import { complianceRepository } from '../repositories/complianceRepository.js';
import { activityRepository } from '../repositories/activityRepository.js';
import { complianceService } from '../services/complianceService.js';
import { policyService } from '../services/policyService.js';
import { notificationService } from '../services/notificationService.js';
import { copilotService } from '../services/copilotService.js';
import { checkAuthentication, authorizeRoles, rolesList } from '../middleware/auth.js';

const router = express.Router();

// Apply Authentication middleware to all API routes
router.use(checkAuthentication);

// 1. Controls Routes
router.get('/controls', async (req, res, next) => {
  try {
    const { framework, search } = req.query;
    let controls = await complianceRepository.getAllControls();
    
    if (framework && framework !== 'all') {
      controls = controls.filter(c => c.framework === framework);
    }
    
    if (search) {
      const q = search.toLowerCase();
      controls = controls.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.id.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q)
      );
    }
    
    res.json(controls);
  } catch (err) {
    next(err);
  }
});

router.post('/controls/:id/toggle', authorizeRoles(rolesList.ADMIN, rolesList.OFFICER, rolesList.AUDITOR), async (req, res, next) => {
  try {
    const { id } = req.params;
    const control = await complianceRepository.getControlById(id);
    if (!control) {
      return res.status(404).json({ error: 'Control not found' });
    }

    const nextStatus = control.status === 'passed' ? 'failed' : 'passed';
    await complianceRepository.updateControl(id, { 
      status: nextStatus,
      evidence: nextStatus === 'failed' ? null : control.evidence
    });

    const scores = await complianceService.recalculateScores();

    await activityRepository.logActivity({
      operation: `Toggle control status [${id}] to ${nextStatus.toUpperCase()}`,
      caller: req.user.username,
      resource: 'Azure SQL / ComplianceControls',
      status: 'Success'
    });

    if (nextStatus === 'failed') {
      await notificationService.sendComplianceAlert({
        type: 'Failed compliance check',
        title: `Control Breach: ${id}`,
        message: `Control [${control.name}] was manually set to non-compliant.`,
        severity: 'high'
      });
    }

    res.json({ id, status: nextStatus, scores });
  } catch (err) {
    next(err);
  }
});

router.post('/controls/:id/evidence', authorizeRoles(rolesList.ADMIN, rolesList.OFFICER), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fileName, expirationDate } = req.body;
    
    if (!fileName) {
      return res.status(400).json({ error: 'Evidence fileName is required' });
    }

    const control = await complianceRepository.getControlById(id);
    if (!control) {
      return res.status(404).json({ error: 'Control not found' });
    }

    // Simulate saving evidence metadata with hashes to Azure SQL and upload to Storage Container
    await complianceRepository.updateControl(id, {
      status: 'passed',
      evidence: fileName,
      expirationDate: expirationDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    });

    const scores = await complianceService.recalculateScores();

    await activityRepository.logActivity({
      operation: `Uploaded evidence '${fileName}' linked to ${id}`,
      caller: req.user.username,
      resource: 'Azure Storage Blob / Evidence Container',
      status: 'Success'
    });

    res.json({ success: true, scores });
  } catch (err) {
    next(err);
  }
});

// 2. Scores Routes
router.get('/scores', async (req, res, next) => {
  try {
    const scores = await complianceRepository.getScores();
    res.json(scores);
  } catch (err) {
    next(err);
  }
});

router.post('/scan', authorizeRoles(rolesList.ADMIN, rolesList.OFFICER), async (req, res, next) => {
  try {
    const scores = await complianceService.recalculateScores();
    
    await activityRepository.logActivity({
      operation: 'Initiated System Policy Audit Scan',
      caller: req.user.username,
      resource: 'Azure Functions Check Engine',
      status: 'Success'
    });

    res.json(scores);
  } catch (err) {
    next(err);
  }
});

// 3. Checklist / Tasks Routes
router.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await complianceRepository.getAllTasks();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.post('/tasks', authorizeRoles(rolesList.ADMIN, rolesList.OFFICER, rolesList.MANAGER), async (req, res, next) => {
  try {
    const { text, framework, deadline } = req.body;
    if (!text || !deadline) {
      return res.status(400).json({ error: 'Task text and deadline date are required' });
    }

    const newTask = await complianceRepository.createTask({ text, framework, deadline });

    await activityRepository.logActivity({
      operation: `Added new checklist action item: ${text}`,
      caller: req.user.username,
      resource: 'Azure SQL / Tasks',
      status: 'Success'
    });

    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

router.put('/tasks/:id', authorizeRoles(rolesList.ADMIN, rolesList.OFFICER, rolesList.MANAGER), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updated = await complianceRepository.updateTask(id, { status });

    await activityRepository.logActivity({
      operation: `Marked task [${id}] status to: ${status}`,
      caller: req.user.username,
      resource: 'Azure SQL / Tasks',
      status: 'Success'
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/tasks/:id', authorizeRoles(rolesList.ADMIN, rolesList.OFFICER), async (req, res, next) => {
  try {
    const { id } = req.params;
    await complianceRepository.deleteTask(id);

    await activityRepository.logActivity({
      operation: `Deleted compliance action item [${id}]`,
      caller: req.user.username,
      resource: 'Azure SQL / Tasks',
      status: 'Success'
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// 4. Audit Trail / Activities Routes
router.get('/activities', async (req, res, next) => {
  try {
    const activities = await activityRepository.getAllActivities();
    res.json(activities);
  } catch (err) {
    next(err);
  }
});

// 5. Azure Policy Infrastructure Scans
router.get('/infrastructure', async (req, res, next) => {
  try {
    const scans = await policyService.scanAzureResources();
    res.json(scans);
  } catch (err) {
    next(err);
  }
});

// 6. AI Compliance Copilot Chat
router.post('/copilot', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Prompt message is required' });
    }

    const reply = await copilotService.askCopilot(message);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

// 7. Reports Compilation & Export Download
router.get('/report/export', async (req, res, next) => {
  try {
    const { format } = req.query; // 'pdf', 'excel', 'csv', 'json'
    const reportFile = await complianceService.exportReport(format || 'pdf');

    res.setHeader('Content-Type', reportFile.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${reportFile.filename}"`);
    res.send(reportFile.data);
  } catch (err) {
    next(err);
  }
});

// 8. Azure Data Factory Pipeline Metrics
router.get('/adf/pipelines', async (req, res, next) => {
  try {
    // Returns pipeline run history and source data catalogs
    res.json({
      activePipelines: [
        { name: 'SyncComplianceLogsToSynapse', status: 'Succeeded', lastRun: '2026-07-06 15:30', recordsProcessed: 142, duration: '4s' },
        { name: 'IngestFederalRegulatoryFeeds', status: 'Succeeded', lastRun: '2026-07-06 14:00', recordsProcessed: 3, duration: '12s' },
        { name: 'BackupEvidenceLockerStorage', status: 'Succeeded', lastRun: '2026-07-05 23:00', recordsProcessed: 12, duration: '45s' }
      ],
      lineage: {
        source: 'Azure Storage Container: acom-evidence-blobs',
        stage: 'Azure Data Factory Copy Activity',
        target: 'Azure Synapse ADLS Gen2 Compliance Lakehouse'
      }
    });
  } catch (err) {
    next(err);
  }
});

// 9. Azure Synapse historical Dashboards analytics
router.get('/synapse/dashboards', async (req, res, next) => {
  try {
    res.json({
      departmentScores: [
        { department: 'Engineering', score: 95 },
        { department: 'HR & Operations', score: 100 },
        { department: 'Data Management', score: 66 },
        { department: 'Legal & Risk', score: 100 }
      ],
      scoreTrends: [
        { month: 'Feb', score: 72 },
        { month: 'Mar', score: 78 },
        { month: 'Apr', score: 81 },
        { month: 'May', score: 80 },
        { month: 'Jun', score: 83 },
        { month: 'Jul', score: 83 }
      ],
      comparisons: [
        { framework: 'GDPR', compliant: 3, total: 3 },
        { framework: 'HIPAA', compliant: 2, total: 3 },
        { framework: 'SOC 2', compliant: 3, total: 3 },
        { framework: 'ISO 27001', compliant: 2, total: 3 }
      ]
    });
  } catch (err) {
    next(err);
  }
});

// 10. External GRC Connectors Connect endpoints
router.post('/integrations/connect', authorizeRoles(rolesList.ADMIN), async (req, res, next) => {
  try {
    const { service, clientId, clientSecret, resourceUrl } = req.body;
    if (!service || !clientId || !clientSecret) {
      return res.status(400).json({ error: 'Integration details (service name, clientId, clientSecret) are required.' });
    }

    await activityRepository.logActivity({
      operation: `Establish OAuth connection mapping to ${service}`,
      caller: req.user.username,
      resource: `GRC Link / ${service}`,
      status: 'Success'
    });

    res.json({ success: true, message: `Oauth connection mapping linked to ${service} successfully.` });
  } catch (err) {
    next(err);
  }
});

export default router;
