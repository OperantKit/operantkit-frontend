// operantkit/apps/operantkit-frontend/app/data/page.tsx
import React, { useMemo } from 'react';
import DataTable from '../../components/DataTable';
import CumulativeRecordChart from '../../components/CumulativeRecordChart';
import ResponseRateChart from '../../components/ResponseRateChart';
import { useExperimentData } from '../../lib/api/client';
import {
  processForCumulativeRecord,
  processForResponseRate,
  DataTableData,
  ExperimentEvent,
} from '../../types/data';

export default function DataPage() {
  const { data: sessionData, error, isLoading } = useExperimentData();

  const tableData: DataTableData[] = useMemo(() => {
    if (!sessionData?.events) return [];
    return sessionData.events.map((event: ExperimentEvent) => ({
      id: event.id,
      "Event Type": event.type,
      Timestamp: new Date(event.timestamp).toLocaleString(),
      Details: JSON.stringify(event.details || {}),
    }));
  }, [sessionData]);

  const cumulativeRecordData = useMemo(() => {
    if (!sessionData?.events) return [];
    return processForCumulativeRecord(sessionData.events);
  }, [sessionData]);

  const responseRateData = useMemo(() => {
    if (!sessionData?.events) return [];
    return processForResponseRate(sessionData.events, 30); // 30-second intervals for response rate
  }, [sessionData]);

  if (isLoading) return <div className="text-gray-600 dark:text-gray-400">Loading experiment data...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">Failed to load experiment data. {error.message}</div>;
  if (!sessionData) return <div className="text-gray-600 dark:text-gray-400">No experiment data available.</div>;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Experiment Data Analysis</h1>

      {/* Raw Data Table */}
      <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Raw Experiment Events</h2>
        <DataTable data={tableData} />
      </section>

      {/* Cumulative Record Chart */}
      <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Cumulative Record</h2>
        {cumulativeRecordData && cumulativeRecordData.length > 0 ? (
          <CumulativeRecordChart data={cumulativeRecordData} />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No cumulative record data available for this session.
          </p>
        )}
      </section>

      {/* Response Rate Chart */}
      <section className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Response Rate Over Time</h2>
        {responseRateData && responseRateData.length > 0 ? (
          <ResponseRateChart data={responseRateData} />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No response rate data available for this session.
          </p>
        )}
      </section>
    </div>
  );
}
