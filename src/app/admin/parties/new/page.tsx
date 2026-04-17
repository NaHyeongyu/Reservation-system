import Link from "next/link";
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
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr] xl:gap-6">
        <article className="order-1 rounded-[24px] border border-[#1c2733] bg-[#0b141d] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-[30px] sm:p-6 xl:order-2">
          <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Date</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h3 className="text-2xl font-semibold text-white">{selectedDate}</h3>
            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${isBlocked ? "border-[#5a4a25] bg-[#191208] text-[#f1dd9d]" : "border-[#274a63] bg-[#0d1a25] text-[#97d7ff]"}`}>
              {isBlocked ? "이미 등록됨" : "생성 가능"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#8ea1b2]">
            {isBlocked
              ? "선택한 날짜에는 이미 등록된 파티가 있습니다. 기존 파티를 확인하거나 다른 날짜를 선택하세요."
              : "선택한 날짜 기준으로 바로 파티를 생성할 수 있습니다."}
          </p>

          <div className="mt-6 space-y-3">
            {existingParties.length === 0 ? (
              template ? (
                <div className="rounded-[20px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
                  <p className="font-mono text-[10px] tracking-[0.18em] text-[#7c95a8] uppercase">Template</p>
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
                  <p className="mt-2 text-sm text-[#8ea1b2]">{formatConsoleTime(party.start_at)} - {formatConsoleTime(party.end_at)}</p>
                  <p className="mt-2 text-sm text-[#8ea1b2]">남 {party.male_capacity} / 여 {party.female_capacity}</p>
                  <Link href={`/admin/parties/${party.id}?from=calendar&date=${selectedDate}`} className="mt-4 inline-flex w-full items-center justify-center rounded-[16px] border border-[#2f5c82] bg-[#0f2231] px-4 py-3 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]">
                    기존 파티 상세 보기
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Link href="/admin/calendar" className="inline-flex w-full items-center justify-center rounded-[16px] border border-[#22303d] bg-[#0f1822] px-4 py-3 text-sm font-semibold text-[#d9e2ea] transition hover:border-[#7ad0ff] hover:text-white">
              캘린더로 돌아가기
            </Link>
            {!isBlocked ? (
              <p className="px-1 text-sm leading-6 text-[#7c95a8]">하단 버튼으로 바로 등록하면 파티 목록에 추가됩니다.</p>
            ) : null}
          </div>
        </article>

        {isBlocked ? (
          <article className="order-2 rounded-[24px] border border-[#1c2733] bg-[#0b141d] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:rounded-[30px] sm:p-6 xl:order-1">
            <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Create</p>
            <h3 className="mt-2 text-xl font-semibold text-white">새 파티 생성 불가</h3>
            <p className="mt-3 text-sm leading-6 text-[#8ea1b2]">같은 날짜에 중복 생성은 막혀 있습니다. 기존 파티를 확인하거나 캘린더에서 다른 날짜를 선택하세요.</p>
          </article>
        ) : (
          <div className="order-2 xl:order-1">
            <PartyCreateForm selectedDate={selectedDate} disabled={false} initialValues={template} />
          </div>
        )}
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
