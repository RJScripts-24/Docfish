import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function Solution() {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-20 left-10 w-6 h-6 bg-teal-200 rounded-full opacity-20" />
      <div className="absolute bottom-40 right-20 w-8 h-8 bg-green-200 rounded-full opacity-20" />
      <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-cyan-200 rounded-full opacity-25" />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-[2rem] lg:rounded-[3rem] shadow-2xl border-2 border-gray-100 p-8 lg:p-16 relative overflow-hidden"
        >
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-100 to-transparent rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-green-100 to-transparent rounded-full blur-3xl opacity-30" />

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-50 to-green-50 px-5 py-2 rounded-full border border-teal-200 shadow-sm mb-8"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">The Solution</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Docfish turns documents into{' '}
              <span className="bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent">
                structured, reliable data.
              </span>
            </motion.h2>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-gray-600 leading-relaxed"
            >
              Extract, normalize, and validate invoice data automatically — powered by AI 
              and built for real-world messy inputs.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}