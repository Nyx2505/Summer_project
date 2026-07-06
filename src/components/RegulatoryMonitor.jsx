import React, { useState } from 'react';
import { 
  Rss, 
  ArrowRight, 
  Activity, 
  Layers, 
  Check, 
  Globe,
  TrendingDown
} from 'lucide-react';

const RegulatoryMonitor = ({ 
  updates, 
  processUpdate,
  addActivity,
  addAlert 
}) => {
  const [activeSubTab, setActiveSubTab] = useState('unprocessed');

  const filteredUpdates = updates.filter(u => 
    activeSubTab === 'processed' ? u.processed : !u.processed
  );

  const handleIngestion = (update) => {
    // 1. Process local updates
    processUpdate(update.id);
    
    // 2. Alert & Logs logs
    addActivity({
      operation: `Ingest Regulatory Update: ${update.title.slice(0, 30)}...`,
      caller: 'Feed-Ingestor-Service',
      resource: 'Azure SQL Database',
      status: 'Success'
    });

    addAlert({
      title: 'New Regulation Ingested',
      message: `Framework update applied for ${update.framework.toUpperCase()}. Organizational impact analysis required.`,
      severity: 'medium',
      timestamp: new Date().toLocaleTimeString()
    });

    alert(`Successfully ingested regulatory change for ${update.framework.toUpperCase()}! Policy checks triggered.`);
  };

  const getJurisdictionLabel = (jurisdiction) => {
    switch (jurisdiction) {
      case 'EU':
        return <span style={styles.jurisdictionBadge}><Globe size={10} /> EU (GDPR)</span>;
      case 'US':
        return <span style={styles.jurisdictionBadge}><Globe size={10} /> USA (HIPAA/SOC2)</span>;
      case 'Global':
        return <span style={styles.jurisdictionBadge}><Globe size={10} /> Global (ISO)</span>;
      default:
        return <span style={styles.jurisdictionBadge}><Globe size={10} /> Global</span>;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Regulatory Change Monitor</h1>
          <p className="page-subtitle">Continuous feed monitoring for regulatory updates, policy modifications, and laws</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsRow}>
        <button 
          onClick={() => setActiveSubTab('unprocessed')}
          style={{ ...styles.tabBtn, ...(activeSubTab === 'unprocessed' ? styles.tabBtnActive : {}) }}
        >
          Unprocessed Feeds ({updates.filter(u => !u.processed).length})
        </button>
        <button 
          onClick={() => setActiveSubTab('processed')}
          style={{ ...styles.tabBtn, ...(activeSubTab === 'processed' ? styles.tabBtnActive : {}) }}
        >
          Ingested & Evaluated ({updates.filter(u => u.processed).length})
        </button>
      </div>

      {/* Feed Stream */}
      <div style={styles.feedStream}>
        {filteredUpdates.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: '#6b7280' }}>
            {activeSubTab === 'processed' 
              ? 'No processed regulatory updates found.' 
              : 'All regulatory changes have been ingested and verified. System is synchronized.'}
          </div>
        ) : (
          filteredUpdates.map((update) => (
            <div key={update.id} className="card" style={styles.updateCard}>
              <div style={styles.cardHeader}>
                <div style={styles.metaRow}>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{update.framework.toUpperCase()}</span>
                  {getJurisdictionLabel(update.jurisdiction)}
                  <span style={styles.dateLabel}>{update.date}</span>
                </div>
                {!update.processed ? (
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => handleIngestion(update)}
                  >
                    Ingest & Assess Impact <ArrowRight size={14} />
                  </button>
                ) : (
                  <span className="badge badge-success" style={{ gap: '0.2rem' }}>
                    <Check size={12} /> Sync Ingested
                  </span>
                )}
              </div>

              <h3 style={styles.cardTitle}>{update.title}</h3>
              <p style={styles.cardDesc}>{update.summary}</p>
              
              <div style={styles.impactBox}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fb923c', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  <TrendingDown size={14} />
                  Impacted Compliance Controls
                </div>
                <div style={styles.controlLinkRow}>
                  {update.affectedControls.map(cId => (
                    <span key={cId} style={styles.affectedControlBadge}>{cId}</span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  tabsRow: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '1.5rem',
    paddingBottom: '0.1rem',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '0.6rem 1rem',
    color: '#9ca3af',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  tabBtnActive: {
    color: '#ffffff',
    borderColor: '#0078d4',
    fontWeight: '600',
  },
  feedStream: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  updateCard: {
    backgroundColor: '#111827',
    padding: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    gap: '1rem',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  dateLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  jurisdictionBadge: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: '0.1rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '0.5rem',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    lineHeight: '1.5',
    marginBottom: '1rem',
  },
  impactBox: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem',
  },
  controlLinkRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginTop: '0.25rem',
  },
  affectedControlBadge: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-mono)',
    backgroundColor: 'rgba(216, 59, 1, 0.05)',
    border: '1px solid rgba(216, 59, 1, 0.15)',
    color: '#fb923c',
    padding: '0.1rem 0.4rem',
    borderRadius: 'var(--radius-sm)',
  }
};

export default RegulatoryMonitor;
