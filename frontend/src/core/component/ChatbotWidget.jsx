import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bot, Send, X, Sparkles } from 'lucide-react';
import { askChatbotApi } from '../services/chatbotServices';

// Custom Markdown Formatter Component
const FormattedMessage = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {lines.map((line, idx) => {
        let trimmed = line.trim();
        if (!trimmed) return <div key={idx} style={{ height: '4px' }} />;

        if (trimmed.startsWith('###') || (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 50)) {
          const text = trimmed.replace(/^###\s*/, '').replace(/\*\*/g, '');
          return (
            <div key={idx} style={{ fontWeight: '800', fontSize: '13.5px', color: '#c084fc', marginTop: '4px' }}>
              {text}
            </div>
          );
        }

        const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');
        if (isBullet) {
          trimmed = trimmed.replace(/^(\*|•|-)\s*/, '');
        }

        const parts = trimmed.split(/(\*\*.*?\*\*)/g);

        return (
          <div
            key={idx}
            style={{
              paddingLeft: isBullet ? '12px' : '0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
            }}
          >
            {isBullet && <span style={{ color: '#a855f7', fontWeight: 'bold' }}>•</span>}
            <span>
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={pIdx} style={{ color: '#f8fafc', fontWeight: '700' }}>
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am EventSphere Smart AI. Ask me anything about events, halls, or booth bookings!' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setTyping(true);

    const botReply = await askChatbotApi(userMsg);
    setTyping(false);
    setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: "'Inter', sans-serif" }}>
      
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            style={{
              width: '58px', height: '58px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#fff', border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(124, 58, 237, 0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <MessageSquare size={26} color="#ffffff" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Glassmorphism Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              width: 'min(410px, 92vw)',
              height: 'min(520px, 80vh)',
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '24px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(79, 70, 229, 0.2))',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bot size={20} color="#ffffff" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    EventSphere AI <Sparkles size={14} color="#c084fc" />
                  </h4>
                  <span style={{ fontSize: '10.5px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Connected to DB
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8',
                  width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Messages Body */}
            <div style={{
              flex: 1, padding: '16px', overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    padding: '10px 14px',
                    borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: m.sender === 'user'
                      ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                      : 'rgba(30, 41, 59, 0.8)',
                    color: '#cbd5e1',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {m.sender === 'user' ? m.text : <FormattedMessage content={m.text} />}
                </motion.div>
              ))}

              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    alignSelf: 'flex-start', background: 'rgba(30, 41, 59, 0.8)',
                    padding: '8px 14px', borderRadius: '14px', color: '#94a3b8',
                    fontSize: '12px', border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  AI is querying database...
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.6)' }}>
              <input
                type="text"
                placeholder="Ask AI about events, booths..."
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{
                  flex: 1, padding: '11px 16px', borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.06)', color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.12)', outline: 'none', fontSize: '13px'
                }}
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                style={{
                  padding: '11px 16px', borderRadius: '14px',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer',
                  fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
                }}
              >
                <Send size={15} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}