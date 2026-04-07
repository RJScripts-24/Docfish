import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';

interface DashboardPageLayoutProps {
  children: ReactNode;
  mainClassName: string;
}

export function DashboardPageLayout({ children, mainClassName }: DashboardPageLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden lg:pl-64">
        <DashboardHeader />

        <main className={`flex-1 w-full max-w-full ${mainClassName}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
