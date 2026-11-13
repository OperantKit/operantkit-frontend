'use client';

import useSWR from 'swr';
import { ExperimentSettings } from '../../types/experiment';
import { ExperimentSessionData } from '../../types/data';

// Error thrown when the API answers with a non-2xx status.
// `info` holds the parsed JSON body of the error response.
export class FetchError extends Error {
  info: unknown;
  status: number;

  constructor(message: string, info: unknown, status: number) {
    super(message);
    this.name = 'FetchError';
    this.info = info;
    this.status = status;
  }
}

// Generic fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new FetchError('An error occurred while fetching the data.', await res.json(), res.status);
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
    throw new FetchError('An error occurred while saving the settings.', await res.json(), res.status);
  }
  return res.json();
};
