import { AdminFlashNotice } from "@/components/layout/AdminFlashNotice";
import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import { getBranchWorkspace, listBranchParties } from "@/features/branch-admin/server/workspace";
import { BranchCalendarView } from "./_components/BranchCalendarView";

type AdminCalendarPageProps = {
  searchParams?: Promise<{ date?: string; deleted?: string }>;
};

export default async function AdminCalendarPage({ searchParams }: AdminCalendarPageProps) {
  const query = searchParams ? await searchParams : undefined;
  const admin = await requireAdminContext();
  const branch = await getBranchWorkspace(admin);
  const parties = await listBranchParties(branch.id, 180);
  const initialSelectedDate =
    query?.date && /^\d{4}-\d{2}-\d{2}$/.test(query.date) ? query.date : undefined;

  return (
    <AdminConsoleLayout
      currentPath="/admin/calendar"
      title="캘린더"
      description={branch.name}
      loginId={admin.loginId}
      role={admin.role}
      notice={
        query?.deleted === "1" ? (
          <AdminFlashNotice
            tone="info"
            message="파티를 삭제했습니다."
            clearKeys={["deleted"]}
          />
        ) : null
      }
    >
      <BranchCalendarView parties={parties} initialSelectedDate={initialSelectedDate} />
    </AdminConsoleLayout>
  );
}
