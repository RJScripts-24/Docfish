import { DashboardPageLayout } from '../components/layout/DashboardPageLayout';

export default function AnalyticsPage() {
  return (
    <DashboardPageLayout mainClassName="p-8">
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Page</h2>
            <p className="text-gray-600">Advanced analytics coming soon...</p>
          </div>
    </DashboardPageLayout>
  );
}
