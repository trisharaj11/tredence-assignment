import React from 'react';

export function Button({ variant = 'secondary', size = 'md', loading, icon, children, className, disabled, style, ...props }) {
  const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 500, cursor: disabled || loading ? 'not-allowed' : 'pointer', border: '1px solid', borderRadius: 8, transition: 'all 150ms', opacity: disabled || loading ? 0.5 : 1, whiteSpace: 'nowrap' };
  const sizes = { sm: { padding: '4px 10px', fontSize: 12, height: 28 }, md: { padding: '6px 12px', fontSize: 13, height: 32 }, lg: { padding: '8px 16px', fontSize: 13, height: 36 } };
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' },
    secondary: { background: 'var(--bg-primary)', color: 'var(--text-primary)', borderColor: 'var(--border-strong)' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', borderColor: 'transparent' },
    danger: { background: 'var(--error-bg)', color: 'var(--error)', borderColor: 'var(--error-border)' },
  };
  return (
    <button disabled={disabled || loading} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = disabled || loading ? '0.5' : '1'; }}
      {...props}
    >
      {loading ? <Spinner size={14} /> : icon}
      {children}
    </button>
  );
}

export function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' },
    success: { background: 'var(--success-bg)', color: 'var(--success)' },
    warning: { background: 'var(--warning-bg)', color: 'var(--warning)' },
    error: { background: 'var(--error-bg)', color: 'var(--error)' },
    info: { background: 'var(--info-bg)', color: 'var(--info)' },
    accent: { background: 'var(--accent-light)', color: 'var(--accent-text)' },
  };
  return (
    <span style={{ ...variants[variant], display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 500 }}>
      {children}
    </span>
  );
}

export function Input({ label, error, id, style, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label htmlFor={inputId} style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
      <input
        id={inputId}
        style={{ width: '100%', padding: '6px 10px', fontSize: 13, borderRadius: 7, border: `1px solid ${error ? 'var(--error-border)' : 'var(--border-strong)'}`, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', outline: 'none', ...style }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
        onBlur={(e) => { e.target.style.borderColor = error ? 'var(--error-border)' : 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
        {...props}
      />
      {error && <p style={{ fontSize: 11, color: 'var(--error)' }}>{error}</p>}
    </div>
  );
}

export function Textarea({ label, id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label htmlFor={inputId} style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
      <textarea
        id={inputId} rows={3}
        style={{ width: '100%', padding: '6px 10px', fontSize: 13, borderRadius: 7, border: '1px solid var(--border-strong)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', outline: 'none', resize: 'none' }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
        {...props}
      />
    </div>
  );
}

export function Select({ label, options, id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label htmlFor={inputId} style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>}
      <select
        id={inputId}
        style={{ width: '100%', padding: '6px 10px', fontSize: 13, borderRadius: 7, border: '1px solid var(--border-strong)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer' }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)'; }}
        {...props}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <div onClick={() => onChange(!checked)} style={{ width: 36, height: 20, borderRadius: 99, background: checked ? 'var(--accent)' : 'var(--border-strong)', position: 'relative', transition: 'background 200ms', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </div>
      {label && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>}
    </label>
  );
}

export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade-in" style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4, borderRadius: 6, display: 'flex' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor"><path d="M11.782 4.032a.575.575 0 10-.813-.813L7.5 6.687 4.032 3.22a.575.575 0 00-.813.813L6.687 7.5l-3.468 3.468a.575.575 0 00.813.813L7.5 8.313l3.468 3.468a.575.575 0 00.813-.813L8.313 7.5l3.469-3.468z"/></svg>
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
