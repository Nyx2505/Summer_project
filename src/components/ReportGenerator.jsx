import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  AlertTriangle, 
  CheckCircle,
  FileCheck,
  Zap
} from 'lucide-react';

const ReportGenerator = ({ 
  controls, 
  scores, 
  addActivity 
}) => {
  const [reportCompiling, setReportCompiling] = useState(false);
  const [compiledReport, setCompiledReport] = useState(null);

  const failedControls = controls.filter(c => c.status === 'failed');
  const passedControls = controls.filter(c => c.status === 'passed');

  const compileAuditReport = () => {
    setReportCompiling(true);
    setTimeout(() => {
      setCompiledReport({
        id: `REP-${Math.floor(100000 + Math.random() * 900000)}`,
        generatedAt: new Date().toLocaleString(),
        version: '1.0.4',
        auditorScope: 'Tenant Resource Auditing & Multi-jurisdictional Policy Assessment',
        passedCount: passedControls.length,
        failedCount: failedControls.length,
        overallScore: scores.overall,
        remediationPlan: failedControls.map(c => ({
          controlId: c.id,
          name: c.name,
          framework: c.framework.toUpperCase(),
          recommendation: 
            c.id === 'GDPR-1' ? 'Create and publish an updated organizational DPIA log, ensuring it maps to current data architectures.' :
            c.id === 'GDPR-2' ? 'Modify key vault networking configuration block to disable public interfaces. Bind to local service endpoint.' :
            c.id === 'HIPAA-1' ? 'Configure diagnostic settings on SQL Server to stream encryption activity logs directly to Azure Activity Monitor.' :
            c.id === 'HIPAA-2' ? 'Establish automatic database snapshot policies and secure replicas in regional pairs.' :
            c.id === 'SOC2-1' ? 'Restrict network security group outbound ports. Block all unauthorized SSH/RDP targets.' :
            'Conduct access review lifecycle audit and remove redundant account mappings.'
        }))
      });

      setReportCompiling(false);

      addActivity({
        operation: 'Compile System Compliance Report',
        caller: 'Report-Compilation-Service',
        resource: 'Azure Synapse / PDF Compiler',
        status: 'Success'
      });
    }, 2000);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Report Generator</h1>
          <p className="page-subtitle">Compile formal compliance reports, analyze gaps, and retrieve audit recommendations</p>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Actions panel */}
        <div className="card" style={{ flex: 1, backgroundColor: '#111827', height: 'fit-content' }}>
          <div className="card-title">
            <FileCheck size={18} color="#0078d4" />
            <span>Audit Control Room</span>
          </div>
          
          <p style={styles.descText}>
            Compile policy results, telemetry data streams (Activity Logs), and uploaded file proofs into a validated compliance report.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={compileAuditReport}
              disabled={reportCompiling}
            >
              {reportCompiling ? 'Compiling Audit Report...' : 'Compile Compliance Report'}
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => {
                if (!compiledReport) {
                  alert('Please compile the report first before sharing.');
                  return;
                }
                addActivity({
                  operation: 'Export Compliance Metadata to GRC tools',
                  caller: 'GRC-Exporter',
                  resource: 'ServiceNow/RSA Archer Link',
                  status: 'Success'
                });
                alert('Exported report tokens to external GRC tools successfully!');
              }}
            >
              <Share2 size={14} /> Export to GRC & Legal Tools
            </button>
          </div>
        </div>

        {/* Live report output */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {reportCompiling && (
            <div className="card" style={styles.loaderCard}>
              <div style={styles.spinner}></div>
              <span style={{ fontSize: '0.9rem', color: '#9ca3af', fontWeight: '500' }}>
                Fetching Synapse log tables... Processing data lineage maps... Validating digital signatures...
              </span>
            </div>
          )}

          {!reportCompiling && !compiledReport && (
            <div className="card" style={styles.emptyReportState}>
              <FileText size={48} color="#374151" style={{ marginBottom: '1rem' }} />
              <h3>Report Console Idle</h3>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem', maxWidth: '300px' }}>
                Click "Compile Compliance Report" to fetch the latest control audit checks.
              </p>
            </div>
          )}

          {!reportCompiling && compiledReport && (
            <div className="card" style={styles.reportCard}>
              {/* Report Header */}
              <div style={styles.reportHeader}>
                <div>
                  <h2 style={{ fontSize: '1.25rem' }}>System Audit & Compliance Certification</h2>
                  <span style={styles.reportMeta}>Report ID: {compiledReport.id} | Generated: {compiledReport.generatedAt}</span>
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                  onClick={() => alert('PDF compiled locally and downloaded (simulated)!')}
                >
                  <Download size={12} /> Download PDF
                </button>
              </div>

              {/* Stats overview */}
              <div style={styles.reportStatsRow}>
                <div style={styles.reportStat}>
                  <span style={styles.reportStatLbl}>Compliance Score</span>
                  <span style={{ ...styles.reportStatVal, color: compiledReport.overallScore >= 85 ? '#4ade80' : '#fb923c' }}>
                    {compiledReport.overallScore}%
                  </span>
                </div>
                <div style={styles.reportStat}>
                  <span style={styles.reportStatLbl}>Passed Controls</span>
                  <span style={{ ...styles.reportStatVal, color: '#4ade80' }}>{compiledReport.passedCount}</span>
                </div>
                <div style={styles.reportStat}>
                  <span style={styles.reportStatLbl}>Failed Controls</span>
                  <span style={{ ...styles.reportStatVal, color: compiledReport.failedCount > 0 ? '#f87171' : '#4ade80' }}>
                    {compiledReport.failedCount}
                  </span>
                </div>
              </div>

              {/* Risk Mitigation Engine */}
              <div style={styles.mitigationPanel}>
                <h3 style={styles.mitigationHeading}>
                  <Zap size={16} color="#fb923c" />
                  Gap Analysis & Mitigation Recommendations
                </h3>

                {compiledReport.failedCount === 0 ? (
                  <div style={styles.noRemediations}>
                    <CheckCircle size={16} color="#4ade80" />
                    No gaps identified. The system strictly adheres to all evaluated GDPR, HIPAA, SOC 2, and ISO 27001 policies.
                  </div>
                ) : (
                  <div style={styles.remediationsList}>
                    {compiledReport.remediationPlan.map((plan, idx) => (
                      <div key={idx} style={styles.remediationItem}>
                        <div style={styles.remediationMeta}>
                          <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>{plan.controlId}</span>
                          <span style={styles.remediationFramework}>{plan.framework}</span>
                        </div>
                        <h4 style={styles.remediationTitle}>{plan.name}</h4>
                        <p style={styles.remediationText}>
                          <strong>Mitigation Plan:</strong> {plan.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  grid: {
    display: 'flex',
    gap: '1.5rem',
    flexDirection: 'row',
  },
  descText: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    lineHeight: '1.5',
  },
  loaderCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: '4rem 2rem',
    textAlign: 'center',
    backgroundColor: '#111827',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.05)',
    borderTop: '4px solid #0078d4',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyReportState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 2rem',
    backgroundColor: '#111827',
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: '#111827',
    padding: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  reportMeta: {
    fontSize: '0.75rem',
    color: '#6b7280',
    display: 'block',
    marginTop: '0.25rem',
    fontFamily: 'var(--font-mono)',
  },
  reportStatsRow: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  reportStat: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  reportStatLbl: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    fontWeight: '600',
  },
  reportStatVal: {
    fontSize: '1.75rem',
    fontWeight: '800',
  },
  mitigationPanel: {
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '1.5rem',
  },
  mitigationHeading: {
    fontSize: '1rem',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  noRemediations: {
    backgroundColor: 'rgba(16, 124, 65, 0.05)',
    border: '1px solid rgba(16, 124, 65, 0.15)',
    borderRadius: 'var(--radius-sm)',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.85rem',
    color: '#4ade80',
  },
  remediationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  remediationItem: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 'var(--radius-sm)',
    padding: '1rem',
  },
  remediationMeta: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    marginBottom: '0.35rem',
  },
  remediationFramework: {
    fontSize: '0.65rem',
    color: '#9ca3af',
    fontWeight: '500',
  },
  remediationTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '0.5rem',
  },
  remediationText: {
    fontSize: '0.85rem',
    color: '#e2e8f0',
    lineHeight: '1.4',
  }
};

export default ReportGenerator;
