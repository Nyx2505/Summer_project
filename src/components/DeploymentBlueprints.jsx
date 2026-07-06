import React, { useState } from 'react';
import { 
  Cloud, 
  HelpCircle, 
  Settings, 
  CheckCircle,
  Copy,
  DollarSign,
  Info
} from 'lucide-react';

const DeploymentBlueprints = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [tiers, setTiers] = useState({
    sql: 'serverless',
    functions: 'consumption',
    synapse: 'serverless',
    notification: 'free',
    factory: 'basic'
  });

  const costMap = {
    sql: { serverless: 5, provisioned: 45 },
    functions: { consumption: 0, premium: 95 },
    synapse: { serverless: 1, dedicated: 150 },
    notification: { free: 0, basic: 10 },
    factory: { basic: 2, standard: 30 }
  };

  const calculateTotalCredits = () => {
    return costMap.sql[tiers.sql] +
           costMap.functions[tiers.functions] +
           costMap.synapse[tiers.synapse] +
           costMap.notification[tiers.notification] +
           costMap.factory[tiers.factory];
  };

  const totalCredits = calculateTotalCredits();
  const limit = 180;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(terraformMainTf);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const terraformMainTf = `# =========================================================================
# Automated Compliance and Regulatory Reporting System (ACOM)
# Credit-Optimized Production Blueprint (Under 180 credits budget)
# =========================================================================

terraform {
  required_version = ">= 1.3.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.90.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "location" {
  type    = string
  default = "East US"
}

variable "resource_group_name" {
  type    = string
  default = "rg-acom-compliance"
}

# 1. Resource Group
resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
  tags = {
    Environment = "Production"
    Project     = "Compliance Reporting Platform"
  }
}

# 2. Azure SQL Database (Serverless Plan - Auto-Pause enabled to save credits)
resource "azurerm_mssql_server" "sql_server" {
  name                         = "sql-acom-compliance-srv"
  resource_group_name          = azurerm_resource_group.rg.name
  location                     = azurerm_resource_group.rg.location
  version                      = "12.0"
  administrator_login          = "dbadmin"
  administrator_login_password = "SecurePassword123!"
}

resource "azurerm_mssql_database" "compliance_db" {
  name         = "acom-compliance-db"
  server_id    = azurerm_mssql_server.sql_server.id
  collation    = "SQL_Latin1_General_CP1_CI_AS"
  license_type = "BasePrice"
  sku_name     = "GP_S_Gen5_1" # General Purpose Serverless Gen5 1 vCore

  auto_pause_delay_in_minutes = 60 # Automatically pauses database after 1 hour idle (0 Credit Burn!)
  min_capacity                = 0.5
  max_size_gb                 = 10
}

# 3. Azure Functions (Consumption Plan - Billing is purely per execution)
resource "azurerm_storage_account" "func_store" {
  name                     = "stacomfuncstore"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_service_plan" "consumption_plan" {
  name                = "plan-acom-consumption"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "Y1" # Y1 = Consumption tier
}

resource "azurerm_linux_function_app" "compliance_checks_func" {
  name                = "func-acom-compliance-checker"
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
}

# 4. Azure Notification Hubs (Free Tier)
resource "azurerm_notification_hub_namespace" "hub_ns" {
  name                = "ns-acom-alerts"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  namespace_type      = "NotificationHub"
  sku_name            = "Free" # Free tier - 1 million free pushes per month
}

resource "azurerm_notification_hub" "hub" {
  name                = "hub-acom-alerts"
  namespace_name      = azurerm_notification_hub_namespace.hub_ns.name
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
}

# 5. Azure Policy Subscription Assignment (Built-in GDPR)
resource "azurerm_subscription_policy_assignment" "gdpr_policy" {
  name                 = "gdpr-standards-eval"
  subscription_id      = "/subscriptions/YOUR_SUBSCRIPTION_ID_HERE"
  policy_definition_id = "/providers/Microsoft.Authorization/policySetDefinitions/099db91e-02b6-444f-bc98-5c490ef4c297"
  display_name         = "GDPR Infrastructure Compliance Standards"
}

# 6. Azure Synapse Workspace (Serverless SQL Pool)
resource "azurerm_storage_data_lake_gen2_filesystem" "adls_fs" {
  name               = "adls-acom-datalake"
  storage_account_id = azurerm_storage_account.func_store.id
}

resource "azurerm_synapse_workspace" "synapse" {
  name                                 = "syn-acom-analytics"
  resource_group_name                  = azurerm_resource_group.rg.name
  location                             = azurerm_resource_group.rg.location
  storage_data_lake_gen2_filesystem_id = azurerm_storage_data_lake_gen2_filesystem.adls_fs.id
  sql_administrator_login             = "synadmin"
  sql_administrator_login_password    = "SecurePassword456!"
}

# 7. Azure Data Factory
resource "azurerm_data_factory" "adf" {
  name                = "adf-acom-pipeline"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
}`;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Azure Deployment Blueprints</h1>
          <p className="page-subtitle">Configure real resource variables and fetch budget optimized infrastructure templates</p>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Cost Optimization configuration */}
        <div className="card" style={{ flex: 1, backgroundColor: '#111827' }}>
          <div className="card-title">
            <DollarSign size={18} color="#107c41" />
            <span>Azure Credit Budget Optimizer</span>
          </div>

          <p style={styles.descText}>
            Fine-tune service tiers to stay strictly under the 180-credit quota. Serverless and Free tiers are automatically selected by default.
          </p>

          <div style={styles.tiersContainer}>
            <div style={styles.tierSelector}>
              <label style={styles.tierLabel}>Azure SQL Database</label>
              <select 
                className="form-select"
                value={tiers.sql}
                onChange={(e) => setTiers({ ...tiers, sql: e.target.value })}
              >
                <option value="serverless">Serverless Plan (GP_S_Gen5_1) ~ 5 credits/mo</option>
                <option value="provisioned">Provisioned Plan (GP_Gen5_2) ~ 45 credits/mo</option>
              </select>
            </div>

            <div style={styles.tierSelector}>
              <label style={styles.tierLabel}>Azure Functions</label>
              <select 
                className="form-select"
                value={tiers.functions}
                onChange={(e) => setTiers({ ...tiers, functions: e.target.value })}
              >
                <option value="consumption">Consumption Plan (Y1) ~ 0 credits/mo</option>
                <option value="premium">Premium Plan (EP1) ~ 95 credits/mo</option>
              </select>
            </div>

            <div style={styles.tierSelector}>
              <label style={styles.tierLabel}>Azure Synapse Analytics</label>
              <select 
                className="form-select"
                value={tiers.synapse}
                onChange={(e) => setTiers({ ...tiers, synapse: e.target.value })}
              >
                <option value="serverless">Serverless SQL Pool ~ 1 credit/mo</option>
                <option value="dedicated">Dedicated SQL Pool (DW100c) ~ 150 credits/mo</option>
              </select>
            </div>

            <div style={styles.tierSelector}>
              <label style={styles.tierLabel}>Notification Hubs</label>
              <select 
                className="form-select"
                value={tiers.notification}
                onChange={(e) => setTiers({ ...tiers, notification: e.target.value })}
              >
                <option value="free">Free Tier Namespace ~ 0 credits/mo</option>
                <option value="basic">Basic Tier Namespace ~ 10 credits/mo</option>
              </select>
            </div>

            <div style={styles.tierSelector}>
              <label style={styles.tierLabel}>Azure Data Factory</label>
              <select 
                className="form-select"
                value={tiers.factory}
                onChange={(e) => setTiers({ ...tiers, factory: e.target.value })}
              >
                <option value="basic">Basic orchestration pipeline ~ 2 credits/mo</option>
                <option value="standard">Self-hosted integration runtime ~ 30 credits/mo</option>
              </select>
            </div>
          </div>

          <div style={{
            ...styles.budgetIndicator,
            borderColor: totalCredits <= limit ? '#107c41' : '#a80000',
            backgroundColor: totalCredits <= limit ? 'rgba(16, 124, 65, 0.05)' : 'rgba(168, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Calculated Total Burn Rate:</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '800', color: totalCredits <= limit ? '#4ade80' : '#f87171' }}>
                {totalCredits} / {limit} credits/mo
              </span>
            </div>
            {totalCredits <= limit ? (
              <span style={styles.budgetStatusText}>
                <CheckCircle size={12} /> Budget Verified! You have {limit - totalCredits} credits remaining.
              </span>
            ) : (
              <span style={{ ...styles.budgetStatusText, color: '#f87171' }}>
                Budget Exceeded! Optimize tiers to deploy successfully.
              </span>
            )}
          </div>
        </div>

        {/* Blueprint Code Viewer */}
        <div className="card" style={{ flex: 1.5, backgroundColor: '#111827' }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cloud size={18} color="#0078d4" />
              <span>Production Terraform Blueprint (main.tf)</span>
            </div>
            <button className="copy-btn" onClick={copyToClipboard}>
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div style={styles.infoAlert}>
            <Info size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: '1.4' }}>
              This script builds all 7 services using serverless parameters (e.g. <code>auto_pause_delay_in_minutes</code> on Azure SQL and <code>Y1</code> SKU on Functions) to protect your credit budget.
            </span>
          </div>

          <pre className="code-preview" style={{ maxHeight: '420px', marginTop: '0.5rem' }}>
            <code>{terraformMainTf}</code>
          </pre>
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
    marginBottom: '1rem',
  },
  tiersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  tierSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  tierLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  budgetIndicator: {
    marginTop: '1.5rem',
    padding: '1rem',
    border: '1px solid',
    borderRadius: 'var(--radius-sm)',
  },
  budgetStatusText: {
    fontSize: '0.75rem',
    color: '#4ade80',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.5rem',
    fontWeight: '500',
  },
  infoAlert: {
    display: 'flex',
    gap: '0.5rem',
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
    border: '1px solid rgba(96, 165, 250, 0.1)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.6rem 0.8rem',
    marginBottom: '0.75rem',
    alignItems: 'center',
  }
};

export default DeploymentBlueprints;
