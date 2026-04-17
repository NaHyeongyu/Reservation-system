"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DistributionItem = {
  label: string;
  count: number;
  ratio: number;
};

type TrendItem = {
  label: string;
  count: number;
};

type BranchDashboardChartsProps = {
  referralRows: DistributionItem[];
  genderRows: DistributionItem[];
  ageRows: DistributionItem[];
  weekdayTrend: TrendItem[];
  hourTrend: TrendItem[];
};

const pieColors = ["#7ad0ff", "#ffb8d0", "#f0d18a", "#8ee2b4", "#9aa9b7"];
const barFill = "#67c7ff";
const gridStroke = "#1f2c38";
const axisStroke = "#6f8598";

export function BranchDashboardCharts({
  referralRows,
  genderRows,
  ageRows,
  weekdayTrend,
  hourTrend,
}: BranchDashboardChartsProps) {
  return (
    <>
      <section className="grid gap-6 xl:grid-cols-3">
        <ChartCard title="유입경로" subtitle="최근 누적 예약 기준">
          {referralRows.length > 0 && referralRows.some((item) => item.count > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={referralRows} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke={axisStroke} tickLine={false} axisLine={false} fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="label"
                  stroke={axisStroke}
                  tickLine={false}
                  axisLine={false}
                  width={70}
                  fontSize={11}
                />
                <Tooltip content={<ChartTooltip suffix="건" />} cursor={{ fill: "rgba(122, 208, 255, 0.08)" }} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} fill={barFill} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="유입 데이터가 없습니다." />
          )}
        </ChartCard>

        <ChartCard title="성별 비율" subtitle="전체 예약 기준">
          {genderRows.length > 0 && genderRows.some((item) => item.count > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={genderRows}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="none"
                >
                  {genderRows.map((entry, index) => (
                    <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip suffix="명" showRatio />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="성별 데이터가 없습니다." />
          )}

          <LegendList items={genderRows} />
        </ChartCard>

        <ChartCard title="연령대" subtitle="전체 예약 기준">
          {ageRows.length > 0 && ageRows.some((item) => item.count > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ageRows} margin={{ top: 8, right: 8, left: -12, bottom: 8 }}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke={axisStroke} tickLine={false} axisLine={false} fontSize={11} />
                <YAxis stroke={axisStroke} tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip content={<ChartTooltip suffix="명" showRatio />} cursor={{ fill: "rgba(122, 208, 255, 0.08)" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {ageRows.map((entry, index) => (
                    <Cell key={entry.label} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="연령대 데이터가 없습니다." />
          )}
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <ChartCard title="요일별 신청 추이" subtitle="접수일 기준">
          {weekdayTrend.length > 0 && weekdayTrend.some((item) => item.count > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weekdayTrend} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                <defs>
                  <linearGradient id="weekdayFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7ad0ff" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#7ad0ff" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke={axisStroke} tickLine={false} axisLine={false} fontSize={11} />
                <YAxis stroke={axisStroke} tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip content={<ChartTooltip suffix="건" />} cursor={{ stroke: "#7ad0ff", strokeWidth: 1 }} />
                <Area type="monotone" dataKey="count" stroke="#7ad0ff" fill="url(#weekdayFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="요일 데이터가 없습니다." />
          )}
        </ChartCard>

        <ChartCard title="시간대별 신청 추이" subtitle="접수 시간 기준">
          {hourTrend.length > 0 && hourTrend.some((item) => item.count > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourTrend} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={axisStroke}
                  tickLine={false}
                  axisLine={false}
                  fontSize={10}
                  interval={1}
                  tickFormatter={(value: string) => value.replace("시", "")}
                />
                <YAxis stroke={axisStroke} tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip content={<ChartTooltip suffix="건" />} cursor={{ fill: "rgba(122, 208, 255, 0.08)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#8ee2b4" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="시간대 데이터가 없습니다." />
          )}
        </ChartCard>
      </section>
    </>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[30px] border border-[#1c2733] bg-[#0b141d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <p className="font-mono text-[11px] tracking-[0.28em] text-[#7fc3ff] uppercase">Charts</p>
      <div className="mt-2">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-[#7f94a7]">{subtitle}</p>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function LegendList({ items }: { items: DistributionItem[] }) {
  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center justify-between rounded-[16px] border border-[#17212b] bg-[#0f1822] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[index % pieColors.length] }} />
            <span className="text-sm text-white">{item.label}</span>
          </div>
          <span className="text-sm text-[#9db0bf]">
            {item.count} / {Math.round(item.ratio * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  suffix,
  showRatio = false,
}: {
  active?: boolean;
  payload?: Array<{ payload: { label: string; count: number; ratio?: number } }>;
  label?: string;
  suffix: string;
  showRatio?: boolean;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0]?.payload;

  if (!item) {
    return null;
  }

  return (
    <div className="rounded-[16px] border border-[#223140] bg-[#091018] px-3 py-2.5 text-sm shadow-[0_16px_40px_rgba(0,0,0,0.32)]">
      <p className="font-semibold text-white">{label ?? item.label}</p>
      <p className="mt-1 text-[#9db0bf]">
        {item.count}
        {suffix}
        {showRatio && typeof item.ratio === "number" ? ` / ${Math.round(item.ratio * 100)}%` : ""}
      </p>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-[22px] border border-dashed border-[#22303d] bg-[#0f1822] text-sm text-[#8ea1b2]">
      {text}
    </div>
  );
}
