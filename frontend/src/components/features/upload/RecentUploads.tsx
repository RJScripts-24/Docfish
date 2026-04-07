import { motion } from 'motion/react';
import { Clock, FileText } from 'lucide-react';
import { Link } from 'react-router';

interface RecentUploadItem {
  id: string;
  name: string;
  subtitle: string;
  status: 'done' | 'processing' | 'error' | 'uploaded';
  path?: string;
}

interface RecentUploadsProps {
  uploads: RecentUploadItem[];
}

export function RecentUploads({ uploads }: RecentUploadsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white border border-gray-200 rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
          <Clock className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Recent Uploads</h3>
          <p className="text-xs text-gray-500">Quick access to last uploads</p>
        </div>
      </div>

      <div className="space-y-3">
        {uploads.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            Your latest uploads will appear here once you start sending documents.
          </div>
        ) : (
          uploads.map((upload, index) => {
            const statusColor =
              upload.status === 'done'
                ? 'bg-green-500'
                : upload.status === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500';

            const content = (
              <motion.div
                key={upload.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{upload.name}</p>
                  <p className="text-xs text-gray-500">{upload.subtitle}</p>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor}`} />
              </motion.div>
            );

            return upload.path ? (
              <Link key={upload.id} to={upload.path}>
                {content}
              </Link>
            ) : (
              <div key={upload.id}>{content}</div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
