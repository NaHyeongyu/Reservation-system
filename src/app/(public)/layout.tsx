import type { ReactNode } from "react";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div data-theme="public" className="flex min-h-full flex-1 bg-brand-black">
      {children}
    </div>
  );
}
