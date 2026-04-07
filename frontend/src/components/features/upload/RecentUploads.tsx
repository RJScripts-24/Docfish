import { motion } from 'motion/react';
import { Clock, FileText } from 'lucide-react';

const recentUploads = [
  { id: '1', name: 'INV-2024-001.pdf', time: '5 minutes ago', status: 'completed' },
  { id: '2', name: 'INV-2024-002.pdf', time: '12 minutes ago', status: 'completed' },
  { id: '3', name: 'INV-2024-003.pdf', time: '1 hour ago', status: 'completed' },
];

export function RecentUploads() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white border border-gray-200 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Recent Uploads</h3>
          <p className="text-xs text-gray-500">Quick access to last uploads</p>
        </div>
      </div>

      <div className="space-y-3">
        {recentUploads.map((upload, index) => (
          <motion.div
            key={upload.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{upload.name}</p>
              <p className="text-xs text-gray-500">{upload.time}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
