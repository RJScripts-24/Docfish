import { motion } from 'motion/react';
import { ArrowRight, Calendar } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-teal-500 via-green-500 to-emerald-500">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
        >
          Start automating your document workflows today.
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto"
        >
          Join teams who trust Docfish to handle their document intelligence needs.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="px-8 py-4 bg-white text-teal-600 rounded-full hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-lg font-semibold">
            Try Docfish
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white/10 transition-all flex items-center gap-2 text-lg font-semibold">
            <Calendar className="w-5 h-5" />
            Book Demo
          </button>
        </motion.div>
      </div>
    </section>
  );
}