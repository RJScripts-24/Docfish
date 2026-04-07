import { DashboardPageLayout } from '../components/layout/DashboardPageLayout';
import { MetricsCard } from '../components/features/dashboard/MetricsCard';
import { ChartSection } from '../components/features/dashboard/ChartSection';
import { RecentDocuments } from '../components/features/dashboard/RecentDocuments';
import { QuickActions } from '../components/features/dashboard/QuickActions';
import { SystemAlerts } from '../components/features/dashboard/SystemAlerts';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getDashboardMetrics,
  getDocumentsOverTime,
  getErrorSummary,
  getRecentDocuments,
} from '../lib/api';
import { DashboardMetrics, DocumentChartPoint, ErrorSummary, InvoiceDocument } from '../lib/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<DocumentChartPoint[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<InvoiceDocument[]>([]);
  const [errorSummary, setErrorSummary] = useState<ErrorSummary | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadDashboard() {
      try {
        setLoadError(null);
        setIsMetricsLoading(true);
        setIsRecentLoading(true);

        const [metricsResponse, recentResponse, errorSummaryResponse] = await Promise.all([
          getDashboardMetrics(),
          getRecentDocuments(5),
          getErrorSummary(),
        ]);

        if (!isActive) {
          return;
        }

        setMetrics(metricsResponse);
        setRecentDocuments(recentResponse);
        setErrorSummary(errorSummaryResponse);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setLoadError(error instanceof Error ? error.message : 'Failed to load dashboard data.');
      } finally {
        if (isActive) {
          setIsMetricsLoading(false);
          setIsRecentLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadChart() {
      try {
        setIsChartLoading(true);
        const response = await getDocumentsOverTime(timeRange);

        if (isActive) {
          setChartData(response);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load chart data.');
        }
      } finally {
        if (isActive) {
          setIsChartLoading(false);
        }
      }
    }

    void loadChart();

    return () => {
      isActive = false;
    };
  }, [timeRange]);

  return (
    <DashboardPageLayout mainClassName="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto">
          {loadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <MetricsCard
              title="Total Documents Processed"
              value={isMetricsLoading ? '...' : metrics?.totalDocuments ?? 0}
              Icon={FileText}
              color="blue"
              delay={0}
            />
            <MetricsCard
              title="Avg Processing Time"
              value={isMetricsLoading ? '...' : metrics?.avgProcessingTime ?? '0.0s'}
              subtitle="Last 24 hours"
              Icon={Clock}
              color="green"
              delay={0.1}
            />
            <MetricsCard
              title="Extraction Success Rate"
              value={isMetricsLoading ? '...' : `${metrics?.successRate ?? 0}%`}
              Icon={CheckCircle}
              color="purple"
              delay={0.2}
            />
            <MetricsCard
              title="Validation Errors"
              value={isMetricsLoading ? '...' : metrics?.validationErrors ?? 0}
              subtitle="Flagged for review"
              Icon={AlertTriangle}
              color="yellow"
              delay={0.3}
            />
          </div>

          {/* Chart Section */}
          <ChartSection
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            data={chartData}
            isLoading={isChartLoading}
          />

          {/* Recent Documents Table */}
          <RecentDocuments documents={recentDocuments} isLoading={isRecentLoading} />

          {/* Bottom Grid - Quick Actions & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <QuickActions />
            </div>
            <div className="lg:col-span-1">
              <SystemAlerts
                reviewCount={errorSummary?.reviewCount ?? 0}
                failedCount={errorSummary?.failedCount ?? 0}
              />
            </div>
          </div>
    </DashboardPageLayout>
  );
}
