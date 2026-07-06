import React, { useState } from 'react';
import { 
  FolderLock, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Link, 
  Activity, 
  Check,
  Lock
} from 'lucide-react';

const EvidenceLocker = ({ 
  controls, 
  linkEvidence, 
  addActivity 
}) => {
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceType, setEvidenceType] = useState('log');
  const [selectedControlId, setSelectedControlId] = useState('');
  
  // Local list of uploaded files (simulated database)
  const [files, setFiles] = useState([
    { id: 'ev-1', name: 'Azure_KeyVault_Logging_Config.json', type: 'config', size: '12 KB', uploadedAt: '2026-07-06 14:12', linkedControl: 'GDPR-2' },
    { id: 'ev-2', name: 'Internal_Privacy_DPIA_V1.pdf', type: 'policy', size: '2.4 MB', uploadedAt: '2026-07-05 10:30', linkedControl: 'GDPR-1' },
    { id: 'ev-3', name: 'NSG_Rules_Prod_Audit.txt', type: 'log', size: '45 KB', uploadedAt: '2026-07-04 18:22', linkedControl: 'SOC2-1' }
  ]);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!evidenceName || !selectedControlId) return;

    const newFile = {
      id: `ev-${Date.now()}`,
      name: evidenceName,
      type: evidenceType,
      size: `${Math.round(Math.random() * 200) + 1} KB`,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      linkedControl: selectedControlId
    };

    // 1. Add to files array
    setFiles([newFile, ...files]);
    
    // 2. Link in compliance state
    linkEvidence(selectedControlId, evidenceName);

    // 3. Log activity
    addActivity({
      operation: `Upload compliance evidence: ${evidenceName}`,
      caller: 'Security-Audit-User',
      resource: 'Azure SQL Database / EvidenceLocker',
      status: 'Success'
    });

    setEvidenceName('');
    setSelectedControlId('');
    alert(`Evidence file uploaded and linked to control ${selectedControlId}! Score updated.`);
  };

  const deleteFile = (fId, cId) => {
    setFiles(files.filter(f => f.id !== fId));
    if (cId) {
      linkEvidence(cId, null); // Unlink in controls
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Evidence Locker & Documentation</h1>
          <p className="page-subtitle">Secure storage, audit evidence uploads, and resource control linkage mapping</p>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Upload Panel */}
        <div className="card" style={{ flex: 1, backgroundColor: '#111827' }}>
          <div className="card-title">
            <UploadCloud size={18} color="#0078d4" />
            <span>Upload Audit Evidence</span>
          </div>

          <form onSubmit={handleUpload} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Document / File Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. storage_account_rules.json" 
                value={evidenceName}
                onChange={(e) => setEvidenceName(e.target.value)}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Evidence Category</label>
              <select 
                className="form-select"
                value={evidenceType}
                onChange={(e) => setEvidenceType(e.target.value)}
              >
                <option value="log">Telemetry Log (.json, .txt)</option>
                <option value="policy">Policy Document (.pdf, .md)</option>
                <option value="config">System Configuration (.yaml, .tf)</option>
                <option value="audit">Previous Audit Report (.docx)</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Link to Compliance Control</label>
              <select 
                className="form-select"
                value={selectedControlId}
                onChange={(e) => setSelectedControlId(e.target.value)}
                required
              >
                <option value="">-- Choose Control --</option>
                {controls.map((ctrl) => (
                  <option key={ctrl.id} value={ctrl.id}>
                    [{ctrl.framework.toUpperCase()}] {ctrl.id} - {ctrl.name.slice(0, 35)}...
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              <Lock size={14} /> Encrypt & Store Evidence
            </button>
          </form>

          {/* Catalog info */}
          <div style={styles.catalogBox}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Activity size={12} />
              Azure Data Factory Ingestion
            </span>
            <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem', lineHeight: '1.4' }}>
              Files uploaded here are cataloged by ADF pipelines. Lineage maps sources (Evidence Locker Blob Store) to final compliance report nodes.
            </p>
          </div>
        </div>

        {/* Uploaded Files Table */}
        <div className="card" style={{ flex: 1.8, backgroundColor: '#111827' }}>
          <div className="card-title">
            <FolderLock size={18} color="#0078d4" />
            <span>Encrypted Storage Locker</span>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>File Name</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Size</th>
                  <th style={styles.th}>Linked Control</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.fileNameCell}>
                        <FileText size={16} color="#60a5fa" />
                        <span style={styles.fileName}>{file.name}</span>
                      </div>
                      <span style={styles.fileDate}>{file.uploadedAt}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.typeLabel}>{file.type}</span>
                    </td>
                    <td style={styles.td}>{file.size}</td>
                    <td style={styles.td}>
                      <span style={styles.linkedBadge}>
                        <Link size={10} /> {file.linkedControl}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => deleteFile(file.id, file.linkedControl)}
                        style={styles.deleteBtn}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '0.75rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    fontWeight: '600',
  },
  catalogBox: {
    marginTop: '1.5rem',
    padding: '0.75rem',
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
    border: '1px solid rgba(96, 165, 250, 0.1)',
    borderRadius: 'var(--radius-sm)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  th: {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    color: '#9ca3af',
    fontWeight: '600',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  td: {
    padding: '0.75rem 1rem',
    verticalAlign: 'middle',
  },
  fileNameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  fileName: {
    fontWeight: '500',
    color: '#ffffff',
  },
  fileDate: {
    fontSize: '0.7rem',
    color: '#6b7280',
    display: 'block',
    marginTop: '0.15rem',
    fontFamily: 'var(--font-mono)',
  },
  typeLabel: {
    fontSize: '0.7rem',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '0.1rem 0.4rem',
    borderRadius: 'var(--radius-sm)',
    color: '#9ca3af',
    textTransform: 'uppercase',
  },
  linkedBadge: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    backgroundColor: 'rgba(0, 120, 212, 0.08)',
    border: '1px solid rgba(0, 120, 212, 0.2)',
    color: '#60a5fa',
    padding: '0.1rem 0.4rem',
    borderRadius: 'var(--radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.2rem',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0.3rem',
    borderRadius: 'var(--radius-sm)',
    transition: 'all 0.15s ease',
  }
};

export default EvidenceLocker;
