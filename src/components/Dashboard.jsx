import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Bell, 
  Activity, 
  Award,
  ChevronRight
} from 'lucide-react';

const Dashboard = ({ 
  scores, 
  controls, 
  alerts, 
  activities, 
  tasks, 
  runScan, 
  isScanning,
  setActiveTab 
}) => {
  
  // Calculations
  const totalControlsCount = controls.length;
  const passedControlsCount = controls.filter(c => c.status === 'passed').length;
  const failedControlsCount = controls.filter(c => c.status === 'failed').length;
  const completionRate = totalControlsCount > 0 ? Math.round((passedControlsCount / totalControlsCount) * 100) : 0;
  
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;

  const scoreColor = (score) => {
    if (score >= 85) return '#107c41'; // Green
    if (score >= 60) return '#d83b01'; // Amber
    return '#a80000'; // Red
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Dashboard</h1>
          <p className="page-subtitle">Continuous organizational compliance assessment across multiple jurisdictions</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={runScan}
          disabled={isScanning}
          style={{ height: '40px' }}
        >
          <RefreshCw size={16} className={isScanning ? 'animate-spin' : ''} />
          {isScanning ? 'Running Automated Checks...' : 'Scan Resources'}
        </button>
      </div>

      {/* Stats row */}
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div>
            <div style={styles.statHeader}>
              <span style={styles.statTitle}>Overall Score</span>
              <ShieldCheck size={20} color="#107c41" />
            </div>
            <div className="stat-value" style={{ color: scoreColor(scores.overall) }}>
              {scores.overall}%
            </div>
          </div>
          <div style={styles.statFooter}>
            <span style={styles.statTrend}>{passedControlsCount} of {totalControlsCount} controls passed</span>
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div style={styles.statHeader}>
              <span style={styles.statTitle}>Non-Compliant</span>
              <AlertTriangle size={20} color="#d83b01" />
            </div>
            <div className="stat-value" style={{ color: failedControlsCount > 0 ? '#f87171' : '#107c41' }}>
              {failedControlsCount}
            </div>
          </div>
          <div style={styles.statFooter}>
            <span style={styles.statTrend}>{failedControlsCount > 0 ? 'Action required immediately' : 'System is fully compliant'}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div style={styles.statHeader}>
              <span style={styles.statTitle}>Pending Tasks</span>
              <Clock size={20} color="#0078d4" />
            </div>
            <div className="stat-value" style={{ color: '#0078d4' }}>
              {pendingTasks}
            </div>
          </div>
          <div style={styles.statFooter}>
            <span style={styles.statTrend}><span style={{ color: '#f87171' }}>{overdueTasks} tasks</span> are currently overdue</span>
          </div>
        </div>

        <div className="card stat-card">
          <div>
            <div style={styles.statHeader}>
              <span style={styles.statTitle}>Framework Coverage</span>
              <Award size={20} color="#c084fc" />
            </div>
            <div className="stat-value" style={{ color: '#c084fc' }}>
              4 / 4
            </div>
          </div>
          <div style={styles.statFooter}>
            <span style={styles.statTrend}>GDPR, HIPAA, SOC 2, ISO 27001</span>
          </div>
        </div>
      </div>

      {/* Framework specific cards */}
      <div style={styles.frameworkContainer}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={20} color="#0078d4" />
          Regulatory Frameworks Scorecard
        </h2>
        <div style={styles.frameworkGrid}>
          {Object.entries(scores).map(([name, score]) => {
            if (name === 'overall') return null;
            return (
              <div 
                key={name} 
                className="card" 
                style={styles.frameworkCard}
                onClick={() => setActiveTab('compliance')}
              >
                <div style={styles.frameworkCardLeft}>
                  <span style={styles.frameworkName}>{name.toUpperCase()}</span>
                  <span style={styles.frameworkDesc}>
                    {name === 'gdpr' && 'General Data Protection Regulation'}
                    {name === 'hipaa' && 'Health Insurance Portability & Accountability'}
                    {name === 'soc2' && 'Service Organization Control 2'}
                    {name === 'iso27001' && 'Information Security Management'}
                  </span>
                </div>
                <div style={styles.frameworkCardRight}>
                  <div 
                    style={{ 
                      ...styles.scoreRing, 
                      borderColor: scoreColor(score),
                      boxShadow: `0 0 10px ${scoreColor(score)}40`
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', fontWeight: '700', color: scoreColor(score) }}>
                      {score}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two column detail panel */}
      <div style={styles.detailsGrid}>
        {/* Active Alerts Panel */}
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="#fb923c" />
              <span>Compliance Alerts</span>
            </div>
            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
              Azure Notification Hub
            </span>
          </div>
          
          <div style={styles.alertsList}>
            {alerts.length === 0 ? (
              <div style={styles.emptyState}>No active alerts. System status is normal.</div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} style={styles.alertItem}>
                  <div style={{ ...styles.alertDot, backgroundColor: alert.severity === 'high' ? '#f87171' : '#fb923c' }} />
                  <div style={styles.alertContent}>
                    <div style={styles.alertHeader}>
                      <span style={styles.alertTitleText}>{alert.title}</span>
                      <span style={styles.alertTime}>{alert.timestamp}</span>
                    </div>
                    <p style={styles.alertDescText}>{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Activity & Audit Trail */}
        <div className="card" style={{ flex: 1 }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#0078d4" />
              <span>Audit Trail & Activity Log</span>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
              Azure Activity Log
            </span>
          </div>

          <div style={styles.activitiesList}>
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} style={styles.activityItem}>
                <div style={styles.activityMeta}>
                  <span style={styles.activityTimestamp}>{act.timestamp}</span>
                  <span className={`badge ${act.status === 'Success' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
                    {act.status}
                  </span>
                </div>
                <div style={styles.activityText}>
                  <strong>{act.operation}</strong> by <span style={{ color: '#0078d4', fontFamily: 'var(--font-mono)' }}>{act.caller}</span>
                  <div style={styles.activityResource}>{act.resource}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statFooter: {
    marginTop: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  statTrend: {
    fontSize: '0.8rem',
    color: '#9ca3af',
  },
  frameworkContainer: {
    marginBottom: '2rem',
  },
  frameworkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.25rem',
  },
  '@media (max-width: 1024px)': {
    frameworkGrid: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    }
  },
  frameworkCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem',
    cursor: 'pointer',
    backgroundColor: '#111827',
  },
  frameworkCardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  frameworkName: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  frameworkDesc: {
    fontSize: '0.7rem',
    color: '#9ca3af',
    maxWidth: '140px',
    lineHeight: '1.3',
  },
  frameworkCardRight: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRing: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    border: '3.5px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  '@media (max-width: 900px)': {
    detailsGrid: {
      gridTemplateColumns: '1fr',
    }
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.9rem',
    fontStyle: 'italic',
  },
  alertItem: {
    display: 'flex',
    gap: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem',
  },
  alertDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginTop: '5px',
    flexShrink: 0,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.2rem',
  },
  alertTitleText: {
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#ffffff',
  },
  alertTime: {
    fontSize: '0.7rem',
    color: '#6b7280',
    fontFamily: 'var(--font-mono)',
  },
  alertDescText: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    lineHeight: '1.4',
  },
  activitiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  activityItem: {
    borderLeft: '2px solid rgba(255, 255, 255, 0.05)',
    paddingLeft: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  activityMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTimestamp: {
    fontSize: '0.7rem',
    color: '#6b7280',
    fontFamily: 'var(--font-mono)',
  },
  activityText: {
    fontSize: '0.8rem',
    color: '#e2e8f0',
    lineHeight: '1.4',
  },
  activityResource: {
    fontSize: '0.7rem',
    color: '#6b7280',
    marginTop: '0.15rem',
    fontFamily: 'var(--font-mono)',
  }
};

export default Dashboard;
