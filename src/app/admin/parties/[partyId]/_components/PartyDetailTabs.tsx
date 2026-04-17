"use client";

import { useState, type ReactNode } from "react";

type PartyDetailTabId = "party" | "queue" | "participants";

type PartyDetailTabsProps = {
  partyInfo: ReactNode;
  applicantQueue: ReactNode;
  participants: ReactNode;
  participantCount: number;
  participantCapacity: number;
  maleCapacity: number;
  femaleCapacity: number;
};

const tabs: Array<{
  id: PartyDetailTabId;
  label: string;
}> = [
  { id: "party", label: "파티 정보" },
  { id: "queue", label: "신청/대기자" },
  { id: "participants", label: "참가자" },
];

export function PartyDetailTabs({
  partyInfo,
  applicantQueue,
  participants,
  participantCount,
  participantCapacity,
  maleCapacity,
  femaleCapacity,
}: PartyDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<PartyDetailTabId>("party");

  return (
    <section className="space-y-4">
      <div className="sticky top-3 z-10 -mx-1 px-1">
        <div className="rounded-[22px] border border-[#22303d] bg-[#0b141d]/95 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur">
          <div className="grid grid-cols-3 gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const detail =
                tab.id === "participants"
                  ? `${participantCount}/${participantCapacity}명`
                  : null;
              const extraDetail =
                tab.id === "participants"
                  ? `남${maleCapacity} · 여${femaleCapacity}`
                  : null;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "flex min-h-[52px] flex-col items-center justify-center rounded-[16px] px-2 py-2 text-center transition",
                    isActive
                      ? "bg-[#0f2231] text-[#d9f1ff]"
                      : "text-[#8ea1b2] hover:bg-[#0f1822] hover:text-white",
                  ].join(" ")}
                >
                  <span className="text-[12px] font-semibold leading-4">{tab.label}</span>
                  {detail ? (
                    <span className="mt-1 text-[11px] font-medium opacity-80">
                      {detail}
                    </span>
                  ) : null}
                  {extraDetail ? (
                    <span className="mt-0.5 hidden text-[10px] font-medium opacity-70 sm:block">
                      {extraDetail}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeTab === "party" ? partyInfo : null}
      {activeTab === "queue" ? applicantQueue : null}
      {activeTab === "participants" ? participants : null}
    </section>
  );
}
