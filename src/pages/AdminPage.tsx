import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { useUserRole } from '@/hooks/useUserRole';
import AdminOverviewPage from './admin/AdminOverviewPage';
import AdminUsersPage from './admin/AdminUsersPage';
import AdminDesignSystemPage from './admin/AdminDesignSystemPage';
import AdminBlocksPage from './admin/AdminBlocksPage';
import AdminAnalyticsPage from './admin/AdminAnalyticsPage';
import AdminDomainsPage from './admin/AdminDomainsPage';
import AdminModerationPage from './admin/AdminModerationPage';
import AdminAuditPage from './admin/AdminAuditPage';
import AdminSettingsPage from './admin/AdminSettingsPage';
import AdminDatabasePage from './admin/AdminDatabasePage';

function SuperAdminOnly({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, loading } = useUserRole();
  
  if (loading) return null;
  if (!isSuperAdmin) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export default function AdminPage() {
  const { isSuperAdmin } = useUserRole();

  return (
    <AdminLayout isSuperAdmin={isSuperAdmin}>
      <Routes>
        <Route path="/" element={<AdminOverviewPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/domains" element={<AdminDomainsPage />} />
        <Route path="/moderation" element={<AdminModerationPage />} />
        {/* Super Admin only routes */}
        <Route path="/design-system" element={<SuperAdminOnly><AdminDesignSystemPage /></SuperAdminOnly>} />
        <Route path="/blocks" element={<SuperAdminOnly><AdminBlocksPage /></SuperAdminOnly>} />
        <Route path="/database" element={<SuperAdminOnly><AdminDatabasePage /></SuperAdminOnly>} />
        <Route path="/audit" element={<SuperAdminOnly><AdminAuditPage /></SuperAdminOnly>} />
        <Route path="/settings" element={<SuperAdminOnly><AdminSettingsPage /></SuperAdminOnly>} />
      </Routes>
    </AdminLayout>
  );
}
