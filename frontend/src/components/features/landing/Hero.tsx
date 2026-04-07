import { Upload, Calendar, FileText, Table, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-100 via-teal-50 to-blue-100">
      {/* Floating Cloud Elements */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-20 bg-white rounded-full opacity-60"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 left-1/4 w-24 h-16 bg-white rounded-full opacity-50"
        animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-28 h-18 bg-white rounded-full opacity-50"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-32 right-20 w-36 h-22 bg-white rounded-full opacity-60"
        animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-32 right-32 w-32 h-20 bg-white rounded-full opacity-50"
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating Document Elements */}
      <motion.div
        className="absolute top-1/4 left-1/3 bg-white p-4 rounded-2xl shadow-lg"
        animate={{ 
          y: [0, -15, 0],
          rotate: [-2, 2, -2]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <FileText className="w-8 h-8 text-teal-500" />
      </motion.div>

      <motion.div
        className="absolute bottom-1/3 right-1/4 bg-white p-4 rounded-2xl shadow-lg"
        animate={{ 
          y: [0, 15, 0],
          rotate: [2, -2, 2]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <Table className="w-8 h-8 text-blue-500" />
      </motion.div>

      <motion.div
        className="absolute top-1/3 right-1/3 bg-white p-4 rounded-2xl shadow-lg"
        animate={{ 
          y: [0, -12, 0],
          rotate: [-3, 3, -3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Database className="w-8 h-8 text-purple-500" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 sm:pt-32 pb-16 sm:pb-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 sm:px-5 py-2 rounded-full border border-gray-200 shadow-sm mb-6 sm:mb-8"
        >
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-gray-700">AI Document Intelligence Layer</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2"
        >
          Your documents are messy.<br />
          <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Docfish makes them structured.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2"
        >
          Docfish automatically extracts, validates, and organizes invoice data using AI. 
          Save hours of manual work and eliminate errors.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4"
        >
          <Link to="/auth" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full hover:from-green-500 hover:to-green-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base sm:text-lg font-medium">
              <Upload className="w-5 h-5" />
              Upload Invoice
            </button>
          </Link>
          <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 bg-white text-gray-700 rounded-full hover:border-gray-400 hover:shadow-md transition-all flex items-center justify-center gap-2 text-base sm:text-lg font-medium">
            <Calendar className="w-5 h-5" />
            Book Demo
          </button>
        </motion.div>
      </div>
    </section>
  );
}