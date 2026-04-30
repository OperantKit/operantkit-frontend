import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-700 text-white p-4 shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Navigation</h2>
      <nav>
        <ul>
          <li className="mb-2">
            <a href="#" className="block hover:bg-gray-600 p-2 rounded">Dashboard</a>
          </li>
          <li className="mb-2">
            <a href="#" className="block hover:bg-gray-600 p-2 rounded">Experiments</a>
          </li>
          <li className="mb-2">
            <a href="#" className="block hover:bg-gray-600 p-2 rounded">Subjects</a>
          </li>
          <li className="mb-2">
            <a href="#" className="block hover:bg-gray-600 p-2 rounded">Data Analysis</a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
