import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/admin-gateway';
import OperationsConsole from './ui/operations-console';
export const dynamic = 'force-dynamic';
export default async function AdminPage() {
  const user = await currentAdmin();
  if (!user) redirect('/admin/login');
  return <OperationsConsole displayName={user.displayName} role={user.role}/>;
}
