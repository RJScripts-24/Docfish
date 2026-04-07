import { motion } from 'motion/react';
import { FileText, Upload } from 'lucide-react';
import { Link } from 'react-router';

export function EmptyState() {
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
        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center"
      >
        <FileText className="w-12 h-12 text-gray-400" />
      </motion.div>

      <h3 className="text-2xl font-bold text-gray-900 mb-3">No invoices processed yet</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Start by uploading your first invoice to see AI-powered extraction in action
      </p>

      <Link to="/upload">
        <button className="df-btn-primary px-8 py-3.5 text-base shadow-[4px_4px_0_var(--df-black)] mx-auto">
          <Upload className="w-5 h-5" />
          Upload Your First Invoice
        </button>
      </Link>
    </motion.div>
  );
}
