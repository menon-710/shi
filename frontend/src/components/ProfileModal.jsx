import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const FIELD = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
    {children}
  </div>
);

export default function ProfileModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', profile: { ...user?.profile } });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tagInputs, setTagInputs] = useState({ allergies: '', chronicConditions: '', currentMedications: '', familyHistory: '', dietaryPreferences: '' });

  useEffect(() => {
    setForm({ name: user?.name || '', profile: { ...user?.profile } });
  }, [user]);

  const set = (field, value) => setForm(p => ({ ...p, profile: { ...p.profile, [field]: value } }));

  const addTag = (field, value) => {
    if (!value.trim()) return;
    const current = form.profile[field] || [];
    if (!current.includes(value.trim())) set(field, [...current, value.trim()]);
    setTagInputs(p => ({ ...p, [field]: '' }));
  };

  const removeTag = (field, idx) => set(field, (form.profile[field] || []).filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: form.name, profile: form.profile });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const TagInput = ({ field, placeholder }) => (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
        {(form.profile[field] || []).map((t, i) => (
          <span key={i} style={ts.tag}>
            {t}
            <button onClick={() => removeTag(field, i)} style={ts.tagRemove}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input className="input" style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
          placeholder={placeholder} value={tagInputs[field]}
          onChange={e => setTagInputs(p => ({ ...p, [field]: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(field, tagInputs[field]))} />
        <button onClick={() => addTag(field, tagInputs[field])} style={ts.addBtn}>Add</button>
      </div>
    </div>
  );

  const Select = ({ field, options }) => (
    <select className="input" style={{ appearance: 'none', cursor: 'pointer' }}
      value={form.profile[field] || ''}
      onChange={e => set(field, e.target.value)}>
      <option value="">Not specified</option>
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );

  return (
    <div style={ts.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={ts.modal} className="fade-up">
        {/* Header */}
        <div style={ts.header}>
          <div>
            <h2 style={ts.title}>Health Profile</h2>
            <p style={ts.subtitle}>Complete your profile for personalized recommendations</p>
          </div>
          <button onClick={onClose} style={ts.closeBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div style={ts.body}>
          {/* Personal */}
          <Section title="Personal Information" icon="👤">
            <div style={ts.grid2}>
              <FIELD label="Full Name">
                <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </FIELD>
              <FIELD label="Age">
                <input className="input" type="number" min="1" max="120"
                  value={form.profile.age || ''} onChange={e => set('age', Number(e.target.value))} placeholder="Years" />
              </FIELD>
              <FIELD label="Gender">
                <Select field="gender" options={[{ v: 'male', l: 'Male' }, { v: 'female', l: 'Female' }, { v: 'other', l: 'Other' }]} />
              </FIELD>
              <FIELD label="Blood Group">
                <Select field="bloodGroup" options={['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => ({ v: b, l: b }))} />
              </FIELD>
              <FIELD label="Height (cm)">
                <input className="input" type="number" placeholder="e.g. 170"
                  value={form.profile.height || ''} onChange={e => set('height', Number(e.target.value))} />
              </FIELD>
              <FIELD label="Weight (kg)">
                <input className="input" type="number" placeholder="e.g. 70"
                  value={form.profile.weight || ''} onChange={e => set('weight', Number(e.target.value))} />
              </FIELD>
            </div>
          </Section>

          {/* Lifestyle */}
          <Section title="Lifestyle" icon="🏃">
            <div style={ts.grid2}>
              <FIELD label="Smoking Status">
                <Select field="smokingStatus" options={[{ v: 'never', l: 'Never smoked' }, { v: 'former', l: 'Former smoker' }, { v: 'current', l: 'Current smoker' }]} />
              </FIELD>
              <FIELD label="Alcohol Consumption">
                <Select field="alcoholConsumption" options={[{ v: 'none', l: 'None' }, { v: 'occasional', l: 'Occasional' }, { v: 'moderate', l: 'Moderate' }, { v: 'heavy', l: 'Heavy' }]} />
              </FIELD>
              <FIELD label="Exercise Frequency">
                <Select field="exerciseFrequency" options={[{ v: 'sedentary', l: 'Sedentary' }, { v: 'light', l: 'Light (1-2/week)' }, { v: 'moderate', l: 'Moderate (3-4/week)' }, { v: 'active', l: 'Active (5-6/week)' }, { v: 'very_active', l: 'Very Active (daily)' }]} />
              </FIELD>
            </div>
          </Section>

          {/* Medical */}
          <Section title="Medical Information" icon="🏥">
            <div style={ts.stack}>
              <FIELD label="Known Allergies">
                <TagInput field="allergies" placeholder="e.g. Penicillin, Peanuts..." />
              </FIELD>
              <FIELD label="Chronic Conditions">
                <TagInput field="chronicConditions" placeholder="e.g. Diabetes, Hypertension..." />
              </FIELD>
              <FIELD label="Current Medications">
                <TagInput field="currentMedications" placeholder="e.g. Metformin, Aspirin..." />
              </FIELD>
              <FIELD label="Family Medical History">
                <TagInput field="familyHistory" placeholder="e.g. Heart disease, Cancer..." />
              </FIELD>
              <FIELD label="Dietary Preferences">
                <TagInput field="dietaryPreferences" placeholder="e.g. Vegetarian, Gluten-free..." />
              </FIELD>
            </div>
          </Section>

          {/* Emergency */}
          <Section title="Emergency Contact" icon="🆘">
            <div style={ts.grid3}>
              <FIELD label="Contact Name">
                <input className="input" placeholder="Full name"
                  value={form.profile.emergencyContact?.name || ''}
                  onChange={e => set('emergencyContact', { ...form.profile.emergencyContact, name: e.target.value })} />
              </FIELD>
              <FIELD label="Phone Number">
                <input className="input" placeholder="+91 XXXXXXXXXX"
                  value={form.profile.emergencyContact?.phone || ''}
                  onChange={e => set('emergencyContact', { ...form.profile.emergencyContact, phone: e.target.value })} />
              </FIELD>
              <FIELD label="Relation">
                <input className="input" placeholder="e.g. Spouse, Parent"
                  value={form.profile.emergencyContact?.relation || ''}
                  onChange={e => set('emergencyContact', { ...form.profile.emergencyContact, relation: e.target.value })} />
              </FIELD>
            </div>
          </Section>
        </div>

        <div style={ts.footer}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            🔒 Your data is private and only used to personalize your AI consultations
          </p>
          <button onClick={handleSave} disabled={saving || saved}
            className="btn btn-primary" style={{ minWidth: 130, justifyContent: 'center' }}>
            {saving ? <><Spinner /> Saving...</> : saved ? '✓ Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

const Section = ({ title, icon, children }) => (
  <div style={{ marginBottom: 28 }}>
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>{icon}</span> {title}
    </h3>
    {children}
  </div>
);

const Spinner = () => (
  <div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
);

const ts = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modal: { width: '100%', maxWidth: 680, maxHeight: '90vh', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow)' },
  header: { padding: '24px 28px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)' },
  subtitle: { fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: 3 },
  closeBtn: { padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: 6, transition: 'all 0.2s' },
  body: { flex: 1, overflowY: 'auto', padding: '24px 28px' },
  footer: { padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' },
  grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px 16px' },
  stack: { display: 'flex', flexDirection: 'column', gap: 16 },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'var(--teal-dim)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 20, fontSize: '0.775rem', color: 'var(--teal)' },
  tagRemove: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal)', fontWeight: 700, fontSize: '1rem', lineHeight: 1, padding: 0 },
  addBtn: { padding: '8px 14px', background: 'var(--teal-dim)', border: '1px solid rgba(0,201,167,0.2)', borderRadius: 8, cursor: 'pointer', color: 'var(--teal)', fontSize: '0.825rem', fontWeight: 500, whiteSpace: 'nowrap', transition: 'all 0.2s' },
};
