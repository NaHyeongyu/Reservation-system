import Image from "next/image";
import Link from "next/link";
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/branding";
import {
  reservationPrimaryButtonClassName,
  reservationPrimaryButtonStyle,
} from "./reservation-button-styles";

type FeaturedPartyUnavailableViewProps = {
  title: string;
  description: string;
};

export function FeaturedPartyUnavailableView({
  title,
  description,
}: FeaturedPartyUnavailableViewProps) {
  return (
    <main className="flex min-h-screen flex-1 bg-brand-black text-brand-white">
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 text-center sm:px-6">
        <div className="mx-auto inline-flex items-center gap-3">
          <Image
            src={BRAND_LOGO_SRC}
            alt={BRAND_LOGO_ALT}
            width={427}
            height={584}
            priority
            className="h-auto w-12 object-contain"
          />
        </div>

        <p className="mt-8 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
          Event Setup
        </p>
        <h1 className="mt-3 text-[30px] font-black leading-tight text-brand-white">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">{description}</p>

        <div className="mt-8">
          <Link
            href="/"
            style={reservationPrimaryButtonStyle}
            className={reservationPrimaryButtonClassName}
          >
            소개 페이지로 이동
          </Link>
        </div>
      </section>
    </main>
  );
}
