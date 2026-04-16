import { ReservationApplyForm } from "@/features/reservations/components/ReservationApplyForm";

type ReservationApplyPageProps = {
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

export default async function ReservationApplyPage({
  searchParams,
}: ReservationApplyPageProps) {
  const params = await searchParams;

  return (
    <ReservationApplyForm
      selectedDate={getSingleValue(params.date)}
      selectedBranchSlug={getSingleValue(params.branch)}
    />
  );
}
