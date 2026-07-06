import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square,
  AlertCircle
} from 'lucide-react';

const TimelineTracker = ({ 
  tasks, 
  addTask, 
  toggleTaskStatus, 
  deleteTask, 
  addActivity 
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskFramework, setNewTaskFramework] = useState('gdpr');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTaskText || !newTaskDeadline) return;

    addTask({
      text: newTaskText,
      framework: newTaskFramework,
      deadline: newTaskDeadline
    });

    addActivity({
      operation: `Create compliance action item: ${newTaskText.slice(0, 30)}...`,
      caller: 'Compliance-Manager-User',
      resource: 'Azure SQL Database',
      status: 'Success'
    });

    setNewTaskText('');
    setNewTaskDeadline('');
  };

  const getFrameworkColor = (framework) => {
    switch (framework) {
      case 'gdpr': return '#3b82f6';
      case 'hipaa': return '#10b981';
      case 'soc2': return '#f59e0b';
      case 'iso27001': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Timeline & Tasks</h1>
          <p className="page-subtitle">Track regulatory compliance deadlines, upcoming audits, and mitigation schedules</p>
        </div>
      </div>

      <div style={styles.contentGrid}>
        {/* Task Creator & List */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Create Task Form */}
          <div className="card" style={{ backgroundColor: '#111827' }}>
            <div className="card-title">
              <Plus size={18} color="#0078d4" />
              <span>Create Compliance Action Item</span>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.formRow}>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="What needs to be addressed for compliance?" 
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  required 
                />
              </div>

              <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <select 
                  className="form-select"
                  value={newTaskFramework}
                  onChange={(e) => setNewTaskFramework(e.target.value)}
                >
                  <option value="gdpr">GDPR</option>
                  <option value="hipaa">HIPAA</option>
                  <option value="soc2">SOC 2</option>
                  <option value="iso27001">ISO 27001</option>
                </select>
              </div>

              <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <input 
                  type="date" 
                  className="form-input" 
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Add Task
              </button>
            </form>
          </div>

          {/* Action Items List */}
          <div className="card" style={{ backgroundColor: '#111827', flex: 1 }}>
            <div className="card-title">
              <CheckSquare size={18} color="#0078d4" />
              <span>Compliance Checklist</span>
            </div>

            <div style={styles.tasksList}>
              {tasks.length === 0 ? (
                <div style={styles.emptyState}>No action items defined. All compliant!</div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} style={styles.taskItem}>
                    <button 
                      onClick={() => toggleTaskStatus(task.id)}
                      style={styles.checkboxBtn}
                    >
                      {task.status === 'completed' ? (
                        <CheckSquare size={20} color="#107c41" />
                      ) : (
                        <Square size={20} color="#9ca3af" />
                      )}
                    </button>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        ...styles.taskText,
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        color: task.status === 'completed' ? '#6b7280' : '#ffffff'
                      }}>
                        {task.text}
                      </div>
                      <div style={styles.taskMeta}>
                        <span 
                          style={{ 
                            ...styles.taskFramework, 
                            backgroundColor: `${getFrameworkColor(task.framework)}15`,
                            color: getFrameworkColor(task.framework),
                            borderColor: `${getFrameworkColor(task.framework)}30`
                          }}
                        >
                          {task.framework.toUpperCase()}
                        </span>
                        <span style={styles.taskDeadline}>
                          Deadline: {task.deadline}
                        </span>
                        {task.status === 'overdue' && (
                          <span style={styles.overdueLabel}>
                            <AlertCircle size={10} /> Overdue
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteTask(task.id)}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Milestones Panel */}
        <div className="card" style={{ flex: 1, backgroundColor: '#111827' }}>
          <div className="card-title">
            <Calendar size={18} color="#c084fc" />
            <span>Audit & Verification Schedule</span>
          </div>

          <div style={styles.milestonesList}>
            <div style={styles.milestoneItem}>
              <div style={styles.milestoneMarker}></div>
              <div>
                <h4 style={styles.milestoneTitle}>GDPR Annual External Audit</h4>
                <p style={styles.milestoneDesc}>Review of DPIA documentation and data controller logs</p>
                <div style={styles.milestoneDate}>Due: 2026-08-15 (Q3)</div>
              </div>
            </div>

            <div style={styles.milestoneItem}>
              <div style={styles.milestoneMarker}></div>
              <div>
                <h4 style={styles.milestoneTitle}>ISO 27001 Re-certification</h4>
                <p style={styles.milestoneDesc}>External assessor audit of physical & digital ISMS controls</p>
                <div style={styles.milestoneDate}>Due: 2026-10-10 (Q4)</div>
              </div>
            </div>

            <div style={styles.milestoneItem}>
              <div style={styles.milestoneMarker}></div>
              <div>
                <h4 style={styles.milestoneTitle}>SOC 2 Type II Assessment Period End</h4>
                <p style={styles.milestoneDesc}>Evidence capture window completion for trust service criteria</p>
                <div style={styles.milestoneDate}>Due: 2026-12-01 (Q4)</div>
              </div>
            </div>

            <div style={styles.milestoneItem}>
              <div style={styles.milestoneMarker}></div>
              <div>
                <h4 style={styles.milestoneTitle}>HIPAA Annual Self-Assessment</h4>
                <p style={styles.milestoneDesc}>Internal review of physical safeguarding and patient access controls</p>
                <div style={styles.milestoneDate}>Due: 2026-07-30 (Q3)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  contentGrid: {
    display: 'flex',
    gap: '1.5rem',
    flexDirection: 'row',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginTop: '0.5rem',
    flexWrap: 'wrap',
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  taskItem: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem',
  },
  checkboxBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.1rem',
  },
  taskText: {
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  taskMeta: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    marginTop: '0.35rem',
    flexWrap: 'wrap',
  },
  taskFramework: {
    fontSize: '0.65rem',
    fontWeight: '600',
    padding: '0.1rem 0.4rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
  },
  taskDeadline: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontFamily: 'var(--font-mono)',
  },
  overdueLabel: {
    fontSize: '0.7rem',
    color: '#ef4444',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.15rem',
    fontWeight: '600',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0.4rem',
    borderRadius: 'var(--radius-sm)',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    fontSize: '0.9rem',
  },
  milestonesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginTop: '1rem',
  },
  milestoneItem: {
    display: 'flex',
    gap: '1rem',
    position: 'relative',
    paddingBottom: '0.5rem',
  },
  milestoneMarker: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#c084fc',
    boxShadow: '0 0 8px rgba(192, 132, 252, 0.6)',
    marginTop: '5px',
    flexShrink: 0,
  },
  milestoneTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  milestoneDesc: {
    fontSize: '0.8rem',
    color: '#9ca3af',
    marginTop: '0.15rem',
    lineHeight: '1.4',
  },
  milestoneDate: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: '#c084fc',
    marginTop: '0.35rem',
    fontWeight: '500',
  }
};

export default TimelineTracker;
