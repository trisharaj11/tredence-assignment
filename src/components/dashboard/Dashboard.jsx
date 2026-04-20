import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Plus, Search, MoreHorizontal, Trash2, Copy, Edit3,
  GitBranch, Clock, ArrowRight, CheckCircle, FileText,
  Archive, Activity, Settings, Sun, Moon, Monitor,
  RotateCcw, Palette, AlertTriangle
} from 'lucide-react';
import { Button, Badge, Modal, Input, Textarea } from '../ui';
import { useAppStore } from '../../store';
import { formatDistanceToNow } from 'date-fns';

const STATUS_CONFIG = {
  active:   { label: 'Active',   variant: 'success' },
  draft:    { label: 'Draft',    variant: 'warning' },
  archived: { label: 'Archived', variant: 'default' },
};

const TAG_COLORS = {
  HR: 'var(--info-bg)', Onboarding: 'var(--success-bg)', Leave: 'var(--warning-bg)',
  Approval: 'var(--info-bg)', Compliance: 'var(--error-bg)', Documents: 'var(--accent-light)',
};

const THEME_OPTIONS = [
  { value: 'light',  label: 'Light',  icon: <Sun size={16} /> },
  { value: 'dark',   label: 'Dark',   icon: <Moon size={16} /> },
  { value: 'system', label: 'System', icon: <Monitor size={16} /> },
];

// ─── Portal ───────────────────────────────────────────────────────────────────
// Renders children directly into document.body so z-index / overflow
// from parent cards can NEVER clip the dropdown.
function Portal({ children }) {
  return ReactDOM.createPortal(children, document.body);
}

// ─── ContextMenu (via Portal) ─────────────────────────────────────────────────
function ContextMenu({ items, anchorRef, onClose }) {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, ready: false });

  // Calculate position after first paint
  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const itemCount = items.filter(Boolean).length;
    const approxHeight = itemCount * 38 + 16;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const top = spaceBelow >= approxHeight
      ? rect.bottom + 4
      : rect.top - approxHeight - 4;
    const left = Math.max(8, Math.min(rect.right - 172, window.innerWidth - 180));
    setPos({ top, left, ready: true });
  }, []);

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      const clickedMenu   = menuRef.current   && menuRef.current.contains(e.target);
      const clickedAnchor = anchorRef.current && anchorRef.current.contains(e.target);
      if (!clickedMenu && !clickedAnchor) onClose();
    }
    // Delay so the opening click doesn't immediately close it
    const t = setTimeout(() => document.addEventListener('mousedown', handle), 10);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handle); };
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <Portal>
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: 176,
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-strong)',
          borderRadius: 10,
          boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.10)',
          zIndex: 2147483647,   // max possible z-index
          padding: '4px 0',
          opacity: pos.ready ? 1 : 0,
          transition: 'opacity 120ms ease',
          pointerEvents: pos.ready ? 'auto' : 'none',
        }}
      >
        {items.map((item, i) =>
          item === null ? (
            <div
              key={`sep-${i}`}
              style={{ height: 1, background: 'var(--border-default)', margin: '3px 0' }}
            />
          ) : (
            <button
              key={item.label}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                item.action();
                onClose();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: item.danger ? 'var(--error)' : 'var(--text-primary)',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                transition: 'background 80ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = item.danger
                  ? 'var(--error-bg)'
                  : 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <span style={{
                color: item.danger ? 'var(--error)' : 'var(--text-tertiary)',
                display: 'flex',
                flexShrink: 0,
              }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        )}
      </div>
    </Portal>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({ open, onClose }) {
  const { theme, setTheme, workflows, deleteWorkflow } = useAppStore();
  const [resetStep, setResetStep] = useState(0);

  function handleDeleteAll() {
    const ids = useAppStore.getState().workflows.map((w) => w.id);
    ids.forEach((id) => deleteWorkflow(id));
    setResetStep(0);
    onClose();
  }

  function handleFullReset() {
    if (resetStep === 0) { setResetStep(1); return; }
    localStorage.removeItem('hr-workflow-store');
    window.location.reload();
  }

  return (
    <Modal open={open} onClose={() => { setResetStep(0); onClose(); }} title="Settings" width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Appearance */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Palette size={14} style={{ color: 'var(--accent)' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Appearance</p>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Choose how the app looks to you.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {THEME_OPTIONS.map((opt) => {
              const active = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  style={{
                    padding: '14px 8px', borderRadius: 10, border: '2px solid',
                    borderColor: active ? 'var(--accent)' : 'var(--border-default)',
                    background: active ? 'var(--accent-light)' : 'var(--bg-secondary)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 7, transition: 'all 150ms',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <span style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }}>{opt.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? 'var(--accent)' : 'var(--text-secondary)' }}>
                    {opt.label}
                  </span>
                  {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />}
                </button>
              );
            })}
          </div>
        </section>

        <div style={{ height: 1, background: 'var(--border-default)' }} />

        {/* Stats */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <GitBranch size={14} style={{ color: 'var(--accent)' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Dashboard Overview</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { label: 'Total',  value: workflows.length },
              { label: 'Active', value: workflows.filter((w) => w.status === 'active').length },
              { label: 'Draft',  value: workflows.filter((w) => w.status === 'draft').length },
            ].map((s) => (
              <div key={s.label} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-default)', textAlign: 'center' }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: 'var(--border-default)' }} />

        {/* Danger Zone */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={14} style={{ color: 'var(--error)' }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--error)' }}>Danger Zone</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--error-border)', background: 'var(--error-bg)' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>Delete all workflows</p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Permanently remove every workflow</p>
              </div>
              <Button variant="danger" size="sm" icon={<Trash2 size={12} />} onClick={handleDeleteAll}>Delete All</Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--error-border)', background: 'var(--error-bg)' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>Reset everything</p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Restore defaults & reload the app</p>
              </div>
              <Button
                variant="danger" size="sm" icon={<RotateCcw size={12} />}
                onClick={handleFullReset}
                style={resetStep === 1 ? { background: 'var(--error)', color: '#fff', borderColor: 'var(--error)' } : {}}
              >
                {resetStep === 1 ? 'Confirm' : 'Reset'}
              </Button>
            </div>
            {resetStep === 1 && (
              <p style={{ fontSize: 11, color: 'var(--error)', textAlign: 'right' }}>
                Click Confirm again — this cannot be undone
              </p>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}

// ─── WorkflowCard ─────────────────────────────────────────────────────────────
function WorkflowCard({ workflow, onOpen, onDelete, onDuplicate, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef = useRef(null);
  const updatedAgo = formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true });
  const status = STATUS_CONFIG[workflow.status] || STATUS_CONFIG.draft;

  const menuItems = [
    {
      icon: <Edit3 size={14} />,
      label: 'Open Designer',
      action: () => onOpen(workflow.id),
    },
    {
      icon: <Copy size={14} />,
      label: 'Duplicate',
      action: () => onDuplicate(workflow.id),
    },
    null,
    {
      icon: <Activity size={14} />,
      label: workflow.status === 'active' ? 'Set as Draft' : 'Set as Active',
      action: () => onStatusChange(workflow.id, workflow.status === 'active' ? 'draft' : 'active'),
    },
    {
      icon: <Archive size={14} />,
      label: workflow.status === 'archived' ? 'Unarchive' : 'Archive',
      action: () => onStatusChange(workflow.id, workflow.status === 'archived' ? 'draft' : 'archived'),
    },
    null,
    {
      icon: <Trash2 size={14} />,
      label: 'Delete',
      action: () => onDelete(workflow.id),
      danger: true,
    },
  ];

  function toggleMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen((v) => !v);
  }

  return (
    <div
      className="fade-in"
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-default)',
        borderRadius: 12,
        transition: 'box-shadow 150ms, border-color 150ms',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--border-strong)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border-default)';
      }}
    >
      {/* Status bar */}
      <div style={{
        height: 3,
        borderRadius: '12px 12px 0 0',
        background: workflow.status === 'active'
          ? 'var(--success)'
          : workflow.status === 'draft'
            ? 'var(--warning)'
            : 'var(--border-strong)',
      }} />

      <div style={{ padding: '16px 18px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {workflow.name}
              </h3>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {workflow.description || 'No description provided.'}
            </p>
          </div>

          {/* 3-dot button */}
          <button
            ref={btnRef}
            onMouseDown={toggleMenu}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              background: menuOpen ? 'var(--bg-active)' : 'transparent',
              border: '1px solid',
              borderColor: menuOpen ? 'var(--border-strong)' : 'transparent',
              borderRadius: 7,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.borderColor = 'var(--border-strong)';
            }}
            onMouseLeave={(e) => {
              if (!menuOpen) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Tags */}
        {workflow.tags && workflow.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
            {workflow.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 99,
                background: TAG_COLORS[tag] || 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
          {[
            { icon: <GitBranch size={11} />, value: workflow.nodes?.length || 0, label: 'nodes' },
            { icon: <ArrowRight size={11} />, value: workflow.edges?.length || 0, label: 'edges' },
          ].map((stat) => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--text-tertiary)' }}>{stat.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{stat.value}</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{stat.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <Clock size={11} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{updatedAgo}</span>
          </div>
        </div>

        {/* Open button */}
        <button
          onClick={() => onOpen(workflow.id)}
          style={{
            width: '100%', padding: '7px 12px', borderRadius: 8,
            border: '1px solid var(--border-strong)', background: 'transparent',
            cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontFamily: 'var(--font-sans)', transition: 'background 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          Open Designer <ArrowRight size={13} />
        </button>
      </div>

      {/* Context menu rendered via portal into document.body */}
      {menuOpen && (
        <ContextMenu
          items={menuItems}
          anchorRef={btnRef}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const {
    workflows, createWorkflow, deleteWorkflow,
    duplicateWorkflow, updateWorkflow,
    setActiveWorkflow, setCurrentView,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filtered = workflows.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch = !search
      || w.name.toLowerCase().includes(q)
      || (w.description || '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || w.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function handleCreate() {
    if (!newName.trim()) return;
    const wf = createWorkflow(newName.trim(), newDesc.trim());
    setNewName(''); setNewDesc(''); setCreateModalOpen(false);
    setActiveWorkflow(wf.id);
    setCurrentView('designer');
  }

  const stats = {
    total:    workflows.length,
    active:   workflows.filter((w) => w.status === 'active').length,
    draft:    workflows.filter((w) => w.status === 'draft').length,
    archived: workflows.filter((w) => w.status === 'archived').length,
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-secondary)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Workflow Designer
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Build and manage HR workflows visually
            </p>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 14px', borderRadius: 9,
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-primary)', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)', transition: 'all 150ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Settings size={15} /> Settings
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Total',    value: stats.total,    icon: <FileText size={16} />,    color: 'var(--info)' },
            { label: 'Active',   value: stats.active,   icon: <CheckCircle size={16} />, color: 'var(--success)' },
            { label: 'Draft',    value: stats.draft,    icon: <Edit3 size={16} />,       color: 'var(--warning)' },
            { label: 'Archived', value: stats.archived, icon: <Archive size={16} />,     color: 'var(--text-tertiary)' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: stat.color }}>{stat.icon}</div>
              <div>
                <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workflows..."
              style={{ width: '100%', padding: '7px 10px 7px 32px', fontSize: 13, borderRadius: 8, border: '1px solid var(--border-strong)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-sans)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'active', 'draft', 'archived'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                style={{
                  padding: '5px 13px', borderRadius: 99, fontSize: 12, fontWeight: 500,
                  border: '1px solid', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  transition: 'all 150ms',
                  borderColor: filterStatus === f ? 'var(--accent)' : 'var(--border-strong)',
                  background: filterStatus === f ? 'var(--accent)' : 'var(--bg-primary)',
                  color: filterStatus === f ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={() => setCreateModalOpen(true)}>
            New Workflow
          </Button>
        </div>

        {/* Workflow grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Search size={28} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {search ? 'No workflows found' : 'No workflows yet'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              {search ? 'Try a different search term' : 'Create your first workflow to get started'}
            </p>
            {!search && (
              <Button variant="primary" size="md" icon={<Plus size={14} />} onClick={() => setCreateModalOpen(true)} style={{ marginTop: 16 }}>
                Create Workflow
              </Button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map((wf) => (
              <WorkflowCard
                key={wf.id}
                workflow={wf}
                onOpen={(id) => { setActiveWorkflow(id); setCurrentView('designer'); }}
                onDelete={(id) => setDeleteTarget(id)}
                onDuplicate={duplicateWorkflow}
                onStatusChange={(id, s) => updateWorkflow(id, { status: s })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}

      <Modal
        open={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setNewName(''); setNewDesc(''); }}
        title="Create New Workflow"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Workflow Name *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g., Employee Onboarding"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Textarea
            label="Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="What does this workflow do?"
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} disabled={!newName.trim()}>Create & Open</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Workflow" width={400}>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            {workflows.find((w) => w.id === deleteTarget)?.name}
          </strong>?{' '}
          This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            variant="danger"
            icon={<Trash2 size={13} />}
            onClick={() => {
              if (deleteTarget) { deleteWorkflow(deleteTarget); setDeleteTarget(null); }
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
