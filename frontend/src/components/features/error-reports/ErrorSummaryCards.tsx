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
      color: 'navy',
      bgColor: 'bg-[var(--df-navy)]',
      textColor: 'text-[var(--df-navy)]',
      bgLight: 'bg-gray-50',
    },
    {
      title: 'Needs Review',
      value: needsReviewCount,
      icon: AlertTriangle,
      color: 'yellow',
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgLight: 'bg-yellow-50',
    },
    {
      title: 'Validation Failures',
      value: validationFailuresCount,
      icon: AlertCircle,
      color: 'orange',
      bgColor: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgLight: 'bg-orange-50',
      subtitle: 'Line item mismatch',
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'lime',
      bgColor: 'bg-[var(--df-lime)]',
      textColor: 'text-gray-900',
      bgLight: 'bg-lime-50',
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
            className="bg-white rounded-2xl p-5 border-[1.5px] border-[var(--df-border)] shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center shadow-sm transition-transform group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${card.title === 'Success Rate' ? 'text-[var(--df-black)]' : 'text-white'}`} />
              </div>
              {card.subtitle && (
                <span className="text-[10px] font-extrabold text-[var(--df-muted)] uppercase tracking-wider bg-[var(--df-light-gray)] px-2 py-1 rounded-lg border border-[var(--df-border)]">
                  {card.subtitle}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--df-muted)] uppercase tracking-widest mb-1">{card.title}</p>
              <p className={`text-3xl font-extrabold ${card.textColor === 'text-[var(--df-navy)]' ? 'text-[var(--df-black)]' : card.textColor} tracking-tighter`}>
                {card.value}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
