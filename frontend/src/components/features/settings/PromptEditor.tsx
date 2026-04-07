import { motion } from 'motion/react';
import { useState } from 'react';
import { AlertTriangle, Save, CheckCircle } from 'lucide-react';

interface PromptEditorProps {
  versionName: string;
  description: string;
  promptContent: string;
  status: 'active' | 'draft';
  onVersionNameChange: (name: string) => void;
  onDescriptionChange: (desc: string) => void;
  onPromptContentChange: (content: string) => void;
  onStatusChange: (status: 'active' | 'draft') => void;
  onSaveNewVersion: () => void;
  onUpdateVersion: () => void;
  onSetActive: () => void;
}

export function PromptEditor({
  versionName,
  description,
  promptContent,
  status,
  onVersionNameChange,
  onDescriptionChange,
  onPromptContentChange,
  onStatusChange,
  onSaveNewVersion,
  onUpdateVersion,
  onSetActive,
}: PromptEditorProps) {
  const [showWarning, setShowWarning] = useState(false);

  const handleSetActive = () => {
    if (status === 'draft') {
      setShowWarning(true);
    } else {
      onSetActive();
    }
  };

  const confirmSetActive = () => {
    onSetActive();
    setShowWarning(false);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-6 space-y-6">
      {/* Warning Banner */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-yellow-900">
              Confirm Prompt Activation
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Changing the active prompt may affect extraction results for all future documents. Are you sure you want to proceed?
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={confirmSetActive}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Yes, Activate
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-all border border-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Metadata Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Prompt Metadata
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Version Name
            </label>
            <input
              type="text"
              value={versionName}
              onChange={(e) => onVersionNameChange(e.target.value)}
              placeholder="e.g., v1.3 - Enhanced vendor extraction"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--df-navy)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Brief description of changes or improvements..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--df-navy)] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => onStatusChange('draft')}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  status === 'draft'
                    ? 'bg-gray-200 text-gray-900 border-2 border-gray-400'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => onStatusChange('active')}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  status === 'active'
                    ? 'bg-[#8AE04A]/20 text-[var(--df-navy)] border-2 border-[#8AE04A]'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                Active
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Prompt Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Prompt Template</h3>
          <span className="text-xs text-gray-500 font-mono">
            {promptContent.length} characters
          </span>
        </div>
        
        <div className="relative">
          <textarea
            value={promptContent}
            onChange={(e) => onPromptContentChange(e.target.value)}
            placeholder="Enter your prompt template here..."
            rows={20}
            className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--df-navy)] font-mono text-sm resize-none bg-gray-50"
            style={{ lineHeight: '1.6' }}
          />
        </div>

        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Tip:</strong> Use placeholders like {'{{document_text}}'}, {'{{vendor_name}}'}, {'{{line_items}}'} for dynamic content.
          </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3 sticky bottom-0 bg-gray-50 py-4"
      >
        <button
          onClick={onSaveNewVersion}
          className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save as New Version
        </button>

        <button
          onClick={onUpdateVersion}
          className="flex-1 px-6 py-3 bg-white border-2 border-[var(--df-navy)] hover:bg-gray-50 text-[var(--df-navy)] rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Update Current Version
        </button>

        <button
          onClick={handleSetActive}
          disabled={status === 'active'}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            status === 'active'
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[var(--df-lime)] hover:bg-[#7BC942] text-gray-900 shadow-sm'
          }`}
        >
          <CheckCircle className="w-5 h-5" />
          Set as Active
        </button>
      </motion.div>
    </div>
  );
}
