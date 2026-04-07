import {
  AlertCircle,
  FileText,
  LayoutDashboard,
  Settings,
  Upload,
} from 'lucide-react';

export interface NavigationItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
}

export const dashboardNavigationItems: NavigationItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Documents', path: '/documents' },
  { icon: Upload, label: 'Upload', path: '/upload' },
  { icon: AlertCircle, label: 'Error Report', path: '/error-reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];
