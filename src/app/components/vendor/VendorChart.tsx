import { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { VendorChartSeriesPoint } from '../../services/analyticsService';
import { safeFormatCurrency, formatCompactCurrency } from '../../utils/currency';

export type { VendorChartSeriesPoint };

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string }>;
  label?: string;
  valueFormatter?: (value: number) => string;
}

export function VendorChartTooltip({
  active,
  payload,
  label,
  valueFormatter = safeFormatCurrency,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-[16px] border border-[var(--color-border)] bg-white/95 backdrop-blur-sm px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color ?? 'var(--vendor-accent-success)' }}
          />
          <span className="text-[var(--color-text-body)]">{entry.name}:</span>
          <span className="font-bold text-[var(--color-text-heading)]">
            {valueFormatter(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface VendorAreaChartProps {
  data: VendorChartSeriesPoint[];
  dataKey?: keyof VendorChartSeriesPoint & string;
  gradientId: string;
  strokeColor?: string;
  height?: number;
}

export function VendorAreaChart({
  data,
  dataKey = 'revenue',
  gradientId,
  strokeColor = 'var(--vendor-accent-success)',
  height = 300,
}: VendorAreaChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            tickFormatter={(value) => formatCompactCurrency(value)}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <VendorChartTooltip
                active={active}
                payload={payload?.map((p) => ({
                  value: Number(p.value),
                  name: String(p.name ?? dataKey),
                  color: strokeColor,
                }))}
                label={String(label ?? '')}
              />
            )}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            name="Revenue"
            stroke={strokeColor}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface VendorBarChartProps {
  data: VendorChartSeriesPoint[];
  dataKey?: keyof VendorChartSeriesPoint & string;
  fillColor?: string;
  height?: number;
}

export function VendorBarChart({
  data,
  dataKey = 'orders',
  fillColor = 'var(--vendor-accent-action)',
  height = 300,
}: VendorBarChartProps) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
          />
          <Tooltip
            content={({ active, payload, label }) => (
              <VendorChartTooltip
                active={active}
                payload={payload?.map((p) => ({
                  value: Number(p.value),
                  name: 'Orders',
                  color: fillColor,
                }))}
                label={String(label ?? '')}
                valueFormatter={(v) => v.toLocaleString()}
              />
            )}
          />
          <Bar dataKey={dataKey} name="Orders" fill={fillColor} radius={[8, 8, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VendorChartLegend({
  items,
  hiddenKeys,
  onToggle,
}: {
  items: Array<{ key: string; label: string; color: string }>;
  hiddenKeys: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {items.map((item) => {
        const hidden = hiddenKeys.has(item.key);
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onToggle(item.key)}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border transition-all ${
              hidden
                ? 'opacity-40 border-[var(--color-border)]'
                : 'border-[var(--vendor-border-card)] bg-white shadow-sm'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-medium text-[var(--color-text-body)]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function VendorChartContainer({ children, title, description }: { children: ReactNode; title: string; description?: string }) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[var(--color-text-heading)] vendor-heading">{title}</h3>
        {description && <p className="text-sm text-[var(--color-text-muted)] vendor-body mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}
