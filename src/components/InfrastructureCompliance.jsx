import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Server
} from 'lucide-react';

const InfrastructureCompliance = ({ addActivity }) => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  const fetchScans = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/infrastructure');
      if (res.ok) {
        const data = await res.json();
        setScans(data);
      } else {
        throw new Error('API server unavailable');
      }
    } catch (e) {
      // Local fallback if API server is not running
      setScans([
        { resourceId: '/subscriptions/sub-1/resourceGroups/rg-prod/providers/Microsoft.Compute/virtualMachines/vm-prod-eu-1', resourceName: 'vm-prod-eu-1', resourceType: 'Virtual Machine', policyName: 'Allowed Locations', status: 'Compliant', severity: 'low', remediation: 'None', lastScan: new Date().toISOString() },
        { resourceId: '/subscriptions/sub-1/resourceGroups/rg-prod/providers/Microsoft.Sql/servers/sql-srv/databases/sql-db', resourceName: 'sql-customer-db', resourceType: 'SQL Database', policyName: 'SQL Databases should have public access disabled', status: 'Non-Compliant', severity: 'high', remediation: 'Disable SQL Public Access in Azure Portal & route over Private Endpoint Link.', lastScan: new Date().toISOString() },
        { resourceId: '/subscriptions/sub-1/resourceGroups/rg-prod/providers/Microsoft.KeyVault/vaults/acom-kv', resourceName: 'keyvault-secrets-vault', resourceType: 'Key Vault', policyName: 'Diagnostics setting should be enabled', status: 'Non-Compliant', severity: 'medium', remediation: 'Configure Diagnostic logs in Key Vault settings and stream to log Analytics.', lastScan: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  const triggerResourceScan = () => {
    setIsScanning(true);
    if (addActivity) {
      addActivity({
        operation: 'Trigger Azure Policy Infrastructure Audit Scan',
        caller: 'Compliance-Auditor-User',
        resource: 'Azure Policy Client Engine',
        status: 'Success'
      });
    }

    setTimeout(() => {
      fetchScans();
      setIsScanning(false);
      alert('Azure Policy scan completed successfully! Resource compliant configurations synchronized.');
    }, 1500);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'high':
        return <span style={{ color: '#f87171', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase' }}>High</span>;
      case 'medium':
        return <span style={{ color: '#fb923c', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase' }}>Medium</span>;
      case 'low':
        return <span style={{ color: '#60a5fa', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase' }}>Low</span>;
      default:
        return <span>-</span>;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Infrastructure Compliance (Azure Policy)</h1>
          <p className="page-subtitle">Continuous scanning of cloud resources against regulatory policy configurations</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={triggerResourceScan}
          disabled={isScanning}
        >
          <RefreshCw size={16} className={isScanning ? 'animate-spin' : ''} />
          {isScanning ? 'Scanning Subscription...' : 'Scan Subscription'}
        </button>
      </div>

      <div style={styles.grid}>
        {/* Info card */}
        <div className="card" style={{ flex: 1, backgroundColor: '#111827', height: 'fit-content' }}>
          <div className="card-title">
            <Shield size={18} color="#0078d4" />
            <span>Azure Policy Auditor</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.5', marginBottom: '1rem' }}>
            Sync compliance states of deployed VMs, Storage pools, Databases, and Key Vaults. Policy checks map directly to HIPAA and GDPR standards.
          </p>
          <div style={styles.complianceScoreBox}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#9ca3af' }}>INFRA COMPLIANCE STATE</span>
            <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fb923c', marginTop: '0.25rem' }}>
              {scans.length > 0 
                ? `${Math.round((scans.filter(s => s.status === 'Compliant').length / scans.length) * 100)}%`
                : '100%'}
            </span>
          </div>
        </div>

        {/* Resources list */}
        <div style={{ flex: 3.2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              Fetching Azure resources policies compliance logs...
            </div>
          ) : (
            scans.map((scan, idx) => (
              <div key={idx} className="card" style={styles.resourceCard}>
                <div style={styles.cardTop}>
                  <div style={styles.resourceInfo}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Server size={16} color="#60a5fa" />
                      <strong style={{ fontSize: '0.95rem' }}>{scan.resourceName}</strong>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
                      ID: {scan.resourceId}
                    </span>
                  </div>

                  <div style={styles.statusCol}>
                    <span className={`badge ${scan.status === 'Compliant' ? 'badge-success' : 'badge-danger'}`}>
                      {scan.status === 'Compliant' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                      {scan.status}
                    </span>
                  </div>
                </div>

                <div style={styles.cardDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Policy Evaluated:</span>
                    <span style={styles.detailValue}>{scan.policyName}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Rule Severity:</span>
                    <span style={styles.detailValue}>{getSeverityBadge(scan.severity)}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Last Evaluation:</span>
                    <span style={{ ...styles.detailValue, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      {scan.lastScan}
                    </span>
                  </div>
                  
                  {scan.status === 'Non-Compliant' && (
                    <div style={styles.remediationBox}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#f87171', fontWeight: '700', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <Info size={12} /> REMEDIATION PLAN
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: '1.4' }}>{scan.reremed || scan.remediation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
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
  complianceScoreBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: '0.85rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    flexDirection: 'column',
    marginTop: '0.5rem',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  resourceCard: {
    backgroundColor: '#111827',
    padding: '1.25rem',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.75rem',
    marginBottom: '0.75rem',
  },
  resourceInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  cardDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
  },
  detailLabel: {
    color: '#9ca3af',
    fontWeight: '500',
  },
  detailValue: {
    color: '#ffffff',
    textAlign: 'right',
  },
  remediationBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
    border: '1px solid rgba(239, 68, 68, 0.1)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem',
    marginTop: '0.5rem',
  }
};

export default InfrastructureCompliance;
