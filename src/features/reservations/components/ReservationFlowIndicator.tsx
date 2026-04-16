type FlowStep = {
  label: string;
  status: "complete" | "current" | "upcoming";
};

type ReservationFlowIndicatorProps = {
  steps: FlowStep[];
};

function getStepBarClassName(status: FlowStep["status"]) {
  if (status === "complete") {
    return "bg-brand-orange";
  }

  if (status === "current") {
    return "bg-brand-orange/40";
  }

  return "bg-brand-orange/12";
}

function getStepLabelClassName(status: FlowStep["status"]) {
  if (status === "complete") {
    return "text-brand-orange";
  }

  if (status === "current") {
    return "text-brand-orange/70";
  }

  if (status === "upcoming") {
    return "text-brand-orange/30";
  }

  return "text-brand-orange";
}

export function ReservationFlowIndicator({
  steps,
}: ReservationFlowIndicatorProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        {steps.map((step) => (
          <span
            key={step.label}
            className={`h-1.5 flex-1 rounded-full ${getStepBarClassName(step.status)}`}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        {steps.map((step) => (
          <span
            key={step.label}
            className={`min-w-0 flex-1 truncate text-center text-[10px] font-medium tracking-[0.14em] uppercase sm:text-[11px] ${getStepLabelClassName(step.status)}`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
