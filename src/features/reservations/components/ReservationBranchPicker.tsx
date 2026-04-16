import {
  isWaitlistOnlyBranch,
  type PublicBranch,
} from "../public-branches";

type ReservationBranchPickerProps = {
  branches: PublicBranch[];
  selectedBranchId: string | null;
  selectedDateLabel: string;
  onSelect: (branchId: string) => void;
};

export function ReservationBranchPicker({
  branches,
  selectedBranchId,
  selectedDateLabel,
  onSelect,
}: ReservationBranchPickerProps) {
  function getOccupancyPercent(applied: number, capacity: number) {
    if (capacity <= 0) {
      return 0;
    }

    return Math.min((applied / capacity) * 100, 100);
  }

  if (branches.length === 0) {
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
        <p className="text-xs text-muted">{branches.length}곳 선택 가능</p>
      </div>

      <div className="flex flex-col gap-3">
        {branches.map((branch) => {
          const isSelected = branch.id === selectedBranchId;
          const isWaitlistOnly = isWaitlistOnlyBranch(branch);

          return (
            <button
              key={branch.id}
              type="button"
              onClick={() => onSelect(branch.id)}
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
                      {branch.name}
                    </p>
                    <span className="text-xs text-muted">{branch.address}</span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-brand-white/85">
                      <span className="text-muted">파티시간</span>{" "}
                      <span className="font-medium text-brand-white">
                        {branch.partyTimeLabel}
                      </span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <p className="flex items-center gap-2 text-brand-white/85">
                            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-orange/55" />
                            <span className="text-muted">남</span>
                          </p>
                          <span className="font-semibold tabular-nums text-brand-white">
                            {branch.applicantCountByGender.male.applied}/
                            {branch.applicantCountByGender.male.capacity}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-brand-white/10">
                          <div
                            className="h-full rounded-full bg-brand-orange/55"
                            style={{
                              width: `${getOccupancyPercent(
                                branch.applicantCountByGender.male.applied,
                                branch.applicantCountByGender.male.capacity,
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
                            {branch.applicantCountByGender.female.applied}/
                            {branch.applicantCountByGender.female.capacity}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-brand-white/10">
                          <div
                            className="h-full rounded-full bg-brand-orange/55"
                            style={{
                              width: `${getOccupancyPercent(
                                branch.applicantCountByGender.female.applied,
                                branch.applicantCountByGender.female.capacity,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {isWaitlistOnly ? (
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
