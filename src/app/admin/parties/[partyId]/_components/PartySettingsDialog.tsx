"use client";

import { useEffect, useState } from "react";
import {
  deletePartyAction,
  updatePartyBasicInfoAction,
} from "@/app/admin/parties/[partyId]/_actions/manage-party";

type PartySettingsDialogProps = {
  branchId: string;
  partyId: string;
  source: "calendar" | "parties";
  sourceDate: string | null;
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  maleCapacity: number;
  femaleCapacity: number;
  isVisible: boolean;
  showHeadcount: boolean;
  canTogglePublicVisibility: boolean;
};

export function PartySettingsDialog({
  branchId,
  partyId,
  source,
  sourceDate,
  title,
  eventDate,
  startTime,
  endTime,
  maleCapacity,
  femaleCapacity,
  isVisible,
  showHeadcount,
  canTogglePublicVisibility,
}: PartySettingsDialogProps) {
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
        수정
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
                  Settings
                </p>
                <p className="mt-2 text-lg font-semibold text-white">파티 설정</p>
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
              <form action={updatePartyBasicInfoAction} className="grid gap-4">
                <input type="hidden" name="branchId" value={branchId} />
                <input type="hidden" name="partyId" value={partyId} />
                <input type="hidden" name="from" value={source} />
                {sourceDate ? <input type="hidden" name="date" value={sourceDate} /> : null}

                <Field label="파티명" htmlFor="settings-title">
                  <input
                    id="settings-title"
                    name="title"
                    type="text"
                    defaultValue={title}
                    className="w-full rounded-[16px] border border-[#223140] bg-[#0f1822] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7ad0ff]"
                    required
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="날짜" htmlFor="settings-date">
                    <input
                      id="settings-date"
                      name="eventDate"
                      type="date"
                      defaultValue={eventDate}
                      className="w-full rounded-[16px] border border-[#223140] bg-[#0f1822] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7ad0ff]"
                      required
                    />
                  </Field>
                  <Field label="시작" htmlFor="settings-start">
                    <input
                      id="settings-start"
                      name="startTime"
                      type="time"
                      defaultValue={startTime}
                      className="w-full rounded-[16px] border border-[#223140] bg-[#0f1822] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7ad0ff]"
                      required
                    />
                  </Field>
                  <Field label="종료" htmlFor="settings-end">
                    <input
                      id="settings-end"
                      name="endTime"
                      type="time"
                      defaultValue={endTime}
                      className="w-full rounded-[16px] border border-[#223140] bg-[#0f1822] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7ad0ff]"
                      required
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="남자" htmlFor="settings-male">
                    <input
                      id="settings-male"
                      name="maleCapacity"
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      defaultValue={maleCapacity}
                      className="w-full rounded-[16px] border border-[#223140] bg-[#0f1822] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7ad0ff]"
                      required
                    />
                  </Field>
                  <Field label="여자" htmlFor="settings-female">
                    <input
                      id="settings-female"
                      name="femaleCapacity"
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      defaultValue={femaleCapacity}
                      className="w-full rounded-[16px] border border-[#223140] bg-[#0f1822] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7ad0ff]"
                      required
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="파티 노출" htmlFor="settings-visible">
                    <select
                      id="settings-visible"
                      name="isVisible"
                      defaultValue={isVisible ? "true" : "false"}
                      disabled={!canTogglePublicVisibility}
                      className="w-full rounded-[16px] border border-[#223140] bg-[#0f1822] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7ad0ff] disabled:cursor-not-allowed disabled:border-[#243240] disabled:bg-[#101923] disabled:text-[#586b7d]"
                    >
                      <option value="true">노출</option>
                      <option value="false">비노출</option>
                    </select>
                  </Field>
                  <Field label="인원수 노출" htmlFor="settings-headcount">
                    <select
                      id="settings-headcount"
                      name="showHeadcount"
                      defaultValue={showHeadcount ? "true" : "false"}
                      className="w-full rounded-[16px] border border-[#223140] bg-[#0f1822] px-4 py-3 text-sm text-white outline-none transition focus:border-[#7ad0ff]"
                    >
                      <option value="true">노출</option>
                      <option value="false">비노출</option>
                    </select>
                  </Field>
                </div>

                {!canTogglePublicVisibility ? (
                  <p className="text-xs text-[#7f94a7]">
                    현재 상태에서는 파티 노출 여부를 변경할 수 없습니다.
                  </p>
                ) : null}

                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <SubmitButton className="inline-flex items-center justify-center rounded-[16px] border border-[#2f5c82] bg-[#0f2231] px-4 py-3 text-sm font-semibold text-[#d9f1ff] transition hover:border-[#7ad0ff] hover:bg-[#143247]">
                    저장
                  </SubmitButton>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-[16px] border border-[#243240] bg-[#101923] px-4 py-3 text-sm font-semibold text-[#b5c3ce] transition hover:border-[#3b5166] hover:text-white"
                  >
                    닫기
                  </button>
                </div>
              </form>

              <div className="mt-5 border-t border-[#17212b] pt-5">
                <form
                  action={deletePartyAction}
                  onSubmit={(event) => {
                    if (!window.confirm("파티를 삭제할까요?")) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="branchId" value={branchId} />
                  <input type="hidden" name="partyId" value={partyId} />
                  <input type="hidden" name="from" value={source} />
                  {sourceDate ? <input type="hidden" name="date" value={sourceDate} /> : null}
                  <DeleteButton />
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
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
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block font-mono text-[11px] tracking-[0.22em] text-[#7c95a8] uppercase"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function SubmitButton({ children, className }: { children: React.ReactNode; className: string }) {
  return <button type="submit" className={className}>{children}</button>;
}

function DeleteButton() {
  return (
    <button
      type="submit"
      className="inline-flex w-full items-center justify-center rounded-[16px] border border-[#a63a50] bg-[#7a2234] px-4 py-3 text-sm font-semibold text-[#fff3f6] shadow-[0_8px_20px_rgba(122,34,52,0.32)] transition hover:border-[#d85f78] hover:bg-[#962a40] hover:text-white"
    >
      파티 삭제
    </button>
  );
}
