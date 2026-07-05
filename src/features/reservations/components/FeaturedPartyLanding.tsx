import Image from "next/image";
import Link from "next/link";
import type { PublicPartyOption } from "@/features/reservations/shared";
import {
  BRAND_LOGO_ALT,
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_SRC,
  BRAND_LOGO_WIDTH,
} from "@/lib/branding";
import {
  reservationPrimaryButtonClassName,
  reservationPrimaryButtonStyle,
} from "./reservation-button-styles";

type FeaturedPartyLandingProps = {
  party: PublicPartyOption;
};

export function FeaturedPartyLanding(_props: FeaturedPartyLandingProps) {
  void _props;

  return (
    <main className="min-h-[100svh] overflow-x-hidden bg-black text-[#fffaf4]">
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-black">
        <div className="absolute inset-0 -z-30">
          <Image
            src="/suwon-background.jpeg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            aria-hidden="true"
          />
        </div>
        <div className="absolute inset-0 -z-20 bg-black/52" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.46)_0%,rgba(0,0,0,0.22)_34%,rgba(0,0,0,0.64)_76%,rgba(0,0,0,0.9)_100%)]" />

        <div className="relative mx-auto flex min-h-[100svh] w-full max-w-3xl flex-col items-center px-5 pb-28 pt-17 text-center sm:px-8 sm:pb-32 sm:pt-24">
          <div className="flex flex-col items-center">
            <Image
              src={BRAND_LOGO_SRC}
              alt={BRAND_LOGO_ALT}
              width={BRAND_LOGO_WIDTH}
              height={BRAND_LOGO_HEIGHT}
              priority
              className="h-auto w-36 object-contain brightness-[1.55] contrast-[1.08] drop-shadow-[0_18px_32px_rgba(0,0,0,0.45)] sm:w-44"
            />

            <div className="mt-5 sm:mt-6">
              <p className="featured-wordmark text-[27px] leading-none tracking-normal text-[#fffaf4] drop-shadow-[0_4px_16px_rgba(0,0,0,0.42)] sm:text-[38px]">
                지문인식
              </p>
              <p className="mt-3 text-[9px] font-bold tracking-[0.38em] text-[#d8a06f] drop-shadow-[0_3px_12px_rgba(0,0,0,0.4)] sm:text-[10px]">
                JIMUNINSIK
              </p>
            </div>

            <div className="mt-8">
              <h1 className="featured-party-title grid gap-1 text-[62px] leading-[0.98] tracking-[0.1em] text-[#fffaf4] drop-shadow-[0_5px_18px_rgba(0,0,0,0.5)] sm:text-[108px]">
                <span>POTLUCK</span>
                <span>PARTY</span>
              </h1>
            </div>
          </div>

          <div className="w-full">
            <section className="mx-auto mt-16 flex w-full max-w-lg flex-col items-center text-center text-[#fffaf4] sm:mt-20">
              <div className="grid w-full max-w-sm gap-4 sm:gap-5">
                <PosterInfo
                  label="DATE"
                  value="7월 10일 금요일"
                  note="20:00 ~ 22:00"
                />
                <PosterInfo label="PEOPLE" value="남 12명 · 여 12명" />
                <PosterInfo label="TICKET" value="20,000원" note="칵테일 2잔 증정" />
                <PosterInfo
                  label="FOOD"
                  value="15,000원"
                  note="각자 15,000원 내외로 음식을 준비해주세요"
                />
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6">
        <div className="pointer-events-auto mx-auto w-full max-w-md sm:max-w-lg">
          <Link
            href="/reservations/apply"
            style={reservationPrimaryButtonStyle}
            className={[
              reservationPrimaryButtonClassName,
              "h-12 border border-[#d8a06f]/38 bg-[#6f371b]/95 tracking-[0.08em] shadow-[0_12px_28px_rgba(0,0,0,0.28)] transition hover:bg-[#7c4021] active:translate-y-px active:shadow-[0_8px_18px_rgba(0,0,0,0.24)] sm:h-14",
            ].join(" ")}
          >
            신청하기
          </Link>
        </div>
      </section>
    </main>
  );
}

function PosterInfo({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-black tracking-[0.26em] text-[#d8a06f]">
        {label}
      </p>
      <p className="mt-0.5 break-words text-[18px] font-black leading-7 text-[#fffaf4]">
        {value}
      </p>
      {note ? (
        <p className="break-words text-[12px] font-semibold leading-5 text-[#fffaf4]/66">
          {note}
        </p>
      ) : null}
    </div>
  );
}
