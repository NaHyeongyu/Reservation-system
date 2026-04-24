"use client";

import { useState } from "react";

type ConsentKey = "partyTerms" | "privacy";

type ConsentSection = {
  title?: string;
  items: string[];
};

const consentItems: {
  key: ConsentKey;
  label: string;
  sections: ConsentSection[];
}[] = [
  {
    key: "partyTerms" as const,
    label: "파티 이용 규정 동의",
    sections: [
      {
        items: [
          "파티일 기준 8일 전까지 취소 시: 전액 환불",
          "파티일 기준 7일 전 - 당일 취소 시: 환불 및 변경 불가 (노쇼 포함)",
          "입장 시 신분증을 확인하니 신분증 필수 지참해주시기 바랍니다. (미성년자 이용방지)",
          "파티 진행 중 일부 시간 현장 촬영이 있을 수 있습니다. 얼굴은 블러 처리가 적용되며, 해당 이미지 및 영상은 마케팅 목적으로 활용될 수 있습니다.",
          "행사 중 발생한 사고의 민형사상 책임은 본인에게 있으며 물품 손괴 시 원가배상을 원칙으로 합니다.",
          "만취자, 과도한 스킨십 등 타인에게 피해 주는 행위를 하시면 즉시 퇴장 조치됩니다.",
          "파티 신청 시 위 내용에 동의한 것으로 간주되며, 동의하지 않으실 경우 참여가 제한될 수 있습니다.",
        ],
      },
    ],
  },
  {
    key: "privacy" as const,
    label: "개인정보 수집 및 이용 동의",
    sections: [
      {
        title: "수집된 개인정보의 이용 목적",
        items: [
          "파티 신청 및 서비스 관련 안내 문자(SMS) 발송",
          "본인 확인 및 파티 안내",
          "입금 확인 및 입장 확인",
          "파티 미 참여에 따른 계좌이체 환불",
          "서비스 이용 및 상담, 부정이용 확인 방지",
        ],
      },
      {
        title: "수집하는 개인정보의 항목",
        items: [
          "예약자 이름, 생년, 휴대전화 번호, 인스타그램 ID",
          "은행명, 계좌번호",
        ],
      },
      {
        title: "개인정보의 보유 및 이용기간",
        items: ["서비스 제공 완료 후 즉시 파기"],
      },
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
    <section className="mt-5 rounded-[26px] border border-line bg-surface px-4 py-4">
      <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
        동의
      </p>

      <label className="mt-3 flex cursor-pointer items-center gap-3 py-1">
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

      <div className="mt-3 space-y-1 border-t border-line pt-3">
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
                  <div className="space-y-3">
                    {item.sections.map((section) => (
                      <div key={section.title ?? section.items.join("/")}>
                        {section.title ? (
                          <p className="mb-1.5 font-medium text-brand-white">
                            {section.title}
                          </p>
                        ) : null}
                        <ul className="space-y-1.5">
                          {section.items.map((content) => (
                            <li key={content} className="flex gap-2">
                              <span aria-hidden="true">-</span>
                              <span>{content}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
