import { FeaturedPartyLanding } from "@/features/reservations/components/FeaturedPartyLanding";
import { FeaturedPartyUnavailableView } from "@/features/reservations/components/FeaturedPartyUnavailableView";
import { getFeaturedPublicPartyOption } from "@/features/reservations/server/public-reservations";

export default async function PublicHomePage() {
  const party = await getFeaturedPublicPartyOption();

  if (!party) {
    return (
      <FeaturedPartyUnavailableView
        title="공개할 파티를 준비 중입니다"
        description="2026년 7월 10일 수원행궁점 파티 정보를 연결하면 이 페이지에서 바로 소개와 신청 흐름이 이어집니다."
      />
    );
  }

  return <FeaturedPartyLanding party={party} />;
}
