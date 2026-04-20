import React, { useState } from 'react';
import { X, Play, CheckCircle, AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { Button, Spinner } from '../ui';
import { simulateWorkflow } from '../../api/mockApi';

const STATUS_ICON = {
  success: <CheckCircle size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />,
  warning: <AlertTriangle size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />,
  error: <AlertCircle size={14} style={{ color: 'var(--error)', flexShrink: 0 }} />,
};

const TYPE_LABELS = { start: 'START', task: 'TASK', approval: 'APPROVE', automated: 'AUTO', end: 'END' };
const TYPE_COLORS = { start: 'var(--node-start)', task: 'var(--node-task)', approval: 'var(--node-approval)', automated: 'var(--node-automated)', end: 'var(--node-end)' };

function StepRow({ step, index }) {
  const time = new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const bg = step.status === 'success' ? 'var(--success-bg)' : step.status === 'warning' ? 'var(--warning-bg)' : 'var(--error-bg)';
  const border = step.status === 'success' ? 'var(--success-border)' : step.status === 'warning' ? 'var(--warning-border)' : 'var(--error-border)';
  return (
    <div className="fade-in" style={{ animationDelay: `${index * 60}ms`, display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 8, background: bg, border: `1px solid ${border}`, marginBottom: 6 }}>
      <div style={{ paddingTop: 1 }}>{STATUS_ICON[step.status]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: TYPE_COLORS[step.nodeType] || 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono)', border: `1px solid ${(TYPE_COLORS[step.nodeType] || 'var(--border-default)')}44`, letterSpacing: '0.04em' }}>
            {TYPE_LABELS[step.nodeType] || step.nodeType?.toUpperCase()}
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{step.nodeLabel}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{step.message}</p>
        <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>{time}</p>
      </div>
    </div>
  );
}

export function SandboxPanel({ nodes, edges, onClose }) {
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  async function handleRun() {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await simulateWorkflow(nodes, edges);
      setResult(res);
    } finally {
      setIsRunning(false);
    }
  }

  const successCount = result?.steps.filter((s) => s.status === 'success').length ?? 0;
  const warningCount = result?.steps.filter((s) => s.status === 'warning').length ?? 0;
  const errorCount = result?.errors.length ?? 0;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} className="fade-in" style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: 540, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Workflow Sandbox</h2>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{nodes.length} nodes · {edges.length} connections</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button variant="primary" size="md" onClick={handleRun} loading={isRunning} icon={!isRunning ? <Play size={13} /> : undefined}>
              {isRunning ? 'Running...' : 'Run Simulation'}
            </Button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', padding: 6, borderRadius: 8 }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {!result && !isRunning && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Play size={24} style={{ color: 'var(--accent)', marginLeft: 2 }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>Ready to simulate</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 280, margin: '0 auto' }}>Click "Run Simulation" to validate and test your workflow execution path.</p>
            </div>
          )}
          {isRunning && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Spinner size={32} />
              <p className="pulse" style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 16 }}>Simulating workflow execution...</p>
            </div>
          )}
          {result && !isRunning && (
            <div>
              {/* Summary */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 20, padding: '12px 14px', borderRadius: 10, background: result.success ? 'var(--success-bg)' : 'var(--error-bg)', border: `1px solid ${result.success ? 'var(--success-border)' : 'var(--error-border)'}` }}>
                {result.success ? <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} /> : <AlertCircle size={18} style={{ color: 'var(--error)', flexShrink: 0 }} />}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: result.success ? 'var(--success)' : 'var(--error)' }}>{result.success ? 'Simulation Passed' : 'Simulation Failed'}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{result.steps.length} steps · {successCount} ok · {warningCount} warnings · {errorCount} errors · {result.duration}</p>
                </div>
              </div>
              {/* Errors */}
              {result.errors.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--error)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={13} /> Validation Errors
                  </p>
                  {result.errors.map((err, i) => (
                    <div key={i} style={{ padding: '8px 12px', borderRadius: 7, background: 'var(--error-bg)', border: '1px solid var(--error-border)', marginBottom: 5, fontSize: 12, color: 'var(--error)' }}>{err}</div>
                  ))}
                </div>
              )}
              {/* Steps */}
              {result.steps.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> Execution Log
                  </p>
                  {result.steps.map((step, i) => <StepRow key={step.nodeId} step={step} index={i} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
