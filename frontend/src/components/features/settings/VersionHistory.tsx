import { motion } from 'motion/react';
import { Check, Clock, Trash2, Tag } from 'lucide-react';
import { PromptVersion } from '../../../lib/types';

interface VersionHistoryProps {
  versions: PromptVersion[];
  selectedVersionId: string;
  onSelectVersion: (id: string) => void;
  onActivateVersion: (id: string) => void;
  onDeleteVersion: (id: string) => void;
}

export function VersionHistory({
  versions,
  selectedVersionId,
  onSelectVersion,
  onActivateVersion,
  onDeleteVersion,
}: VersionHistoryProps) {
  return (
    <div className="h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Version History</h2>
        <p className="text-sm text-gray-600 mt-1">{versions.length} versions</p>
      </div>

      <div className="p-4 space-y-3">
        {versions.map((version, index) => (
          <motion.div
            key={version.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectVersion(version.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedVersionId === version.id
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{version.name}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {version.timestamp}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  version.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {version.status === 'active' ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  'Draft'
                )}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {version.description}
            </p>

            {version.tags && version.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {version.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div
              className="flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {version.status === 'draft' && (
                <button
                  onClick={() => onActivateVersion(version.id)}
                  className="flex-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-all"
                >
                  Activate
                </button>
              )}
              <button
                onClick={() => onDeleteVersion(version.id)}
                className="flex-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
