"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  BRAND_LOGO_ALT,
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_SRC,
  BRAND_LOGO_WIDTH,
} from "@/lib/branding";

type NavigationItem = {
  href: string;
  label: string;
};

type AdminSidebarNavProps = {
  navigationItems: NavigationItem[];
  currentPath: string;
  loginId: string;
  roleLabel: string;
  footer?: ReactNode;
};

export function AdminSidebarNav({
  navigationItems,
  currentPath,
  loginId,
  roleLabel,
  footer,
}: AdminSidebarNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="border-b border-[#17212b] bg-[#091119] px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-[14px] border border-[#22303d] bg-[#0b141d] px-4 py-2.5 text-sm font-semibold text-white"
          >
            메뉴
          </button>
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src={BRAND_LOGO_SRC}
              alt={BRAND_LOGO_ALT}
              width={BRAND_LOGO_WIDTH}
              height={BRAND_LOGO_HEIGHT}
              priority
              className="h-auto w-7 shrink-0 object-contain"
            />
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-white">{loginId}</p>
              <p className="text-xs text-[#7c95a8]">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden border-r border-[#17212b] bg-[#091119] lg:flex lg:min-h-full lg:flex-col">
        <div className="flex-1 px-4 py-4">
          <Link
            href="/admin/dashboard"
            className="mb-6 flex items-center gap-3 rounded-[18px] border border-[#17212b] bg-[#0b141d] px-4 py-3"
          >
            <Image
              src={BRAND_LOGO_SRC}
              alt={BRAND_LOGO_ALT}
              width={BRAND_LOGO_WIDTH}
              height={BRAND_LOGO_HEIGHT}
              priority
              className="h-auto w-8 shrink-0 object-contain"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">Admin</p>
            </div>
          </Link>
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                active={currentPath === item.href}
                label={item.label}
              />
            ))}
          </nav>
        </div>
        <div className="space-y-3 border-t border-[#17212b] px-4 py-4">
          <div className="rounded-[18px] border border-[#17212b] bg-[#0b141d] px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">{loginId}</p>
            <p className="mt-1 text-xs text-[#7c95a8]">{roleLabel}</p>
          </div>
          {footer}
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="close-menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/55"
          />
          <aside className="relative flex h-full w-[84%] max-w-[320px] flex-col border-r border-[#17212b] bg-[#091119] shadow-[0_24px_80px_rgba(0,0,0,0.48)]">
            <div className="flex items-center justify-between border-b border-[#17212b] px-4 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <Image
                  src={BRAND_LOGO_SRC}
                  alt={BRAND_LOGO_ALT}
                  width={BRAND_LOGO_WIDTH}
                  height={BRAND_LOGO_HEIGHT}
                  priority
                  className="h-auto w-8 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{loginId}</p>
                  <p className="mt-1 text-xs text-[#7c95a8]">{roleLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#22303d] bg-[#0b141d] text-sm font-semibold text-white"
              >
                닫기
              </button>
            </div>
            <div className="flex-1 px-4 py-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    active={currentPath === item.href}
                    label={item.label}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
              </nav>
            </div>
            <div className="space-y-3 border-t border-[#17212b] px-4 py-4">{footer}</div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function NavItem({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "flex items-center rounded-[16px] border px-4 py-3 text-sm font-semibold transition",
        active
          ? "border-[#2f5c82] bg-[#0f2231] text-[#d9f1ff]"
          : "border-transparent bg-transparent text-[#9eb0be] hover:border-[#22303d] hover:bg-[#0b141d] hover:text-white",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </Link>
  );
}
