"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { updateBranchInfoAction } from "@/app/admin/parties/[partyId]/_actions/manage-party";

type BranchSettingsDialogProps = {
  branchId: string;
  partyId: string;
  source: "calendar" | "parties";
  sourceDate: string | null;
  name: string;
  phone: string | null;
  address: string | null;
  instagramUrl: string | null;
};

export function BranchSettingsDialog({
  branchId,
  partyId,
  source,
  sourceDate,
  name,
  phone,
  address,
  instagramUrl,
}: BranchSettingsDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-[14px] border border-[#2f5c82] bg-[#0f2231] px-4 py-2.5 text-xs font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]"
      >
        지점 수정
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#04080ccc]/80 px-3 py-6 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#1c2733] bg-[#0b141d] shadow-[0_30px_120px_rgba(0,0,0,0.42)]">
            <div className="flex items-center justify-between border-b border-[#17212b] px-5 py-4 sm:px-6">
              <div>
                <p className="font-mono text-[11px] tracking-[0.24em] text-[#7fc3ff] uppercase">
                  Branch
                </p>
                <p className="mt-2 text-lg font-semibold text-white">지점 정보 수정</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#223140] bg-[#0f1822] text-[#9cb0c0] transition hover:border-[#7ad0ff] hover:text-white"
                aria-label="팝업 닫기"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
                  <path
                    d="M4 4L12 12M12 4L4 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <form action={updateBranchInfoAction} className="grid gap-4">
                <input type="hidden" name="branchId" value={branchId} />
                <input type="hidden" name="partyId" value={partyId} />
                <input type="hidden" name="from" value={source} />
                {sourceDate ? <input type="hidden" name="date" value={sourceDate} /> : null}

                <Field label="지점명" htmlFor="branch-settings-name">
                  <input
                    id="branch-settings-name"
                    name="name"
                    type="text"
                    defaultValue={name}
                    className="w-full rounded-[16px] border border-[#223140] bg-[#0f1822] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7ad0ff]"
                    required
                  />
                </Field>

                <Field label="전화번호" htmlFor="branch-settings-phone">
                  <input
                    id="branch-settings-phone"
                    name="phone"
                    type="text"
                    defaultValue={phone ?? ""}
                    className="w-full rounded-[16px] border border-[#223140] bg-[#0f1822] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7ad0ff]"
                  />
                </Field>

                <Field label="주소" htmlFor="branch-settings-address">
                  <input
                    id="branch-settings-address"
                    name="address"
                    type="text"
                    defaultValue={address ?? ""}
                    className="w-full rounded-[16px] border border-[#223140] bg-[#0f1822] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7ad0ff]"
                  />
                </Field>

                <Field label="인스타그램" htmlFor="branch-settings-instagram">
                  <input
                    id="branch-settings-instagram"
                    name="instagramUrl"
                    type="text"
                    defaultValue={instagramUrl ?? ""}
                    className="w-full rounded-[16px] border border-[#223140] bg-[#0f1822] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7ad0ff]"
                  />
                </Field>

                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <SubmitButton />
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-[16px] border border-[#243240] bg-[#101923] px-4 py-3 text-sm font-semibold text-[#b5c3ce] transition hover:border-[#3b5166] hover:text-white"
                  >
                    닫기
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[16px] border border-[#2f5c82] bg-[#0f2231] px-4 py-3 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247] disabled:cursor-not-allowed disabled:border-[#253543] disabled:bg-[#10161d] disabled:text-[#607282]"
    >
      {pending ? "저장 중..." : "저장"}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10px] tracking-[0.22em] text-[#7c95a8] uppercase"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
