import { ReservationCalendar } from "@/features/reservations/components/ReservationCalendar";
import { listPublicPartyOptions } from "@/features/reservations/server/public-reservations";

export default async function PublicHomePage() {
  const partyOptions = await listPublicPartyOptions();

  return <ReservationCalendar partyOptions={partyOptions} />;
}
