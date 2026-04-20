import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const sampleWorkflow = {
  id: 'wf-onboarding',
  name: 'Employee Onboarding',
  description: 'End-to-end onboarding for new hires including document collection and system access.',
  status: 'active',
  createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  tags: ['HR', 'Onboarding'],
  nodes: [
    { id: 'n1', type: 'workflowNode', position: { x: 80, y: 180 }, data: { type: 'start', label: 'Start', startTitle: 'New Employee Onboarding', metadata: [] } },
    { id: 'n2', type: 'workflowNode', position: { x: 320, y: 100 }, data: { type: 'task', label: 'Collect Documents', title: 'Collect Documents', description: 'Gather ID, certificates, bank details', assignee: 'HR Coordinator', dueDate: '2025-02-01', customFields: [] } },
    { id: 'n3', type: 'workflowNode', position: { x: 320, y: 280 }, data: { type: 'approval', label: 'HR Approval', title: 'HR Approval', approverRole: 'HRBP', autoApproveThreshold: 80 } },
    { id: 'n4', type: 'workflowNode', position: { x: 560, y: 180 }, data: { type: 'automated', label: 'Send Welcome Email', title: 'Send Welcome Email', actionId: 'send_email', actionParams: { to: 'new_employee@company.com', subject: 'Welcome to Tredence!' } } },
    { id: 'n5', type: 'workflowNode', position: { x: 780, y: 180 }, data: { type: 'end', label: 'Complete', endMessage: 'Onboarding complete. Employee is ready.', summaryFlag: true } },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', type: 'smoothstep' },
    { id: 'e2', source: 'n1', target: 'n3', type: 'smoothstep' },
    { id: 'e3', source: 'n2', target: 'n4', type: 'smoothstep' },
    { id: 'e4', source: 'n3', target: 'n4', type: 'smoothstep' },
    { id: 'e5', source: 'n4', target: 'n5', type: 'smoothstep' },
  ],
};

const leaveWorkflow = {
  id: 'wf-leave',
  name: 'Leave Approval',
  description: 'Automated leave request routing and approval workflow.',
  status: 'active',
  createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 86400000).toISOString(),
  tags: ['Leave', 'Approval'],
  nodes: [
    { id: 'l1', type: 'workflowNode', position: { x: 80, y: 200 }, data: { type: 'start', label: 'Leave Request', startTitle: 'Leave Request Initiated', metadata: [] } },
    { id: 'l2', type: 'workflowNode', position: { x: 320, y: 200 }, data: { type: 'approval', label: 'Manager Approval', title: 'Manager Approval', approverRole: 'Manager', autoApproveThreshold: 0 } },
    { id: 'l3', type: 'workflowNode', position: { x: 560, y: 100 }, data: { type: 'automated', label: 'Notify HR', title: 'Notify HR', actionId: 'notify_slack', actionParams: { channel: '#hr-leaves', message: 'Leave approved' } } },
    { id: 'l4', type: 'workflowNode', position: { x: 560, y: 300 }, data: { type: 'automated', label: 'Notify Employee', title: 'Notify Employee', actionId: 'send_email', actionParams: { to: 'employee@company.com', subject: 'Leave Status' } } },
    { id: 'l5', type: 'workflowNode', position: { x: 800, y: 200 }, data: { type: 'end', label: 'Done', endMessage: 'Leave process complete.', summaryFlag: false } },
  ],
  edges: [
    { id: 'le1', source: 'l1', target: 'l2', type: 'smoothstep' },
    { id: 'le2', source: 'l2', target: 'l3', type: 'smoothstep' },
    { id: 'le3', source: 'l2', target: 'l4', type: 'smoothstep' },
    { id: 'le4', source: 'l3', target: 'l5', type: 'smoothstep' },
    { id: 'le5', source: 'l4', target: 'l5', type: 'smoothstep' },
  ],
};

const docWorkflow = {
  id: 'wf-docverify',
  name: 'Document Verification',
  description: 'KYC and document verification pipeline for compliance.',
  status: 'draft',
  createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
  tags: ['Compliance', 'Documents'],
  nodes: [
    { id: 'd1', type: 'workflowNode', position: { x: 80, y: 200 }, data: { type: 'start', label: 'Start Verification', startTitle: 'Document Verification Start', metadata: [] } },
    { id: 'd2', type: 'workflowNode', position: { x: 320, y: 200 }, data: { type: 'task', label: 'Upload Documents', title: 'Upload Documents', description: 'Employee uploads required documents', assignee: 'Employee', dueDate: '2025-02-15', customFields: [] } },
    { id: 'd3', type: 'workflowNode', position: { x: 560, y: 200 }, data: { type: 'approval', label: 'Compliance Check', title: 'Compliance Review', approverRole: 'Director', autoApproveThreshold: 0 } },
    { id: 'd4', type: 'workflowNode', position: { x: 800, y: 200 }, data: { type: 'end', label: 'Verified', endMessage: 'Document verification complete.', summaryFlag: true } },
  ],
  edges: [
    { id: 'de1', source: 'd1', target: 'd2', type: 'smoothstep' },
    { id: 'de2', source: 'd2', target: 'd3', type: 'smoothstep' },
    { id: 'de3', source: 'd3', target: 'd4', type: 'smoothstep' },
  ],
};

export const useAppStore = create(
  persist(
    (set, get) => ({
      theme: 'system',
      workflows: [sampleWorkflow, leaveWorkflow, docWorkflow],
      activeWorkflowId: null,
      currentView: 'dashboard',
      selectedNodeId: null,
      simulationResult: null,
      isSimulating: false,
      isSandboxOpen: false,

      setTheme: (theme) => set({ theme }),
      setCurrentView: (currentView) => set({ currentView }),
      setActiveWorkflow: (id) => set({ activeWorkflowId: id }),
      setSelectedNode: (selectedNodeId) => set({ selectedNodeId }),
      setSimulationResult: (simulationResult) => set({ simulationResult }),
      setIsSimulating: (isSimulating) => set({ isSimulating }),
      setIsSandboxOpen: (isSandboxOpen) => set({ isSandboxOpen }),

      createWorkflow: (name, description) => {
        const workflow = {
          id: `wf-${uuidv4().slice(0, 8)}`,
          name,
          description,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          nodes: [
            {
              id: `n-${uuidv4().slice(0, 6)}`,
              type: 'workflowNode',
              position: { x: 100, y: 200 },
              data: { type: 'start', label: 'Start', startTitle: name, metadata: [] },
            },
          ],
          edges: [],
        };
        set((s) => ({ workflows: [...s.workflows, workflow] }));
        return workflow;
      },

      updateWorkflow: (id, updates) =>
        set((s) => ({
          workflows: s.workflows.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
          ),
        })),

      deleteWorkflow: (id) =>
        set((s) => ({
          workflows: s.workflows.filter((w) => w.id !== id),
          activeWorkflowId: s.activeWorkflowId === id ? null : s.activeWorkflowId,
          currentView: s.activeWorkflowId === id ? 'dashboard' : s.currentView,
        })),

      duplicateWorkflow: (id) => {
        const wf = get().workflows.find((w) => w.id === id);
        if (!wf) return;
        const dup = {
          ...wf,
          id: `wf-${uuidv4().slice(0, 8)}`,
          name: `${wf.name} (Copy)`,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ workflows: [...s.workflows, dup] }));
      },

      saveCanvasState: (id, nodes, edges) =>
        set((s) => ({
          workflows: s.workflows.map((w) =>
            w.id === id ? { ...w, nodes, edges, updatedAt: new Date().toISOString() } : w
          ),
        })),

      getActiveWorkflow: () => {
        const { workflows, activeWorkflowId } = get();
        return workflows.find((w) => w.id === activeWorkflowId);
      },
    }),
    {
      name: 'hr-workflow-store',
      partialize: (state) => ({ theme: state.theme, workflows: state.workflows }),
    }
  )
);
