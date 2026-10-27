"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Interview score trend over time.
 *
 * Shows how the candidate's overall score and answer clarity evolve across
 * sessions — the "progress over time" view.
 */
export function ScoreTrendChart({
  data,
}: {
  data: Array<{ label: string; score: number; clarity: number }>;
}) {
  if (data.length === 0) return null;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-500)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--brand-500)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              fontSize: "12px",
              boxShadow: "0 10px 30px rgb(0 0 0 / 0.12)",
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            name="Overall"
            stroke="var(--brand-500)"
            strokeWidth={2.5}
            fill="url(#scoreGradient)"
            dot={{ r: 3, strokeWidth: 2, fill: "var(--card)" }}
          />
          <Area
            type="monotone"
            dataKey="clarity"
            name="Clarity"
            stroke="var(--accent-3)"
            strokeWidth={2}
            strokeDasharray="4 3"
            fill="transparent"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
