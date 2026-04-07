import { motion } from 'motion/react';
import { Upload, FileStack, RefreshCw } from 'lucide-react';
import { Link } from 'react-router';

export function QuickActions() {
  const actions = [
    {
      icon: Upload,
      label: 'Upload New Invoice',
      description: 'Process a single document',
      color: 'from-green-400 to-green-500',
      hoverColor: 'hover:from-green-500 hover:to-green-600',
      path: '/upload',
    },
    {
      icon: FileStack,
      label: 'Bulk Upload',
      description: 'Upload multiple documents',
      color: 'from-blue-400 to-blue-500',
      hoverColor: 'hover:from-blue-500 hover:to-blue-600',
      path: '/upload?bulk=true',
    },
    {
      icon: RefreshCw,
      label: 'Reprocess Failed',
      description: 'Retry error documents',
      color: 'from-purple-400 to-purple-500',
      hoverColor: 'hover:from-purple-500 hover:to-purple-600',
      path: '/documents?status=error',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-500 mt-1">Frequently used tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} to={action.path}>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className={`w-full bg-gradient-to-br ${action.color} ${action.hoverColor} text-white rounded-xl p-6 transition-all shadow-md hover:shadow-lg text-left group`}
              >
                <Icon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-lg mb-1">{action.label}</div>
                <div className="text-sm text-white/80">{action.description}</div>
              </motion.button>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
