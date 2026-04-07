import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

const data7Days = [
  { date: 'Mon', documents: 145 },
  { date: 'Tue', documents: 189 },
  { date: 'Wed', documents: 167 },
  { date: 'Thu', documents: 203 },
  { date: 'Fri', documents: 178 },
  { date: 'Sat', documents: 92 },
  { date: 'Sun', documents: 87 },
];

const data24Hours = [
  { time: '00:00', documents: 12 },
  { time: '04:00', documents: 8 },
  { time: '08:00', documents: 45 },
  { time: '12:00', documents: 67 },
  { time: '16:00', documents: 54 },
  { time: '20:00', documents: 32 },
];

const data30Days = [
  { date: 'Week 1', documents: 823 },
  { date: 'Week 2', documents: 945 },
  { date: 'Week 3', documents: 891 },
  { date: 'Week 4', documents: 1024 },
];

export function ChartSection() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const dataMap = {
    '24h': data24Hours,
    '7d': data7Days,
    '30d': data30Days,
  };

  const currentData = dataMap[timeRange];
  const xKey = timeRange === '24h' ? 'time' : 'date';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Documents Processed Over Time</h3>
          <p className="text-sm text-gray-500 mt-1">Track your processing volume</p>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === '24h' ? 'Last 24h' : range === '7d' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData} key={timeRange}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={xKey} 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="documents" 
              stroke="#14b8a6" 
              strokeWidth={3}
              dot={{ fill: '#14b8a6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}