import { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ onProfileClick }) {
  const { sessions, activeSession, fetchSessions, loadSession, startNewSession, deleteSession } = useChat();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchSessions(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setDeleting(id);
    await deleteSession(id);
    setDeleting(null);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div style={s.sidebar}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="var(--teal)"/>
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="var(--teal)"/>
            </svg>
          </div>
          <span style={s.logoText}>MediCare AI</span>
        </div>

        <button onClick={startNewSession} style={s.newBtn} title="New conversation">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>

      {/* New Chat shortcut */}
      <div style={{ padding: '0 12px 8px' }}>
        <button onClick={startNewSession} style={s.newChatBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
          </svg>
          New Consultation
        </button>
      </div>

      {/* Sessions */}
      <div style={s.sessionsLabel}>Recent Conversations</div>
      <div style={s.sessions}>
        {sessions.length === 0 ? (
          <div style={s.empty}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--text-muted)" style={{ marginBottom: 8 }}>
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
            </svg>
            <p>No conversations yet</p>
            <p style={{ fontSize: '0.75rem' }}>Start a new consultation</p>
          </div>
        ) : (
          sessions.map(session => (
            <div key={session._id}
              onClick={() => loadSession(session._id)}
              style={{ ...s.sessionItem, ...(activeSession?._id === session._id ? s.sessionActive : {}) }}>
              <div style={s.sessionIcon}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.6 }}>
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
              </div>
              <div style={s.sessionInfo}>
                <p style={s.sessionTitle}>{session.title}</p>
                {session.lastMessage && <p style={s.sessionPreview}>{session.lastMessage}</p>}
                <p style={s.sessionDate}>{formatDate(session.updatedAt)}</p>
              </div>
              <button onClick={e => handleDelete(e, session._id)} style={s.deleteBtn}
                disabled={deleting === session._id} title="Delete">
                {deleting === session._id
                  ? <div style={s.miniSpinner} />
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <button onClick={onProfileClick} style={s.profileBtn}>
          <div style={s.avatar}>{initials}</div>
          <div style={s.userInfo}>
            <p style={s.userName}>{user?.name}</p>
            <p style={s.userEmail}>{user?.email}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text-muted)">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </button>
        <button onClick={logout} style={s.logoutBtn} title="Sign out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

const formatDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const now = new Date();
  const diff = now - date;
  if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const s = {
  sidebar: { width: 280, minWidth: 280, height: '100vh', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '18px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: { width: 38, height: 38, background: 'var(--teal-dim)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' },
  newBtn: { width: 32, height: 32, background: 'var(--teal-dim)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 8, cursor: 'pointer', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
  newChatBtn: { width: '100%', padding: '10px 14px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 9, transition: 'all 0.2s' },
  sessionsLabel: { padding: '4px 16px 6px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' },
  sessions: { flex: 1, overflowY: 'auto', padding: '0 8px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', gap: 4 },
  sessionItem: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 10px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s', marginBottom: 2, position: 'relative' },
  sessionActive: { background: 'var(--teal-dim)', border: '1px solid rgba(0,201,167,0.15)' },
  sessionIcon: { marginTop: 3, color: 'var(--text-muted)', flexShrink: 0 },
  sessionInfo: { flex: 1, minWidth: 0 },
  sessionTitle: { fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  sessionPreview: { fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 },
  sessionDate: { fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 3 },
  deleteBtn: { opacity: 0, padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: 4, transition: 'all 0.15s', flexShrink: 0 },
  miniSpinner: { width: 12, height: 12, border: '2px solid var(--border)', borderTopColor: 'var(--teal)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  footer: { padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 },
  profileBtn: { flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--bg-hover)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' },
  avatar: { width: 32, height: 32, background: 'linear-gradient(135deg, var(--teal), #00a88c)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#000', flexShrink: 0 },
  userInfo: { flex: 1, textAlign: 'left', minWidth: 0 },
  userName: { fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: { width: 34, height: 34, background: 'none', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 },
};
