import { openAiClient } from '../config/azure.js';
import { complianceRepository } from '../repositories/complianceRepository.js';

export const copilotService = {
  async askCopilot(userQuestion) {
    // 1. Gather context
    const controls = await complianceRepository.getAllControls();
    const scores = await complianceRepository.getScores();
    
    const failingControls = controls.filter(c => c.status === 'failed');
    
    // Inject current compliance telemetry into prompt
    const systemPrompt = `You are the ACOM Enterprise AI Compliance Copilot.
You have access to the following compliance database:
- Framework Scores: GDPR: ${scores.gdpr}%, HIPAA: ${scores.hipaa}%, SOC 2: ${scores.soc2}%, ISO 27001: ${scores.iso27001}%, Overall Score: ${scores.overall}%.
- Failing Controls: ${JSON.stringify(failingControls.map(c => ({ id: c.id, name: c.name, framework: c.framework, severity: c.severity })))}

Answer the user query professionally. Explain why scores have drifted, recommend priority remediations, summarize findings, and help them prepare for audits.`;

    const deploymentId = process.env.AZURE_OPENAI_DEPLOYMENT_ID || 'gpt-4';

    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuestion }
      ];
      
      const response = await openAiClient.getChatCompletions(deploymentId, messages);
      return response.choices[0].message.content;
    } catch (err) {
      console.warn('[Copilot OpenAI Warning] Falling back to intelligent query parser.', err.message);
      return "Unable to contact Azure OpenAI. Model response could not be loaded.";
    }
  }
};
