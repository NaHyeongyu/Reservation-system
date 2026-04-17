import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import {
  getBranchStatusLabel,
  getBranchWorkspace,
} from "@/features/branch-admin/server/workspace";

export default async function AdminBranchSettingsPage() {
  const admin = await requireAdminContext();
  const branch = await getBranchWorkspace(admin);

  return (
    <AdminConsoleLayout currentPath="/admin/branch-settings" title="지점 설정" description={branch.name} loginId={admin.loginId} role={admin.role}>
      <article className="rounded-[30px] border border-[#1c2733] bg-[#0b141d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Branch</p>
        <div className="mt-5 space-y-4">
          <InfoRow label="지점명" value={branch.name} />
          <InfoRow label="전화번호" value={branch.phone ?? "-"} />
          <InfoRow label="주소" value={branch.address ?? "-"} />
          <InfoRow label="인스타그램" value={branch.instagram_url ?? "-"} />
          <InfoRow label="상태" value={getBranchStatusLabel(branch.status)} />
        </div>
      </article>
    </AdminConsoleLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[18px] border border-[#17212b] bg-[#0f1822] px-4 py-4"><p className="font-mono text-[10px] tracking-[0.22em] text-[#70879a] uppercase">{label}</p><p className="mt-2 text-sm font-semibold text-white">{value}</p></div>;
}
