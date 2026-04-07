export default function TypingIndicator() {
  return (
    <div style={s.wrapper}>
      <div style={s.avatar}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="var(--teal)"/>
          <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="var(--teal)"/>
        </svg>
      </div>
      <div style={s.bubble}>
        <div style={s.dots}>
          <span style={{ ...s.dot, animationDelay: '0ms' }} />
          <span style={{ ...s.dot, animationDelay: '160ms' }} />
          <span style={{ ...s.dot, animationDelay: '320ms' }} />
        </div>
        <span style={s.label}>MediCare AI is analyzing...</span>
      </div>
    </div>
  );
}

const s = {
  wrapper: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 24, animation: 'fadeUp 0.3s ease' },
  avatar: { width: 36, height: 36, background: 'var(--teal-dim)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bubble: { padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, borderTopLeftRadius: 4, display: 'flex', alignItems: 'center', gap: 12 },
  dots: { display: 'flex', gap: 5, alignItems: 'center' },
  dot: { display: 'block', width: 8, height: 8, background: 'var(--teal)', borderRadius: '50%', animation: 'typing 1.2s ease-in-out infinite', opacity: 0.4 },
  label: { fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' },
};
