// operantkit/apps/operantkit-frontend/app/settings/page.tsx
import React from 'react';
import ExperimentSettingsForm from '../../components/ExperimentSettingsForm'; // Adjust path as needed

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Experiment Settings</h1>
      <ExperimentSettingsForm />
    </div>
  );
}
