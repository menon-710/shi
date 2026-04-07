import ReactMarkdown from 'react-markdown';

const urgencyColors = {
  emergency: { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', color: '#f87171', label: '🚨 Emergency' },
  high: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24', label: '⚠️ High Priority' },
  medium: { bg: 'rgba(79,142,247,0.08)', border: 'rgba(79,142,247,0.2)', color: '#4f8ef7', label: 'ℹ️ Medium' },
  low: null,
};

export default function MessageBubble({ message, isLast }) {
  const isUser = message.role === 'user';
  const urgency = message.metadata?.urgencyLevel;
  const urgencyStyle = urgency && urgencyColors[urgency];

  return (
    <div style={{ ...s.wrapper, ...(isUser ? s.userWrapper : s.aiWrapper), ...(isLast ? { animation: 'fadeUp 0.35s ease' } : {}) }}>
      {!isUser && (
        <div style={s.aiAvatar}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="var(--teal)"/>
            <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="var(--teal)"/>
          </svg>
        </div>
      )}

      <div style={{ maxWidth: '100%', minWidth: 0 }}>
        {/* Urgency badge */}
        {urgencyStyle && (
          <div style={{ ...s.urgencyBadge, background: urgencyStyle.bg, borderColor: urgencyStyle.border, color: urgencyStyle.color }}>
            {urgencyStyle.label}
          </div>
        )}

        <div style={{ ...s.bubble, ...(isUser ? s.userBubble : s.aiBubble) }}>
          {isUser ? (
            <p style={s.userText}>{message.content}</p>
          ) : (
            <div className="markdown">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Metadata tags */}
        {!isUser && message.metadata?.symptoms?.length > 0 && (
          <div style={s.tags}>
            {message.metadata.symptoms.slice(0, 4).map(sym => (
              <span key={sym} className="tag tag-rose" style={{ fontSize: '0.7rem' }}>{sym}</span>
            ))}
            {message.metadata.topicsDiscussed?.slice(0, 2).map(t => (
              <span key={t} className="tag tag-teal" style={{ fontSize: '0.7rem' }}>{t}</span>
            ))}
          </div>
        )}

        <div style={s.time}>{formatTime(message.timestamp)}</div>
      </div>

      {isUser && <div style={s.userAvatar}>You</div>}
    </div>
  );
}

const formatTime = (t) => {
  if (!t) return '';
  return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const s = {
  wrapper: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 24 },
  userWrapper: { flexDirection: 'row-reverse' },
  aiWrapper: { flexDirection: 'row' },
  aiAvatar: { width: 36, height: 36, background: 'var(--teal-dim)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  userAvatar: { width: 36, height: 36, background: 'linear-gradient(135deg, #4f8ef7, #3b6fd4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0, marginTop: 2 },
  bubble: { padding: '14px 18px', borderRadius: 16, wordBreak: 'break-word' },
  aiBubble: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderTopLeftRadius: 4, maxWidth: 720 },
  userBubble: { background: 'linear-gradient(135deg, var(--teal), #00a88c)', color: '#000', borderTopRightRadius: 4, maxWidth: 520 },
  userText: { color: '#000', fontWeight: 500, lineHeight: 1.6 },
  urgencyBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, border: '1px solid', marginBottom: 8 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  time: { fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 5, paddingLeft: 2 },
};
