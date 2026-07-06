import React, { useState } from 'react';
import { 
  Network, 
  Settings, 
  Database, 
  Cpu, 
  BellRing, 
  LineChart, 
  Shuffle, 
  FileSearch,
  Code,
  Play,
  CheckCircle,
  AlertCircle,
  Copy,
  Terminal,
  Columns
} from 'lucide-react';

const Architecture = ({ 
  controls, 
  activities, 
  addActivity, 
  addAlert,
  updateScores,
  runScan,
  isScanning
}) => {
  const [selectedService, setSelectedService] = useState('policy');
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM ComplianceLogs WHERE severity = 'high';");
  const [queryResult, setQueryResult] = useState(null);
  const [adfRunning, setAdfRunning] = useState(false);
  const [adfLogs, setAdfLogs] = useState([]);
  const [policyScanResult, setPolicyScanResult] = useState(null);
  const [pushedAlert, setPushedAlert] = useState({ title: '', message: '' });
  const [copiedCode, setCopiedCode] = useState(false);

  // Nodes Coordinates for SVG lines
  // canvas size is approx 800 x 400
  const nodes = {
    policy: { x: 120, y: 80, name: 'Azure Policy', icon: FileSearch, desc: 'Infrastructure Guardrails' },
    activity: { x: 380, y: 80, name: 'Azure Activity Log', icon: Network, desc: 'Audit logging & compliance tracking' },
    sql: { x: 120, y: 220, name: 'Azure SQL Database', icon: Database, desc: 'Compliance policy & control store' },
    functions: { x: 380, y: 220, name: 'Azure Functions', icon: Cpu, desc: 'Automated compliance engines' },
    notifications: { x: 680, y: 80, name: 'Notification Hubs', icon: BellRing, desc: 'Real-time stakeholder alerts' },
    factory: { x: 380, y: 350, name: 'Azure Data Factory', icon: Shuffle, desc: 'Data lineage & cataloging' },
    synapse: { x: 680, y: 220, name: 'Azure Synapse', icon: LineChart, desc: 'Serverless SQL analytics & queries' }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Synapse simulated database queries
  const runSynapseQuery = () => {
    const cleanQuery = sqlQuery.trim().toLowerCase();
    
    if (cleanQuery.includes('from compliancelogs')) {
      const data = [
        { id: 1, resource: 'VM-Prod-01', framework: 'HIPAA', issue: 'Unencrypted storage volume', severity: 'high', date: '2026-07-06' },
        { id: 2, resource: 'DB-SQL-Customer', framework: 'GDPR', issue: 'Public network access allowed', severity: 'high', date: '2026-07-05' },
        { id: 3, resource: 'Blob-Logs-Audit', framework: 'SOC2', issue: 'Retention duration < 365 days', severity: 'medium', date: '2026-07-04' },
        { id: 4, resource: 'AKS-Cluster-Main', framework: 'ISO27001', issue: 'API server public access enabled', severity: 'high', date: '2026-07-06' },
        { id: 5, resource: 'KeyVault-Secrets', framework: 'GDPR', issue: 'Diagnostic settings disabled', severity: 'low', date: '2026-07-03' }
      ];

      if (cleanQuery.includes("severity = 'high'")) {
        setQueryResult(data.filter(d => d.severity === 'high'));
      } else {
        setQueryResult(data);
      }
    } else if (cleanQuery.includes('from activitylogs') || cleanQuery.includes('from activity')) {
      const formattedActs = activities.map((a, i) => ({
        id: a.id,
        operation: a.operation,
        caller: a.caller,
        resource: a.resource,
        status: a.status,
        date: a.timestamp
      }));
      setQueryResult(formattedActs);
    } else {
      setQueryResult([{ Error: "Table not found. Available tables: 'ComplianceLogs', 'ActivityLogs'" }]);
    }

    addActivity({
      operation: 'Execute Serverless SQL Query',
      caller: 'Synapse-Admin-User',
      resource: 'Azure Synapse Analytics Serverless DB',
      status: 'Success'
    });
  };

  // ADF Pipeline Run
  const runAdfPipeline = () => {
    setAdfRunning(true);
    setAdfLogs(['[ADF] Initiating Pipeline: SyncComplianceLogsToSynapse', '[ADF] Fetching metadata from Azure SQL Database...']);
    
    setTimeout(() => {
      setAdfLogs(prev => [...prev, '[ADF] Active Data Lineage mapping verified. Source: SQL.dbo.ComplianceControls.']);
    }, 800);

    setTimeout(() => {
      setAdfLogs(prev => [...prev, '[ADF] Ingesting telemetry logs from Azure Blob Storage/Activity Logs...']);
    }, 1500);

    setTimeout(() => {
      setAdfLogs(prev => [...prev, '[ADF] Loading data to Synapse Analytics Serverless SQL (Azure Data Lake Gen2)...']);
    }, 2200);

    setTimeout(() => {
      setAdfLogs(prev => [...prev, '[ADF] Pipeline run COMPLETED. 142 records indexed, data lineage catalog updated.']);
      setAdfRunning(false);
      addActivity({
        operation: 'Data Ingestion Run (ADF Pipeline)',
        caller: 'ADF-ServicePrincipal',
        resource: 'Azure Data Factory Pipeline',
        status: 'Success'
      });
    }, 3000);
  };

  // Policy scan tool
  const triggerPolicyScan = () => {
    setPolicyScanResult('scanning');
    setTimeout(() => {
      const issuesFound = controls.filter(c => c.status === 'failed');
      setPolicyScanResult({
        totalEvaluated: 12,
        nonCompliant: issuesFound.length,
        compliant: 12 - issuesFound.length,
        issues: issuesFound.map(c => ({
          name: c.name,
          framework: c.framework.toUpperCase(),
          severity: c.severity
        }))
      });

      addActivity({
        operation: 'Azure Policy Compliance Scan',
        caller: 'Azure Policy Engine',
        resource: 'Tenant Resource Groups',
        status: 'Success'
      });
    }, 1500);
  };

  // Custom Alert Trigger
  const triggerPushAlert = (e) => {
    e.preventDefault();
    if (!pushedAlert.title || !pushedAlert.message) return;

    addAlert({
      title: pushedAlert.title,
      message: pushedAlert.message,
      severity: 'medium',
      timestamp: new Date().toLocaleTimeString()
    });

    addActivity({
      operation: 'Send Multi-channel Compliance Alert',
      caller: 'Notification-Engine-Func',
      resource: 'Azure Notification Hubs',
      status: 'Success'
    });

    setPushedAlert({ title: '', message: '' });
    alert('Alert pushed via Notification Hub simulation successfully!');
  };

  // Terraform deployment configs for the services
  const deploymentConfigs = {
    policy: {
      type: 'Terraform Code',
      cost: 'Free tier inclusion. Credits: 0',
      code: `resource "azurerm_subscription_policy_assignment" "gdpr_assignment" {
  name                 = "gdpr-compliance-standards"
  subscription_id      = "/subscriptions/\${var.subscription_id}"
  policy_definition_id = "/providers/Microsoft.Authorization/policySetDefinitions/099db91e-02b6-444f-bc98-5c490ef4c297" # GDPR Built-in
  display_name         = "GDPR Infrastructure Compliance Guardrails"
  description          = "Enforce resource rules for European General Data Protection Regulation"
}`
    },
    activity: {
      type: 'Terraform Code',
      cost: 'Free. Credits: 0',
      code: `resource "azurerm_monitor_diagnostic_setting" "activity_log_export" {
  name               = "export-activity-logs-to-sql"
  target_resource_id = "/subscriptions/\${var.subscription_id}"
  eventhub_name      = azurerm_eventhub.audit_hub.name

  enabled_log {
    category = "Administrative"
  }
  enabled_log {
    category = "Policy"
  }
}`
    },
    sql: {
      type: 'Terraform Code',
      cost: 'Serverless Plan: ~$5/month. Credits: 5',
      code: `resource "azurerm_mssql_database" "compliance_db" {
  name         = "acom-compliance-sql"
  server_id    = azurerm_mssql_server.sql_server.id
  collation    = "SQL_Latin1_General_CP1_CI_AS"
  license_type = "BasePrice"
  sku_name     = "GP_S_Gen5_1" # Serverless tier

  auto_pause_delay_in_minutes = 60 # Save credits when idle
  min_capacity                = 0.5
  max_size_gb                 = 10
}`
    },
    functions: {
      type: 'Terraform Code',
      cost: 'Consumption Plan (1 million free requests). Credits: 0',
      code: `resource "azurerm_linux_function_app" "compliance_func" {
  name                = "acom-checks-engine"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  storage_account_name       = azurerm_storage_account.func_store.name
  storage_account_access_key = azurerm_storage_account.func_store.primary_access_key
  service_plan_id            = azurerm_service_plan.consumption_plan.id

  site_config {
    application_stack {
      node_version = "18"
    }
  }
}`
    },
    notifications: {
      type: 'Terraform Code',
      cost: 'Free tier - 1 million free notifications. Credits: 0',
      code: `resource "azurerm_notification_hub_namespace" "hub_ns" {
  name                = "acom-notif-namespace"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  namespace_type      = "NotificationHub"
  sku_name            = "Free" # 0 Credit impact
}

resource "azurerm_notification_hub" "hub" {
  name                = "acom-compliance-alerts"
  namespace_name      = azurerm_notification_hub_namespace.hub_ns.name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
}`
    },
    factory: {
      type: 'Terraform Code',
      cost: 'Free-tier pipelines - ~$2/month. Credits: 2',
      code: `resource "azurerm_data_factory" "adf" {
  name                = "acom-data-pipeline"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  
  # Enabling Data Lineage catalog mapping
  global_parameter {
    name  = "LineageExportEnabled"
    type  = "Bool"
    value = "true"
  }
}`
    },
    synapse: {
      type: 'Terraform Code',
      cost: 'Serverless plan - $5 per TB processed. Credits: 1',
      code: `resource "azurerm_synapse_workspace" "synapse" {
  name                                 = "acom-synapse-workspace"
  resource_group_name                  = azurerm_resource_group.rg.name
  location                             = azurerm_resource_group.rg.location
  storage_data_lake_gen2_filesystem_id = azurerm_storage_data_lake_gen2_filesystem.adls_fs.id
  sql_administrator_login             = "synapseadmin"
  sql_administrator_login_password    = "P@ssw0rdSecure!"
}`
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Azure Architecture Map</h1>
          <p className="page-subtitle">Interactive compliance data pipeline and service configuration engine</p>
        </div>
      </div>

      <div className="architecture-container">
        {/* Interactive Canvas */}
        <div className="canvas-wrapper">
          <div className="canvas-grid-bg" />
          <div className="nodes-container">
            {/* SVG Connection Lines */}
            <svg className="connections-svg">
              {/* Line: Policy -> Activity Log */}
              <line 
                x1={nodes.policy.x + 80} y1={nodes.policy.y + 20} 
                x2={nodes.activity.x} y2={nodes.activity.y + 20} 
                className={`connection-path ${selectedService === 'policy' || selectedService === 'activity' ? 'active' : ''}`} 
              />
              {/* Line: Policy -> Functions */}
              <path 
                d={`M ${nodes.policy.x + 80} ${nodes.policy.y + 20} C 250 150, 250 180, ${nodes.functions.x} ${nodes.functions.y + 20}`}
                className={`connection-path ${selectedService === 'policy' || selectedService === 'functions' ? 'active' : ''}`} 
              />
              {/* Line: Activity Log -> SQL */}
              <path 
                d={`M ${nodes.activity.x} ${nodes.activity.y + 20} C 300 150, 300 180, ${nodes.sql.x + 80} ${nodes.sql.y + 20}`}
                className={`connection-path ${selectedService === 'activity' || selectedService === 'sql' ? 'active' : ''}`} 
              />
              {/* Line: SQL -> Functions */}
              <line 
                x1={nodes.sql.x + 80} y1={nodes.sql.y + 20} 
                x2={nodes.functions.x} y2={nodes.functions.y + 20} 
                className={`connection-path ${selectedService === 'sql' || selectedService === 'functions' ? 'active' : ''}`} 
              />
              {/* Line: Functions -> Notification Hub */}
              <path 
                d={`M ${nodes.functions.x + 80} ${nodes.functions.y + 20} C 530 180, 530 120, ${nodes.notifications.x} ${nodes.notifications.y + 20}`}
                className={`connection-path ${selectedService === 'functions' || selectedService === 'notifications' ? 'active' : ''}`} 
              />
              {/* Line: SQL -> ADF */}
              <path 
                d={`M ${nodes.sql.x + 80} ${nodes.sql.y + 20} C 250 300, 250 350, ${nodes.factory.x} ${nodes.factory.y + 20}`}
                className={`connection-path ${selectedService === 'sql' || selectedService === 'factory' ? 'active' : ''}`} 
              />
              {/* Line: Activity Log -> ADF */}
              <line 
                x1={nodes.activity.x + 40} y1={nodes.activity.y + 40} 
                x2={nodes.factory.x + 40} y2={nodes.factory.y} 
                className={`connection-path ${selectedService === 'activity' || selectedService === 'factory' ? 'active' : ''}`} 
              />
              {/* Line: ADF -> Synapse */}
              <path 
                d={`M ${nodes.factory.x + 80} ${nodes.factory.y + 20} C 530 350, 530 300, ${nodes.synapse.x} ${nodes.synapse.y + 20}`}
                className={`connection-path ${selectedService === 'factory' || selectedService === 'synapse' ? 'active' : ''}`} 
              />
            </svg>

            {/* Render Nodes */}
            {Object.entries(nodes).map(([id, node]) => {
              const NodeIcon = node.icon;
              const isSelected = selectedService === id;
              
              let pulseClass = '';
              if (id === 'functions' && isScanning) pulseClass = 'pulse-success';
              if (id === 'factory' && adfRunning) pulseClass = 'pulse-success';

              return (
                <div
                  key={id}
                  onClick={() => setSelectedService(id)}
                  className={`arch-node ${isSelected ? 'selected' : ''} ${pulseClass}`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '180px',
                  }}
                >
                  <div style={{
                    padding: '0.4rem',
                    backgroundColor: isSelected ? 'rgba(0, 120, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <NodeIcon size={18} color={isSelected ? '#0078d4' : '#e2e8f0'} />
                  </div>
                  <div>
                    <div className="arch-node-title" style={{ color: isSelected ? '#ffffff' : '#e2e8f0' }}>
                      {node.name}
                    </div>
                    <div className="arch-node-subtitle">{node.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail Panel */}
        <div className="node-details-panel">
          {/* Simulated Active Panel */}
          <div className="card">
            <div className="card-title">
              <Terminal size={18} color="#0078d4" />
              <span>Simulated Control Center: {nodes[selectedService].name}</span>
            </div>

            {selectedService === 'policy' && (
              <div style={styles.tabContent}>
                <p style={styles.descText}>
                  Azure Policy assesses resource states and flags items that violate compliance blueprints.
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <button className="btn btn-primary" onClick={triggerPolicyScan} disabled={policyScanResult === 'scanning'}>
                    {policyScanResult === 'scanning' ? 'Running evaluation policies...' : 'Evaluate Policy Compliance'}
                  </button>
                  
                  {policyScanResult === 'scanning' && (
                    <div style={{ ...styles.logBox, marginTop: '1rem' }}>
                      Checking Azure VM policies...<br />
                      Checking SQL encryption settings...<br />
                      Validating storage network filters...
                    </div>
                  )}

                  {policyScanResult && policyScanResult !== 'scanning' && (
                    <div style={styles.policyResultBox}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ffffff' }}>Policy Evaluation Result:</h4>
                      <div style={styles.resultStatsRow}>
                        <div style={styles.resultStatCol}>
                          <span style={styles.resultStatVal}>{policyScanResult.totalEvaluated}</span>
                          <span style={styles.resultStatLbl}>Evaluated</span>
                        </div>
                        <div style={styles.resultStatCol}>
                          <span style={{ ...styles.resultStatVal, color: '#4ade80' }}>{policyScanResult.compliant}</span>
                          <span style={styles.resultStatLbl}>Compliant</span>
                        </div>
                        <div style={styles.resultStatCol}>
                          <span style={{ ...styles.resultStatVal, color: '#f87171' }}>{policyScanResult.nonCompliant}</span>
                          <span style={styles.resultStatLbl}>Non-Compliant</span>
                        </div>
                      </div>
                      <div style={{ marginTop: '0.75rem' }}>
                        {policyScanResult.issues.map((issue, idx) => (
                          <div key={idx} style={styles.issueItem}>
                            <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0 }} />
                            <span>
                              <strong>{issue.framework}</strong>: {issue.name} ({issue.severity.toUpperCase()})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedService === 'activity' && (
              <div style={styles.tabContent}>
                <p style={styles.descText}>
                  Azure Activity Log records management events, resource operations, and status changes.
                </p>
                <h4 style={{ fontSize: '0.85rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Recent Log Payloads (JSON Schema):</h4>
                <div style={styles.logBox}>
{`{
  "operationName": "Microsoft.Authorization/policyAssignments/write",
  "status": "Succeeded",
  "caller": "admin@acom-tenant.onmicrosoft.com",
  "resourceId": "/subscriptions/sub-1/resourceGroups/rg-prod/providers/...",
  "eventTimestamp": "2026-07-06T16:09:22Z"
}`}
                </div>
              </div>
            )}

            {selectedService === 'sql' && (
              <div style={styles.tabContent}>
                <p style={styles.descText}>
                  Azure SQL Serverless hosts policy definitions, frameworks, logs metadata, and compliance evidence indices.
                </p>
                <h4 style={{ fontSize: '0.85rem', marginTop: '1.25rem', marginBottom: '0.5rem' }}>Relational Tables Catalog:</h4>
                <div style={styles.sqlTablesGrid}>
                  <div style={styles.sqlTableBadge}>
                    <strong>Frameworks</strong>
                    <span>4 records</span>
                  </div>
                  <div style={styles.sqlTableBadge}>
                    <strong>ComplianceControls</strong>
                    <span>12 records</span>
                  </div>
                  <div style={styles.sqlTableBadge}>
                    <strong>EvidenceLocker</strong>
                    <span>{controls.filter(c => c.evidence).length} files</span>
                  </div>
                  <div style={styles.sqlTableBadge}>
                    <strong>Deadlines</strong>
                    <span>4 records</span>
                  </div>
                </div>
              </div>
            )}

            {selectedService === 'functions' && (
              <div style={styles.tabContent}>
                <p style={styles.descText}>
                  Serverless Functions monitor regulatory RSS feeds, execute scanning engines, and push notifications when issues arise.
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="btn btn-primary" onClick={runScan} disabled={isScanning}>
                    <Cpu size={16} /> Run Automated Compliance Assessor Function
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => {
                      addActivity({
                        operation: 'Clear Alerts Queue',
                        caller: 'Func-QueueManager',
                        resource: 'Azure Functions Execution Plan',
                        status: 'Success'
                      });
                      alert('Triggered scheduled clean-up function.');
                    }}
                  >
                    Trigger System Cache Cleanup
                  </button>
                </div>
              </div>
            )}

            {selectedService === 'notifications' && (
              <div style={styles.tabContent}>
                <p style={styles.descText}>
                  Pushes real-time alerts to emails, slack channels, or mobile apps via Azure Notification Hub when compliance drift occurs.
                </p>
                <form onSubmit={triggerPushAlert} style={styles.formContainer}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Alert Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Storage encryption failure"
                      value={pushedAlert.title}
                      onChange={(e) => setPushedAlert({ ...pushedAlert, title: e.target.value })}
                      required 
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Alert Message</label>
                    <textarea 
                      className="form-input" 
                      style={{ height: '70px', resize: 'none' }}
                      placeholder="Detail the drift event to notify stakeholders..."
                      value={pushedAlert.message}
                      onChange={(e) => setPushedAlert({ ...pushedAlert, message: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    <BellRing size={16} /> Broadcast via Notification Hub
                  </button>
                </form>
              </div>
            )}

            {selectedService === 'factory' && (
              <div style={styles.tabContent}>
                <p style={styles.descText}>
                  Azure Data Factory maps data lineages and orchestrates ETL flows from SQL database/logs into the Synapse analytics lake.
                </p>
                <div style={{ marginTop: '1rem' }}>
                  <button className="btn btn-primary" onClick={runAdfPipeline} disabled={adfRunning}>
                    {adfRunning ? 'Executing pipeline...' : 'Execute Data Factory Lineage Sync'}
                  </button>
                  
                  {adfLogs.length > 0 && (
                    <div style={{ ...styles.logBox, marginTop: '1rem', maxHeight: '150px' }}>
                      {adfLogs.map((log, idx) => (
                        <div key={idx}>{log}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedService === 'synapse' && (
              <div style={styles.tabContent}>
                <p style={styles.descText}>
                  Azure Synapse Analytics uses Serverless SQL pool to execute ad-hoc analysis directly on cataloged compliance data lakes.
                </p>
                <div className="sql-editor-container" style={{ marginTop: '1rem' }}>
                  <div className="sql-editor-header">
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>Serverless SQL Pool Console</span>
                    <button className="btn btn-primary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }} onClick={runSynapseQuery}>
                      <Play size={10} /> Execute
                    </button>
                  </div>
                  <textarea 
                    className="sql-editor-textarea"
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                  />
                </div>

                {queryResult && (
                  <div style={styles.queryResultsContainer}>
                    <h4 style={{ fontSize: '0.8rem', color: '#ffffff', marginBottom: '0.5rem' }}>Query Output:</h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="sql-results-table">
                        <thead>
                          <tr>
                            {Object.keys(queryResult[0] || {}).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {queryResult.map((row, idx) => (
                            <tr key={idx}>
                              {Object.values(row).map((val, i) => (
                                <td key={i}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Infrastructure Setup Templates */}
          <div className="card">
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code size={18} color="#c084fc" />
                <span>Azure Resource Blueprint ({deploymentConfigs[selectedService].type})</span>
              </div>
              <button 
                className="copy-btn" 
                onClick={() => copyToClipboard(deploymentConfigs[selectedService].code)}
              >
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            
            <div style={styles.blueprintCostInfo}>
              <strong>Cost Impact:</strong> {deploymentConfigs[selectedService].cost}
            </div>

            <pre className="code-preview" style={{ marginTop: '0.5rem', maxHeight: '350px' }}>
              <code>{deploymentConfigs[selectedService].code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  tabContent: {
    marginTop: '0.75rem',
  },
  descText: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    lineHeight: '1.5',
    marginBottom: '1rem',
  },
  logBox: {
    backgroundColor: '#05070f',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: '#38bdf8',
    overflowY: 'auto',
    lineHeight: '1.6',
  },
  policyResultBox: {
    marginTop: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem',
  },
  resultStatsRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
    marginBottom: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.75rem',
  },
  resultStatCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.4rem',
  },
  resultStatVal: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  resultStatLbl: {
    fontSize: '0.65rem',
    color: '#6b7280',
    marginTop: '0.1rem',
  },
  issueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: '#f87171',
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    border: '1px solid rgba(239, 68, 68, 0.08)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.4rem 0.6rem',
    marginBottom: '0.35rem',
  },
  sqlTablesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  sqlTableBadge: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    marginTop: '0.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  formLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#9ca3af',
  },
  queryResultsContainer: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  blueprintCostInfo: {
    fontSize: '0.75rem',
    color: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
    border: '1px solid rgba(74, 222, 128, 0.1)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.4rem 0.6rem',
    display: 'inline-block',
    marginBottom: '0.5rem',
  }
};

export default Architecture;
