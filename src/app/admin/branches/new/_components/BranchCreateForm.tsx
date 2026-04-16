"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createBranchAction } from "../_actions/create-branch";

const initialState = {
  errorMessage: null,
};

export function BranchCreateForm() {
  const [state, formAction] = useActionState(createBranchAction, initialState);

  return (
    <form action={formAction} className="grid gap-5 rounded-[30px] border border-[#1c2733] bg-[#0b141d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <Field label="지점명" htmlFor="name">
        <input id="name" name="name" type="text" className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff]" required />
      </Field>
      <Field label="전화번호" htmlFor="phone">
        <input id="phone" name="phone" type="text" className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff]" />
      </Field>
      <Field label="주소" htmlFor="address">
        <input id="address" name="address" type="text" className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff]" />
      </Field>
      <Field label="인스타그램" htmlFor="instagramUrl">
        <input id="instagramUrl" name="instagramUrl" type="url" className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff]" />
      </Field>
      {state.errorMessage ? <div className="rounded-[18px] border border-[#5a2430] bg-[#1a0d12] px-4 py-3 text-sm text-[#ffd7de]">{state.errorMessage}</div> : null}
      <SubmitButton />
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <label className="block font-mono text-[11px] tracking-[0.22em] text-[#7c95a8] uppercase" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="inline-flex w-full items-center justify-center rounded-[18px] border border-[#2f5c82] bg-[#0f2231] px-5 py-3.5 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247] disabled:cursor-not-allowed disabled:border-[#253543] disabled:bg-[#10161d] disabled:text-[#607282]">{pending ? "생성 중..." : "지점 생성"}</button>;
}
