import React, { useEffect } from 'react';
import { LayoutDashboard, GitBranch, Settings, HelpCircle, Sun, Moon, Monitor, ChevronLeft, Menu } from 'lucide-react';
import { useAppStore } from '../../store';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: <Sun size={13} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={13} /> },
  { value: 'system', label: 'System', icon: <Monitor size={13} /> },
];

function useTheme() {
  const theme = useAppStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    function apply(isDark) { root.setAttribute('data-theme', isDark ? 'dark' : 'light'); }
    if (theme === 'dark') { apply(true); return; }
    if (theme === 'light') { apply(false); return; }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mq.matches);
    const handler = (e) => apply(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);
}

export function AppLayout({ children }) {
  useTheme();
  const { currentView, setCurrentView, theme, setTheme, workflows, activeWorkflowId } = useAppStore();
  const [collapsed, setCollapsed] = React.useState(false);
  const activeWorkflow = workflows.find((w) => w.id === activeWorkflowId);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} />, onClick: () => setCurrentView('dashboard'), disabled: false },
    { id: 'designer', label: activeWorkflow?.name || 'Designer', icon: <GitBranch size={16} />, onClick: () => activeWorkflowId && setCurrentView('designer'), disabled: !activeWorkflowId },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-secondary)', fontFamily: 'var(--font-sans)' }}>
      {/* Sidebar */}
      <div style={{ width: collapsed ? 56 : 'var(--sidebar-width)', flexShrink: 0, background: 'var(--bg-primary)', borderRight: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', transition: 'width 200ms ease', overflow: 'hidden' }}>
        {/* Logo */}
        <div style={{ height: 'var(--toolbar-height)', padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>HR Designer</p>
                <p style={{ fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1, marginTop: 1 }}>Tredence Studio</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', padding: 4, borderRadius: 6, marginLeft: collapsed ? 'auto' : 0 }}>
            {collapsed ? <Menu size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflow: 'hidden' }}>
          {!collapsed && <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px', marginBottom: 4 }}>Navigation</p>}
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button key={item.id} onClick={item.onClick} disabled={item.disabled} title={collapsed ? item.label : undefined}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 2, borderRadius: 8, border: 'none', background: isActive ? 'var(--accent-light)' : 'transparent', color: isActive ? 'var(--accent)' : item.disabled ? 'var(--text-tertiary)' : 'var(--text-secondary)', fontWeight: isActive ? 600 : 400, fontSize: 13, cursor: item.disabled ? 'not-allowed' : 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)', transition: 'all 150ms', overflow: 'hidden', whiteSpace: 'nowrap', opacity: item.disabled ? 0.5 : 1, justifyContent: collapsed ? 'center' : 'flex-start' }}
                onMouseEnter={(e) => { if (!isActive && !item.disabled) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-default)', flexShrink: 0 }}>
          {!collapsed && (
            <>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 8 }}>Appearance</p>
              <div style={{ display: 'flex', gap: 4, padding: '0 4px', marginBottom: 8 }}>
                {THEME_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => setTheme(opt.value)} title={opt.label} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '5px 4px', borderRadius: 6, border: '1px solid', borderColor: theme === opt.value ? 'var(--accent)' : 'var(--border-default)', background: theme === opt.value ? 'var(--accent-light)' : 'transparent', color: theme === opt.value ? 'var(--accent)' : 'var(--text-tertiary)', cursor: 'pointer', fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
          {collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', marginBottom: 8 }}>
              {THEME_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setTheme(opt.value)} title={opt.label} style={{ width: 32, height: 28, borderRadius: 6, border: '1px solid', borderColor: theme === opt.value ? 'var(--accent)' : 'transparent', background: theme === opt.value ? 'var(--accent-light)' : 'transparent', color: theme === opt.value ? 'var(--accent)' : 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {opt.icon}
                </button>
              ))}
            </div>
          )}
          {[{ icon: <Settings size={15} />, label: 'Settings' }, { icon: <HelpCircle size={15} />, label: 'Help & Support' }].map((item) => (
            <button key={item.label} title={collapsed ? item.label : undefined} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-tertiary)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)', marginBottom: 2, justifyContent: collapsed ? 'center' : 'flex-start', whiteSpace: 'nowrap', overflow: 'hidden' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
              {item.icon}
              {!collapsed && item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
