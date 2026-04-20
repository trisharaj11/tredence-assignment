import React, { useState } from 'react';
import { Search } from 'lucide-react';

const NODE_TYPES = [
  { type: 'start', label: 'Start Node', subtitle: 'Workflow entry point', color: 'var(--node-start)', bg: 'var(--node-start-bg)', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.2"/><path d="M10 8l6 4-6 4V8z"/></svg> },
  { type: 'task', label: 'Task Node', subtitle: 'Human task assignment', color: 'var(--node-task)', bg: 'var(--node-task-bg)', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg> },
  { type: 'approval', label: 'Approval Node', subtitle: 'Manager/HR approval step', color: 'var(--node-approval)', bg: 'var(--node-approval-bg)', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg> },
  { type: 'automated', label: 'Automated Step', subtitle: 'System-triggered action', color: 'var(--node-automated)', bg: 'var(--node-automated-bg)', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
  { type: 'end', label: 'End Node', subtitle: 'Workflow completion', color: 'var(--node-end)', bg: 'var(--node-end-bg)', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.2"/><rect x="8" y="8" width="8" height="8" rx="1"/></svg> },
];

export function NodesSidebar({ onDragStart }) {
  const [search, setSearch] = useState('');
  const filtered = NODE_TYPES.filter((n) => !search || n.label.toLowerCase().includes(search.toLowerCase()) || n.subtitle.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ width: 196, flexShrink: 0, background: 'var(--bg-primary)', borderRight: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid var(--border-default)' }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Node Library</p>
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search nodes..." style={{ width: '100%', padding: '5px 8px 5px 26px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border-strong)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-sans)' }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 4 }}>Drag onto canvas</p>
        {filtered.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 4, borderRadius: 8, border: '1px solid var(--border-default)', cursor: 'grab', background: 'var(--bg-primary)', transition: 'all 150ms', userSelect: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = node.color; e.currentTarget.style.background = node.bg; e.currentTarget.style.transform = 'translateX(2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'var(--bg-primary)'; e.currentTarget.style.transform = 'translateX(0)'; }}
          >
            <div style={{ width: 28, height: 28, borderRadius: 7, background: node.bg, color: node.color, border: `1px solid ${node.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {node.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>{node.label}</p>
              <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>{node.subtitle}</p>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 16, padding: 10, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-default)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Tips</p>
          {['Drag nodes onto canvas', 'Click node to edit', 'Drag handles to connect', 'Backspace to delete'].map((tip) => (
            <p key={tip} style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3, display: 'flex', gap: 4 }}>
              <span style={{ color: 'var(--accent)' }}>·</span> {tip}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
