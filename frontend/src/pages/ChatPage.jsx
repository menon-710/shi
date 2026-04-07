import { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import ProfileModal from '../components/ProfileModal';

const QUICK_PROMPTS = [
  { icon: '🤒', text: 'I have a headache and fever', label: 'Headache & Fever' },
  { icon: '💊', text: 'Can you review my medications for interactions?', label: 'Medication Review' },
  { icon: '🩺', text: 'What health screenings should I get at my age?', label: 'Health Screenings' },
  { icon: '😴', text: "I've been having trouble sleeping lately", label: 'Sleep Issues' },
  { icon: '🍎', text: 'Give me a personalized nutrition plan', label: 'Nutrition Plan' },
  { icon: '❤️', text: 'How can I improve my heart health?', label: 'Heart Health' },
];

export default function ChatPage() {
  const { messages, sending, loading, activeSession, sendMessage, startNewSession } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setInput('');
    textareaRef.current.style.height = 'auto';
    await sendMessage(trimmed);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextarea = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const isFirstMessage = messages.length === 0;
  const profileComplete = user?.profile?.age && user?.profile?.chronicConditions?.length >= 0;

  return (
    <div style={s.layout}>
      <Sidebar onProfileClick={() => setShowProfile(true)} />

      <div style={s.main}>
        {/* Top bar */}
        <div style={s.topbar}>
          <div style={s.topbarLeft}>
            {activeSession ? (
              <>
                <div style={s.sessionDot} />
                <span style={s.sessionTitle}>{activeSession.title}</span>
              </>
            ) : (
              <span style={s.sessionTitle}>New Consultation</span>
            )}
          </div>
          <div style={s.topbarRight}>
            {!profileComplete && (
              <button onClick={() => setShowProfile(true)} style={s.profileAlert}>
                ⚠️ Complete health profile for better recommendations
              </button>
            )}
            <button onClick={() => setShowProfile(true)} style={s.profileBtn}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
              Profile
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div style={s.messagesArea}>
          {loading ? (
            <div style={s.loadingState}>
              <div style={s.loadingSpinner} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading conversation...</p>
            </div>
          ) : isFirstMessage ? (
            <Welcome user={user} onQuickPrompt={p => { setInput(p); textareaRef.current?.focus(); }} />
          ) : (
            <div style={s.messagesList}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} isLast={i === messages.length - 1} />
              ))}
              {sending && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div style={s.inputArea}>
          <div style={s.disclaimer}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--text-muted)">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            MediCare AI provides health information only — not a substitute for professional medical advice
          </div>

          <div style={s.inputBox}>
            <textarea ref={textareaRef}
              style={s.textarea}
              placeholder="Describe your symptoms or ask a health question... (Shift+Enter for new line)"
              value={input}
              onChange={handleTextarea}
              onKeyDown={handleKey}
              rows={1}
              disabled={sending}
            />
            <button onClick={handleSend} disabled={!input.trim() || sending} style={{ ...s.sendBtn, ...(input.trim() && !sending ? s.sendBtnActive : {}) }}>
              {sending
                ? <div style={s.sendSpinner} />
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>}
            </button>
          </div>

          {/* Quick prompts — show only if empty and no session */}
          {isFirstMessage && (
            <div style={s.quickPrompts}>
              {QUICK_PROMPTS.map(p => (
                <button key={p.label} onClick={() => { setInput(p.text); textareaRef.current?.focus(); }}
                  style={s.quickBtn}>
                  <span>{p.icon}</span> {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}

const Welcome = ({ user, onQuickPrompt }) => (
  <div style={w.root} className="fade-in">
    <div style={w.bg} />
    <div style={w.content}>
      <div style={w.iconWrap}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="var(--teal)"/>
          <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="var(--teal)"/>
        </svg>
      </div>
      <h2 style={w.title}>Hello, {user?.name?.split(' ')[0]} 👋</h2>
      <p style={w.subtitle}>
        I'm MediCare AI, your personal health companion. I'm aware of your health history and profile, and I'm here to provide personalized, evidence-based health guidance.
      </p>
      <div style={w.chips}>
        {['🩺 Symptom Analysis', '💊 Medication Info', '🥗 Nutrition Advice', '🧠 Mental Wellness', '⚡ Emergency Guidance', '📋 Health Tracking'].map(c => (
          <span key={c} style={w.chip}>{c}</span>
        ))}
      </div>
      <p style={w.cta}>How can I help you today? Try one of these:</p>
      <div style={w.quickGrid}>
        {[
          { icon: '🤒', label: 'Symptom Check', text: 'I have a headache and mild fever since yesterday' },
          { icon: '💊', label: 'Medication Review', text: 'Can you check my medications for interactions?' },
          { icon: '🍎', label: 'Nutrition Plan', text: 'Give me a personalized nutrition plan based on my profile' },
          { icon: '😴', label: 'Sleep Help', text: "I've been struggling with insomnia for 2 weeks" },
        ].map(q => (
          <button key={q.label} onClick={() => onQuickPrompt(q.text)} style={w.quickCard}>
            <span style={w.quickIcon}>{q.icon}</span>
            <span style={w.quickLabel}>{q.label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

const w = {
  root: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' },
  bg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,201,167,0.04) 0%, transparent 70%)', pointerEvents: 'none' },
  content: { maxWidth: 600, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 },
  iconWrap: { width: 72, height: 72, background: 'var(--teal-dim)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'pulse-ring 3s ease-in-out infinite' },
  title: { fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.02em' },
  subtitle: { fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 32 },
  chip: { padding: '5px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.78rem', color: 'var(--text-secondary)' },
  cta: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 },
  quickGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  quickCard: { padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' },
  quickIcon: { fontSize: '1.5rem' },
  quickLabel: { fontSize: '0.825rem', fontWeight: 500 },
};

const s = {
  layout: { display: 'flex', height: '100vh', overflow: 'hidden' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' },
  topbar: { padding: '14px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  topbarLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  sessionDot: { width: 8, height: 8, background: 'var(--teal)', borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 6px var(--teal)' },
  sessionTitle: { fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 10 },
  profileAlert: { fontSize: '0.75rem', color: 'var(--amber)', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' },
  profileBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 500, transition: 'all 0.2s' },
  messagesArea: { flex: 1, overflowY: 'auto', position: 'relative' },
  messagesList: { padding: '28px 32px', maxWidth: 900, margin: '0 auto' },
  loadingState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 },
  loadingSpinner: { width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--teal)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  inputArea: { padding: '16px 32px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 },
  disclaimer: { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 10 },
  inputBox: { display: 'flex', gap: 10, alignItems: 'flex-end', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 16, padding: '8px 8px 8px 16px', transition: 'border-color 0.2s' },
  textarea: { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', resize: 'none', maxHeight: 160, lineHeight: 1.6, paddingTop: 6, paddingBottom: 6 },
  sendBtn: { width: 40, height: 40, background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' },
  sendBtnActive: { background: 'var(--teal)', borderColor: 'var(--teal)', color: '#000', boxShadow: '0 4px 16px rgba(0,201,167,0.4)' },
  sendSpinner: { width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  quickPrompts: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 },
  quickBtn: { padding: '6px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 20, cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s', whiteSpace: 'nowrap' },
};
