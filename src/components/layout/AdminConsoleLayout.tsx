import type { ReactNode } from "react";
import { signOutAdminAction } from "@/app/admin/_actions/sign-out-admin";
import type { AdminRole } from "@/features/admin-auth/server/types";
import { AdminSidebarNav } from "./AdminSidebarNav";

type AdminConsoleLayoutProps = {
  currentPath: string;
  title: string;
  description: string;
  loginId: string;
  role: AdminRole;
  children: ReactNode;
  actions?: ReactNode;
  notice?: ReactNode;
};

type NavigationItem = {
  href: string;
  label: string;
};

const superAdminNavigationItems: NavigationItem[] = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/branches", label: "지점" },
];

const branchAdminNavigationItems: NavigationItem[] = [
  { href: "/admin/dashboard", label: "대시보드" },
  { href: "/admin/calendar", label: "캘린더" },
  { href: "/admin/parties", label: "파티" },
  { href: "/admin/applicants", label: "신청자" },
  { href: "/admin/branch-settings", label: "지점 설정" },
];

export function AdminConsoleLayout(props: AdminConsoleLayoutProps) {
  const { currentPath, loginId, role, children, actions, notice } = props;
  const navigationItems =
    role === "super_admin" ? superAdminNavigationItems : branchAdminNavigationItems;

  return (
    <main className="min-h-screen bg-[#04080d] text-[#f4f7fb]">
      <div className="mx-auto w-full max-w-[1760px] px-2 py-2 sm:px-4 sm:py-4 lg:px-6">
        <section className="overflow-hidden rounded-[30px] border border-[#1b2733] bg-[linear-gradient(180deg,rgba(8,13,19,0.98),rgba(5,9,14,0.98))] shadow-[0_38px_140px_rgba(0,0,0,0.42)]">
          <div className="grid min-h-[calc(100vh-1rem)] lg:grid-cols-[232px_minmax(0,1fr)]">
            <AdminSidebarNav
              navigationItems={navigationItems}
              currentPath={currentPath}
              loginId={loginId}
              roleLabel={formatRoleLabel(role)}
              footer={
                <>
                  {actions}
                  <form action={signOutAdminAction}>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-[16px] border border-[#2b3947] bg-[#0b1218] px-4 py-3 text-sm font-semibold text-[#dfe8ef] transition hover:border-[#7ad0ff] hover:text-white"
                    >
                      로그아웃
                    </button>
                  </form>
                </>
              }
            />

            <div className="min-w-0 bg-[#0f1822]">
              <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                {notice ? notice : null}
                {children}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatRoleLabel(role: AdminRole) {
  return role === "super_admin" ? "Main Admin" : "Branch Admin";
}
