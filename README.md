# Automated Compliance and Regulatory Reporting System (ACOM)

A high-fidelity, interactive compliance and regulatory reporting platform built to simulate a complex, serverless Azure-based architecture.

## Architecture & Integration Flow
The system demonstrates the seamless data pipelines of 7 key Azure services:
1. **Azure Policy**: Runs automated infrastructure security scans and logs compliance drifts.
2. **Azure Activity Log**: Creates an audit trail of management and administrative operations.
3. **Azure SQL Database**: Stores relational framework mappings, controls definitions, and linked evidence items.
4. **Azure Functions**: Executes serverless timers and ingestion checks, recalculating compliance score mappings.
5. **Azure Notification Hubs**: Broadcasts push warnings and critical alert queues to stakeholders.
6. **Azure Data Factory**: Coordinates ETL runs, metadata catalogs, and lineage mappings.
7. **Azure Synapse Analytics**: Operates serverless SQL queries over compliance log databases.

## Credit-Optimized Deployment
To run this in a production Azure subscription under a strict credit budget (e.g., **under 180 credits**), this project utilizes serverless-first resources:
- **Azure SQL Database**: Set to general purpose serverless with auto-pause enabled. Pauses when idle, using 0 credits.
- **Azure Functions**: Consumption plan, providing 1 million free invocations per month.
- **Notification Hubs**: Free tier, enabling 1 million free broadcasts.
- **Azure Synapse**: Serverless SQL, paying strictly per TB of queries executed.

Total active deployment footprint runs at less than **10-15 credits/month**.

## How to Run Locally

### Prerequisites
- Node.js (version 18 or above recommended)
- npm

### Launch Steps
1. Navigate to the project directory:
   ```bash
   cd "d:/Microsoft Certification/Project"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch local dev server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:3000`.
