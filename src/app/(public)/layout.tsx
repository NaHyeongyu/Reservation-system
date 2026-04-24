import type { ReactNode } from "react";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return <div data-theme="public" className="min-h-full bg-brand-black">{children}</div>;
}
