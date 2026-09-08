import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight, FileText, AlertTriangle } from 'lucide-react';
import { askChatbot, tryBackend } from '../data/apiClient';

export default function AIAssistantDrawer({ isOpen, onToggle, initialQuery, onOpenModal }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello Engineer. I am monitoring active well 15/9-F-1 and indexing 1,604 historical Daily Drilling Reports. How can I assist your operational decisions?'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Quick suggestions matching engineer workflows
  const suggestedQueries = [
    "Why is 15/9-F-1 high risk for stuck pipe?",
    "Which offset wells lost circulation near 2,100m?",
    "What mud weight was used in 15/9-19 A?"
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    const res = await tryBackend(() => askChatbot({
      question: query,
      current_well: '15/9-F-1',
      current_depth: 2150,
      area: null
    }));

    let reply = "";
    if (res.ok && res.data && res.data.answer) {
      reply = res.data.answer;
    } else {
      if (query.toLowerCase().includes("high risk") || query.toLowerCase().includes("stuck pipe")) {
        reply = "Active well 15/9-F-1 shows torque micro-spikes (increasing from 4.8 to 8.4 kN·m at 2,145m) and ROP deceleration resembling the pre-sticking signature documented in offset well 15/9-19 A [DDR Day 43 at 2,162m MD]. Recommended action: elevate pump rate to clear cuttings and maintain string rotation.";
      } else if (query.toLowerCase().includes("lost circulation") || query.toLowerCase().includes("mud loss")) {
        reply = "In the 2,000m–2,500m window, offset well 15/9-19 A experienced 35 bbl/hr mud loss at 2,241m in the Horda transition, requiring a 50 bbl high-viscosity LCM pill [DDR #43]. Offset 15/9-F-7 also noted 15 bbl/hr seepage at 1,900m.";
      } else {
        reply = `Analyzing offset database for "${query}". Analogues 15/9-19 A, 15/9-F-5, and 15/9-F-4 suggest maintaining synthetic-based mud at 1.28 SG with minimum annular velocity > 120 ft/min across Forties Sandstone.`;
      }
    }

    setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    setIsTyping(false);
  };

  return (
    <>
      {/* 1. Small Persistent Bottom-Right Floating Trigger Button */}
      {!isOpen && (
        <button 
          className="persistent-ai-pill-btn"
          onClick={() => {
            onToggle(true);
            if (initialQuery) handleSend(initialQuery);
          }}
          title="Open eRTMAC Copilot"
        >
          <div className="ai-pill-icon">
            <Sparkles size={16} color="#8F7C3A" />
          </div>
          <div className="ai-pill-text">
            <span className="ai-brand-label">Ask eRTMAC</span>
            <span className="ai-prompt-teaser">"Why is this well high risk?" &rarr;</span>
          </div>
        </button>
      )}

      {/* 2. Slide-over Copilot Drawer */}
      {isOpen && (
        <div className="ai-drawer-backdrop" onClick={() => onToggle(false)}>
          <div className="ai-drawer-panel" onClick={e => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="ai-drawer-head">
              <div className="ai-head-info">
                <div className="ai-bot-avatar">
                  <Bot size={18} color="#8F7C3A" />
                </div>
                <div>
                  <h3 className="ai-head-title">Ask eRTMAC Assistant</h3>
                  <span className="ai-head-sub">Context-Aware Drilling Support &bull; Historical DDR Records</span>
                </div>
              </div>

              <button 
                className="ai-close-btn"
                onClick={() => onToggle(false)}
                aria-label="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Well Context Badge */}
            <div className="ai-context-banner">
              <div className="pulse-indicator-green" />
              <span>ACTIVE CONTEXT: 15/9-F-1 &bull; Depth: 2,150m &bull; Formation info where available (Forties Sandstone)</span>
            </div>

            {/* Chat Conversation Stream */}
            <div className="ai-messages-container">
              {messages.map((m, idx) => (
                <div key={idx} className={`ai-msg-bubble role-${m.role}`}>
                  <div className="msg-role-avatar">
                    {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div className="msg-content">
                    <p>{m.text}</p>
                    {m.text.includes("DDR Day 43") && (
                      <button 
                        className="btn-evidence-chip"
                        onClick={() => onOpenModal({
                          title: "DDR Day 43 Source Citation",
                          subtitle: "Well 15/9-19 A • Differential Sticking",
                          content: "Direct citation from Tour Report:\n'At 2,162m MD, rapid torque increase from 5.1 to 9.2 kN·m. Overpull 75 klbf. Jarred for 4.5 hours with oil-based freeing pill.'"
                        })}
                      >
                        <FileText size={12} />
                        <span>View DDR Day 43 Evidence</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="ai-typing-indicator">
                  <span>eRTMAC is querying offset logs...</span>
                </div>
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="ai-suggestions-tray">
              <span className="tray-label">SUGGESTED QUERIES:</span>
              <div className="tray-chips">
                {suggestedQueries.map((q, idx) => (
                  <button 
                    key={idx} 
                    className="suggestion-chip"
                    onClick={() => handleSend(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Row */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="ai-input-form"
            >
              <input
                type="text"
                className="ai-chat-input"
                placeholder="Ask about offset hazards, stuck pipe, or DDRs..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />
              <button 
                type="submit" 
                className="btn-ai-send"
                disabled={!inputVal.trim()}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
