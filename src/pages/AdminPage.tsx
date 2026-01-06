import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminOverviewPage from './admin/AdminOverviewPage';
import AdminUsersPage from './admin/AdminUsersPage';
import AdminDesignSystemPage from './admin/AdminDesignSystemPage';
import AdminBlocksPage from './admin/AdminBlocksPage';
import AdminAnalyticsPage from './admin/AdminAnalyticsPage';
import AdminDomainsPage from './admin/AdminDomainsPage';
import AdminModerationPage from './admin/AdminModerationPage';
import AdminAuditPage from './admin/AdminAuditPage';
import AdminSettingsPage from './admin/AdminSettingsPage';

export default function AdminPage() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminOverviewPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/design-system" element={<AdminDesignSystemPage />} />
        <Route path="/blocks" element={<AdminBlocksPage />} />
        <Route path="/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/domains" element={<AdminDomainsPage />} />
        <Route path="/moderation" element={<AdminModerationPage />} />
        <Route path="/audit" element={<AdminAuditPage />} />
        <Route path="/settings" element={<AdminSettingsPage />} />
      </Routes>
    </AdminLayout>
  );
}
