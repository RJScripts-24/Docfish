import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router';

export function HighFailureAlert() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm"
    >
      <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
        <AlertCircle className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-red-900">High Failure Rate Detected</h3>
        <p className="text-sm text-red-700">
          Unusual spike in processing errors detected in the last hour. This may require immediate attention.
        </p>
      </div>
      <Link to="/error-reports">
        <button className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all whitespace-nowrap">
          Investigate Now
        </button>
      </Link>
    </motion.div>
  );
}
