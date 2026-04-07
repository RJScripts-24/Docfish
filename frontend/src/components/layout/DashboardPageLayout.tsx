import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';

interface DashboardPageLayoutProps {
  children: ReactNode;
  mainClassName: string;
}

export function DashboardPageLayout({ children, mainClassName }: DashboardPageLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <DashboardHeader />

        <main className={mainClassName}>{children}</main>
      </div>
    </div>
  );
}
