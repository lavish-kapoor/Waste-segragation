import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartData, ScanResult, WasteCategory } from '../types';

interface HistoryChartProps {
  history: ScanResult[];
}

const COLORS = {
  [WasteCategory.BIODEGRADABLE]: '#86efac', // green-300
  [WasteCategory.RECYCLABLE]: '#93c5fd', // blue-300
  [WasteCategory.NON_RECYCLABLE]: '#cbd5e1', // slate-300
  [WasteCategory.HAZARDOUS]: '#fca5a5', // red-300
  [WasteCategory.E_WASTE]: '#fcd34d', // amber-300
  [WasteCategory.UNKNOWN]: '#e2e8f0', // slate-200
};

const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <p>No scans yet.</p>
        <p className="text-sm mt-2">Start scanning to see your impact!</p>
      </div>
    );
  }

  // Aggregate data - flatten items from all scans
  const dataMap = history.reduce((acc, scan) => {
    scan.items.forEach(item => {
        acc[item.category] = (acc[item.category] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const data: ChartData[] = Object.keys(dataMap).map((key) => ({
    name: key,
    value: dataMap[key],
    color: COLORS[key as WasteCategory] || '#ccc'
  }));

  // Calculate total items
  const totalItems = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-80 w-full relative">
      <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">Your Impact</h3>
          <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full text-gray-600">{totalItems} items tracked</span>
      </div>
      
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs text-gray-600 ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
