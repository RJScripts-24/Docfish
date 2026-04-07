import { motion } from 'motion/react';
import { useState } from 'react';
import { Upload, Play, Code2, X } from 'lucide-react';

interface TestPromptPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRunTest: (sampleText: string) => void;
}

export function TestPromptPanel({ isOpen, onClose, onRunTest }: TestPromptPanelProps) {
  const [sampleText, setSampleText] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    if (!sampleText.trim()) {
      alert('Please enter sample text or upload a document');
      return;
    }

    setIsRunning(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResult = {
        vendor_name: {
          value: 'Acme Corporation',
          confidence: 0.95,
        },
        invoice_number: {
          value: 'INV-2024-001',
          confidence: 0.98,
        },
        invoice_date: {
          value: '2024-01-15',
          confidence: 0.92,
        },
        total_amount: {
          value: 12450.0,
          confidence: 0.96,
        },
        line_items: [
          {
            description: 'Professional Services',
            quantity: 1,
            unit_price: 10000.0,
            total: 10000.0,
            confidence: 0.89,
          },
          {
            description: 'Software License',
            quantity: 1,
            unit_price: 1205.0,
            total: 1205.0,
            confidence: 0.94,
          },
        ],
      };

      setTestResult(mockResult);
      setIsRunning(false);
      onRunTest(sampleText);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Test Prompt</h2>
            <p className="text-sm text-gray-600 mt-1">
              Run extraction on sample text to validate your prompt
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">
                Sample Document Text
              </label>
              <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload PDF
              </button>
            </div>
            <textarea
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="Paste invoice text here or upload a PDF document..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono text-sm bg-gray-50"
            />
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunTest}
            disabled={isRunning}
            className={`w-full px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              isRunning
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[var(--df-lime)] hover:bg-[#7BC942] text-gray-900 shadow-sm'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Running Extraction...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Extraction
              </>
            )}
          </button>

          {/* Results Section */}
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Extraction Results
                </label>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1">
                  <Code2 className="w-3 h-3" />
                  JSON
                </span>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                <pre className="text-green-400 font-mono text-sm">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>

              {/* Confidence Summary */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                  <p className="text-xs text-green-600 font-semibold">
                    Average Confidence
                  </p>
                  <p className="text-2xl font-bold text-green-700 mt-1">94%</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <p className="text-xs text-blue-600 font-semibold">
                    Fields Extracted
                  </p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">6</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
