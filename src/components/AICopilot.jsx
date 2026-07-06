import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User,
  Zap,
  ArrowRight
} from 'lucide-react';

const AICopilot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your ACOM AI Compliance Copilot. Ask me anything about GDPR, HIPAA, SOC 2, ISO 27001 compliance scores, failed controls, or audit remediation plans.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    'Explain why compliance scores changed recently',
    'List all failed compliance controls and remediation plans',
    'Suggest priorities for audit readiness',
    'Show what documentation we uploaded for GDPR'
  ];

  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || inputMessage;
    if (!textToSend.trim()) return;

    // 1. Add User Message
    const userMsg = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:5000/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        throw new Error('API server unreachable');
      }
    } catch (e) {
      // Local fallback parser
      setTimeout(() => {
        let reply = "I couldn't contact the Copilot service. Please verify the backend Express server is running on port 5000.";
        const q = textToSend.toLowerCase();
        
        if (q.includes('gdpr') || q.includes('privacy')) {
          reply = "GDPR is currently at 100% compliance. 3 of 3 controls passed. We have validated DPIA uploads ('Internal_Privacy_DPIA_V1.pdf') and Key Vault TLS protocols.";
        } else if (q.includes('hipaa') || q.includes('health') || q.includes('failing')) {
          reply = "HIPAA is at 66%. Control HIPAA-1 is failing because Diagnostic Logs are not exported. Remediation: Enable diagnostics logs to stream database telemetry audits.";
        } else if (q.includes('why') || q.includes('change') || q.includes('drift')) {
          reply = "Compliance scores changed because regulatory monitor feeds were ingested, which created new audit requirements and drifted local checks (like HIPAA-1) to failing status.";
        } else if (q.includes('priority') || q.includes('remediat')) {
          reply = "Remediation priorities:\n1. **HIPAA-1 (High)**: Configure SQL diagnostics exports.\n2. **ISO-1 (Medium)**: Run administrative credential clean-up audits.";
        }
        
        setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={24} color="#a5b4fc" style={{ filter: 'drop-shadow(0 0 8px rgba(165,180,252,0.5))' }} />
            AI Compliance Copilot
          </h1>
          <p className="page-subtitle">Ask questions across GDPR, HIPAA, SOC2, and ISO 27001 framework telemetry</p>
        </div>
      </div>

      <div style={styles.chatGrid}>
        {/* Chat window */}
        <div className="card" style={styles.chatWindow}>
          <div style={styles.messagesList}>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{ 
                  ...styles.messageItem, 
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' 
                }}
              >
                {msg.role !== 'user' && (
                  <div style={styles.botIcon}>
                    <Bot size={16} color="#ffffff" />
                  </div>
                )}
                
                <div style={{
                  ...styles.bubble,
                  backgroundColor: msg.role === 'user' ? '#0078d4' : 'rgba(255, 255, 255, 0.03)',
                  border: msg.role === 'user' ? '1px solid #106ebe' : '1px solid rgba(255, 255, 255, 0.06)',
                  color: '#ffffff'
                }}>
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div style={styles.userIcon}>
                    <User size={16} color="#ffffff" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div style={{ ...styles.messageItem, justifyContent: 'flex-start' }}>
                <div style={styles.botIcon}>
                  <Bot size={16} />
                </div>
                <div style={{ ...styles.bubble, backgroundColor: 'rgba(255,255,255,0.02)', color: '#6b7280' }}>
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
            style={styles.chatInputForm}
          >
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ask Copilot a question (e.g. 'How can I fix failed controls for HIPAA?')..." 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="btn btn-primary" disabled={isTyping}>
              <Send size={14} /> Send
            </button>
          </form>
        </div>

        {/* Sidebar suggestions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
          <div className="card" style={{ backgroundColor: '#111827' }}>
            <div className="card-title">
              <Zap size={16} color="#fb923c" />
              <span>Suggested Queries</span>
            </div>
            <div style={styles.suggestionsList}>
              {suggestedPrompts.map((prompt, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  style={styles.suggestionBtn}
                  className="nav-btn"
                >
                  <span style={{ fontSize: '0.8rem', textAlign: 'left' }}>{prompt}</span>
                  <ArrowRight size={12} color="#0078d4" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  chatGrid: {
    display: 'flex',
    gap: '1.5rem',
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    paddingBottom: '1.5rem',
  },
  chatWindow: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#111827',
    padding: '1.25rem',
    height: '100%',
    overflow: 'hidden',
  },
  messagesList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    overflowY: 'auto',
    paddingRight: '0.5rem',
    marginBottom: '1rem',
  },
  messageItem: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
    maxWidth: '85%',
  },
  botIcon: {
    padding: '0.4rem',
    backgroundColor: '#0078d4',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  userIcon: {
    padding: '0.4rem',
    backgroundColor: '#374151',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  bubble: {
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    whiteSpace: 'pre-line',
  },
  chatInputForm: {
    display: 'flex',
    gap: '0.75rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '1rem',
  },
  suggestionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  suggestionBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.65rem 0.85rem',
    color: '#9ca3af',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s ease',
  }
};

export default AICopilot;
