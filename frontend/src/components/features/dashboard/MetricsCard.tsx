import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  Icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'yellow';
  delay?: number;
}

const colorClasses = {
  blue: 'bg-gray-100 text-[var(--df-navy)] border border-gray-200',
  green: 'bg-[#8AE04A]/20 text-[var(--df-navy)] border border-[#8AE04A]/30',
  purple: 'bg-[var(--df-navy)] text-white',
  yellow: 'bg-gray-800 text-white',
};

export function MetricsCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  Icon, 
  color,
  delay = 0 
}: MetricsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
      
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-2">{subtitle}</div>
      )}
    </motion.div>
  );
}
