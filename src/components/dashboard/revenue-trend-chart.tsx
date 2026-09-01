'use client';

import React, { useState } from 'react';
import { formatRupiah } from '@/lib/utils';
import { TrendingUp, LineChart } from 'lucide-react';

interface DayData {
  dateStr: string;
  dayLabel: string;
  shortDate: string;
  totalRevenue: number;
  txCount: number;
  isToday: boolean;
}

interface RevenueTrendChartProps {
  data: {
    days: DayData[];
    total7DayRevenue: number;
    maxRevenue: number;
  };
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const days = data?.days || [];
  const total7DayRevenue = data?.total7DayRevenue || 0;
  const maxRevenue = Math.max(data?.maxRevenue || 1, 10000);
  const avgDaily = Math.round(total7DayRevenue / 7);

  // SVG Chart Dimensions
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate Coordinates
  const points = days.map((day, idx) => {
    const x = paddingX + (idx / Math.max(days.length - 1, 1)) * chartWidth;
    const ratio = Math.min(Math.max(day.totalRevenue / maxRevenue, 0), 1);
    const y = paddingTop + chartHeight - ratio * chartHeight;
    return { x, y, day };
  });

  // Generate Smooth Cubic Bezier Path
  const getSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;

    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const linePath = getSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x},${paddingTop + chartHeight} L ${points[0].x},${paddingTop + chartHeight} Z`
    : '';

  const activeDay = hoveredIndex !== null ? days[hoveredIndex] : null;

  return (
    <div className="h-full bg-white p-5 md:p-6 rounded-xl border border-[#E5E8EB] shadow-xs flex flex-col justify-between space-y-3.5">
      {/* Header with Divider matching the right card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E8EB]">
        <div>
          <div className="flex items-center space-x-2">
            <LineChart className="w-4 h-4 text-[#3182F6]" />
            <h2 className="font-bold text-sm md:text-base text-[#191F28]">
              Tren Omzet Penjualan (7 Hari Terakhir)
            </h2>
          </div>
          <p className="text-xs text-[#6F7780] mt-0.5">
            Rata-rata omzet harian: <strong className="text-[#191F28] font-mono">{formatRupiah(avgDaily)}</strong> / hari
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 bg-[#E8F3FF] border border-[#3182F6]/20 rounded-lg text-right">
            <span className="text-[10px] font-semibold text-[#6F7780] block">Total 7 Hari</span>
            <span className="font-extrabold text-sm text-[#3182F6] font-mono tabular-nums">
              {formatRupiah(total7DayRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* Pure SVG Wave/Line Chart Area */}
      <div className="relative flex-1 flex flex-col justify-center pt-2 pb-1">
        {/* Floating Tooltip */}
        {activeDay && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#191F28] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-lg pointer-events-none flex items-center space-x-2 z-10 animate-in fade-in zoom-in-95">
            <span className="text-[#90C2FF] font-bold">
              {activeDay.isToday ? 'Hari Ini' : activeDay.dayLabel} ({activeDay.shortDate}):
            </span>
            <span className="font-mono font-bold">{formatRupiah(activeDay.totalRevenue)}</span>
            <span className="text-[10px] text-[#8B95A1]">({activeDay.txCount} Transaksi)</span>
          </div>
        )}

        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-48 sm:h-56 select-none"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3182F6" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#3182F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {[0, 0.5, 1].map((ratio, i) => {
              const y = paddingTop + chartHeight * (1 - ratio);
              const val = Math.round(maxRevenue * ratio);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#E5E8EB"
                    strokeDasharray={ratio > 0 && ratio < 1 ? '4 4' : 'none'}
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="#8B95A1"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {val >= 1000000
                      ? `${(val / 1000000).toFixed(1)}jt`
                      : val >= 1000
                      ? `${Math.round(val / 1000)}k`
                      : val}
                  </text>
                </g>
              );
            })}

            {/* Smooth Area Gradient Fill */}
            {areaPath && (
              <path d={areaPath} fill="url(#areaGradient)" className="transition-all duration-300" />
            )}

            {/* Smooth Line Curve */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#3182F6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300 drop-shadow-xs"
              />
            )}

            {/* Interactive Data Points & Vertical Guides */}
            {points.map((pt, idx) => {
              const isHovered = hoveredIndex === idx;
              const isToday = pt.day.isToday;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Vertical Guide Line on Hover */}
                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingTop}
                      x2={pt.x}
                      y2={paddingTop + chartHeight}
                      stroke="#3182F6"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Invisible broad hitbox for easy touch/mouse targeting */}
                  <rect
                    x={pt.x - 25}
                    y={paddingTop}
                    width={50}
                    height={chartHeight + paddingBottom}
                    fill="transparent"
                  />

                  {/* Glowing Point Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6.5 : isToday ? 5.5 : 4}
                    fill={isToday || isHovered ? '#3182F6' : '#FFFFFF'}
                    stroke="#3182F6"
                    strokeWidth={isToday || isHovered ? 3 : 2.5}
                    className="transition-all duration-150"
                  />

                  {/* Pulse ring on Today's point */}
                  {isToday && !isHovered && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={9}
                      fill="none"
                      stroke="#3182F6"
                      strokeWidth="1.5"
                      opacity="0.5"
                    />
                  )}

                  {/* X-Axis Day & Date Labels */}
                  <text
                    x={pt.x}
                    y={paddingTop + chartHeight + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isToday || isHovered ? 'bold' : '600'}
                    fill={isToday ? '#3182F6' : isHovered ? '#191F28' : '#4E5968'}
                  >
                    {isToday ? 'Hari Ini' : pt.day.dayLabel}
                  </text>
                  <text
                    x={pt.x}
                    y={paddingTop + chartHeight + 30}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="500"
                    fill="#8B95A1"
                  >
                    {pt.day.shortDate}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend & Guide */}
      <div className="flex items-center justify-between text-[11px] text-[#6F7780] pt-1 border-t border-[#E5E8EB]">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3182F6] ring-2 ring-[#E8F3FF]" />
            <span className="font-semibold text-[#191F28]">Titik Hari Ini</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-[#3182F6] rounded-full" />
            <span>Grafik Garis & Area</span>
          </div>
        </div>

        <span className="text-[10px] text-[#8B95A1]">Arahkan kursor ke titik grafik untuk detail</span>
      </div>
    </div>
  );
}
