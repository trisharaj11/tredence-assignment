import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  addEdge, useNodesState, useEdgesState, BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { Play, Download, Upload, Save, LayoutGrid, Undo2, Redo2 } from 'lucide-react';

import { WorkflowNode } from '../nodes/WorkflowNode';
import { NodesSidebar } from './NodesSidebar';
import { NodeFormPanel } from '../forms/NodeFormPanel';
import { SandboxPanel } from './SandboxPanel';
import { Button, Badge } from '../ui';
import { useAppStore } from '../../store';

const nodeTypes = { workflowNode: WorkflowNode };

const DEFAULT_DATA = {
  start:     { type: 'start',     label: 'Start',     startTitle: 'Workflow Start', metadata: [] },
  task:      { type: 'task',      label: 'New Task',  title: 'New Task', description: '', assignee: '', dueDate: '', customFields: [] },
  approval:  { type: 'approval',  label: 'Approval',  title: 'Approval Step', approverRole: 'Manager', autoApproveThreshold: 0 },
  automated: { type: 'automated', label: 'Automated', title: 'Automated Step', actionId: '', actionParams: {} },
  end:       { type: 'end',       label: 'End',       endMessage: 'Workflow completed.', summaryFlag: false },
};

const MAX_HISTORY = 50; // max undo steps

function useUndoRedo(initialNodes, initialEdges) {
  // Each history entry = { nodes, edges }
  const [history, setHistory] = useState([{ nodes: initialNodes, edges: initialEdges }]);
  const [pointer, setPointer] = useState(0);

  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  // Push a new snapshot — call this after any meaningful change
  const pushHistory = useCallback((nodes, edges) => {
    setHistory((prev) => {
      // Discard any redo future
      const trimmed = prev.slice(0, pointer + 1);
      const next = [...trimmed, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
      // Cap at max
      if (next.length > MAX_HISTORY) next.shift();
      return next;
    });
    setPointer((p) => Math.min(p + 1, MAX_HISTORY - 1));
  }, [pointer]);

  const undo = useCallback(() => {
    if (!canUndo) return null;
    const newPtr = pointer - 1;
    setPointer(newPtr);
    return history[newPtr];
  }, [canUndo, pointer, history]);

  const redo = useCallback(() => {
    if (!canRedo) return null;
    const newPtr = pointer + 1;
    setPointer(newPtr);
    return history[newPtr];
  }, [canRedo, pointer, history]);

  // Reset when loading a different workflow
  const resetHistory = useCallback((nodes, edges) => {
    setHistory([{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
    setPointer(0);
  }, []);

  return { canUndo, canRedo, pushHistory, undo, redo, resetHistory, historySize: history.length, pointer };
}

export function WorkflowCanvas() {
  const {
    activeWorkflowId, workflows, selectedNodeId,
    setSelectedNode, saveCanvasState, setCurrentView,
    setIsSandboxOpen, isSandboxOpen,
  } = useAppStore();

  const workflow = workflows.find((w) => w.id === activeWorkflowId);

  const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.edges || []);
  const [saved, setSaved] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [rfInstance, setRfInstance] = useState(null);

  // Toast for undo/redo feedback
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const wrapperRef = useRef(null);

  const { canUndo, canRedo, pushHistory, undo, redo, resetHistory, pointer, historySize } = useUndoRedo(
    workflow?.nodes || [],
    workflow?.edges || []
  );

  // Track whether change was triggered by undo/redo (to avoid double-pushing)
  const isUndoRedo = useRef(false);

  // Load workflow when switching
  useEffect(() => {
    if (workflow) {
      const n = workflow.nodes || [];
      const e = workflow.edges || [];
      isUndoRedo.current = true;
      setNodes(n);
      setEdges(e);
      resetHistory(n, e);
      setTimeout(() => { isUndoRedo.current = false; }, 0);
    }
  }, [activeWorkflowId]);

  function showToast(msg, type = 'info') {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    function handleKey(e) {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); handleRedo(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [canUndo, canRedo, pointer, historySize]);

  function handleUndo() {
    const snapshot = undo();
    if (!snapshot) { showToast('Nothing to undo', 'warn'); return; }
    isUndoRedo.current = true;
    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
    showToast('Undone', 'success');
    setTimeout(() => { isUndoRedo.current = false; }, 0);
  }

  function handleRedo() {
    const snapshot = redo();
    if (!snapshot) { showToast('Nothing to redo', 'warn'); return; }
    isUndoRedo.current = true;
    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
    showToast('Redone', 'success');
    setTimeout(() => { isUndoRedo.current = false; }, 0);
  }

  // ── Push snapshot on meaningful node/edge changes ───────────────────────────
  // We intercept setNodes/setEdges for operations we control explicitly.
  // React Flow's onNodesChange fires for position drags too — we push on mouse-up.
  const dragEndPush = useRef(false);

  const onNodesChangeWithHistory = useCallback((changes) => {
    onNodesChange(changes);
    // Only push history for remove changes (not position moves — handled by onNodeDragStop)
    if (!isUndoRedo.current) {
      const hasRemove = changes.some((c) => c.type === 'remove');
      if (hasRemove) {
        // Use setTimeout so state has settled
        setTimeout(() => {
          setNodes((currentNodes) => {
            setEdges((currentEdges) => {
              pushHistory(currentNodes, currentEdges);
              return currentEdges;
            });
            return currentNodes;
          });
        }, 0);
      }
    }
  }, [onNodesChange, pushHistory]);

  const onEdgesChangeWithHistory = useCallback((changes) => {
    onEdgesChange(changes);
    if (!isUndoRedo.current) {
      const hasRemove = changes.some((c) => c.type === 'remove');
      if (hasRemove) {
        setTimeout(() => {
          setNodes((currentNodes) => {
            setEdges((currentEdges) => {
              pushHistory(currentNodes, currentEdges);
              return currentEdges;
            });
            return currentNodes;
          });
        }, 0);
      }
    }
  }, [onEdgesChange, pushHistory]);

  // Push history after node drag ends
  const onNodeDragStop = useCallback(() => {
    if (isUndoRedo.current) return;
    setNodes((currentNodes) => {
      setEdges((currentEdges) => {
        pushHistory(currentNodes, currentEdges);
        return currentEdges;
      });
      return currentNodes;
    });
  }, [pushHistory]);

  // ── Connect ──────────────────────────────────────────────────────────────────
  const onConnect = useCallback((params) => {
    const newEdge = { ...params, id: `e-${uuidv4().slice(0, 6)}`, type: 'smoothstep' };
    setEdges((eds) => {
      const updated = addEdge(newEdge, eds);
      setNodes((ns) => { pushHistory(ns, updated); return ns; });
      return updated;
    });
  }, [setEdges, setNodes, pushHistory]);

  // ── Drag & drop ──────────────────────────────────────────────────────────────
  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setIsDraggingOver(true); }, []);
  const onDragLeave = useCallback(() => setIsDraggingOver(false), []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type || !rfInstance) return;
    const position = rfInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const newNode = {
      id: `n-${uuidv4().slice(0, 6)}`,
      type: 'workflowNode',
      position,
      data: { ...DEFAULT_DATA[type] },
    };
    setNodes((nds) => {
      const updated = [...nds, newNode];
      setEdges((eds) => { pushHistory(updated, eds); return eds; });
      return updated;
    });
  }, [rfInstance, setNodes, setEdges, pushHistory]);

  const onDragStart = (e, nodeType) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // ── Node update / delete ─────────────────────────────────────────────────────
  const handleNodeUpdate = useCallback((nodeId, data) => {
    setNodes((nds) => {
      const updated = nds.map((n) => n.id === nodeId ? { ...n, data: { ...data } } : n);
      setEdges((eds) => { pushHistory(updated, eds); return eds; });
      return updated;
    });
  }, [setNodes, setEdges, pushHistory]);

  const handleNodeDelete = useCallback((nodeId) => {
    setNodes((nds) => {
      const updated = nds.filter((n) => n.id !== nodeId);
      setEdges((eds) => {
        const updatedEdges = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
        pushHistory(updated, updatedEdges);
        return updatedEdges;
      });
      return updated;
    });
  }, [setNodes, setEdges, pushHistory]);

  // ── Save / Export / Import ───────────────────────────────────────────────────
  const handleSave = () => {
    if (!activeWorkflowId) return;
    saveCanvasState(activeWorkflowId, nodes, edges);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = JSON.stringify({ nodes, edges, metadata: { workflowId: activeWorkflowId, name: workflow?.name, exportedAt: new Date().toISOString() } }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(workflow?.name || 'workflow').replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          const n = parsed.nodes || [];
          const ed = parsed.edges || [];
          isUndoRedo.current = true;
          setNodes(n);
          setEdges(ed);
          resetHistory(n, ed);
          setTimeout(() => { isUndoRedo.current = false; }, 0);
        } catch { alert('Invalid workflow JSON file.'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Toolbar ── */}
      <div style={{ height: 'var(--toolbar-height)', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8, flexShrink: 0 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          <button onClick={() => setCurrentView('dashboard')} style={{ fontSize: 13, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, fontFamily: 'var(--font-sans)' }}>
            Workflows
          </button>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{workflow?.name || 'Untitled'}</span>
          {workflow?.status === 'draft'  && <Badge variant="warning">Draft</Badge>}
          {workflow?.status === 'active' && <Badge variant="success">Active</Badge>}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

          {/* Undo / Redo group */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', background: 'none', border: 'none',
                cursor: canUndo ? 'pointer' : 'not-allowed',
                color: canUndo ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500,
                transition: 'background 150ms',
                opacity: canUndo ? 1 : 0.45,
              }}
              onMouseEnter={(e) => { if (canUndo) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              <Undo2 size={14} /> Undo
            </button>
            <div style={{ width: 1, height: 20, background: 'var(--border-default)' }} />
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', background: 'none', border: 'none',
                cursor: canRedo ? 'pointer' : 'not-allowed',
                color: canRedo ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontSize: 12, fontFamily: 'var(--font-sans)', fontWeight: 500,
                transition: 'background 150ms',
                opacity: canRedo ? 1 : 0.45,
              }}
              onMouseEnter={(e) => { if (canRedo) e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              <Redo2 size={14} /> Redo
            </button>
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--border-default)', margin: '0 4px' }} />

          <Button variant="ghost" size="sm" icon={<Upload size={13} />} onClick={handleImport}>Import</Button>
          <Button variant="ghost" size="sm" icon={<Download size={13} />} onClick={handleExport}>Export</Button>

          <div style={{ width: 1, height: 20, background: 'var(--border-default)', margin: '0 4px' }} />

          <Button variant="secondary" size="sm" icon={<Save size={13} />} onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save'}
          </Button>
          <Button variant="primary" size="sm" icon={<Play size={13} />} onClick={() => setIsSandboxOpen(true)}>
            Test Run
          </Button>
        </div>
      </div>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <NodesSidebar onDragStart={onDragStart} />

        <div
          ref={wrapperRef}
          style={{ flex: 1, position: 'relative', outline: isDraggingOver ? '2px dashed var(--accent)' : 'none', outlineOffset: -4 }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeWithHistory}
            onEdgesChange={onEdgesChangeWithHistory}
            onConnect={onConnect}
            onInit={setRfInstance}
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            onPaneClick={() => setSelectedNode(null)}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            defaultEdgeOptions={{ style: { stroke: 'var(--text-tertiary)', strokeWidth: 2 }, type: 'smoothstep' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => ({ start: '#3b82f6', task: '#f59e0b', approval: '#10b981', automated: '#8b5cf6', end: '#e8633a' }[node.data?.type] || '#888')}
              maskColor="rgba(0,0,0,0.05)"
              style={{ background: 'var(--bg-primary)' }}
            />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <LayoutGrid size={28} style={{ color: 'var(--accent)' }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Empty canvas</p>
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Drag nodes from the left panel to start building</p>
              </div>
            </div>
          )}

          {/* Undo/Redo toast notification */}
          {toast && (
            <div style={{
              position: 'absolute',
              bottom: 60,
              left: '50%',
              transform: 'translateX(-50%)',
              background: toast.type === 'success' ? 'var(--text-primary)' : 'var(--warning-bg)',
              color: toast.type === 'success' ? 'var(--text-inverse)' : 'var(--warning)',
              border: toast.type === 'warn' ? '1px solid var(--warning-border)' : 'none',
              padding: '8px 16px',
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              boxShadow: 'var(--shadow-md)',
              pointerEvents: 'none',
              animation: 'fadeIn 150ms ease',
              whiteSpace: 'nowrap',
              zIndex: 100,
            }}>
              {toast.msg}
            </div>
          )}
        </div>

        {/* Node form panel */}
        {selectedNode && (
          <NodeFormPanel
            nodeId={selectedNode.id}
            data={selectedNode.data}
            onUpdate={handleNodeUpdate}
            onDelete={handleNodeDelete}
          />
        )}
      </div>

      {isSandboxOpen && (
        <SandboxPanel nodes={nodes} edges={edges} onClose={() => setIsSandboxOpen(false)} />
      )}
    </div>
  );
}
