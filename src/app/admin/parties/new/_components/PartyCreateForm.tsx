"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPartyAction } from "../_actions/create-party";

type PartyCreateFormProps = {
  selectedDate: string;
  disabled: boolean;
  initialValues?: {
    title: string;
    startTime: string;
    endTime: string;
    maleCapacity: number;
    femaleCapacity: number;
  } | null;
};

const initialState = {
  errorMessage: null,
};

export function PartyCreateForm({ selectedDate, disabled, initialValues }: PartyCreateFormProps) {
  const [state, formAction] = useActionState(createPartyAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-[24px] border border-[#1c2733] bg-[#0b141d] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:gap-5 sm:rounded-[30px] sm:p-6">
      <input type="hidden" name="eventDate" value={selectedDate} />
      <section className="rounded-[20px] border border-[#17212b] bg-[#0f1822] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#7c95a8] uppercase">Selected Date</p>
            <p className="mt-2 text-lg font-semibold text-white">{selectedDate}</p>
          </div>
          {initialValues ? (
            <span className="inline-flex rounded-full border border-[#274a63] bg-[#0d1a25] px-2.5 py-1 text-[10px] font-medium text-[#97d7ff]">
              최근 설정 반영
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-[#8ea1b2]">
          {initialValues
            ? "최근 파티 설정을 기본값으로 채워두었습니다."
            : "아래 정보만 입력하면 바로 파티를 등록할 수 있습니다."}
        </p>
      </section>

      <Field label="파티명" htmlFor="title"><input id="title" name="title" type="text" defaultValue={initialValues?.title ?? "메인 파티"} disabled={disabled} className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff] disabled:cursor-not-allowed disabled:opacity-50" required /></Field>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <Field label="시작" htmlFor="startTime"><input id="startTime" name="startTime" type="time" defaultValue={initialValues?.startTime ?? "20:00"} disabled={disabled} className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff] disabled:cursor-not-allowed disabled:opacity-50" required /></Field>
        <Field label="종료" htmlFor="endTime"><input id="endTime" name="endTime" type="time" defaultValue={initialValues?.endTime ?? "23:00"} disabled={disabled} className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff] disabled:cursor-not-allowed disabled:opacity-50" required /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <Field label="남자" htmlFor="maleCapacity"><input id="maleCapacity" name="maleCapacity" type="number" min={0} step={1} inputMode="numeric" defaultValue={initialValues?.maleCapacity ?? 10} disabled={disabled} className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff] disabled:cursor-not-allowed disabled:opacity-50" required /></Field>
        <Field label="여자" htmlFor="femaleCapacity"><input id="femaleCapacity" name="femaleCapacity" type="number" min={0} step={1} inputMode="numeric" defaultValue={initialValues?.femaleCapacity ?? 10} disabled={disabled} className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff] disabled:cursor-not-allowed disabled:opacity-50" required /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        <Field label="프론트 노출" htmlFor="isVisible">
          <select
            id="isVisible"
            name="isVisible"
            defaultValue="false"
            disabled={disabled}
            className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="true">노출</option>
            <option value="false">비노출</option>
          </select>
        </Field>
        <Field label="인원 수 노출" htmlFor="showHeadcount">
          <select
            id="showHeadcount"
            name="showHeadcount"
            defaultValue="true"
            disabled={disabled}
            className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="true">노출</option>
            <option value="false">비노출</option>
          </select>
        </Field>
      </div>
      {disabled ? <div className="rounded-[18px] border border-[#5a4a25] bg-[#191208] px-4 py-3 text-sm leading-6 text-[#f1dd9d]">선택한 날짜에는 이미 파티가 있습니다.</div> : null}
      {state.errorMessage ? <div className="rounded-[18px] border border-[#5a2430] bg-[#1a0d12] px-4 py-3 text-sm leading-6 text-[#ffd7de]">{state.errorMessage}</div> : null}
      <div className="sticky bottom-3 z-10 -mx-1 mt-1 rounded-[22px] border border-[#1c2733] bg-[#0b141d]/95 p-2 backdrop-blur sm:static sm:mx-0 sm:mt-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <SubmitButton disabled={disabled} />
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-2.5"><label className="block font-mono text-[11px] tracking-[0.22em] text-[#7c95a8] uppercase" htmlFor={htmlFor}>{label}</label>{children}</div>;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={disabled || pending} className="inline-flex w-full items-center justify-center rounded-[18px] border border-[#2f5c82] bg-[#0f2231] px-5 py-3.5 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247] disabled:cursor-not-allowed disabled:border-[#253543] disabled:bg-[#10161d] disabled:text-[#607282]">{pending ? "생성 중..." : "파티 생성"}</button>;
}
