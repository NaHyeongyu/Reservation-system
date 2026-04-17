import { notFound } from "next/navigation";
import { ReservationApplyForm } from "@/features/reservations/components/ReservationApplyForm";
import { getPublicPartyOption } from "@/features/reservations/server/public-reservations";

type ReservationApplyPageProps = {
  searchParams: Promise<{
    party?: string | string[];
  }>;
};

function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default async function ReservationApplyPage({
  searchParams,
}: ReservationApplyPageProps) {
  const params = await searchParams;
  const partyId = getSingleValue(params.party);

  if (!partyId) {
    notFound();
  }

  const party = await getPublicPartyOption(partyId);

  if (!party) {
    notFound();
  }

  return <ReservationApplyForm party={party} />;
}
