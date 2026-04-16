import { ReservationCompleteView } from "@/features/reservations/components/ReservationCompleteView";

type ReservationCompletePageProps = {
  searchParams: Promise<{
    date?: string | string[];
    branch?: string | string[];
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

  return (
    <ReservationCompleteView
      selectedDate={getSingleValue(params.date)}
      selectedBranchSlug={getSingleValue(params.branch)}
    />
  );
}
