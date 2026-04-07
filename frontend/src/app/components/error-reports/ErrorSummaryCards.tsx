import { motion } from 'motion/react';
import { AlertCircle, AlertTriangle, FileX, TrendingUp } from 'lucide-react';

interface ErrorSummaryCardsProps {
  failedCount: number;
  needsReviewCount: number;
  validationFailuresCount: number;
  successRate: number;
}

export function ErrorSummaryCards({
  failedCount,
  needsReviewCount,
  validationFailuresCount,
  successRate,
}: ErrorSummaryCardsProps) {
  const cards = [
    {
      title: 'Failed Documents',
      value: failedCount,
      icon: FileX,
      color: 'red',
      bgColor: 'from-red-400 to-red-500',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
    },
    {
      title: 'Needs Review',
      value: needsReviewCount,
      icon: AlertTriangle,
      color: 'yellow',
      bgColor: 'from-yellow-400 to-yellow-500',
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
    },
    {
      title: 'Validation Failures',
      value: validationFailuresCount,
      icon: AlertCircle,
      color: 'orange',
      bgColor: 'from-orange-400 to-orange-500',
      textColor: 'text-orange-600',
      bgLight: 'bg-orange-50',
      subtitle: 'Line item mismatch, missing fields',
    },
    {
      title: 'Avg Retry Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'from-green-400 to-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.bgColor} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{card.title}</p>
            <p className={`text-3xl font-bold ${card.textColor} mb-1`}>
              {card.value}
            </p>
            {card.subtitle && (
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
