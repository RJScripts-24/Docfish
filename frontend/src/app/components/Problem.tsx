import { motion } from 'motion/react';
import { FileSpreadsheet, Mail, FolderOpen, FileText, Sparkles } from 'lucide-react';

export function Problem() {
  const icons = [
    { Icon: FileSpreadsheet, color: 'text-green-500', position: 'top-20 left-1/4' },
    { Icon: Mail, color: 'text-blue-500', position: 'top-32 right-1/4' },
    { Icon: FolderOpen, color: 'text-yellow-500', position: 'bottom-40 left-1/3' },
    { Icon: FileText, color: 'text-purple-500', position: 'top-1/3 left-20' },
    { Icon: FileSpreadsheet, color: 'text-red-500', position: 'bottom-32 right-1/4' },
  ];

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-teal-100 via-green-50 to-emerald-100 py-24">
      {/* Scattered Floating Icons */}
      {icons.map(({ Icon, color, position }, index) => (
        <motion.div
          key={index}
          className={`absolute ${position} bg-white p-4 rounded-2xl shadow-lg`}
          animate={{
            y: [0, -20, 0],
            rotate: [-5, 5, -5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 5 + index,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.5,
          }}
        >
          <Icon className={`w-8 h-8 ${color}`} />
        </motion.div>
      ))}

      {/* Scattered Circles */}
      <div className="absolute top-10 left-10 w-3 h-3 bg-gray-400 rounded-full opacity-30" />
      <div className="absolute top-1/4 right-20 w-2 h-2 bg-gray-400 rounded-full opacity-40" />
      <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-gray-400 rounded-full opacity-25" />
      <div className="absolute bottom-20 right-1/3 w-3 h-3 bg-gray-400 rounded-full opacity-35" />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full border border-orange-200 shadow-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-gray-700">The Problem</span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
        >
          Messy documents are slowing your workflows.
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
        >
          Invoices come in different formats, fields are inconsistent, and manual data entry 
          leads to errors, delays, and inefficiencies.
        </motion.p>
      </div>
    </section>
  );
}