// operantkit/apps/operantkit-frontend/lib/api/client.ts
'use client';

import useSWR from 'swr';
import { ExperimentSettings } from '../../types/experiment';
import { ExperimentSessionData } from '../../types/data';

// Generic fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.') as any;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
};

// Hook for fetching experiment settings
export const useExperimentSettings = () => {
  return useSWR<ExperimentSettings>('/api/settings', fetcher);
};

// Hook for fetching experiment data
export const useExperimentData = () => {
  return useSWR<ExperimentSessionData>('/api/data', fetcher);
};

// Function to save experiment settings
export const saveExperimentSettings = async (settings: ExperimentSettings) => {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!res.ok) {
    const error = new Error('An error occurred while saving the settings.') as any;
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
};
