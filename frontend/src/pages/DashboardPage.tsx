import { DashboardPageLayout } from '../components/layout/DashboardPageLayout';
import { MetricsCard } from '../components/features/dashboard/MetricsCard';
import { ChartSection } from '../components/features/dashboard/ChartSection';
import { RecentDocuments } from '../components/features/dashboard/RecentDocuments';
import { QuickActions } from '../components/features/dashboard/QuickActions';
import { SystemAlerts } from '../components/features/dashboard/SystemAlerts';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <DashboardPageLayout mainClassName="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <MetricsCard
              title="Total Documents Processed"
              value="1,248"
              trend={{ value: '12.5%', isPositive: true }}
              Icon={FileText}
              color="blue"
              delay={0}
            />
            <MetricsCard
              title="Avg Processing Time"
              value="2.4s"
              subtitle="Last 24 hours"
              Icon={Clock}
              color="green"
              delay={0.1}
            />
            <MetricsCard
              title="Extraction Success Rate"
              value="94.8%"
              trend={{ value: '2.3%', isPositive: true }}
              Icon={CheckCircle}
              color="purple"
              delay={0.2}
            />
            <MetricsCard
              title="Validation Errors"
              value="32"
              subtitle="Flagged for review"
              Icon={AlertTriangle}
              color="yellow"
              delay={0.3}
            />
          </div>

          {/* Chart Section */}
          <ChartSection />

          {/* Recent Documents Table */}
          <RecentDocuments />

          {/* Bottom Grid - Quick Actions & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <QuickActions />
            </div>
            <div className="lg:col-span-1">
              <SystemAlerts />
            </div>
          </div>
    </DashboardPageLayout>
  );
}