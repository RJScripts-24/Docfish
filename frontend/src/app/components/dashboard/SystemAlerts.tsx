import { motion } from 'motion/react';
import { AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export function SystemAlerts() {
  const alerts = [
    {
      type: 'warning' as const,
      title: '12 documents require review',
      description: 'Low confidence scores detected',
      count: 12,
      action: 'Review Now',
      path: '/documents?status=review',
    },
    {
      type: 'error' as const,
      title: '4 validation errors',
      description: 'Missing required fields',
      count: 4,
      action: 'Fix Issues',
      path: '/documents?status=error',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="space-y-4"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">System Alerts</h3>
        <p className="text-sm text-gray-500 mt-1">Items requiring attention</p>
      </div>

      {alerts.map((alert, index) => {
        const isWarning = alert.type === 'warning';
        const Icon = isWarning ? AlertTriangle : AlertCircle;
        
        return (
          <motion.div
            key={alert.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
            className={`rounded-2xl p-5 border-2 ${
              isWarning
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isWarning ? 'bg-yellow-400' : 'bg-red-400'
              }`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-bold ${
                    isWarning ? 'text-yellow-900' : 'text-red-900'
                  }`}>
                    {alert.title}
                  </h4>
                </div>
                <p className={`text-sm mb-3 ${
                  isWarning ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {alert.description}
                </p>
                
                <Link to={alert.path}>
                  <button className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${
                    isWarning
                      ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                      : 'bg-red-400 text-red-900 hover:bg-red-500'
                  }`}>
                    {alert.action}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
