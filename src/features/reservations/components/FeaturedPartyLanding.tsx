import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  FEATURED_PUBLIC_PARTY_TIMELINE,
  type FeaturedPublicPartyTimelineItem,
} from "@/features/reservations/featured-party";
import type { PublicPartyOption } from "@/features/reservations/shared";
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/branding";
import {
  reservationPrimaryButtonClassName,
  reservationPrimaryButtonStyle,
} from "./reservation-button-styles";

type FeaturedPartyLandingProps = {
  party: PublicPartyOption;
};

type TypingLineStyle = CSSProperties & {
  "--typing-characters": number;
  "--typing-delay": string;
  "--typing-duration": string;
};

export function FeaturedPartyLanding({ party }: FeaturedPartyLandingProps) {
  const eventDateLabel = formatFeaturedDateText(party.startAt);
  const eventTimeLabel = formatFeaturedTimeText(party.startAt, party.endAt);
  const eventPlaceLabel = "제주시 칠성로길 8-1";
  const headlineFirstLine = "단 20명,";
  const headlineSecondLine = "특별한 밤이 시작됩니다";
  const typingSecondsPerCharacter = 0.085;
  const headlineFirstLineDuration = `${(
    headlineFirstLine.length * typingSecondsPerCharacter
  ).toFixed(2)}s`;
  const headlineSecondLineDuration = `${(
    headlineSecondLine.length * typingSecondsPerCharacter
  ).toFixed(2)}s`;
  const headlineFirstLineStyle: TypingLineStyle = {
    "--typing-characters": headlineFirstLine.length,
    "--typing-delay": "0.2s",
    "--typing-duration": headlineFirstLineDuration,
  };
  const headlineSecondLineStyle: TypingLineStyle = {
    "--typing-characters": headlineSecondLine.length,
    "--typing-delay": "0.9s",
    "--typing-duration": headlineSecondLineDuration,
  };

  return (
    <main className="min-h-screen bg-brand-black pb-28 text-brand-white sm:pb-32">
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-brand-black">
        <Image
          src="/events/featured-jeju-party.jpeg"
          alt={`${party.branchName} 파티 포스터`}
          fill
          priority
          className="object-cover object-center brightness-[0.68] contrast-110 saturate-[0.95]"
        />
        <div className="absolute inset-0 bg-black/58" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,0,0,0.12)_0%,transparent_32%),linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.52)_72%,rgba(0,0,0,0.86)_100%)]" />

        <div className="relative mx-auto grid min-h-[100svh] w-full max-w-4xl content-center justify-items-center px-6 py-12 text-center sm:px-10">
          <Image
            src={BRAND_LOGO_SRC}
            alt={BRAND_LOGO_ALT}
            width={427}
            height={584}
            priority
            className="h-auto w-12 object-contain drop-shadow-[0_14px_34px_rgba(255,0,0,0.28)] sm:w-14"
          />

          <h1 className="mt-10 grid gap-2 text-balance text-[clamp(1.9rem,5.8vw,4rem)] font-bold leading-[1.18] tracking-[-0.012em] text-brand-white/88 drop-shadow-[0_16px_38px_rgba(0,0,0,0.5)] sm:gap-3">
            <span
              className="featured-typing-line featured-typing-line--lead"
              style={headlineFirstLineStyle}
            >
              {headlineFirstLine}
            </span>
            <span
              className="featured-typing-line featured-typing-line--final"
              style={headlineSecondLineStyle}
            >
              {headlineSecondLine}
            </span>
          </h1>

          <div className="mt-24 grid w-full max-w-lg gap-4 py-4 text-center sm:mt-28 sm:grid-cols-2 sm:gap-6">
            <InfoBlock label="Date">
              <span>{eventDateLabel}</span>
              <span>{eventTimeLabel}</span>
            </InfoBlock>
            <InfoBlock label="Place">
              <span>{eventPlaceLabel}</span>
            </InfoBlock>
          </div>
        </div>
      </section>

      <section className="bg-brand-black">
        <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="text-center">
            <p className="text-[12px] font-black tracking-[0.3em] text-brand-red">
              TIME TABLE
            </p>
          </div>
          <ol className="mt-6">
            {FEATURED_PUBLIC_PARTY_TIMELINE.map((item) => (
              <TimelineRow key={`${item.startTime}-${item.title}`} item={item} />
            ))}
          </ol>
        </div>
      </section>

      <section className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6">
        <div className="pointer-events-auto mx-auto w-full max-w-md sm:max-w-lg">
          <Link
            href="/reservations/apply"
            style={reservationPrimaryButtonStyle}
            className={[
              reservationPrimaryButtonClassName,
              "h-12 bg-brand-red tracking-[0.08em] shadow-[0_14px_34px_rgba(255,0,0,0.34)] hover:bg-brand-red/90 sm:h-14",
            ].join(" ")}
          >
            신청하기
          </Link>
        </div>
      </section>
    </main>
  );
}

function InfoBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-orange">
        {label}
      </p>
      <div className="grid gap-0.5 break-words text-[15px] font-semibold leading-6 text-brand-white/90 sm:text-[16px]">
        {children}
      </div>
    </div>
  );
}

function TimelineRow({ item }: { item: FeaturedPublicPartyTimelineItem }) {
  const isBreak = item.tone === "break";

  return (
    <li
      className={[
        "grid min-w-0 grid-cols-[74px_18px_minmax(0,1fr)] items-center gap-4 border-b border-white/10 py-4 sm:grid-cols-[104px_18px_minmax(0,1fr)] sm:gap-6",
        isBreak ? "text-brand-orange" : "text-brand-white",
      ].join(" ")}
    >
      <div className="translate-x-2 justify-self-start text-left sm:translate-x-3">
        <p className="font-mono text-[13px] font-bold tracking-[0.08em]">
          {item.startTime}
        </p>
        <p className="mt-1 font-mono text-[10px] tracking-[0.14em] opacity-60">
          {item.endTime}
        </p>
      </div>
      <span
        className={[
          "h-2 w-2 justify-self-center rounded-full",
          isBreak ? "bg-brand-orange" : "bg-brand-red",
        ].join(" ")}
      />
      <p className="min-w-0 self-center break-words text-[15px] font-bold leading-6 sm:text-[17px]">
        {item.title}
      </p>
    </li>
  );
}

function formatFeaturedDateText(startAt: string) {
  const dateText = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(startAt))
    .replaceAll("-", ".");
  const weekdayText = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
  }).format(new Date(startAt));

  return `${dateText} (${weekdayText})`;
}

function formatFeaturedTimeText(startAt: string, endAt: string) {
  const timeFormatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  return `${timeFormatter.format(new Date(startAt))} ~ ${timeFormatter.format(new Date(endAt))}`;
}
