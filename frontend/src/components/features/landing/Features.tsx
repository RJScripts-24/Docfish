import { motion } from 'motion/react';
import { FileText, Image, FileScan, CheckCircle2, Database, Zap } from 'lucide-react';

export function Features() {
  const features = [
    {
      title: 'Ingest Anything',
      description: 'Upload invoices, PDFs, scanned documents, or bulk files. Docfish handles multiple formats and layouts effortlessly.',
      icons: [FileText, Image, FileScan],
      bgColor: 'from-purple-100 to-purple-50',
      borderColor: 'border-purple-200',
      iconColors: ['text-purple-500', 'text-purple-600', 'text-purple-700'],
    },
    {
      title: 'Extract & Validate',
      description: 'AI extracts key fields like vendor name, invoice number, dates, totals, and line items — with built-in validation and confidence scoring.',
      badges: ['invoice_number', 'total_amount', 'confidence: 98%'],
      bgColor: 'from-yellow-100 to-yellow-50',
      borderColor: 'border-yellow-200',
      badgeColors: ['bg-yellow-200 text-yellow-800', 'bg-yellow-200 text-yellow-800', 'bg-green-200 text-green-800'],
    },
    {
      title: 'Structured Output',
      description: 'Get clean, normalized JSON output ready for APIs, databases, or downstream systems.',
      icons: [Zap, Database, CheckCircle2],
      bgColor: 'from-teal-100 to-teal-50',
      borderColor: 'border-teal-200',
      iconColors: ['text-teal-500', 'text-teal-600', 'text-teal-700'],
    },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`bg-gradient-to-br ${feature.bgColor} rounded-3xl p-8 border-2 ${feature.borderColor} shadow-lg hover:shadow-xl transition-shadow`}
            >
              {/* Icons or Badges Section */}
              <div className="mb-6 min-h-[100px] flex flex-col justify-center">
                {feature.icons ? (
                  <div className="flex gap-3">
                    {feature.icons.map((Icon, i) => (
                      <div
                        key={i}
                        className="bg-white p-3 rounded-2xl shadow-md"
                      >
                        <Icon className={`w-6 h-6 ${feature.iconColors?.[i]}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {feature.badges?.map((badge, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${feature.badgeColors?.[i]} border border-current/20`}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}