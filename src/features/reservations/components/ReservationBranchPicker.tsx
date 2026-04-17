import type { PublicPartyOption } from "@/features/reservations/shared";
import { formatPublicTimeLabel } from "@/features/reservations/shared";

type ReservationBranchPickerProps = {
  parties: PublicPartyOption[];
  selectedPartyId: string | null;
  selectedDateLabel: string;
  onSelect: (partyId: string) => void;
};

export function ReservationBranchPicker({
  parties,
  selectedPartyId,
  selectedDateLabel,
  onSelect,
}: ReservationBranchPickerProps) {
  function getOccupancyPercent(applied: number, capacity: number) {
    if (capacity <= 0) {
      return 0;
    }

    return Math.min((applied / capacity) * 100, 100);
  }

  if (parties.length === 0) {
    return (
      <section className="mt-5 rounded-[22px] border border-line bg-surface px-4 py-4">
        <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
          가능한 지점
        </p>
        <p className="mt-2 text-sm text-brand-white">
          {selectedDateLabel}에는 현재 선택 가능한 지점이 없습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-5">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
            가능한 지점
          </p>
          <p className="mt-1 text-sm text-brand-white">{selectedDateLabel}</p>
        </div>
        <p className="text-xs text-muted">{parties.length}곳 선택 가능</p>
      </div>

      <div className="flex flex-col gap-3">
        {parties.map((party) => {
          const isSelected = party.id === selectedPartyId;

          return (
            <button
              key={party.id}
              type="button"
              onClick={() => onSelect(party.id)}
              className={`rounded-[22px] border px-4 py-4 text-left transition ${
                isSelected
                  ? "border-brand-orange bg-brand-orange/10"
                  : "border-line bg-surface hover:border-brand-orange/35"
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-base font-semibold text-brand-white">
                      {party.branchName}
                    </p>
                    {party.branchAddress ? (
                      <span className="text-xs text-muted">{party.branchAddress}</span>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-brand-white/85">
                      <span className="text-muted">파티</span>{" "}
                      <span className="font-medium text-brand-white">{party.title}</span>
                    </p>
                    <p className="text-brand-white/85">
                      <span className="text-muted">파티시간</span>{" "}
                      <span className="font-medium text-brand-white">
                        {formatPublicTimeLabel(party.startAt, party.endAt)}
                      </span>
                    </p>

                    {party.showHeadcount ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <p className="flex items-center gap-2 text-brand-white/85">
                              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-orange/55" />
                              <span className="text-muted">남</span>
                            </p>
                            <span className="font-semibold tabular-nums text-brand-white">
                              {party.maleApplied}/{party.maleCapacity}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-brand-white/10">
                            <div
                              className="h-full rounded-full bg-brand-orange/55"
                              style={{
                                width: `${getOccupancyPercent(
                                  party.maleApplied,
                                  party.maleCapacity,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <p className="flex items-center gap-2 text-brand-white/85">
                              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-orange/55" />
                              <span className="text-muted">여</span>
                            </p>
                            <span className="font-semibold tabular-nums text-brand-white">
                              {party.femaleApplied}/{party.femaleCapacity}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-brand-white/10">
                            <div
                              className="h-full rounded-full bg-brand-orange/55"
                              style={{
                                width: `${getOccupancyPercent(
                                  party.femaleApplied,
                                  party.femaleCapacity,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {party.waitlistOnly ? (
                      <p className="text-sm text-brand-red">대기자 신청</p>
                    ) : null}
                  </div>
                </div>

                <span
                  className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                    isSelected
                      ? "border-brand-orange bg-brand-orange text-brand-black"
                      : "border-line text-muted"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
