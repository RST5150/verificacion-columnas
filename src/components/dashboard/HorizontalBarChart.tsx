'use client'

import { useState } from 'react'

export interface BarItem {
  key: string
  label: string
  value: number
  displayValue: string
  color: string
}

interface Props {
  items: BarItem[]
  maxValue: number
  labelWidth?: number
}

const ROW_HEIGHT = 32
const BAR_HEIGHT = 20
const CHART_WIDTH = 480
const RADIUS = 4

function roundedEndPath(x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2))
  return `M ${x},${y} H ${x + w - rad} Q ${x + w},${y} ${x + w},${y + rad} V ${y + h - rad} Q ${x + w},${y + h} ${x + w - rad},${y + h} H ${x} Z`
}

// Gráfico de barras horizontales sin dependencias externas: cada barra es su
// propio hit target (tooltip en hover/focus, la barra se resalta), con
// extremo redondeado del lado del valor y base cuadrada contra el eje, según
// las specs de marcas del sistema de diseño. Ancho fijo (px 1:1 con el
// viewBox, sin reescalado no uniforme) envuelto en overflow-x-auto, mismo
// patrón que las tablas del resto de la app.
export default function HorizontalBarChart({ items, maxValue, labelWidth = 190 }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const plotWidth = CHART_WIDTH - labelWidth - 48
  const height = items.length * ROW_HEIGHT
  const hovered = hoveredIndex === null ? null : items[hoveredIndex]

  return (
    <div className="relative overflow-x-auto">
      <svg width={CHART_WIDTH} height={height} role="img" aria-label="Gráfico de barras">
        {items.map((item, i) => {
          const y = i * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2
          const w = maxValue === 0 ? 0 : Math.max((item.value / maxValue) * plotWidth, 2)
          const isHovered = hoveredIndex === i
          return (
            <g key={item.key}>
              <text
                x={labelWidth - 10}
                y={y + BAR_HEIGHT / 2 + 4}
                textAnchor="end"
                className="fill-foreground/70 text-[11px]"
              >
                {item.label}
              </text>
              <path
                d={roundedEndPath(labelWidth, y, w, BAR_HEIGHT, RADIUS)}
                style={{ fill: item.color, opacity: isHovered ? 1 : 0.88 }}
              />
              {isHovered && (
                <rect
                  x={labelWidth}
                  y={y - 2}
                  width={w}
                  height={BAR_HEIGHT + 4}
                  fill="none"
                  stroke={item.color}
                  strokeOpacity={0.35}
                  strokeWidth={2}
                  rx={RADIUS + 2}
                />
              )}
              <text x={labelWidth + w + 8} y={y + BAR_HEIGHT / 2 + 4} className="fill-foreground text-[11px] font-semibold">
                {item.displayValue}
              </text>
              {/* hit target: toda la fila, más alto que la barra */}
              <rect
                x={0}
                y={i * ROW_HEIGHT}
                width={CHART_WIDTH}
                height={ROW_HEIGHT}
                fill="transparent"
                onPointerEnter={() => setHoveredIndex(i)}
                onPointerLeave={() => setHoveredIndex((h) => (h === i ? null : h))}
                onFocus={() => setHoveredIndex(i)}
                onBlur={() => setHoveredIndex((h) => (h === i ? null : h))}
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
          style={{ left: labelWidth, top: hoveredIndex * ROW_HEIGHT }}
        >
          <p className="text-foreground/60">{hovered.label}</p>
          <p className="font-semibold text-foreground">{hovered.displayValue}</p>
        </div>
      )}
    </div>
  )
}
