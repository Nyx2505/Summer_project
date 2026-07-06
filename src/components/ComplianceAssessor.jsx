import React, { useState } from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  Search, 
  Check, 
  X,
  FileCheck,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

const ComplianceAssessor = ({ 
  controls, 
  toggleControlStatus, 
  scores, 
  setActiveTab 
}) => {
  const [selectedFramework, setSelectedFramework] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredControls = controls.filter(control => {
    const matchesFramework = selectedFramework === 'all' || control.framework === selectedFramework;
    const matchesSearch = control.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          control.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          control.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFramework && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'passed':
        return <span className="badge badge-success"><Check size={10} /> Passed</span>;
      case 'failed':
        return <span className="badge badge-danger"><X size={10} /> Failed</span>;
      default:
        return <span className="badge badge-warning">Unknown</span>;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return <span style={{ color: '#f87171', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>High</span>;
      case 'medium':
        return <span style={{ color: '#fb923c', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>Medium</span>;
      case 'low':
        return <span style={{ color: '#60a5fa', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>Low</span>;
      default:
        return <span>-</span>;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Continuous Compliance Assessor</h1>
          <p className="page-subtitle">Granular controls monitoring and regulatory compliance verification engine</p>
        </div>
      </div>

      {/* Scores Grid */}
      <div style={styles.scoreRow}>
        {Object.entries(scores).map(([name, val]) => (
          <div key={name} className="card" style={styles.scoreCard}>
            <span style={styles.scoreCardTitle}>{name === 'overall' ? 'System Overall' : name.toUpperCase()}</span>
            <span style={{ 
              fontSize: '1.75rem', 
              fontWeight: '800', 
              color: val >= 85 ? '#4ade80' : val >= 60 ? '#fb923c' : '#f87171' 
            }}>{val}%</span>
          </div>
        ))}
      </div>

      {/* Filters and Search Bar */}
      <div className="card" style={styles.filterCard}>
        <div style={styles.filtersWrapper}>
          <div style={styles.searchBox}>
            <Search size={16} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Search controls by ID, name, or key terms..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.selectWrapper}>
            <span style={styles.filterLabel}>Framework:</span>
            <select 
              className="form-select" 
              style={{ width: '150px', padding: '0.4rem 0.6rem' }}
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
            >
              <option value="all">All</option>
              <option value="gdpr">GDPR</option>
              <option value="hipaa">HIPAA</option>
              <option value="soc2">SOC 2</option>
              <option value="iso27001">ISO 27001</option>
            </select>
          </div>
        </div>
      </div>

      {/* Controls List */}
      <div style={styles.controlsList}>
        {filteredControls.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            No controls match the selected filters.
          </div>
        ) : (
          filteredControls.map((control) => (
            <div key={control.id} className="card" style={styles.controlCard}>
              <div style={styles.controlTop}>
                <div style={styles.controlInfo}>
                  <div style={styles.controlMeta}>
                    <span style={styles.controlId}>{control.id}</span>
                    <span style={styles.frameworkBadge}>{control.framework.toUpperCase()}</span>
                    <div style={styles.severityRow}>
                      <span style={{ color: '#6b7280' }}>Severity:</span> {getSeverityBadge(control.severity)}
                    </div>
                  </div>
                  <h3 style={styles.controlName}>{control.name}</h3>
                </div>

                <div style={styles.controlActions}>
                  {getStatusBadge(control.status)}
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                    onClick={() => toggleControlStatus(control.id)}
                  >
                    Toggle Status
                  </button>
                </div>
              </div>

              <p style={styles.controlDesc}>{control.description}</p>

              <div style={styles.controlFooter}>
                <div style={styles.evidenceSection}>
                  <FolderOpen size={14} color="#9ca3af" />
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    Evidence Collected:{' '}
                    {control.evidence ? (
                      <span style={{ color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>{control.evidence}</span>
                    ) : (
                      <span style={{ color: '#f87171', fontStyle: 'italic' }}>None (Failing Requirement)</span>
                    )}
                  </span>
                </div>

                {!control.evidence && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', display: 'flex', gap: '0.2rem' }}
                    onClick={() => setActiveTab('evidence')}
                  >
                    Upload Evidence
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  scoreRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  scoreCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '1rem 0.5rem',
    textAlign: 'center',
    backgroundColor: '#111827',
  },
  scoreCardTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  filterCard: {
    padding: '1rem',
    marginBottom: '1.5rem',
    backgroundColor: '#111827',
  },
  filtersWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  searchBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#0a0e1a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.4rem 0.75rem',
  },
  searchInput: {
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#ffffff',
    fontSize: '0.85rem',
    width: '100%',
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterLabel: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    fontWeight: '500',
  },
  controlsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  controlCard: {
    backgroundColor: '#111827',
    padding: '1.25rem',
    borderLeft: '4px solid rgba(255, 255, 255, 0.05)',
  },
  controlTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  controlInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  controlMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  controlId: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: '#0078d4',
    fontWeight: '600',
  },
  frameworkBadge: {
    fontSize: '0.65rem',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.1rem 0.4rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  severityRow: {
    fontSize: '0.75rem',
    display: 'flex',
    gap: '0.25rem',
  },
  controlName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  controlActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  controlDesc: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    lineHeight: '1.5',
    marginBottom: '1rem',
  },
  controlFooter: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '0.85rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evidenceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  }
};

export default ComplianceAssessor;
