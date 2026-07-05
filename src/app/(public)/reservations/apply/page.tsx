import { ReservationApplyForm } from "@/features/reservations/components/ReservationApplyForm";
import { FeaturedPartyUnavailableView } from "@/features/reservations/components/FeaturedPartyUnavailableView";
import { getFeaturedPublicPartyOption } from "@/features/reservations/server/public-reservations";

export default async function ReservationApplyPage() {
  const party = await getFeaturedPublicPartyOption();

  if (!party) {
    return (
      <FeaturedPartyUnavailableView
        title="신청 가능한 파티가 아직 없습니다"
        description="현재 공개 신청과 연결된 수원행궁점 파티가 없어 신청 폼을 열 수 없습니다. 파티를 게시하면 바로 이 화면에서 신청을 받을 수 있습니다."
      />
    );
  }

  return <ReservationApplyForm party={party} />;
}
