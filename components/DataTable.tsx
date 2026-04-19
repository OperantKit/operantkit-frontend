// operantkit/apps/operantkit-frontend/components/DataTable.tsx
import React from 'react';
import { DataTableData } from '../types/data';

interface DataTableProps {
  data: DataTableData[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-600 dark:text-gray-400">No data available.</p>;
  }

  // Extract headers from the first data object
  const headers = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="py-3 px-6">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex} // Use row.id if available, otherwise rowIndex
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {headers.map((header) => (
                <td key={`${row.id || rowIndex}-${header}`} className="py-4 px-6">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
