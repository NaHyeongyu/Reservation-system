import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import { formatConsoleTime, getBranchPartyTemplate, getBranchWorkspace, listBranchPartiesOnDate } from "@/features/branch-admin/server/workspace";
import { PartyCreateForm } from "./_components/PartyCreateForm";

type AdminPartyCreatePageProps = {
  searchParams?: Promise<{ date?: string }>;
};

export default async function AdminPartyCreatePage({ searchParams }: AdminPartyCreatePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const admin = await requireAdminContext();
  const branch = await getBranchWorkspace(admin);
  const selectedDate = normalizeDateParam(params?.date);
  const [existingParties, template] = await Promise.all([
    listBranchPartiesOnDate(branch.id, selectedDate),
    getBranchPartyTemplate(branch.id, selectedDate),
  ]);
  const isBlocked = existingParties.length > 0;

  return (
    <AdminConsoleLayout currentPath="/admin/parties" title="파티 생성" description={branch.name} loginId={admin.loginId} role={admin.role}>
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <PartyCreateForm selectedDate={selectedDate} disabled={isBlocked} initialValues={template} />

        <article className="rounded-[30px] border border-[#1c2733] bg-[#0b141d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Date</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{selectedDate}</h3>

          <div className="mt-6 space-y-3">
            {existingParties.length === 0 ? (
              template ? (
                <div className="rounded-[20px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
                  <p className="text-base font-semibold text-white">{template.title}</p>
                  <p className="mt-2 text-sm text-[#8ea1b2]">{template.startTime} - {template.endTime}</p>
                  <p className="mt-2 text-sm text-[#8ea1b2]">남 {template.maleCapacity} / 여 {template.femaleCapacity}</p>
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-[#22303d] bg-[#0f1822] px-4 py-8 text-center text-sm text-[#8ea1b2]">생성 가능한 날짜입니다.</div>
              )
            ) : (
              existingParties.map((party) => (
                <div key={party.id} className="rounded-[20px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
                  <p className="text-base font-semibold text-white">{party.title}</p>
                  <p className="mt-2 text-sm text-[#8ea1b2]">{formatConsoleTime(party.start_at)}</p>
                  <p className="mt-2 text-sm text-[#8ea1b2]">남 {party.male_capacity} / 여 {party.female_capacity}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </AdminConsoleLayout>
  );
}

function normalizeDateParam(value?: string) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
