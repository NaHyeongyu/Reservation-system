"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/branding";
import type { PublicReservationCompleteData } from "@/features/reservations/shared";
import {
  formatPublicDateLabel,
  formatPublicTimeLabel,
} from "@/features/reservations/shared";
import {
  reservationPrimaryButtonClassName,
  reservationPrimaryButtonStyle,
} from "./reservation-button-styles";

type ReservationCompleteViewProps = {
  reservation: PublicReservationCompleteData;
};

export function ReservationCompleteView({
  reservation,
}: ReservationCompleteViewProps) {
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const isWaitlisted = reservation.reservationStatus === "waitlisted";

  async function handleCopyAddress() {
    if (!reservation.branchAddress) {
      return;
    }

    try {
      await navigator.clipboard.writeText(reservation.branchAddress);
      setIsAddressCopied(true);
      window.setTimeout(() => setIsAddressCopied(false), 2000);
    } catch {
      setIsAddressCopied(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-1">
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-8 text-center sm:px-6 sm:py-10">
        <header className="mb-4 flex flex-col items-center gap-3">
          <Image
            src={BRAND_LOGO_SRC}
            alt={BRAND_LOGO_ALT}
            width={427}
            height={584}
            priority
            className="h-auto w-14 object-contain sm:w-16"
          />
        </header>

        <div className="mt-10 flex h-24 w-24 items-center justify-center rounded-full border border-brand-orange/30 bg-brand-orange/8">
          <svg
            viewBox="0 0 48 48"
            className="h-14 w-14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M14 24.5L21.5 32L34.5 17"
              className="reservation-check-path"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="mt-6">
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
            {isWaitlisted ? "대기 접수" : "신청 완료"}
          </p>
          <h1 className="mt-3 text-[28px] font-black tracking-[0.01em] text-brand-white">
            {isWaitlisted ? "대기 신청이 접수되었습니다" : "신청서가 제출되었습니다"}
          </h1>
          {isWaitlisted ? (
            <p className="mt-3 text-sm leading-6 text-muted">
              신청이 몰려 같은 성별 접수가 먼저 마감되어 현재는 대기자로 접수되었습니다.
            </p>
          ) : null}
        </div>

        <section className="mt-8 w-full rounded-[26px] border border-line bg-surface px-4 py-4 text-left">
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
            신청 정보
          </p>
          <div className="mt-3 space-y-3 text-sm text-brand-white">
            <DetailRow label="이름" value={reservation.reserverName} />
            <DetailRow label="전화번호" value={reservation.reserverPhone} />
            <DetailRow
              label="파티 날짜"
              value={formatPublicDateLabel(reservation.partyStartAt)}
            />
            <DetailRow
              label="진행 시간"
              value={formatPublicTimeLabel(
                reservation.partyStartAt,
                reservation.partyEndAt,
              )}
            />
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted">주소</span>
              {reservation.branchAddress ? (
                <div className="flex items-center gap-2 text-right">
                  <span>{reservation.branchAddress}</span>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                      isAddressCopied
                        ? "border-brand-orange bg-brand-orange text-brand-white"
                        : "border-line text-muted hover:border-brand-orange/35 hover:text-brand-white"
                    }`}
                    aria-label="주소 복사"
                    title={isAddressCopied ? "복사됨" : "주소 복사"}
                  >
                    {isAddressCopied ? (
                      <svg
                        viewBox="0 0 16 16"
                        className="h-4 w-4"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.25 8.25L6.4 11.4L12.75 5.05"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 16 16"
                        className="h-3.5 w-3.5"
                        fill="none"
                        aria-hidden="true"
                      >
                        <rect
                          x="5"
                          y="3"
                          width="8"
                          height="10"
                          rx="1.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                        />
                        <path
                          d="M3.5 10.5V4.5C3.5 3.95 3.95 3.5 4.5 3.5H9.5"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              ) : (
                <span className="text-right">-</span>
              )}
            </div>
          </div>
        </section>

        <div className="mt-8 w-full">
          <Link
            href="/"
            style={reservationPrimaryButtonStyle}
            className={[
              reservationPrimaryButtonClassName,
              "bg-brand-red hover:bg-brand-red/90",
            ].join(" ")}
          >
            파티 소개로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
