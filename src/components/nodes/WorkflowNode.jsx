import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useAppStore } from '../../store';

const NODE_CONFIGS = {
  start: {
    color: 'var(--node-start)', bg: 'var(--node-start-bg)',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.2"/><path d="M10 8l6 4-6 4V8z"/></svg>,
  },
  task: {
    color: 'var(--node-task)', bg: 'var(--node-task-bg)',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>,
  },
  approval: {
    color: 'var(--node-approval)', bg: 'var(--node-approval-bg)',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
  },
  automated: {
    color: 'var(--node-automated)', bg: 'var(--node-automated-bg)',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  },
  end: {
    color: 'var(--node-end)', bg: 'var(--node-end-bg)',
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.2"/><rect x="8" y="8" width="8" height="8" rx="1"/></svg>,
  },
};

function getSubtitle(data) {
  switch (data.type) {
    case 'start': return 'Entry point';
    case 'task': return data.assignee ? `→ ${data.assignee}` : 'No assignee';
    case 'approval': return data.approverRole || 'No approver';
    case 'automated': return data.actionId ? data.actionId.replace(/_/g, ' ') : 'No action set';
    case 'end': return 'Completion';
    default: return '';
  }
}

export const WorkflowNode = memo(function WorkflowNode({ id, data, selected }) {
  const setSelectedNode = useAppStore((s) => s.setSelectedNode);
  const cfg = NODE_CONFIGS[data.type] || NODE_CONFIGS.task;
  const isStart = data.type === 'start';
  const isEnd = data.type === 'end';

  return (
    <div
      onClick={() => setSelectedNode(id)}
      style={{
        background: 'var(--bg-primary)',
        border: `1.5px solid ${selected ? cfg.color : 'var(--border-default)'}`,
        borderRadius: 10,
        padding: '10px 14px',
        minWidth: 160,
        maxWidth: 220,
        cursor: 'pointer',
        boxShadow: selected ? 'var(--shadow-node-selected)' : 'var(--shadow-node)',
        transition: 'all 150ms ease',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 10, right: 10, height: 2, borderRadius: '0 0 2px 2px', background: cfg.color, opacity: selected ? 1 : 0.4, transition: 'opacity 150ms' }} />

      {!isStart && <Handle type="target" position={Position.Left} style={{ background: cfg.color }} />}
      {!isEnd && <Handle type="source" position={Position.Right} style={{ background: cfg.color }} />}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {cfg.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.label}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {getSubtitle(data)}
          </div>
        </div>
      </div>

      {/* Type badge */}
      <div style={{ position: 'absolute', top: -8, right: 8, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`, borderRadius: 99, fontSize: 9, fontWeight: 700, padding: '1px 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {data.type}
      </div>
    </div>
  );
});
