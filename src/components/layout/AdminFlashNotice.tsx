"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type AdminFlashNoticeProps = {
  message: string;
  tone?: "info" | "danger";
  clearKeys?: string[];
  durationMs?: number;
  placement?: "bottom" | "center";
};

export function AdminFlashNotice({
  message,
  tone = "info",
  clearKeys = [],
  durationMs = 2400,
  placement = "bottom",
}: AdminFlashNoticeProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(true);
  const nextUrl = useMemo(() => {
    if (clearKeys.length === 0) {
      return pathname;
    }

    const params = new URLSearchParams(searchParams.toString());

    for (const key of clearKeys) {
      params.delete(key);
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [clearKeys, pathname, searchParams]);

  useEffect(() => {
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, durationMs);

    const clearTimer = window.setTimeout(() => {
      if (clearKeys.length > 0) {
        window.history.replaceState(window.history.state, "", nextUrl);
      }
    }, durationMs + 220);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(clearTimer);
    };
  }, [clearKeys.length, durationMs, nextUrl]);

  if (placement === "center") {
    return (
      <div
        className={[
          "fixed inset-0 z-50 flex items-center justify-center px-4 transition duration-200",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-live="assertive"
      >
        <div className="absolute inset-0 bg-[rgba(3,8,12,0.58)] backdrop-blur-[2px]" />
        <section
          className={[
            "relative w-full max-w-[360px] rounded-[24px] border px-5 py-4 text-center text-sm shadow-[0_24px_64px_rgba(0,0,0,0.42)] transition duration-200",
            visible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0",
            tone === "danger"
              ? "border-[#5a2430] bg-[#1a0d12] text-[#ffd7de]"
              : "border-[#2b5878] bg-[#0d1c27] text-[#d9f1ff]",
          ].join(" ")}
          role="alertdialog"
          aria-modal="true"
        >
          {message}
        </section>
      </div>
    );
  }

  return (
    <section
      className={[
        "fixed inset-x-4 bottom-4 z-50 rounded-[18px] border px-4 py-3 text-sm shadow-[0_18px_48px_rgba(0,0,0,0.38)] transition duration-200 sm:left-auto sm:right-6 sm:w-[360px] lg:right-8",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        tone === "danger"
          ? "border-[#5a2430] bg-[#1a0d12] text-[#ffd7de]"
          : "border-[#2b5878] bg-[#0d1c27] text-[#d9f1ff]",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      {message}
    </section>
  );
}
