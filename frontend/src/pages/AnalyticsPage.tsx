import { DashboardPageLayout } from '../components/layout/DashboardPageLayout';
import { MetricsCard } from '../components/features/dashboard/MetricsCard';
import { ChartSection } from '../components/features/dashboard/ChartSection';
import { RecentDocuments } from '../components/features/dashboard/RecentDocuments';
import { useEffect, useState } from 'react';
import { CheckCircle, Clock, FileText, AlertTriangle } from 'lucide-react';
import { getDashboardMetrics, getDocumentsOverTime, getRecentDocuments } from '../lib/api';
import { DashboardMetrics, DocumentChartPoint, InvoiceDocument } from '../lib/types';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<DocumentChartPoint[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<InvoiceDocument[]>([]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadAnalytics() {
      try {
        setErrorMessage(null);
        setIsLoading(true);

        const [metricsResponse, recentResponse] = await Promise.all([
          getDashboardMetrics(),
          getRecentDocuments(10),
        ]);

        if (!isActive) {
          return;
        }

        setMetrics(metricsResponse);
        setRecentDocuments(recentResponse);
      } catch (error) {
        if (isActive) {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load analytics.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadAnalytics();

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
          setErrorMessage(error instanceof Error ? error.message : 'Failed to load trend data.');
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
          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <MetricsCard title="Total Documents" value={isLoading ? '...' : metrics?.totalDocuments ?? 0} Icon={FileText} color="blue" />
            <MetricsCard title="Avg Processing Time" value={isLoading ? '...' : metrics?.avgProcessingTime ?? '0.0s'} Icon={Clock} color="green" />
            <MetricsCard title="Success Rate" value={isLoading ? '...' : `${metrics?.successRate ?? 0}%`} Icon={CheckCircle} color="purple" />
            <MetricsCard title="Validation Errors" value={isLoading ? '...' : metrics?.validationErrors ?? 0} Icon={AlertTriangle} color="yellow" />
          </div>

          <ChartSection
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            data={chartData}
            isLoading={isChartLoading}
          />

          <RecentDocuments documents={recentDocuments} isLoading={isLoading} />
    </DashboardPageLayout>
  );
}
