"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { BRAND_LOGO_ALT, BRAND_LOGO_SRC } from "@/lib/branding";
import { signInAdminAccountAction } from "../_actions/sign-in-admin-account";

const initialState = {
  errorMessage: null,
};

export function AdminLoginForm() {
  const [state, formAction] = useActionState(signInAdminAccountAction, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-[30px] border border-[#1c2733] bg-[#0b141d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
    >
      <div className="flex items-center gap-3">
        <Image
          src={BRAND_LOGO_SRC}
          alt={BRAND_LOGO_ALT}
          width={427}
          height={584}
          priority
          className="h-auto w-9 shrink-0 object-contain"
        />
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-[#7c95a8] uppercase">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-white">로그인</h1>
        </div>
      </div>

      <Field label="아이디" htmlFor="loginId">
        <input
          id="loginId"
          name="loginId"
          type="text"
          className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff]"
          required
        />
      </Field>

      <Field label="비밀번호" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          className="w-full rounded-[18px] border border-[#223140] bg-[#0f1822] px-4 py-3.5 text-base text-white outline-none transition focus:border-[#7ad0ff]"
          required
        />
      </Field>

      {state.errorMessage ? (
        <div className="rounded-[18px] border border-[#5a2430] bg-[#1a0d12] px-4 py-3 text-sm text-[#ffd7de]">
          {state.errorMessage}
        </div>
      ) : null}

      <SubmitButton>로그인</SubmitButton>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <label className="block font-mono text-[11px] tracking-[0.22em] text-[#7c95a8] uppercase" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center rounded-[18px] border border-[#2f5c82] bg-[#0f2231] px-5 py-3.5 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247] disabled:cursor-not-allowed disabled:border-[#253543] disabled:bg-[#10161d] disabled:text-[#607282]"
    >
      {pending ? "처리 중..." : children}
    </button>
  );
}
