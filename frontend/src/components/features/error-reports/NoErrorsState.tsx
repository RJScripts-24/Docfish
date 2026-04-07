import { motion } from 'motion/react';
import { CheckCircle, Upload } from 'lucide-react';
import { Link } from 'react-router';

export function NoErrorsState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-gray-200 p-16 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center"
      >
        <CheckCircle className="w-12 h-12 text-green-600" />
      </motion.div>

      <h3 className="text-2xl font-bold text-gray-900 mb-3">No errors detected</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        All documents have been processed successfully. Great job!
      </p>

      <Link to="/upload">
        <button className="px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto">
          <Upload className="w-5 h-5" />
          Upload More Documents
        </button>
      </Link>
    </motion.div>
  );
}
