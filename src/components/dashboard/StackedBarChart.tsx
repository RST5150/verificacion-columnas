'use client'

import { useState } from 'react'

export interface StackedBarItem {
  key: string
  label: string
  si: number
  no: number
  nulo: number
  total: number
}

interface Props {
  items: StackedBarItem[]
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

function pct(n: number, total: number) {
  return total === 0 ? 0 : (n / total) * 100
}

// Barra apilada Sí/No/Sin dato por ítem: mismo patrón de fila (label + hit
// target + tooltip) que HorizontalBarChart, pero cada barra se recorta con
// un clipPath redondeado y adentro se dibujan 3 segmentos sólidos en vez de
// una sola marca — así el extremo queda redondeado sin tener que calcular
// el path de cada segmento por separado.
export default function StackedBarChart({ items, labelWidth = 210 }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const plotWidth = CHART_WIDTH - labelWidth - 48
  const height = items.length * ROW_HEIGHT
  const hovered = hoveredIndex === null ? null : items[hoveredIndex]

  return (
    <div className="relative overflow-x-auto">
      <svg width={CHART_WIDTH} height={height} role="img" aria-label="Gráfico de barras apiladas Sí/No/Sin dato">
        {items.map((item, i) => {
          const y = i * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2
          const wSi = item.total === 0 ? 0 : (item.si / item.total) * plotWidth
          const wNo = item.total === 0 ? 0 : (item.no / item.total) * plotWidth
          const wNulo = item.total === 0 ? 0 : plotWidth - wSi - wNo
          const isHovered = hoveredIndex === i
          const clipId = `stacked-clip-${item.key}`
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
              {item.total > 0 && (
                <>
                  <defs>
                    <clipPath id={clipId}>
                      <path d={roundedEndPath(labelWidth, y, plotWidth, BAR_HEIGHT, RADIUS)} />
                    </clipPath>
                  </defs>
                  <g clipPath={`url(#${clipId})`} style={{ opacity: isHovered ? 1 : 0.88 }}>
                    <rect x={labelWidth} y={y} width={wSi} height={BAR_HEIGHT} fill="var(--accent)" />
                    <rect
                      x={labelWidth + wSi}
                      y={y}
                      width={wNo}
                      height={BAR_HEIGHT}
                      fill="var(--foreground)"
                      fillOpacity={0.32}
                    />
                    <rect
                      x={labelWidth + wSi + wNo}
                      y={y}
                      width={wNulo}
                      height={BAR_HEIGHT}
                      fill="var(--foreground)"
                      fillOpacity={0.1}
                    />
                  </g>
                </>
              )}
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
                aria-label={`${item.label}: ${item.si} sí, ${item.no} no, ${item.nulo} sin dato`}
              />
            </g>
          )
        })}
      </svg>
      {hovered && hoveredIndex !== null && (
        <div
          className="pointer-events-none absolute rounded-fluent border border-border bg-surface px-2 py-1.5 text-xs shadow-md"
          style={{ left: labelWidth, top: hoveredIndex * ROW_HEIGHT }}
        >
          <p className="mb-1 font-semibold text-foreground">{hovered.label}</p>
          <p className="text-foreground/80">
            Sí: {hovered.si.toLocaleString('es-AR')} ({pct(hovered.si, hovered.total).toFixed(0)}%)
          </p>
          <p className="text-foreground/80">
            No: {hovered.no.toLocaleString('es-AR')} ({pct(hovered.no, hovered.total).toFixed(0)}%)
          </p>
          <p className="text-foreground/60">
            Sin dato: {hovered.nulo.toLocaleString('es-AR')} ({pct(hovered.nulo, hovered.total).toFixed(0)}%)
          </p>
        </div>
      )}
    </div>
  )
}
