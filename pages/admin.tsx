import { AdminDashboardView } from '../src/views/AdminDashboardView';
import { SEO } from '../src/components/SEO';

export default function AdminPage() {
  return (
    <>
      <SEO title="Admin Dashboard" description="DSA Study Hub Administration" noindex />
      <AdminDashboardView />
    </>
  );
}
