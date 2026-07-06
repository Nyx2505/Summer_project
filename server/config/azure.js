import dotenv from 'dotenv';
import mssql from 'mssql';
import { DefaultAzureCredential } from '@azure/identity';
import { NotificationHubsClient } from '@azure/notification-hubs';
import { BlobServiceClient } from '@azure/storage-blob';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

dotenv.config();

// Production credentials fallback to dev/mock mode
const isProduction = process.env.NODE_ENV === 'production';

// SQL configuration
const sqlConfig = {
  user: process.env.AZURE_SQL_USER || 'dbadmin',
  password: process.env.AZURE_SQL_PASSWORD || 'DevPassword123!',
  server: process.env.AZURE_SQL_SERVER || 'localhost',
  database: process.env.AZURE_SQL_DATABASE || 'acom_db',
  options: {
    encrypt: true, // Use SSL encryption
    trustServerCertificate: true // Local dev fallback
  }
};

let sqlPool = null;
export async function getSqlPool() {
  if (sqlPool) return sqlPool;
  try {
    sqlPool = await mssql.connect(sqlConfig);
    console.log('[Azure SQL] Pool connected successfully.');
    return sqlPool;
  } catch (error) {
    console.warn('[Azure SQL WARNING] Failed to connect to physical SQL Database, starting Mock DB Client mode.', error.message);
    // Return mock database connector interface
    return {
      request: () => ({
        query: async (queryString) => {
          console.log(`[Mock DB Query Execution]: ${queryString}`);
          return { recordset: [] };
        }
      })
    };
  }
}

// Azure Credential Configuration
export const azureCredential = isProduction 
  ? new DefaultAzureCredential() 
  : { getAccessToken: async () => ({ token: 'mock-local-token' }) };

// Storage Client
export const blobServiceClient = process.env.AZURE_STORAGE_CONNECTION_STRING
  ? BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
  : {
      getContainerClient: (name) => ({
        createIfNotExists: async () => {},
        getBlockBlobClient: (blobName) => ({
          upload: async (data) => ({ requestId: 'mock-upload-id', etag: 'mock-etag' }),
          downloadToBuffer: async () => Buffer.from('Mock evidence content'),
          delete: async () => {}
        })
      })
    };

// Notification Hub client
export const notificationHubClient = process.env.AZURE_NOTIFICATION_HUB_CONNECTION_STRING && process.env.AZURE_NOTIFICATION_HUB_NAME
  ? new NotificationHubsClient(process.env.AZURE_NOTIFICATION_HUB_CONNECTION_STRING, process.env.AZURE_NOTIFICATION_HUB_NAME)
  : {
      sendNotification: async (notification) => {
        console.log(`[Notification Hub Mock broadcast]: sent ${JSON.stringify(notification)}`);
        return { trackingId: 'mock-tracking-id' };
      }
    };

// OpenAI / Copilot client
export const openAiClient = process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY
  ? new OpenAIClient(process.env.AZURE_OPENAI_ENDPOINT, new AzureKeyCredential(process.env.AZURE_OPENAI_KEY))
  : {
      getChatCompletions: async (deployment, messages) => {
        console.log(`[Azure OpenAI Copilot query]: ${JSON.stringify(messages)}`);
        const userPrompt = messages[messages.length - 1].content.toLowerCase();
        
        let responseText = "As your AI Compliance Copilot, I can help you monitor frameworks and plan remediations. Ask about GDPR, HIPAA, SOC2, or NIST.";
        
        if (userPrompt.includes('gdpr') || userPrompt.includes('privacy')) {
          responseText = "Based on our latest data, GDPR is at 100%. We have uploaded 'Internal_Privacy_DPIA_V1.pdf' for DPIA checks and encrypted all traffic. No open violations found.";
        } else if (userPrompt.includes('hipaa') || userPrompt.includes('health') || userPrompt.includes('telemetry')) {
          responseText = "HIPAA is currently at 66%. Control HIPAA-1 (Transmission Security & Telemetry Logging) is failing because database logs are not exported to diagnostic monitor pools. Remediation recommendation: Modify SQL diagnostics options inside Azure to stream events to Sentinel.";
        } else if (userPrompt.includes('soc2') || userPrompt.includes('security')) {
          responseText = "SOC 2 Type II compliance stands at 100%. All trust services criteria (Firewalls, MFA, Change Logs) are fully validated.";
        } else if (userPrompt.includes('iso') || userPrompt.includes('access')) {
          responseText = "ISO 27001 is at 66%. Control ISO-1 (Access Control Policy Audit) is failing because monthly administrative log reviews are overdue. Remediation priority: Run access audit workflows and delete redundant accounts.";
        } else if (userPrompt.includes('remediat') || userPrompt.includes('priority')) {
          responseText = "Remediation Priorities:\n1. **HIPAA-1 (High)**: Enable database diagnostics audit log streaming.\n2. **ISO-1 (Medium)**: Automate Entra ID administrative role audits.";
        }

        return {
          choices: [
            {
              message: {
                content: responseText
              }
            }
          ]
        };
      }
    };
