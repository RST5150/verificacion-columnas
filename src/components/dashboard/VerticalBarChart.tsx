'use client'

import { useState } from 'react'

export interface VBarItem {
  key: string
  label: string
  value: number
  displayValue: string
}

interface Props {
  items: VBarItem[]
  maxValue: number
}

const COL_WIDTH = 96
const BAR_MAX_WIDTH = 24
const CHART_HEIGHT = 200
const AXIS_PAD_BOTTOM = 28
const RADIUS = 4

function roundedTopPath(x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2))
  return `M ${x},${y + h} V ${y + rad} Q ${x},${y} ${x + rad},${y} H ${x + w - rad} Q ${x + w},${y} ${x + w},${y + rad} V ${y + h} Z`
}

// Barras verticales para comparar pocas categorías cortas (ej. zonas). Mismo
// patrón de hit target + tooltip que HorizontalBarChart.
export default function VerticalBarChart({ items, maxValue }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const width = items.length * COL_WIDTH
  const plotHeight = CHART_HEIGHT - AXIS_PAD_BOTTOM
  const hovered = hoveredIndex === null ? null : items[hoveredIndex]

  return (
    <div className="relative overflow-x-auto">
      <svg width={width} height={CHART_HEIGHT} role="img" aria-label="Gráfico de barras por zona">
        <line x1={0} y1={plotHeight} x2={width} y2={plotHeight} className="stroke-border" strokeWidth={1} />
        {items.map((item, i) => {
          const colX = i * COL_WIDTH
          const barW = BAR_MAX_WIDTH
          const barX = colX + (COL_WIDTH - barW) / 2
          const h = maxValue === 0 ? 0 : Math.max((item.value / maxValue) * (plotHeight - 24), 2)
          const y = plotHeight - h
          const isHovered = hoveredIndex === i
          return (
            <g key={item.key}>
              <path
                d={roundedTopPath(barX, y, barW, h, RADIUS)}
                style={{ fill: 'var(--accent)', opacity: isHovered ? 1 : 0.88 }}
              />
              <text x={colX + COL_WIDTH / 2} y={y - 8} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
                {item.displayValue}
              </text>
              <text
                x={colX + COL_WIDTH / 2}
                y={plotHeight + 18}
                textAnchor="middle"
                className="fill-foreground/70 text-[11px]"
              >
                {item.label}
              </text>
              <rect
                x={colX}
                y={0}
                width={COL_WIDTH}
                height={CHART_HEIGHT}
                fill="transparent"
                onPointerEnter={() => setHoveredIndex(i)}
                onPointerLeave={() => setHoveredIndex((h2) => (h2 === i ? null : h2))}
                onFocus={() => setHoveredIndex(i)}
                onBlur={() => setHoveredIndex((h2) => (h2 === i ? null : h2))}
                tabIndex={0}
                aria-label={`${item.label}: ${item.displayValue}`}
              />
            </g>
          )
        })}
      </svg>
      {hovered && hoveredIndex !== null && (
        <div
          className="pointer-events-none absolute rounded-fluent border border-border bg-surface px-2 py-1 text-xs shadow-md"
          style={{ left: hoveredIndex * COL_WIDTH + COL_WIDTH / 2 - 30, top: 4 }}
        >
          <p className="text-foreground/60">{hovered.label}</p>
          <p className="font-semibold text-foreground">{hovered.displayValue}</p>
        </div>
      )}
    </div>
  )
}
