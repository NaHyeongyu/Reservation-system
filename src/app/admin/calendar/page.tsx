import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import { getBranchWorkspace, listBranchParties } from "@/features/branch-admin/server/workspace";
import { BranchCalendarView } from "./_components/BranchCalendarView";

export default async function AdminCalendarPage() {
  const admin = await requireAdminContext();
  const branch = await getBranchWorkspace(admin);
  const parties = await listBranchParties(branch.id, 180);

  return (
    <AdminConsoleLayout currentPath="/admin/calendar" title="캘린더" description={branch.name} loginId={admin.loginId} role={admin.role}>
      <BranchCalendarView parties={parties} />
    </AdminConsoleLayout>
  );
}
