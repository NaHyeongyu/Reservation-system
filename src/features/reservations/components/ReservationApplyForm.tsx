"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { PublicPartyOption } from "@/features/reservations/shared";
import {
  formatPublicDateLabel,
  formatPublicTimeLabel,
} from "@/features/reservations/shared";
import { createPublicReservationAction } from "@/app/(public)/reservations/apply/_actions/create-public-reservation";
import { ReservationFlowIndicator } from "./ReservationFlowIndicator";
import { ReservationConsentSection } from "./ReservationConsentSection";
import {
  reservationDisabledButtonClassName,
  reservationPrimaryButtonClassName,
  reservationPrimaryButtonStyle,
} from "./reservation-button-styles";

type ReservationApplyFormProps = {
  party: PublicPartyOption;
};

const referralSources = [
  "인스타그램",
  "네이버 검색",
  "지인 추천",
  "카카오톡",
  "블로그",
  "기타",
];

const initialState = {
  errorMessage: null,
};

export function ReservationApplyForm({ party }: ReservationApplyFormProps) {
  const [state, formAction] = useActionState(
    createPublicReservationAction,
    initialState,
  );
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [referralSourceValues, setReferralSourceValues] = useState<string[]>([]);
  const [partyTermsAgreed, setPartyTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const allAgreed = partyTermsAgreed && privacyAgreed;
  const isBirthDateValid = /^\d{8}$/.test(birthDate);
  const isWaitlistExpected =
    (gender === "male" && party.maleApplied >= party.maleCapacity) ||
    (gender === "female" && party.femaleApplied >= party.femaleCapacity);
  const hasRequiredFields =
    gender !== null &&
    isBirthDateValid &&
    name.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    bankName.trim().length > 0 &&
    accountNumber.trim().length > 0;
  const canSubmit = hasRequiredFields && allAgreed;

  function handleToggleAllConsents(checked: boolean) {
    setPartyTermsAgreed(checked);
    setPrivacyAgreed(checked);
  }

  function handleToggleReferralSource(source: string, checked: boolean) {
    setReferralSourceValues((current) => {
      if (checked) {
        return current.includes(source) ? current : [...current, source];
      }

      return current.filter((item) => item !== source);
    });
  }

  return (
    <main className="flex min-h-screen flex-1">
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
        <ReservationFlowIndicator
          steps={[
            { label: "날짜", status: "complete" },
            { label: "지점", status: "complete" },
            { label: "신청서", status: "current" },
          ]}
        />

        <section className="rounded-[26px] border border-line bg-surface px-4 py-4">
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
            예약 정보
          </p>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="text-muted">선택 날짜</p>
              <p className="mt-1 text-brand-white">
                {formatPublicDateLabel(party.startAt)}
              </p>
            </div>
            <div>
              <p className="text-muted">선택 지점</p>
              <p className="mt-1 text-brand-white">{party.branchName}</p>
            </div>
            <div>
              <p className="text-muted">파티</p>
              <p className="mt-1 text-brand-white">{party.title}</p>
            </div>
            <div>
              <p className="text-muted">파티시간</p>
              <p className="mt-1 text-brand-white">
                {formatPublicTimeLabel(party.startAt, party.endAt)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end border-t border-line pt-4">
            <Link
              href="/"
              className="text-xs font-medium tracking-[0.08em] text-muted transition hover:text-brand-white"
            >
              날짜 선택으로 돌아가기
            </Link>
          </div>
        </section>

        <form action={formAction} className="contents">
          <input type="hidden" name="partyId" value={party.id} />
          <input
            type="hidden"
            name="partyTermsAgreed"
            value={partyTermsAgreed ? "true" : "false"}
          />
          <input
            type="hidden"
            name="privacyAgreed"
            value={privacyAgreed ? "true" : "false"}
          />

          <section className="mt-5 rounded-[26px] border border-line bg-surface px-4 py-4">
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
                  개인 정보 입력
                </p>
              </div>

              <fieldset className="block">
                <legend className="flex items-center gap-1 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
                  <span>성별</span>
                  <span className="text-brand-red">*</span>
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 rounded-[16px] border bg-brand-black px-4 py-3 text-sm text-brand-white transition ${
                      gender === "male" ? "border-brand-orange" : "border-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      required
                      checked={gender === "male"}
                      onChange={() => setGender("male")}
                      className="h-4 w-4 accent-brand-orange"
                    />
                    <span>남</span>
                  </label>
                  <label
                    className={`flex items-center justify-center gap-2 rounded-[16px] border bg-brand-black px-4 py-3 text-sm text-brand-white transition ${
                      gender === "female" ? "border-brand-orange" : "border-line"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      required
                      checked={gender === "female"}
                      onChange={() => setGender("female")}
                      className="h-4 w-4 accent-brand-orange"
                    />
                    <span>여</span>
                  </label>
                </div>
                {isWaitlistExpected ? (
                  <p className="mt-3 text-sm text-brand-red">
                    현재 선택한 성별 정원이 차 있어 대기 접수로 들어갑니다.
                  </p>
                ) : null}
              </fieldset>

              <label className="block">
                <span className="flex items-center gap-1 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
                  <span>생년월일</span>
                  <span className="text-brand-red">*</span>
                </span>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={8}
                  minLength={8}
                  pattern="[0-9]{8}"
                  placeholder="20010809"
                  value={birthDate}
                  onChange={(event) => setBirthDate(event.target.value)}
                  className="mt-2 w-full rounded-[16px] border border-line bg-brand-black px-4 py-3 text-sm text-brand-white outline-none transition placeholder:text-muted focus:border-brand-orange/60"
                />
              </label>

              <label className="block">
                <span className="flex items-center gap-1 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
                  <span>이름</span>
                  <span className="text-brand-red">*</span>
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="이름을 입력하세요"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 w-full rounded-[16px] border border-line bg-brand-black px-4 py-3 text-sm text-brand-white outline-none transition placeholder:text-muted focus:border-brand-orange/60"
                />
              </label>

              <label className="block">
                <span className="flex items-center gap-1 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
                  <span>전화번호</span>
                  <span className="text-brand-red">*</span>
                </span>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  placeholder="010-0000-0000"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  className="mt-2 w-full rounded-[16px] border border-line bg-brand-black px-4 py-3 text-sm text-brand-white outline-none transition placeholder:text-muted focus:border-brand-orange/60"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                <label className="block">
                  <span className="flex items-center gap-1 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
                    <span>은행</span>
                    <span className="text-brand-red">*</span>
                  </span>
                  <input
                    id="bankName"
                    name="bankName"
                    type="text"
                    required
                    placeholder="은행명을 입력하세요"
                    value={bankName}
                    onChange={(event) => setBankName(event.target.value)}
                    className="mt-2 w-full rounded-[16px] border border-line bg-brand-black px-4 py-3 text-sm text-brand-white outline-none transition placeholder:text-muted focus:border-brand-orange/60"
                  />
                </label>

                <label className="block">
                  <span className="flex items-center gap-1 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
                    <span>계좌번호</span>
                    <span className="text-brand-red">*</span>
                  </span>
                  <input
                    id="accountNumber"
                    name="accountNumber"
                    type="text"
                    required
                    placeholder="계좌번호를 입력하세요"
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value)}
                    className="mt-2 w-full rounded-[16px] border border-line bg-brand-black px-4 py-3 text-sm text-brand-white outline-none transition placeholder:text-muted focus:border-brand-orange/60"
                  />
                </label>
              </div>

              <div className="pt-2">
                <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
                  유입경로
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {referralSources.map((source) => (
                  <label key={source} className="block">
                    <input
                      type="checkbox"
                      name="referralSources"
                      value={source}
                      checked={referralSourceValues.includes(source)}
                      onChange={(event) =>
                        handleToggleReferralSource(source, event.target.checked)
                      }
                      className="peer sr-only"
                    />
                    <span className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm text-muted transition peer-checked:border-brand-orange peer-checked:text-brand-white">
                      {source}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <ReservationConsentSection
            partyTermsAgreed={partyTermsAgreed}
            privacyAgreed={privacyAgreed}
            onChangePartyTerms={setPartyTermsAgreed}
            onChangePrivacy={setPrivacyAgreed}
            onToggleAll={handleToggleAllConsents}
          />

          {state.errorMessage ? (
            <div className="mt-5 rounded-[22px] border border-[#5a2430] bg-[#1a0d12] px-4 py-3 text-sm text-[#ffd7de]">
              {state.errorMessage}
            </div>
          ) : null}

          <p className="mt-4 px-1 text-xs leading-5 text-muted">
            제출 시점에 같은 성별 신청이 먼저 마감되면 대기자로 접수될 수 있습니다.
          </p>

          <div className="mt-5">
            <SubmitButton
              disabled={!canSubmit}
              label={isWaitlistExpected ? "대기자 신청" : "신청서 제출하기"}
            />
          </div>
        </form>
      </section>
    </main>
  );
}

function SubmitButton({
  disabled,
  label,
}: {
  disabled: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      style={reservationPrimaryButtonStyle}
      className={
        isDisabled
          ? reservationDisabledButtonClassName
          : reservationPrimaryButtonClassName
      }
    >
      {pending ? "처리 중..." : label}
    </button>
  );
}
