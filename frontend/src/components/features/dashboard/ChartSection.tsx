import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DocumentChartPoint } from '../../../lib/types';

interface ChartSectionProps {
  timeRange: '24h' | '7d' | '30d';
  onTimeRangeChange: (value: '24h' | '7d' | '30d') => void;
  data: DocumentChartPoint[];
  isLoading?: boolean;
}

export function ChartSection({
  timeRange,
  onTimeRangeChange,
  data,
  isLoading = false,
}: ChartSectionProps) {

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
              onClick={() => onTimeRangeChange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-white text-[var(--df-navy)] shadow-sm'
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
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Loading chart data...
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            No documents available for the selected time range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} key={timeRange}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
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
                stroke="#8AE04A"
                strokeWidth={3}
                dot={{ fill: '#0D1117', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
