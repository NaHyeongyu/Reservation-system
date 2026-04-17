import { notFound } from "next/navigation";
import { AdminFlashNotice } from "@/components/layout/AdminFlashNotice";
import { AdminConsoleLayout } from "@/components/layout/AdminConsoleLayout";
import { requireAdminContext } from "@/features/admin-auth/server/admin-context";
import {
  getBranchPartyDetail,
  getBranchWorkspace,
  listPartyReservations,
} from "@/features/branch-admin/server/workspace";
import { PartyDetailClient } from "./_components/PartyDetailClient";

type AdminPartyDetailPageProps = {
  params: Promise<{ partyId: string }>;
  searchParams?: Promise<{
    updated?: string;
    error?: string;
    from?: string;
    date?: string;
  }>;
};

export default async function AdminPartyDetailPage({
  params,
  searchParams,
}: AdminPartyDetailPageProps) {
  const routeParams = await params;
  const query = searchParams ? await searchParams : undefined;
  const admin = await requireAdminContext();
  const branch = await getBranchWorkspace(admin);
  const [party, reservations] = await Promise.all([
    getBranchPartyDetail(branch.id, routeParams.partyId),
    listPartyReservations(branch.id, routeParams.partyId, 300),
  ]);

  if (!party) {
    notFound();
  }

  const detailSource = query?.from === "calendar" ? "calendar" : "parties";
  const sourceDate =
    detailSource === "calendar" && query?.date && /^\d{4}-\d{2}-\d{2}$/.test(query.date)
      ? query.date
      : formatDateInput(party.start_at);
  const backHref =
    detailSource === "calendar"
      ? `/admin/calendar?date=${sourceDate}`
      : "/admin/parties";

  return (
    <AdminConsoleLayout
      currentPath="/admin/parties"
      title={party.title}
      description={branch.name}
      loginId={admin.loginId}
      role={admin.role}
      notice={
        query?.updated === "visibility" ? (
          <AdminFlashNotice
            tone="info"
            message="인원수 노출 설정을 변경했습니다."
            clearKeys={["updated"]}
          />
        ) : query?.updated === "party_visibility" ? (
          <AdminFlashNotice
            tone="info"
            message="파티 노출 설정을 변경했습니다."
            clearKeys={["updated"]}
          />
        ) : query?.updated === "party" ? (
          <AdminFlashNotice
            tone="info"
            message="파티 기본 정보를 수정했습니다."
            clearKeys={["updated"]}
          />
        ) : query?.updated === "branch" ? (
          <AdminFlashNotice
            tone="info"
            message="지점 정보를 수정했습니다."
            clearKeys={["updated"]}
          />
        ) : query?.error ? (
          <AdminFlashNotice
            tone="danger"
            placement="bottom"
            message={
              query.error === "party_update"
                ? "파티 기본 정보 수정에 실패했습니다."
                : query.error === "branch_update"
                ? "지점 정보 수정에 실패했습니다."
                : query.error === "party_delete_reserved"
                ? "예약 내역이 있는 파티는 삭제할 수 없습니다."
                : query.error === "party_delete"
                ? "파티 삭제에 실패했습니다."
                : query.error === "party_visibility"
                ? "파티 노출 설정 변경에 실패했습니다."
                : query.error === "visibility"
                ? "인원수 노출 설정 변경에 실패했습니다."
                : "처리에 실패했습니다."
            }
            clearKeys={["error"]}
          />
        ) : null
      }
    >
      <PartyDetailClient
        branch={{
          id: branch.id,
          name: branch.name,
          phone: branch.phone,
          address: branch.address,
          instagramUrl: branch.instagram_url,
        }}
        party={{
          id: party.id,
          title: party.title,
          status: party.status,
          startAt: party.start_at,
          endAt: party.end_at,
          capacity: party.capacity,
          maleCapacity: party.male_capacity,
          femaleCapacity: party.female_capacity,
          showHeadcount: party.show_headcount,
        }}
        initialReservations={reservations}
        source={detailSource}
        sourceDate={detailSource === "calendar" ? sourceDate : null}
        backHref={backHref}
      />
    </AdminConsoleLayout>
  );
}

function formatDateInput(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
