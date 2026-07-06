import React from 'react';
import { 
  LayoutDashboard, 
  Network, 
  ShieldAlert, 
  Rss, 
  Calendar, 
  FileText, 
  FolderLock, 
  Cloud,
  Layers,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'architecture', label: 'Azure Architecture', icon: Network },
    { id: 'compliance', label: 'Compliance Assessor', icon: ShieldAlert },
    { id: 'infra', label: 'Infra Compliance', icon: ShieldCheck },
    { id: 'regulatory', label: 'Regulatory Monitor', icon: Rss },
    { id: 'timeline', label: 'Timeline & Deadlines', icon: Calendar },
    { id: 'evidence', label: 'Evidence Locker', icon: FolderLock },
    { id: 'reports', label: 'Report Generator', icon: FileText },
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles },
    { id: 'deployment', label: 'Azure Blueprints', icon: Cloud },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <Layers size={26} color="#0078d4" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 120, 212, 0.6))' }} />
        <div style={styles.brandText}>
          <span style={styles.brandTitle}>ACOM</span>
          <span style={styles.brandSubtitle}>Compliance Platform</span>
        </div>
      </div>
      
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
              className="nav-btn"
            >
              <Icon 
                size={18} 
                style={{ 
                  color: isActive ? '#0078d4' : '#9ca3af',
                  transition: 'color 0.2s ease'
                }} 
              />
              <span style={styles.navLabel}>{item.label}</span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <div style={styles.creditBadge}>
          <span style={styles.creditTitle}>Azure Credit Budget</span>
          <div style={styles.creditStats}>
            <span style={styles.creditValue}>0 / 180</span>
            <span style={styles.creditUnit}>credits used</span>
          </div>
          <div style={styles.progressBarBg}>
            <div style={styles.progressBarFill}></div>
          </div>
          <span style={styles.creditDisclaimer}>Local Simulation Active</span>
        </div>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#111827',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '1.5rem 1rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.75rem 1.5rem 0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '1.5rem',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    fontFamily: 'var(--font-heading)',
    color: '#ffffff',
    letterSpacing: '0.05em',
  },
  brandSubtitle: {
    fontSize: '0.7rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
    padding: '0.75rem 0.85rem',
    background: 'none',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: '#9ca3af',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    position: 'relative',
    width: '100%',
  },
  navItemActive: {
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  navLabel: {
    flex: 1,
  },
  activeIndicator: {
    position: 'absolute',
    left: '0',
    top: '25%',
    height: '50%',
    width: '3px',
    backgroundColor: '#0078d4',
    borderRadius: 'var(--radius-full)',
    boxShadow: '0 0 8px rgba(0, 120, 212, 0.8)',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  creditBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: 'var(--radius-md)',
    padding: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  creditTitle: {
    fontSize: '0.7rem',
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  creditStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  creditValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#34d399',
  },
  creditUnit: {
    fontSize: '0.65rem',
    color: '#6b7280',
  },
  progressBarBg: {
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    width: '2%',
    backgroundColor: '#34d399',
    borderRadius: 'var(--radius-full)',
    boxShadow: '0 0 6px rgba(52, 211, 153, 0.5)',
  },
  creditDisclaimer: {
    fontSize: '0.65rem',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: '0.15rem',
    fontStyle: 'italic',
  }
};

export default Sidebar;
