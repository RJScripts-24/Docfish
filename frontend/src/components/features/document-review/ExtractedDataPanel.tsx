import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, AlertCircle, AlertTriangle, Edit2, RotateCcw } from 'lucide-react';

interface Field {
  label: string;
  value: string;
  confidence: number;
  isEdited?: boolean;
  originalValue?: string;
}

interface ExtractedDataPanelProps {
  onFieldEdit: (field: string, value: string) => void;
  onReset: (field: string) => void;
}

export function ExtractedDataPanel({ onFieldEdit, onReset }: ExtractedDataPanelProps) {
  const [fields, setFields] = useState<Record<string, Field>>({
    vendorName: {
      label: 'Vendor Name',
      value: 'Acme Corporation',
      confidence: 95,
    },
    invoiceNumber: {
      label: 'Invoice Number',
      value: 'INV-2024-001',
      confidence: 98,
    },
    invoiceDate: {
      label: 'Invoice Date',
      value: '2024-01-15',
      confidence: 92,
    },
    currency: {
      label: 'Currency',
      value: 'USD',
      confidence: 99,
    },
    totalAmount: {
      label: 'Total Amount',
      value: '12450.00',
      confidence: 95,
    },
    taxAmount: {
      label: 'Tax Amount',
      value: '1245.00',
      confidence: 88,
    },
  });

  const [lineItems, setLineItems] = useState([
    { id: 1, description: 'Professional Services - January 2024', quantity: '1', unitPrice: '10000.00', total: '10000.00' },
    { id: 2, description: 'Software License - Annual', quantity: '1', unitPrice: '1205.00', total: '1205.00' },
  ]);

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

  const handleFieldChange = (fieldKey: string, newValue: string) => {
    setFields(prev => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        value: newValue,
        isEdited: true,
        originalValue: prev[fieldKey].originalValue || prev[fieldKey].value,
      },
    }));
    onFieldEdit(fieldKey, newValue);
  };

  const handleResetField = (fieldKey: string) => {
    const field = fields[fieldKey];
    if (field.originalValue) {
      setFields(prev => ({
        ...prev,
        [fieldKey]: {
          ...prev[fieldKey],
          value: field.originalValue!,
          isEdited: false,
          originalValue: undefined,
        },
      }));
      onReset(fieldKey);
    }
  };

  const handleLineItemChange = (id: number, field: string, value: string) => {
    setLineItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Auto-calculate total
          if (field === 'quantity' || field === 'unitPrice') {
            const qty = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
            const price = parseFloat(field === 'unitPrice' ? value : item.unitPrice) || 0;
            updated.total = (qty * price).toFixed(2);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const addLineItem = () => {
    setLineItems(prev => [
      ...prev,
      {
        id: Math.max(...prev.map(i => i.id), 0) + 1,
        description: '',
        quantity: '0',
        unitPrice: '0.00',
        total: '0.00',
      },
    ]);
  };

  const removeLineItem = (id: number) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const lineItemsTotal = lineItems.reduce((sum, item) => sum + parseFloat(item.total || '0'), 0);
  const totalAmount = parseFloat(fields.totalAmount.value || '0');
  const hasMismatch = Math.abs(lineItemsTotal - totalAmount) > 0.01;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 space-y-6">
      {/* Document Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Processing Status</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">Completed</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Processing Time</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">2.3s</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Overall Confidence</p>
            <p className="text-lg font-semibold text-green-600 mt-1">94%</p>
          </div>
        </div>
      </motion.div>

      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
        <div className="space-y-4">
          {Object.entries(fields).map(([key, field]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">{field.label}</label>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 ${getConfidenceColor(field.confidence)}`}>
                    {getConfidenceIcon(field.confidence)}
                    {field.confidence}%
                  </span>
                  {field.isEdited && (
                    <button
                      onClick={() => handleResetField(key)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Reset to AI value"
                    >
                      <RotateCcw className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              <input
                type={key === 'invoiceDate' ? 'date' : 'text'}
                value={field.value}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  field.isEdited ? 'border-teal-500 bg-teal-50' : 'border-gray-200'
                }`}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Line Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Line Items</h3>
          <button
            onClick={addLineItem}
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
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lineItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(item.id, 'quantity', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(item.id, 'unitPrice', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900">${parseFloat(item.total).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">Line Items Total:</td>
                <td className="px-4 py-3 font-bold text-gray-900">${lineItemsTotal.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* Validation Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Validation Results</h3>
        <div className="space-y-3">
          {/* Validation Check 1 */}
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
                  : 'Sum of line items matches total amount'
                }
              </p>
            </div>
          </div>

          {/* Validation Check 2 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-900">All Required Fields Present</p>
              <p className="text-sm text-green-700">Vendor name, invoice number, and date are all filled</p>
            </div>
          </div>

          {/* Validation Check 3 */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-yellow-50">
            <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-yellow-900">Low Confidence Warning</p>
              <p className="text-sm text-yellow-700">Tax amount extracted with 88% confidence - please verify</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
