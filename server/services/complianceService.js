import { complianceRepository } from '../repositories/complianceRepository.js';
import { activityRepository } from '../repositories/activityRepository.js';
import { notificationHubClient } from '../config/azure.js';

export const complianceService = {
  async recalculateScores() {
    const controls = await complianceRepository.getAllControls();
    const frameworks = ['gdpr', 'hipaa', 'soc2', 'iso27001'];
    const scores = {};

    let overallSum = 0;
    frameworks.forEach(fw => {
      const fwControls = controls.filter(c => c.framework === fw);
      const passed = fwControls.filter(c => c.status === 'passed').length;
      const total = fwControls.length;
      scores[fw] = total > 0 ? Math.round((passed / total) * 100) : 0;
      overallSum += scores[fw];
    });

    scores.overall = Math.round(overallSum / frameworks.length);
    
    await complianceRepository.updateScores(scores);
    return scores;
  },

  // Export report to different file extensions
  async exportReport(format) {
    const controls = await complianceRepository.getAllControls();
    const scores = await complianceRepository.getScores();
    const activities = await activityRepository.getAllActivities();

    const reportData = {
      title: "Enterprise Compliance & Audit Report",
      scope: "Azure Resource Policies, Multi-framework Assessment logs",
      timestamp: new Date().toISOString(),
      scores,
      controls: controls.map(c => ({ id: c.id, name: c.name, framework: c.framework, status: c.status, evidence: c.evidence })),
      auditTrail: activities.slice(0, 10)
    };

    if (format === 'json') {
      return {
        contentType: 'application/json',
        filename: 'compliance_report.json',
        data: JSON.stringify(reportData, null, 2)
      };
    }

    if (format === 'csv') {
      let csvContent = 'Framework,Control ID,Control Name,Status,Evidence\n';
      controls.forEach(c => {
        csvContent += `"${c.framework.toUpperCase()}","${c.id}","${c.name}","${c.status}","${c.evidence || 'None'}"\n`;
      });
      return {
        contentType: 'text/csv',
        filename: 'compliance_report.csv',
        data: csvContent
      };
    }

    if (format === 'excel') {
      // Simulate XML Excel Spreadsheet format
      let xlsContent = '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">';
      xlsContent += '<Worksheet name="Compliance Status"><Table>';
      xlsContent += '<Row><Cell><Data Type="String">Framework</Data></Cell><Cell><Data Type="String">Control ID</Data></Cell><Cell><Data Type="String">Control Name</Data></Cell><Cell><Data Type="String">Status</Data></Cell></Row>';
      controls.forEach(c => {
        xlsContent += `<Row><Cell><Data Type="String">${c.framework.toUpperCase()}</Data></Cell><Cell><Data Type="String">${c.id}</Data></Cell><Cell><Data Type="String">${c.name}</Data></Cell><Cell><Data Type="String">${c.status}</Data></Cell></Row>`;
      });
      xlsContent += '</Table></Worksheet></Workbook>';
      return {
        contentType: 'application/vnd.ms-excel',
        filename: 'compliance_report.xls',
        data: xlsContent
      };
    }

    // Default to PDF format simulation
    let pdfContent = `%PDF-1.4\n%----\n1 0 obj\n<< /Title (Enterprise Compliance Report) /Author (ACOM Azure App) >>\nendobj\n`;
    pdfContent += `2 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n`;
    pdfContent += `3 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n`;
    pdfContent += `4 0 obj\n<< /Type /Page /Parent 3 0 R /Contents 5 0 R >>\nendobj\n`;
    pdfContent += `5 0 obj\n<< /Length 150 >>\nstream\n`;
    pdfContent += `BT /F1 14 Tf 50 700 Td (ACOM System Compliance Audit Report) Tj ET\n`;
    pdfContent += `BT /F1 10 Tf 50 650 Td (Overall Score: ${scores.overall}% | GDPR: ${scores.gdpr}% | HIPAA: ${scores.hipaa}%) Tj ET\n`;
    pdfContent += `endstream\nendobj\nxref\n0 6\ntrailer << /Root 2 0 R >>\n%%EOF`;

    return {
      contentType: 'application/pdf',
      filename: 'compliance_report.pdf',
      data: pdfContent
    };
  },

  // Automated background jobs runner (Azure Function simulations)
  setupBackgroundJobs() {
    console.log('[Azure Functions] Background automations initialized.');
    
    // 1. Hourly Regulatory Monitor
    setInterval(async () => {
      console.log('[Azure Functions] Scheduled Trigger: Hourly Regulatory Monitoring Feed Scan...');
      // In production, we scrape or fetch updates and trigger score checks
    }, 60 * 60 * 1000);

    // 2. Daily Compliance Scans
    setInterval(async () => {
      console.log('[Azure Functions] Scheduled Trigger: Daily Infrastructure Compliance Policy Scan...');
      await this.recalculateScores();
    }, 24 * 60 * 60 * 1000);

    // 3. Weekly Report Generation & Expiration check
    setInterval(async () => {
      console.log('[Azure Functions] Scheduled Trigger: Weekly Evidence Expiration checks...');
      const controls = await complianceRepository.getAllControls();
      const today = new Date();
      controls.forEach(c => {
        if (c.expirationDate && new Date(c.expirationDate) < today) {
          console.warn(`[Azure Functions] Alert! Evidence for control ${c.id} has EXPIRED.`);
          // Send notification hub warning
          notificationHubClient.sendNotification({
            body: `Evidence for control ${c.id} has expired on ${c.expirationDate}.`
          });
        }
      });
    }, 7 * 24 * 60 * 60 * 1000);
  }
};
