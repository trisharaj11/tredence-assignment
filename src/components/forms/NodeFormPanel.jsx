import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, Plus, Trash2 } from 'lucide-react';
import { Input, Textarea, Select, Toggle, Button } from '../ui';
import { useAppStore } from '../../store';
import { mockActions } from '../../api/mockApi';

function KVEditor({ pairs, onChange }) {
  return (
    <div>
      {pairs.map((pair, i) => (
        <div key={pair.id} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input placeholder="Key" value={pair.key} onChange={(e) => { const p = [...pairs]; p[i] = { ...p[i], key: e.target.value }; onChange(p); }}
            style={{ flex: 1, padding: '5px 8px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border-strong)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', outline: 'none' }} />
          <input placeholder="Value" value={pair.value} onChange={(e) => { const p = [...pairs]; p[i] = { ...p[i], value: e.target.value }; onChange(p); }}
            style={{ flex: 1, padding: '5px 8px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border-strong)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', outline: 'none' }} />
          <button onClick={() => onChange(pairs.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', display: 'flex', alignItems: 'center', padding: '0 4px', borderRadius: 4 }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...pairs, { id: uuidv4(), key: '', value: '' }])} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
        <Plus size={13} /> Add field
      </button>
    </div>
  );
}

function StartForm({ data, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Display Label" value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })} />
      <Input label="Start Title" value={data.startTitle || ''} onChange={(e) => onChange({ ...data, startTitle: e.target.value })} placeholder="e.g., New Employee Onboarding" />
      <div>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>Metadata (optional)</p>
        <KVEditor pairs={data.metadata || []} onChange={(metadata) => onChange({ ...data, metadata })} />
      </div>
    </div>
  );
}

function TaskForm({ data, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Display Label" value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })} />
      <Input label="Title *" value={data.title || ''} onChange={(e) => onChange({ ...data, title: e.target.value })} placeholder="Task title" />
      <Textarea label="Description" value={data.description || ''} onChange={(e) => onChange({ ...data, description: e.target.value })} placeholder="What needs to be done..." />
      <Input label="Assignee" value={data.assignee || ''} onChange={(e) => onChange({ ...data, assignee: e.target.value })} placeholder="e.g., HR Manager" />
      <Input label="Due Date" type="date" value={data.dueDate || ''} onChange={(e) => onChange({ ...data, dueDate: e.target.value })} />
      <div>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>Custom Fields</p>
        <KVEditor pairs={data.customFields || []} onChange={(customFields) => onChange({ ...data, customFields })} />
      </div>
    </div>
  );
}

function ApprovalForm({ data, onChange }) {
  const roles = [
    { value: 'Manager', label: 'Manager' },
    { value: 'HRBP', label: 'HRBP' },
    { value: 'Director', label: 'Director' },
    { value: 'VP', label: 'VP' },
    { value: 'CFO', label: 'CFO' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Display Label" value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })} />
      <Input label="Title" value={data.title || ''} onChange={(e) => onChange({ ...data, title: e.target.value })} placeholder="Approval step name" />
      <Select label="Approver Role" value={data.approverRole || 'Manager'} options={roles} onChange={(e) => onChange({ ...data, approverRole: e.target.value })} />
      <div>
        <Input label="Auto-approve Threshold (%)" type="number" min={0} max={100} value={data.autoApproveThreshold ?? 0} onChange={(e) => onChange({ ...data, autoApproveThreshold: Number(e.target.value) })} />
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Set to 0 to always require manual approval</p>
      </div>
    </div>
  );
}

function AutomatedForm({ data, onChange }) {
  const selectedAction = mockActions.find((a) => a.id === data.actionId);
  const actionOptions = [{ value: '', label: 'Select an action...' }, ...mockActions.map((a) => ({ value: a.id, label: a.label }))];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Display Label" value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })} />
      <Input label="Title" value={data.title || ''} onChange={(e) => onChange({ ...data, title: e.target.value })} />
      <Select label="Action" value={data.actionId || ''} options={actionOptions} onChange={(e) => onChange({ ...data, actionId: e.target.value, actionParams: {} })} />
      {selectedAction && selectedAction.params.length > 0 && (
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>Action Parameters</p>
          {selectedAction.params.map((param) => (
            <div key={param} style={{ marginBottom: 10 }}>
              <Input label={param} value={(data.actionParams || {})[param] || ''} onChange={(e) => onChange({ ...data, actionParams: { ...(data.actionParams || {}), [param]: e.target.value } })} placeholder={`Enter ${param}...`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EndForm({ data, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input label="Display Label" value={data.label} onChange={(e) => onChange({ ...data, label: e.target.value })} />
      <Textarea label="End Message" value={data.endMessage || ''} onChange={(e) => onChange({ ...data, endMessage: e.target.value })} placeholder="Workflow completion message..." />
      <Toggle checked={!!data.summaryFlag} onChange={(v) => onChange({ ...data, summaryFlag: v })} label="Generate summary on completion" />
    </div>
  );
}

const TYPE_LABELS = { start: 'Start Node', task: 'Task Node', approval: 'Approval Node', automated: 'Automated Step', end: 'End Node' };
const TYPE_COLORS = { start: 'var(--node-start)', task: 'var(--node-task)', approval: 'var(--node-approval)', automated: 'var(--node-automated)', end: 'var(--node-end)' };

export function NodeFormPanel({ nodeId, data, onUpdate, onDelete }) {
  const [localData, setLocalData] = useState(data);
  const setSelectedNode = useAppStore((s) => s.setSelectedNode);

  useEffect(() => { setLocalData(data); }, [nodeId]);

  function handleChange(updated) {
    setLocalData(updated);
    onUpdate(nodeId, updated);
  }

  const color = TYPE_COLORS[data.type] || 'var(--accent)';

  return (
    <div className="slide-right" style={{ width: 'var(--rightpanel-width)', height: '100%', background: 'var(--bg-primary)', borderLeft: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 20, borderRadius: 2, background: color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{TYPE_LABELS[data.type]}</p>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Configure node properties</p>
        </div>
        <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', padding: 4, borderRadius: 6 }}>
          <X size={15} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {localData.type === 'start' && <StartForm data={localData} onChange={handleChange} />}
        {localData.type === 'task' && <TaskForm data={localData} onChange={handleChange} />}
        {localData.type === 'approval' && <ApprovalForm data={localData} onChange={handleChange} />}
        {localData.type === 'automated' && <AutomatedForm data={localData} onChange={handleChange} />}
        {localData.type === 'end' && <EndForm data={localData} onChange={handleChange} />}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-default)' }}>
        <Button variant="danger" size="sm" icon={<Trash2 size={13} />} onClick={() => { onDelete(nodeId); setSelectedNode(null); }} style={{ width: '100%', justifyContent: 'center' }}>
          Delete Node
        </Button>
      </div>
    </div>
  );
}
