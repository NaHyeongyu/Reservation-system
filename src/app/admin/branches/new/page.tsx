import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireSuperAdminContext } from "@/features/admin-auth/server/admin-context";
import { BranchCreateForm } from "./_components/BranchCreateForm";

export default async function AdminBranchCreatePage() {
  const admin = await requireSuperAdminContext();

  return (
    <AdminConsoleLayout
      currentPath="/admin/branches"
      title="지점 생성"
      description="새 지점을 추가합니다."
      loginId={admin.loginId}
      role={admin.role}
    >
      <BranchCreateForm />
    </AdminConsoleLayout>
  );
}
