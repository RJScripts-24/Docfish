import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  vendor: string;
  date: string;
  amount: string;
  status: 'success' | 'review' | 'error';
  confidence: number;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'INV-2024-001.pdf',
    vendor: 'Acme Corp',
    date: '2024-04-05',
    amount: '$2,450.00',
    status: 'success',
    confidence: 98,
  },
  {
    id: '2',
    name: 'INV-2024-002.pdf',
    vendor: 'TechSupply Inc',
    date: '2024-04-05',
    amount: '$1,230.50',
    status: 'review',
    confidence: 87,
  },
  {
    id: '3',
    name: 'INV-2024-003.pdf',
    vendor: 'Global Services',
    date: '2024-04-04',
    amount: '$5,890.00',
    status: 'success',
    confidence: 95,
  },
  {
    id: '4',
    name: 'INV-2024-004.pdf',
    vendor: 'Cloud Solutions',
    date: '2024-04-04',
    amount: '$890.00',
    status: 'error',
    confidence: 62,
  },
  {
    id: '5',
    name: 'INV-2024-005.pdf',
    vendor: 'Design Studio',
    date: '2024-04-03',
    amount: '$3,200.00',
    status: 'success',
    confidence: 99,
  },
];

export function RecentDocuments() {
  const getStatusBadge = (status: Document['status']) => {
    const styles = {
      success: 'bg-green-100 text-green-700',
      review: 'bg-yellow-100 text-yellow-700',
      error: 'bg-red-100 text-red-700',
    };

    const labels = {
      success: 'Success',
      review: 'Needs Review',
      error: 'Error',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Recent Documents</h3>
          <p className="text-sm text-gray-500 mt-1">Latest processed invoices</p>
        </div>
        <button className="text-gray-900 border-b border-gray-900 hover:text-gray-600 font-medium text-sm flex items-center gap-1 pb-0.5 transition-colors">
          View All
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Document Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vendor</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {mockDocuments.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">{doc.vendor}</td>
                <td className="py-4 px-4 text-sm text-gray-600">{doc.date}</td>
                <td className="py-4 px-4 text-sm font-medium text-gray-900">{doc.amount}</td>
                <td className="py-4 px-4">{getStatusBadge(doc.status)}</td>
                <td className="py-4 px-4">
                  <span className={`text-sm font-semibold ${getConfidenceColor(doc.confidence)}`}>
                    {doc.confidence}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
