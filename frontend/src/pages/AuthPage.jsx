import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.bg} />
      <div style={styles.grid} />

      <div style={styles.card} className="fade-up">
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="var(--teal)"/>
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="var(--teal)"/>
            </svg>
          </div>
          <div>
            <h1 style={styles.logoTitle}>MediCare AI</h1>
            <p style={styles.logoSub}>Your personal health companion</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ ...styles.tab, ...(mode === m ? styles.tabActive : {}) }}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === 'register' && (
            <div style={styles.field} className="fade-up">
              <label style={styles.label}>Full Name</label>
              <input className="input" placeholder="Dr. John Smith" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input className="input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? <Spinner /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p style={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={styles.switchBtn}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        {/* Features */}
        <div style={styles.features}>
          {['🔒 End-to-end privacy', '🧠 AI-powered analysis', '📋 Full history tracking'].map(f => (
            <span key={f} style={styles.feature}>{f}</span>
          ))}
        </div>
      </div>

      <p style={styles.disclaimer}>
        ⚕️ MediCare AI provides health information, not medical diagnoses. Always consult a licensed physician for medical decisions.
      </p>
    </div>
  );
}

const Spinner = () => (
  <div style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
);

const styles = {
  root: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' },
  bg: { position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(0,201,167,0.08) 0%, transparent 60%)', pointerEvents: 'none' },
  grid: { position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: 440, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '40px', boxShadow: 'var(--shadow), var(--shadow-glow)', position: 'relative', zIndex: 1 },
  logo: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 },
  logoIcon: { width: 52, height: 52, background: 'var(--teal-dim)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoTitle: { fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' },
  logoSub: { fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 },
  tabs: { display: 'flex', background: 'var(--bg-secondary)', borderRadius: 10, padding: 4, marginBottom: 28, border: '1px solid var(--border)' },
  tab: { flex: 1, padding: '9px', border: 'none', background: 'transparent', color: 'var(--text-muted)', borderRadius: 8, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.2s' },
  tabActive: { background: 'var(--bg-hover)', color: 'var(--text-primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' },
  error: { padding: '11px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, color: 'var(--rose)', fontSize: '0.875rem' },
  switchText: { textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-muted)' },
  switchBtn: { background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' },
  features: { display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' },
  feature: { fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)' },
  disclaimer: { maxWidth: 440, textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 20, lineHeight: 1.5, position: 'relative', zIndex: 1 }
};
