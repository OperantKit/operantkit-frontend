// operantkit/apps/operantkit-frontend/components/ResponseRateChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ResponseRateData } from '../types/data';

interface ResponseRateChartProps {
  data: ResponseRateData[];
}

const ResponseRateChart: React.FC<ResponseRateChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-600 dark:text-gray-400">No response rate data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
        <XAxis
          dataKey="time"
          label={{ value: "Time (seconds)", position: "insideBottomRight", offset: 0 }}
          className="fill-gray-700 dark:fill-gray-300"
        />
        <YAxis
          label={{ value: "Response Rate (res/min)", angle: -90, position: "insideLeft" }}
          className="fill-gray-700 dark:fill-gray-300"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid #ccc',
            color: '#333'
          }}
          itemStyle={{ color: '#333' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="responseRate"
          stroke="#ffc658"
          activeDot={{ r: 8 }}
          strokeWidth={2}
          name="Response Rate"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ResponseRateChart;
