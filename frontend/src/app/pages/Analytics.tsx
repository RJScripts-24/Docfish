import { Sidebar } from '../components/dashboard/Sidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';

export default function Analytics() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <DashboardHeader />
        
        <main className="p-8">
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Page</h2>
            <p className="text-gray-600">Advanced analytics coming soon...</p>
          </div>
        </main>
      </div>
    </div>
  );
}
