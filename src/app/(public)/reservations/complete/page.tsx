import { notFound } from "next/navigation";
import { ReservationCompleteView } from "@/features/reservations/components/ReservationCompleteView";
import { getPublicReservationCompleteData } from "@/features/reservations/server/public-reservations";

type ReservationCompletePageProps = {
  searchParams: Promise<{
    code?: string | string[];
  }>;
};

function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default async function ReservationCompletePage({
  searchParams,
}: ReservationCompletePageProps) {
  const params = await searchParams;
  const reservationCode = getSingleValue(params.code);

  if (!reservationCode) {
    notFound();
  }

  const reservation = await getPublicReservationCompleteData(reservationCode);

  if (!reservation) {
    notFound();
  }

  return <ReservationCompleteView reservation={reservation} />;
}
