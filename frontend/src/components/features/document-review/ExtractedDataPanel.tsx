import { motion } from 'motion/react';
import { Check, AlertCircle, AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { DocumentDetails, EditableLineItem, ExtractedField } from '../../../lib/types';

const FIELD_LABELS: Record<string, string> = {
  vendorName: 'Vendor Name',
  invoiceNumber: 'Invoice Number',
  invoiceDate: 'Invoice Date',
  dueDate: 'Due Date',
  currency: 'Currency',
  totalAmount: 'Total Amount',
  taxAmount: 'Tax Amount',
  taxRate: 'Tax Rate',
  subtotal: 'Subtotal',
  paymentTerms: 'Payment Terms',
  notes: 'Notes',
};

interface ExtractedDataPanelProps {
  document: DocumentDetails;
  fields: Record<string, ExtractedField>;
  lineItems: EditableLineItem[];
  onFieldEdit: (field: string, value: string) => void;
  onReset: (field: string) => void;
  onLineItemChange: (id: number, field: keyof EditableLineItem, value: string) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (id: number) => void;
}

export function ExtractedDataPanel({
  document,
  fields,
  lineItems,
  onFieldEdit,
  onReset,
  onLineItemChange,
  onAddLineItem,
  onRemoveLineItem,
}: ExtractedDataPanelProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <Check className="w-3 h-3" />;
    if (confidence >= 70) return <AlertTriangle className="w-3 h-3" />;
    return <AlertCircle className="w-3 h-3" />;
  };

  const orderedFields = Object.entries(fields).sort(([a], [b]) => {
    const order = Object.keys(FIELD_LABELS);
    return order.indexOf(a) - order.indexOf(b);
  });

  const lineItemsTotal = lineItems.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const totalAmount = Number(fields.totalAmount?.value || 0);
  const hasMismatch = Math.abs(lineItemsTotal - totalAmount) > 0.01;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 border border-gray-200"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Processing Status</p>
            <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">{document.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Processing Time</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{document.processingTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Overall Confidence</p>
            <p className="text-lg font-semibold text-green-600 mt-1">{document.overallConfidence}%</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          {orderedFields.map(([key, field]) => {
            const confidencePercent = Math.round((field.confidence || 0) * 100);

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">{FIELD_LABELS[key] || key}</label>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 ${getConfidenceColor(confidencePercent)}`}>
                      {getConfidenceIcon(confidencePercent)}
                      {confidencePercent}%
                    </span>
                    {field.isEdited ? (
                      <button
                        onClick={() => onReset(key)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Reset to AI value"
                      >
                        <RotateCcw className="w-4 h-4 text-gray-600" />
                      </button>
                    ) : null}
                  </div>
                </div>
                <input
                  type={key.includes('Date') ? 'date' : 'text'}
                  value={field.value || ''}
                  onChange={(event) => onFieldEdit(key, event.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    field.isEdited ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Line Items</h3>
          <button
            onClick={onAddLineItem}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-all"
          >
            + Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-24">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Unit Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-32">Total</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lineItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(event) => onLineItemChange(item.id, 'description', event.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(event) => onLineItemChange(item.id, 'quantity', event.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(event) => onLineItemChange(item.id, 'unitPrice', event.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900">${Number(item.total || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onRemoveLineItem(item.id)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">Line Items Total:</td>
                <td className="px-4 py-3 font-bold text-gray-900">${lineItemsTotal.toFixed(2)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Validation Results</h3>
        <div className="space-y-3">
          <div className={`flex items-start gap-3 p-3 rounded-xl ${hasMismatch ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${hasMismatch ? 'bg-red-500' : 'bg-green-500'}`}>
              {hasMismatch ? <AlertCircle className="w-4 h-4 text-white" /> : <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${hasMismatch ? 'text-red-900' : 'text-green-900'}`}>
                {hasMismatch ? 'Total Amount Mismatch' : 'Total Amount Verified'}
              </p>
              <p className={`text-sm ${hasMismatch ? 'text-red-700' : 'text-green-700'}`}>
                {hasMismatch
                  ? `Line items total ($${lineItemsTotal.toFixed(2)}) does not match invoice total ($${totalAmount.toFixed(2)})`
                  : 'Sum of line items matches total amount'}
              </p>
            </div>
          </div>

          {document.validationResults.map((result, index) => {
            const colorClass =
              result.severity === 'ok'
                ? 'bg-green-50 text-green-900 text-green-700 bg-green-500'
                : result.severity === 'warning'
                ? 'bg-yellow-50 text-yellow-900 text-yellow-700 bg-yellow-500'
                : 'bg-red-50 text-red-900 text-red-700 bg-red-500';

            const [containerClass, titleClass, messageClass, iconClass] = colorClass.split(' ');
            const icon =
              result.severity === 'ok' ? (
                <Check className="w-4 h-4 text-white" />
              ) : result.severity === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-white" />
              ) : (
                <AlertCircle className="w-4 h-4 text-white" />
              );

            return (
              <div key={`${result.title}-${index}`} className={`flex items-start gap-3 p-3 rounded-xl ${containerClass}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                  {icon}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${titleClass}`}>{result.title}</p>
                  <p className={`text-sm ${messageClass}`}>{result.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
