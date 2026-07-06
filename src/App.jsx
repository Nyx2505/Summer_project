import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Architecture from './components/Architecture.jsx';
import ComplianceAssessor from './components/ComplianceAssessor.jsx';
import InfrastructureCompliance from './components/InfrastructureCompliance.jsx';
import RegulatoryMonitor from './components/RegulatoryMonitor.jsx';
import TimelineTracker from './components/TimelineTracker.jsx';
import EvidenceLocker from './components/EvidenceLocker.jsx';
import ReportGenerator from './components/ReportGenerator.jsx';
import AICopilot from './components/AICopilot.jsx';
import DeploymentBlueprints from './components/DeploymentBlueprints.jsx';
import { Sparkles, Key } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const initialControls = [
  { id: 'GDPR-1', framework: 'gdpr', name: 'Data Protection Impact Assessment (DPIA)', description: 'Establish system DPIA workflow logs detailing all personal information storage locations.', severity: 'high', status: 'passed', evidence: 'Internal_Privacy_DPIA_V1.pdf' },
  { id: 'GDPR-2', framework: 'gdpr', name: 'Encryption of Personal Data in Transit', description: 'Enforce transport layer security (TLS 1.2+) on all web API and database endpoints.', severity: 'high', status: 'passed', evidence: 'Azure_KeyVault_Logging_Config.json' },
  { id: 'GDPR-3', framework: 'gdpr', name: 'Right to Be Forgotten Process Integration', description: 'Create data purging pipelines in Azure SQL for deleting customer accounts.', severity: 'medium', status: 'passed', evidence: 'purge_stored_procedure.sql' },
  { id: 'HIPAA-1', framework: 'hipaa', name: 'Transmission Security & Telemetry Logging', description: 'Enable diagnostic settings on databases to track unauthorized record reads.', severity: 'high', status: 'failed', evidence: null },
  { id: 'HIPAA-2', framework: 'hipaa', name: 'Emergency Access Procedure Replicas', description: 'Maintain read-only data backups in geographically paired regions.', severity: 'high', status: 'passed', evidence: 'geo_replication_policy.json' },
  { id: 'HIPAA-3', framework: 'hipaa', name: 'Device and Media Controls Policy', description: 'Configure bitlocker encryption keys in KeyVault for VM disk drives.', severity: 'medium', status: 'passed', evidence: 'disk_encryption_set.tf' },
  { id: 'SOC2-1', framework: 'soc2', name: 'Network Security Perimeter Controls', description: 'Configure NSG security rules to restrict port 22/3389 inbound public routes.', severity: 'high', status: 'passed', evidence: 'NSG_Rules_Prod_Audit.txt' },
  { id: 'SOC2-2', framework: 'soc2', name: 'Multi-Factor Authentication Enforcement', description: 'Enforce MFA policies across Entra ID administrative roles.', severity: 'high', status: 'passed', evidence: 'mfa_conditional_access.json' },
  { id: 'SOC2-3', framework: 'soc2', name: 'Change Management Approval Tracking', description: 'Establish pull request approvals and build verification gates.', severity: 'medium', status: 'passed', evidence: 'release_pipeline_approvals.pdf' },
  { id: 'ISO-1', framework: 'iso27001', name: 'Access Control Policy Audit', description: 'Conduct monthly audits to remove inactive user logins from administrative groups.', severity: 'medium', status: 'failed', evidence: null },
  { id: 'ISO-2', framework: 'iso27001', name: 'Physical Safeguards for Assets', description: 'Enforce lock-box diagnostic alerts on physical rack assemblies.', severity: 'low', status: 'passed', evidence: 'rack_sensor_telemetry.yaml' },
  { id: 'ISO-3', framework: 'iso27001', name: 'Disaster Recovery Operations Plan', description: 'Establish automated failover procedures with simulated annual runs.', severity: 'high', status: 'passed', evidence: 'dr_failover_blueprint.pdf' }
];

const initialUpdates = [
  { id: 'up-1', framework: 'gdpr', jurisdiction: 'EU', date: '2026-07-05', title: 'EU-US Data Privacy Framework Security Upgrades', summary: 'The European Commission updated rules regarding data residency. Requires reviewing database diagnostic log exports to ensure IP address masking.', affectedControls: ['GDPR-1', 'GDPR-2'], processed: false },
  { id: 'up-2', framework: 'hipaa', jurisdiction: 'US', date: '2026-07-02', title: 'HHS HIPAA Security Rule Diagnostic Update', summary: 'New guidelines clarify telemetry log retention windows. Encryption check events must be preserved in a tamper-proof database audit log for a minimum of 7 years.', affectedControls: ['HIPAA-1'], processed: false },
  { id: 'up-3', framework: 'iso27001', jurisdiction: 'Global', date: '2026-06-28', title: 'ISO 27001:2025 Revision Publication', summary: 'Updates require systematic documentation of user credential lifecycles. System owners must automate inactive account removals within 90 days.', affectedControls: ['ISO-1'], processed: false }
];

const initialTasks = [
  { id: 't-1', text: 'Configure Diagnostic Log exports for SQL Database to Storage Account', framework: 'hipaa', deadline: '2026-07-15', status: 'pending' },
  { id: 't-2', text: 'Audit admin roles in Microsoft Entra ID and remove inactive users', framework: 'iso27001', deadline: '2026-07-04', status: 'overdue' },
  { id: 't-3', text: 'Conduct review of DPIA mapping rules', framework: 'gdpr', deadline: '2026-07-28', status: 'pending' }
];

const initialActivities = [
  { id: 'act-1', timestamp: '2026-07-06 15:30', operation: 'Recalculate Compliance Scores', caller: 'Azure Functions Engine', resource: 'Azure SQL / compliance-db', status: 'Success' },
  { id: 'act-2', timestamp: '2026-07-06 14:15', operation: 'Upload Evidence File (Azure_KeyVault_Logging_Config.json)', caller: 'Security-Audit-User', resource: 'Azure Blob Storage / EvidenceLocker', status: 'Success' },
  { id: 'act-3', timestamp: '2026-07-06 11:22', operation: 'Update NSG Rule Configuration', caller: 'Deployer-CI-CD', resource: 'Azure Policy / NetworkSettings', status: 'Success' }
];

const initialAlerts = [
  { id: 'al-1', title: 'HIPAA Audits Failed', message: 'Transmission Security log stream (HIPAA-1) is missing evidence tags.', severity: 'high', timestamp: '15:30:12' },
  { id: 'al-2', title: 'Overdue Deadline Alert', message: 'Access control audit (ISO-1) has passed its deadline.', severity: 'medium', timestamp: '12:05:42' }
];

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Authentication states (Enterprise Azure AD integration mockup)
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true so they can browse without mandatory gates
  const [user, setUser] = useState({ name: 'Default Enterprise Admin', role: 'Admin' });

  const [controls, setControls] = useState(initialControls);
  const [updates, setUpdates] = useState(initialUpdates);
  const [tasks, setTasks] = useState(initialTasks);
  const [activities, setActivities] = useState(initialActivities);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [scores, setScores] = useState({ overall: 83, gdpr: 100, hipaa: 66, soc2: 100, iso27001: 66 });
  const [isScanning, setIsScanning] = useState(false);

  // Authorization token builder for API endpoints
  const getAuthHeaders = () => {
    const roleKey = user ? user.role.toLowerCase().split(' ')[0] : 'admin';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${roleKey}`
    };
  };

  // Fetch initial telemetry from REST server
  const loadPlatformData = async () => {
    try {
      const h = getAuthHeaders();
      
      const resControls = await fetch(`${API_BASE}/controls`, { headers: h });
      if (resControls.ok) {
        const data = await resControls.json();
        setControls(data);
      }

      const resScores = await fetch(`${API_BASE}/scores`, { headers: h });
      if (resScores.ok) {
        const data = await resScores.json();
        setScores(data);
      }

      const resTasks = await fetch(`${API_BASE}/tasks`, { headers: h });
      if (resTasks.ok) {
        const data = await resTasks.json();
        setTasks(data);
      }

      const resActs = await fetch(`${API_BASE}/activities`, { headers: h });
      if (resActs.ok) {
        const data = await resActs.json();
        setActivities(data);
      }
    } catch (e) {
      console.warn('[API Resiliency Fallback] REST server is not running on port 5000. Operating in local-mode.', e.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPlatformData();
    }
  }, [isAuthenticated, user]);

  const calculateScores = (currentControls) => {
    const frameworks = ['gdpr', 'hipaa', 'soc2', 'iso27001'];
    const newScores = {};
    let overallSum = 0;

    frameworks.forEach(fw => {
      const fwControls = currentControls.filter(c => c.framework === fw);
      const passed = fwControls.filter(c => c.status === 'passed').length;
      const total = fwControls.length;
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
      
      newScores[fw] = percentage;
      overallSum += percentage;
    });

    newScores.overall = Math.round(overallSum / frameworks.length);
    setScores(newScores);
  };

  // Scan trigger
  const runScan = async () => {
    setIsScanning(true);
    
    addActivity({
      operation: 'Initiated System Policy Audit Scan',
      caller: user.name,
      resource: 'Azure Functions Scan Engine',
      status: 'Success'
    });

    try {
      const res = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const updatedScores = await res.json();
        setScores(updatedScores);
      }
    } catch (err) {
      // Local fallback calculation
      calculateScores(controls);
    }

    setTimeout(() => {
      setIsScanning(false);
      alert('Automated compliance scan completed. Scores and activity logs synchronized.');
    }, 1500);
  };

  // Helper activity builder
  const addActivity = async (act) => {
    const newAct = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      ...act
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const addAlert = (alertItem) => {
    const newAlert = {
      id: `al-${Date.now()}`,
      ...alertItem
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // Toggle control state manually
  const toggleControlStatus = async (id) => {
    let handledLocally = true;
    try {
      const res = await fetch(`${API_BASE}/controls/${id}/toggle`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setControls(prev => prev.map(c => c.id === id ? { ...c, status: data.status, evidence: data.status === 'failed' ? null : c.evidence } : c));
        setScores(data.scores);
        handledLocally = false;
      }
    } catch (e) {
      // API fallback
    }

    if (handledLocally) {
      const updated = controls.map(c => {
        if (c.id === id) {
          const nextStatus = c.status === 'passed' ? 'failed' : 'passed';
          addActivity({
            operation: `Override control status [${id}] to ${nextStatus.toUpperCase()}`,
            caller: user.name,
            resource: 'Azure SQL Database / ControlsTable',
            status: 'Success'
          });

          if (nextStatus === 'failed') {
            addAlert({
              title: `Control Breach: ${id}`,
              message: `Control ${c.name} was changed to NON-COMPLIANT. Action required.`,
              severity: 'high',
              timestamp: new Date().toLocaleTimeString()
            });
          }

          return { ...c, status: nextStatus, evidence: nextStatus === 'failed' ? null : c.evidence };
        }
        return c;
      });

      setControls(updated);
      calculateScores(updated);
    }
  };

  // Link uploaded evidence document
  const linkEvidence = async (id, fileName) => {
    let handledLocally = true;
    try {
      const res = await fetch(`${API_BASE}/controls/${id}/evidence`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ fileName })
      });
      if (res.ok) {
        const data = await res.json();
        setControls(prev => prev.map(c => c.id === id ? { ...c, status: 'passed', evidence: fileName } : c));
        setScores(data.scores);
        handledLocally = false;
      }
    } catch (e) {
      // API Fallback
    }

    if (handledLocally) {
      const updated = controls.map(c => {
        if (c.id === id) {
          return { ...c, evidence: fileName, status: fileName ? 'passed' : 'failed' };
        }
        return c;
      });

      setControls(updated);
      calculateScores(updated);
    }
  };

  // Ingest regulatory updates
  const processUpdate = (id) => {
    const updateItem = updates.find(u => u.id === id);
    if (!updateItem) return;

    setUpdates(prev => prev.map(u => u.id === id ? { ...u, processed: true } : u));

    const updatedControls = controls.map(c => {
      if (updateItem.affectedControls.includes(c.id)) {
        return { ...c, status: 'failed', evidence: null };
      }
      return c;
    });

    setControls(updatedControls);
    calculateScores(updatedControls);
  };

  // Tasks managers
  const addTask = async (task) => {
    let handledLocally = true;
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(task)
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [newTask, ...prev]);
        handledLocally = false;
      }
    } catch (e) {
      // API Fallback
    }

    if (handledLocally) {
      const newTask = {
        id: `t-${Date.now()}`,
        status: 'pending',
        ...task
      };
      setTasks(prev => [newTask, ...prev]);
    }
  };

  const toggleTaskStatus = async (id) => {
    const taskItem = tasks.find(t => t.id === id);
    if (!taskItem) return;
    const nextStatus = taskItem.status === 'completed' ? 'pending' : 'completed';

    let handledLocally = true;
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
        handledLocally = false;
      }
    } catch (e) {
      // API Fallback
    }

    if (handledLocally) {
      setTasks(prev => prev.map(t => {
        if (t.id === id) {
          addActivity({
            operation: `Update task status: ${t.text}`,
            caller: user.name,
            resource: 'Azure SQL Database / ChecklistTable',
            status: 'Success'
          });
          return { ...t, status: nextStatus };
        }
        return t;
      }));
    }
  };

  const deleteTask = async (id) => {
    let handledLocally = true;
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
        handledLocally = false;
      }
    } catch (e) {
      // API Fallback
    }

    if (handledLocally) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  // Render Azure AD Authentication Gate Mockup if signed out
  if (!isAuthenticated) {
    return (
      <div style={styles.authWrapper}>
        <div className="card" style={styles.authCard}>
          <div style={styles.authHeaderIcon}>
            <Key size={32} color="#0078d4" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 120, 212, 0.5))' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', textAlign: 'center', marginBottom: '0.5rem' }}>
            Microsoft Entra ID (Azure AD)
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', marginBottom: '1.5rem' }}>
            ACOM Security Portal Authentication Gate. Choose your enterprise role mapping:
          </p>
          <div style={styles.rolesGrid}>
            {['Admin', 'Compliance Officer', 'Auditor', 'Manager', 'Viewer'].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setUser({ name: `ACOM ${role} Member`, role });
                  setIsAuthenticated(true);
                }}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.75rem', justifyContent: 'flex-start' }}
              >
                <Sparkles size={14} color="#a5b4fc" />
                Sign in as {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {/* User Identity Profile Indicator */}
        <div style={styles.userProfileBanner}>
          <div style={styles.profileMeta}>
            <span style={styles.userName}>{user.name}</span>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{user.role}</span>
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
            onClick={() => setIsAuthenticated(false)}
          >
            Switch Profile
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <Dashboard 
            scores={scores}
            controls={controls}
            alerts={alerts}
            activities={activities}
            tasks={tasks}
            runScan={runScan}
            isScanning={isScanning}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'architecture' && (
          <Architecture 
            controls={controls}
            activities={activities}
            addActivity={addActivity}
            addAlert={addAlert}
            updateScores={() => calculateScores(controls)}
            runScan={runScan}
            isScanning={isScanning}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceAssessor 
            controls={controls}
            toggleControlStatus={toggleControlStatus}
            scores={scores}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'infra' && (
          <InfrastructureCompliance 
            addActivity={addActivity}
          />
        )}

        {activeTab === 'regulatory' && (
          <RegulatoryMonitor 
            updates={updates}
            processUpdate={processUpdate}
            addActivity={addActivity}
            addAlert={addAlert}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineTracker 
            tasks={tasks}
            addTask={addTask}
            toggleTaskStatus={toggleTaskStatus}
            deleteTask={deleteTask}
            addActivity={addActivity}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceLocker 
            controls={controls}
            linkEvidence={linkEvidence}
            addActivity={addActivity}
          />
        )}

        {activeTab === 'reports' && (
          <ReportGenerator 
            controls={controls}
            scores={scores}
            addActivity={addActivity}
          />
        )}

        {activeTab === 'copilot' && (
          <AICopilot />
        )}

        {activeTab === 'deployment' && (
          <DeploymentBlueprints />
        )}
      </main>
    </div>
  );
};

const styles = {
  authWrapper: {
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0a0e1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: 'radial-gradient(circle at center, rgba(0, 120, 212, 0.12), transparent 60%)',
  },
  authCard: {
    width: '400px',
    backgroundColor: '#111827',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  authHeaderIcon: {
    padding: '1rem',
    backgroundColor: 'rgba(0,120,212,0.06)',
    borderRadius: '50%',
    marginBottom: '1rem',
    border: '1px solid rgba(0,120,212,0.15)',
  },
  rolesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    width: '100%',
  },
  userProfileBanner: {
    position: 'absolute',
    top: '1rem',
    right: '2.5rem',
    zIndex: 100,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '0.4rem 0.85rem',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    gap: '0.85rem',
    alignItems: 'center',
  },
  profileMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#ffffff',
  }
};

export default App;
