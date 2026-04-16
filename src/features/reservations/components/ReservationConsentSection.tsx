"use client";

import { useState } from "react";

type ConsentKey = "partyTerms" | "privacy";

const consentItems = [
  {
    key: "partyTerms" as const,
    label: "파티 이용 규정 동의",
    content: [
      "본 문구는 임시 약관 내용입니다. 예약 신청 후 파티 이용 전반에 적용되는 기본 안내가 이 영역에 들어갑니다.",
      "입장 시간, 이용 가능 범위, 주의 사항, 취소 및 변경 규정 등 세부 운영 정책은 추후 확정된 내용으로 교체될 예정입니다.",
    ],
  },
  {
    key: "privacy" as const,
    label: "개인 정보 수집 및 이용 동의",
    content: [
      "본 문구는 임시 개인정보 동의 내용입니다. 예약 처리와 본인 확인을 위해 이름, 연락처, 생년월일, 계좌정보 등을 수집할 수 있습니다.",
      "수집된 정보의 보관 기간, 이용 목적, 파기 절차에 대한 상세 정책은 실제 운영 기준에 맞춰 추후 반영될 예정입니다.",
    ],
  },
];

type ReservationConsentSectionProps = {
  partyTermsAgreed: boolean;
  privacyAgreed: boolean;
  onChangePartyTerms: (checked: boolean) => void;
  onChangePrivacy: (checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
};

export function ReservationConsentSection({
  partyTermsAgreed,
  privacyAgreed,
  onChangePartyTerms,
  onChangePrivacy,
  onToggleAll,
}: ReservationConsentSectionProps) {
  const [openedConsent, setOpenedConsent] = useState<ConsentKey | null>(null);

  const allAgreed = partyTermsAgreed && privacyAgreed;

  function handleToggleConsent(key: ConsentKey) {
    setOpenedConsent((current) => (current === key ? null : key));
  }

  function getAgreementState(key: ConsentKey) {
    return key === "partyTerms" ? partyTermsAgreed : privacyAgreed;
  }

  function setAgreementState(key: ConsentKey, checked: boolean) {
    if (key === "partyTerms") {
      onChangePartyTerms(checked);
      return;
    }

    onChangePrivacy(checked);
  }

  return (
    <>
      <section className="mt-5 rounded-[26px] border border-line bg-surface px-4 py-4">
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
          동의
        </p>

        <div className="mt-3 rounded-[20px] border border-line bg-brand-black/60">
          <div className="px-4 py-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={(event) => onToggleAll(event.target.checked)}
                className="peer sr-only"
              />
              <span
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] transition ${
                  allAgreed
                    ? "border-brand-orange bg-brand-orange text-brand-white"
                    : "border-line text-transparent"
                }`}
              >
                ✓
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-brand-white">전체 동의</p>
              </div>
            </label>
          </div>

          <div className="px-4 pb-3">
            <div className="ml-2 pl-4">
              <div className="space-y-1">
                {consentItems.map((item) => {
                  const isAgreed = getAgreementState(item.key);
                  const isOpen = openedConsent === item.key;

                  return (
                    <div key={item.key} className="py-1">
                      <div className="flex items-center gap-3">
                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-2">
                          <input
                            type="checkbox"
                            checked={isAgreed}
                            onChange={(event) =>
                              setAgreementState(item.key, event.target.checked)
                            }
                            className="peer sr-only"
                          />
                          <span
                            className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] transition ${
                              isAgreed
                                ? "border-brand-orange bg-brand-orange text-brand-white"
                                : "border-line text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <span className="flex min-w-0 items-center gap-1 text-sm text-brand-white">
                            <span className="truncate">{item.label}</span>
                            <span className="text-brand-red">*</span>
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleToggleConsent(item.key)}
                          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs transition ${
                            isOpen
                              ? "border-brand-orange/50 text-brand-white"
                              : "border-line text-muted hover:border-brand-orange/35 hover:text-brand-white"
                          }`}
                          aria-expanded={isOpen}
                          aria-controls={`${item.key}-content`}
                          aria-label={isOpen ? `${item.label} 닫기` : `${item.label} 보기`}
                        >
                          {isOpen ? "-" : "+"}
                        </button>
                      </div>

                      {isOpen ? (
                        <div
                          id={`${item.key}-content`}
                          className="mt-1 rounded-[14px] border border-line bg-brand-black/40 px-4 py-3 text-xs leading-6 text-muted"
                        >
                          <div className="space-y-2">
                            {item.content.map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
