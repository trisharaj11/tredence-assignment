# HR Workflow Designer

A full-featured HR Workflow Designer built with React + React Flow for Tredence Analytics.

## Features

- **Visual Canvas** — Drag-and-drop workflow builder powered by React Flow
- **5 Node Types** — Start, Task, Approval, Automated Step, End
- **Node Configuration** — Rich edit forms per node type with dynamic fields
- **Mock API Layer** — GET /automations and POST /simulate endpoints
- **Sandbox Panel** — Run simulation with step-by-step execution log and validation
- **Dashboard** — View, search, filter, create, duplicate, archive, delete workflows
- **Light / Dark / System** theme with live toggle
- **Export / Import** workflows as JSON
- **Persistent state** via localStorage (Zustand persist)

## Tech Stack

- React 18 (JavaScript / JSX — no TypeScript)
- Vite
- @xyflow/react (React Flow v12)
- Zustand (state management)
- lucide-react (icons)
- date-fns

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
src/
  api/          mockApi.js — GET /automations, POST /simulate
  components/
    canvas/     WorkflowCanvas, NodesSidebar, SandboxPanel
    dashboard/  Dashboard (list view, CRUD)
    forms/      NodeFormPanel (per-node edit forms)
    layout/     AppLayout, sidebar, theme switcher
    nodes/      WorkflowNode (custom React Flow node)
    ui/         Button, Input, Select, Toggle, Modal, Badge
  store/        index.js — Zustand store with persist
  styles/       globals.css — CSS variables, dark mode, React Flow overrides
  App.jsx
  main.jsx
```

## Architecture Decisions

- **Zustand** for global state — clean, minimal boilerplate, built-in persist middleware
- **CSS Variables** for theming — zero JS overhead, instant dark/light/system switching
- **React Flow** handles all canvas logic; app state owns node data independently
- **Mock API** uses async functions with artificial delay to simulate real API behaviour
- **Component decomposition** — each node type form is its own component, easy to extend
- **No TypeScript** — pure JS/JSX as requested

## What I'd Add With More Time

- Undo/Redo stack
- Auto-layout with dagre
- Node version history
- Validation errors shown visually on nodes
- Real backend with Node.js + PostgreSQL
- Authentication with JWT
- Collaborative editing via WebSockets
