"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BRAND_LOGO_ALT,
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_SRC,
  BRAND_LOGO_WIDTH,
} from "@/lib/branding";
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
    <main className="flex min-h-screen flex-1 bg-[#050505] text-[#fffaf4]">
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-8 text-center sm:px-6 sm:py-10">
        <header className="mb-4 flex flex-col items-center gap-3">
          <Image
            src={BRAND_LOGO_SRC}
            alt={BRAND_LOGO_ALT}
            width={BRAND_LOGO_WIDTH}
            height={BRAND_LOGO_HEIGHT}
            priority
            className="h-auto w-20 object-contain brightness-[1.3] contrast-[1.05] drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)] sm:w-24"
          />
        </header>

        <div className="mt-6">
          <p className="text-[11px] font-medium tracking-[0.16em] text-[#d8a06f] uppercase">
            {isWaitlisted ? "대기 접수" : "신청 완료"}
          </p>
          <h1 className="mt-3 text-[28px] font-black tracking-[0.01em] text-[#fffaf4]">
            {isWaitlisted ? "대기 신청이 접수되었습니다" : "신청서가 제출되었습니다"}
          </h1>
          {isWaitlisted ? (
            <p className="mt-3 text-sm leading-6 text-[#fffaf4]/62">
              신청이 몰려 같은 성별 접수가 먼저 마감되어 현재는 대기자로 접수되었습니다.
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#fffaf4]/62">
              신청 정보를 확인한 뒤 입금 안내 및 파티 공지를 순차적으로 전달드립니다.
            </p>
          )}
        </div>

        <section className="mt-8 w-full rounded-[26px] border border-white/10 bg-[#111111]/86 px-4 py-4 text-left shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          <p className="text-[11px] font-medium tracking-[0.16em] text-[#d8a06f] uppercase">
            신청 정보
          </p>
          <div className="mt-3 space-y-3 text-sm text-[#fffaf4]">
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
            <div className="grid grid-cols-[92px_minmax(0,1fr)] items-start gap-4">
              <span className="text-[#fffaf4]/58">주소</span>
              {reservation.branchAddress ? (
                <div className="flex min-w-0 items-start gap-2">
                  <span className="min-w-0 flex-1 break-words text-left">
                    {reservation.branchAddress}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                      isAddressCopied
                        ? "border-[#d8a06f] bg-[#9c5a31] text-[#fffaf4]"
                        : "border-white/15 text-[#fffaf4]/56 hover:border-[#d8a06f]/45 hover:text-[#fffaf4]"
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
                <span className="text-left">-</span>
              )}
            </div>
          </div>
        </section>

        <div className="mt-4 w-full rounded-[16px] border border-[#d8a06f]/24 bg-[#d8a06f]/8 px-4 py-3 text-left text-sm leading-6 text-[#fffaf4]/72">
          최소 인원 10명 미충족 시 파티가 취소될 수 있으며, 이 경우 환불 처리가
          진행됩니다.
        </div>

        <div className="mt-8 w-full">
          <Link
            href="/"
            style={reservationPrimaryButtonStyle}
            className={[
              reservationPrimaryButtonClassName,
              "border border-[#d8a06f]/38 bg-[#1b1b1b] shadow-[0_12px_28px_rgba(0,0,0,0.32)] hover:bg-[#242424]",
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
    <div className="grid grid-cols-[92px_minmax(0,1fr)] items-start gap-4">
      <span className="text-[#fffaf4]/58">{label}</span>
      <span className="min-w-0 break-words text-left">{value}</span>
    </div>
  );
}
