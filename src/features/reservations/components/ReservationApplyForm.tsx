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
import { ReservationConsentSection } from "./ReservationConsentSection";
import {
  reservationDisabledButtonClassName,
  reservationPrimaryButtonClassName,
  reservationPrimaryButtonStyle,
} from "./reservation-button-styles";

type ReservationApplyFormProps = {
  party: PublicPartyOption;
};

const initialState = {
  errorMessage: null,
};

const darkPanelClassName =
  "rounded-[26px] border border-white/10 bg-[#111111]/86 px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)]";
const fieldLabelClassName =
  "flex items-center gap-1 text-[11px] font-medium tracking-[0.14em] text-[#d8a06f] uppercase";
const inputClassName =
  "mt-2 w-full rounded-[16px] border border-white/10 bg-[#050505] px-4 py-3 text-sm text-[#fffaf4] outline-none transition placeholder:text-[#fffaf4]/36 focus:border-[#d8a06f]/70 focus:bg-[#090909]";

export function ReservationApplyForm({ party }: ReservationApplyFormProps) {
  const [state, formAction] = useActionState(
    createPublicReservationAction,
    initialState,
  );
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [birthYear, setBirthYear] = useState("");
  const [name, setName] = useState("");
  const [instagramId, setInstagramId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [partyTermsAgreed, setPartyTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const allAgreed = partyTermsAgreed && privacyAgreed;
  const isBirthYearValid = /^\d{4}$/.test(birthYear);
  const isWaitlistExpected =
    (gender === "male" && party.maleApplied >= party.maleCapacity) ||
    (gender === "female" && party.femaleApplied >= party.femaleCapacity);
  const hasRequiredFields =
    gender !== null &&
    isBirthYearValid &&
    name.trim().length > 0 &&
    instagramId.trim().length > 0 &&
    phoneNumber.trim().length > 0 &&
    bankName.trim().length > 0 &&
    accountNumber.trim().length > 0;
  const canSubmit = hasRequiredFields && allAgreed;

  function handleToggleAllConsents(checked: boolean) {
    setPartyTermsAgreed(checked);
    setPrivacyAgreed(checked);
  }

  return (
    <main className="flex min-h-screen flex-1 bg-[#050505] text-[#fffaf4]">
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-5">
          <div className="h-[13px]" aria-hidden="true" />
          <h1 className="mt-3 text-[28px] font-black leading-tight text-[#fffaf4]">
            파티 신청서
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#fffaf4]/62">
            {formatPublicDateLabel(party.startAt)} ·{" "}
            {formatPublicTimeLabel(party.startAt, party.endAt)}
          </p>
        </header>

        <section className={darkPanelClassName}>
          <p className="text-[11px] font-medium tracking-[0.16em] text-[#d8a06f] uppercase">
            파티 정보
          </p>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="text-[#fffaf4]/58">지점명</p>
              <p className="mt-1 text-[#fffaf4]">지문인식 {party.branchName}</p>
            </div>
            {party.branchAddress ? (
              <div>
                <p className="text-[#fffaf4]/58">주소</p>
                <p className="mt-1 break-words text-[#fffaf4]">
                  {party.branchAddress}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-[#fffaf4]/58">파티 날짜</p>
              <p className="mt-1 text-[#fffaf4]">
                {formatPublicDateLabel(party.startAt)}
              </p>
            </div>
            <div>
              <p className="text-[#fffaf4]/58">진행 시간</p>
              <p className="mt-1 text-[#fffaf4]">
                {formatPublicTimeLabel(party.startAt, party.endAt)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end border-t border-white/10 pt-4">
            <Link
              href="/"
              className="text-xs font-medium tracking-[0.08em] text-[#fffaf4]/54 transition hover:text-[#fffaf4]"
            >
              파티 소개로 돌아가기
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

          <section className={`mt-5 ${darkPanelClassName}`}>
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-medium tracking-[0.16em] text-[#d8a06f] uppercase">
                  개인 정보 입력
                </p>
              </div>

              <fieldset className="block">
                <legend className={fieldLabelClassName}>
                  <span>성별</span>
                  <span className="text-[#d8a06f]">*</span>
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-center gap-2 rounded-[16px] border bg-[#050505] px-4 py-3 text-sm text-[#fffaf4] transition ${
                      gender === "male"
                        ? "border-[#d8a06f]"
                        : "border-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      required
                      checked={gender === "male"}
                      onChange={() => setGender("male")}
                      className="h-4 w-4 accent-[#d8a06f]"
                    />
                    <span>남</span>
                  </label>
                  <label
                    className={`flex items-center justify-center gap-2 rounded-[16px] border bg-[#050505] px-4 py-3 text-sm text-[#fffaf4] transition ${
                      gender === "female"
                        ? "border-[#d8a06f]"
                        : "border-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      required
                      checked={gender === "female"}
                      onChange={() => setGender("female")}
                      className="h-4 w-4 accent-[#d8a06f]"
                    />
                    <span>여</span>
                  </label>
                </div>
                {isWaitlistExpected ? (
                  <p className="mt-3 text-sm text-[#ffb7a0]">
                    현재 선택한 성별 정원이 차 있어 대기 접수로 들어갑니다.
                  </p>
                ) : null}
              </fieldset>

              <label className="block">
                <span className={fieldLabelClassName}>
                  <span>생년</span>
                  <span className="text-[#d8a06f]">*</span>
                </span>
                <input
                  id="birthYear"
                  name="birthYear"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={4}
                  minLength={4}
                  pattern="[0-9]{4}"
                  placeholder="2001"
                  value={birthYear}
                  onChange={(event) => setBirthYear(event.target.value)}
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={fieldLabelClassName}>
                  <span>이름</span>
                  <span className="text-[#d8a06f]">*</span>
                </span>
                <FieldDescription>
                  <p>
                    신청자, 입금자, 신분증 이름 미일치 시 입금확인 및 입장이
                    어렵습니다.
                  </p>
                  <p>
                    신청서는 1인 1개씩 필수 작성 부탁드립니다. 일행과 동반 시
                    각각 작성해주세요.
                  </p>
                </FieldDescription>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="이름을 입력하세요"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={fieldLabelClassName}>
                  <span>인스타그램 ID</span>
                  <span className="text-[#d8a06f]">*</span>
                </span>
                <input
                  id="instagramId"
                  name="instagramId"
                  type="text"
                  required
                  autoCapitalize="none"
                  autoComplete="username"
                  maxLength={31}
                  pattern="@?[A-Za-z0-9._]{1,30}"
                  placeholder="@party_account"
                  value={instagramId}
                  onChange={(event) => setInstagramId(event.target.value)}
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className={fieldLabelClassName}>
                  <span>전화번호</span>
                  <span className="text-[#d8a06f]">*</span>
                </span>
                <FieldDescription>
                  추후 본인 확인 및 파티 안내 용도로 사용됩니다.
                </FieldDescription>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  placeholder="010-0000-0000"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  className={inputClassName}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                <label className="block">
                  <span className={fieldLabelClassName}>
                    <span>환불 은행</span>
                    <span className="text-[#d8a06f]">*</span>
                  </span>
                  <FieldDescription>
                    환불 업무에 사용됩니다.
                  </FieldDescription>
                  <input
                    id="bankName"
                    name="bankName"
                    type="text"
                    required
                    placeholder="은행명을 입력하세요"
                    value={bankName}
                    onChange={(event) => setBankName(event.target.value)}
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className={fieldLabelClassName}>
                    <span>환불 계좌번호</span>
                    <span className="text-[#d8a06f]">*</span>
                  </span>
                  <FieldDescription>
                    환불 업무에 사용됩니다.
                  </FieldDescription>
                  <input
                    id="accountNumber"
                    name="accountNumber"
                    type="text"
                    required
                    placeholder="계좌번호를 입력하세요"
                    value={accountNumber}
                    onChange={(event) => setAccountNumber(event.target.value)}
                    className={inputClassName}
                  />
                </label>
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

          <p className="mt-4 px-1 text-xs leading-5 text-[#fffaf4]/56">
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

function FieldDescription({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 space-y-1 border-l-2 border-[#d8a06f]/70 pl-3 text-[11px] leading-5 text-[#fffaf4]/64">
      {children}
    </div>
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
          ? [
              reservationDisabledButtonClassName,
              "bg-[#6f371b]/28 text-[#fffaf4]/46",
            ].join(" ")
          : [
              reservationPrimaryButtonClassName,
              "border border-[#d8a06f]/38 bg-[#1b1b1b] shadow-[0_12px_28px_rgba(0,0,0,0.32)] hover:bg-[#242424]",
            ].join(" ")
      }
    >
      {pending ? "처리 중..." : label}
    </button>
  );
}
