import { motion } from 'motion/react';
import { ChevronDown, Zap, Target, Shield } from 'lucide-react';
import { useState } from 'react';

export interface AdvancedUploadSettings {
  extractionMode: 'fast' | 'accurate';
  autoProcess: boolean;
  validation: boolean;
}

interface AdvancedSettingsProps {
  value: AdvancedUploadSettings;
  onChange: (value: AdvancedUploadSettings) => void;
}

export function AdvancedSettings({ value, onChange }: AdvancedSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const setExtractionMode = (extractionMode: 'fast' | 'accurate') => {
    onChange({ ...value, extractionMode });
  };

  const toggleAutoProcess = () => {
    onChange({ ...value, autoProcess: !value.autoProcess });
  };

  const toggleValidation = () => {
    onChange({ ...value, validation: !value.validation });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Advanced Settings</h3>
            <p className="text-xs text-gray-500">Configure extraction options</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      {/* Content */}
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gray-200 px-6 py-6 space-y-6"
        >
          {/* Extraction Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Extraction Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExtractionMode('fast')}
                className={`p-4 border-2 rounded-xl transition-all text-left ${
                  value.extractionMode === 'fast'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Zap className={`w-5 h-5 mb-2 ${
                  value.extractionMode === 'fast' ? 'text-teal-600' : 'text-gray-600'
                }`} />
                <div className="font-medium text-gray-900">Fast</div>
                <div className="text-xs text-gray-500">Quick processing</div>
              </button>

              <button
                onClick={() => setExtractionMode('accurate')}
                className={`p-4 border-2 rounded-xl transition-all text-left ${
                  value.extractionMode === 'accurate'
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Target className={`w-5 h-5 mb-2 ${
                  value.extractionMode === 'accurate' ? 'text-teal-600' : 'text-gray-600'
                }`} />
                <div className="font-medium text-gray-900">High Accuracy</div>
                <div className="text-xs text-gray-500">Detailed analysis</div>
              </button>
            </div>
          </div>

          {/* Auto Process Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Auto-process after upload</div>
              <div className="text-xs text-gray-500">Start extraction immediately</div>
            </div>
            <button
              onClick={toggleAutoProcess}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                value.autoProcess ? 'bg-teal-500' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: value.autoProcess ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
              />
            </button>
          </div>

          {/* Validation Checks Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Enable validation checks</div>
              <div className="text-xs text-gray-500">Verify extracted data accuracy</div>
            </div>
            <button
              onClick={toggleValidation}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                value.validation ? 'bg-teal-500' : 'bg-gray-300'
              }`}
            >
              <motion.div
                animate={{ x: value.validation ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
              />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
