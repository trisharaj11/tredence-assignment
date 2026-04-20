import React from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { WorkflowCanvas } from './components/canvas/WorkflowCanvas';
import { useAppStore } from './store';
import './styles/globals.css';

export default function App() {
  const currentView = useAppStore((s) => s.currentView);
  return (
    <AppLayout>
      {currentView === 'dashboard' ? <Dashboard /> : <WorkflowCanvas />}
    </AppLayout>
  );
}
