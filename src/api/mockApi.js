const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const mockActions = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject', 'body'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'notify_slack', label: 'Notify Slack', params: ['channel', 'message'] },
  { id: 'create_ticket', label: 'Create JIRA Ticket', params: ['project', 'summary', 'assignee'] },
  { id: 'update_hrms', label: 'Update HRMS Record', params: ['employeeId', 'field', 'value'] },
  { id: 'schedule_meeting', label: 'Schedule Meeting', params: ['participants', 'title', 'duration'] },
];

export async function getAutomations() {
  await delay(300);
  return mockActions;
}

export async function simulateWorkflow(nodes, edges) {
  await delay(800);

  const errors = [];
  const steps = [];

  const startNodes = nodes.filter((n) => n.data?.type === 'start');
  const endNodes = nodes.filter((n) => n.data?.type === 'end');

  if (startNodes.length === 0) errors.push('No Start Node found. Workflow must begin with a Start Node.');
  if (startNodes.length > 1) errors.push('Multiple Start Nodes found. Only one Start Node is allowed.');
  if (endNodes.length === 0) errors.push('No End Node found. Workflow must end with an End Node.');

  const connectedNodeIds = new Set();
  edges.forEach((e) => { connectedNodeIds.add(e.source); connectedNodeIds.add(e.target); });
  if (nodes.length > 1) {
    nodes.forEach((n) => {
      if (!connectedNodeIds.has(n.id)) {
        errors.push(`Node "${n.data?.label || n.id}" is not connected to the workflow.`);
      }
    });
  }

  if (errors.length > 0 && startNodes.length === 0) {
    return { success: false, steps: [], errors, duration: '0ms' };
  }

  // Topological sort
  const adjacency = {};
  nodes.forEach((n) => { adjacency[n.id] = []; });
  edges.forEach((e) => { if (adjacency[e.source]) adjacency[e.source].push(e.target); });

  const visited = new Set();
  const order = [];
  function dfs(nodeId) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    (adjacency[nodeId] || []).forEach(dfs);
    order.unshift(nodeId);
  }
  if (startNodes[0]) dfs(startNodes[0].id);

  const nodeMap = {};
  nodes.forEach((n) => { nodeMap[n.id] = n; });

  const now = new Date();
  for (let i = 0; i < order.length; i++) {
    const node = nodeMap[order[i]];
    if (!node) continue;
    const data = node.data;
    const stepTime = new Date(now.getTime() + i * 250);
    let message = '';
    let status = 'success';

    switch (data?.type) {
      case 'start':
        message = `Workflow initiated: "${data.startTitle || 'Untitled'}"`;
        break;
      case 'task':
        if (!data.title) { status = 'warning'; message = `Task node missing title`; }
        else if (!data.assignee) { status = 'warning'; message = `Task "${data.title}" has no assignee`; }
        else message = `Task "${data.title}" assigned to ${data.assignee}`;
        break;
      case 'approval':
        message = `Approval requested from ${data.approverRole || 'Manager'} — threshold: ${data.autoApproveThreshold || 0}%`;
        break;
      case 'automated': {
        const action = mockActions.find((a) => a.id === data.actionId);
        if (!action) { status = 'warning'; message = `No action selected for automated step`; }
        else message = `Executing: ${action.label}`;
        break;
      }
      case 'end':
        message = data.endMessage || 'Workflow completed successfully.';
        if (data.summaryFlag) message += ' [Summary generated]';
        break;
      default:
        message = `Processing node...`;
    }

    steps.push({
      nodeId: node.id,
      nodeType: data?.type,
      nodeLabel: data?.label || 'Unknown',
      status,
      message,
      timestamp: stepTime.toISOString(),
    });
  }

  return {
    success: errors.length === 0,
    steps,
    errors,
    duration: `${order.length * 250}ms`,
  };
}
