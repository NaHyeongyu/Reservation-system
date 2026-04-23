import Image from "next/image";
import Link from "next/link";
import type { PublicPartyOption } from "@/features/reservations/shared";
import {
  reservationPrimaryButtonClassName,
  reservationPrimaryButtonStyle,
} from "./reservation-button-styles";

type FeaturedPartyLandingProps = {
  party: PublicPartyOption;
};

export function FeaturedPartyLanding({ party }: FeaturedPartyLandingProps) {
  return (
    <main className="flex min-h-screen flex-1 bg-brand-black text-brand-white">
      <section className="relative min-h-screen flex-1 overflow-hidden">
        <Image
          src="/events/featured-jeju-party.jpeg"
          alt={`${party.branchName} 파티 현장`}
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/28" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-brand-black via-brand-black/76 to-transparent" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-end px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="w-full pb-2 sm:pb-4">
            <div className="mx-auto w-full max-w-md">
              <Link
                href="/reservations/apply"
                style={reservationPrimaryButtonStyle}
                className={reservationPrimaryButtonClassName}
              >
                신청하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
