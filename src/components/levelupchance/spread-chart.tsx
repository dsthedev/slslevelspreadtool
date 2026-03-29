import { Popover } from "@base-ui/react/popover"
import { CircleHelp } from "lucide-react"

import type { LevelEntry } from "@/components/levelupchance/types"
import {
  getEffectiveLevelChances,
  type DistributionAlgorithm,
} from "@/components/levelupchance/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type SpreadChartProps = {
  entries: LevelEntry[]
  centerPosition: number
  algorithm: DistributionAlgorithm
  levelsCount: number
  selectedLevel: number | null
  peakValue: number
  error: string | null
  className?: string
}

function getBandColorClass(
  algorithm: DistributionAlgorithm,
  distanceFromCenter: number,
  isUnreachable: boolean
) {
  if (isUnreachable) {
    return "bg-slate-400"
  }

  if (algorithm === "evenish") {
    return "bg-indigo-500"
  }

  if (distanceFromCenter <= 0) {
    return "bg-green-500"
  }

  if (distanceFromCenter === 1) {
    return "bg-blue-500"
  }

  if (distanceFromCenter === 2) {
    return "bg-indigo-500"
  }

  if (distanceFromCenter === 3) {
    return "bg-violet-500"
  }

  return "bg-red-500"
}

export function SpreadChart({
  entries,
  centerPosition,
  algorithm,
  levelsCount,
  selectedLevel,
  peakValue,
  error,
  className,
}: SpreadChartProps) {
  const maxScaleValue = 100
  const centerIndex = Math.max(centerPosition - 1, 0)
  const totalWeight = entries.reduce((sum, entry) => sum + entry.value, 0)
  const effectiveEntries = getEffectiveLevelChances(entries)
  const totalEffectiveChance = effectiveEntries.reduce(
    (sum, entry) => sum + entry.effectiveChance,
    0
  )
  const totalWeightFieldStyle = getMetricFieldStyle(totalWeight)
  const totalEffectiveFieldStyle = getMetricFieldStyle(totalEffectiveChance)
  const unreachableEntries = effectiveEntries.filter(
    (entry) => entry.value > 0 && entry.effectiveChance <= 0
  )
  const hasUnreachableEntries = unreachableEntries.length > 0

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader>
        <CardTitle>3. Dist Preview</CardTitle>
        <CardDescription>Bars use a fixed vertical scale from 0 to 100.</CardDescription>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Levels: {levelsCount}</Badge>
          <Badge variant="secondary">Center: L{selectedLevel ?? "-"}</Badge>
          <Badge variant="secondary">Peak: {peakValue.toFixed(4)}</Badge>
          {error ? <Badge variant="destructive">{error}</Badge> : null}
        </div>
        {hasUnreachableEntries ? (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Warning: some levels currently have 0% effective chance because a
            higher level threshold fully covers them during the top-down roll
            check. Those unreachable levels are shown in gray.
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-1">
        <div className="relative h-full min-h-64 w-full overflow-hidden rounded-xl border border-border bg-linear-to-b from-primary/10 to-background p-3">
          <div className="absolute top-3 right-3 z-2 space-y-2 rounded-lg border border-border/60 bg-background/85 p-2 backdrop-blur-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="total-weight" className="text-[10px] text-muted-foreground">
                  Total weight
                </Label>
                <MetricInfoPopover
                  title="Total weight"
                  description="This is the raw sum of all threshold values currently shown. It is useful for comparing generated spreads, but it is not the same thing as actual spawn probability because higher thresholds can overlap and shadow lower ones."
                />
              </div>
              <Input
                id="total-weight"
                readOnly
                value={totalWeight.toFixed(4)}
                aria-label="Total sum of level weights"
                className="h-8 w-32 text-right font-mono text-xs"
                style={totalWeightFieldStyle}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Label htmlFor="total-effective" className="text-[10px] text-muted-foreground">
                  Total effective %
                </Label>
                <MetricInfoPopover
                  title="Total effective %"
                  description="This is the real combined chance that any leveled creature appears after the game checks thresholds from highest level down. If this is below 100%, the leftover chance becomes a base creature with no stars."
                />
              </div>
              <Input
                id="total-effective"
                readOnly
                value={totalEffectiveChance.toFixed(4)}
                aria-label="Total effective chance"
                className="h-8 w-32 text-right font-mono text-xs"
                style={totalEffectiveFieldStyle}
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-3 left-3 z-10 flex flex-col justify-between text-[10px] text-muted-foreground">
            <span>100</span>
            <span>50</span>
            <span>0</span>
          </div>
          {entries.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Load a dataset to preview the distribution.
            </div>
          ) : (
            <div className="ml-7 flex h-full items-end gap-1">
              {entries.map((entry, index) => {
                const normalizedHeight = Math.min(
                  Math.max((entry.value / maxScaleValue) * 100, 0),
                  100
                )
                const distanceFromCenter = Math.abs(index - centerIndex)
                const effectiveEntry = effectiveEntries[index]
                const isUnreachable =
                  effectiveEntry !== undefined &&
                  effectiveEntry.value > 0 &&
                  effectiveEntry.effectiveChance <= 0

                return (
                  <div
                    key={entry.level}
                    className="relative flex h-full min-w-0 flex-1 items-end"
                  >
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all duration-200 hover:brightness-110",
                        getBandColorClass(
                          algorithm,
                          distanceFromCenter,
                          isUnreachable
                        )
                      )}
                      style={{ height: `${normalizedHeight}%`, maxHeight: "100%" }}
                      title={`L${entry.level}: ${entry.value.toFixed(4)} (${effectiveEntry?.effectiveChance.toFixed(4) ?? "0.0000"}% effective)`}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function getMetricFieldStyle(value: number) {
  const red = { r: 239, g: 68, b: 68 }
  const blue = { r: 59, g: 130, b: 246 }

  if (!Number.isFinite(value) || value > 100) {
    return {
      color: `rgb(${red.r} ${red.g} ${red.b})`,
      borderColor: `rgb(${red.r} ${red.g} ${red.b} / 65%)`,
      backgroundColor: `rgb(${red.r} ${red.g} ${red.b} / 12%)`,
    }
  }

  const progress = Math.min(Math.max(value / 100, 0), 1)
  const r = Math.round(red.r + (blue.r - red.r) * progress)
  const g = Math.round(red.g + (blue.g - red.g) * progress)
  const b = Math.round(red.b + (blue.b - red.b) * progress)

  return {
    color: `rgb(${r} ${g} ${b})`,
    borderColor: `rgb(${r} ${g} ${b} / 65%)`,
    backgroundColor: `rgb(${r} ${g} ${b} / 12%)`,
  }
}

function MetricInfoPopover({ title, description }: { title: string; description: string }) {
  return (
    <Popover.Root>
      <Popover.Trigger
        type="button"
        aria-label={`Show ${title} details`}
        className={cn(
          "inline-flex size-4 items-center justify-center rounded-full border border-input bg-input/20 text-muted-foreground transition-colors",
          "hover:bg-input/40 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        )}
      >
        <CircleHelp className="size-3" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8}>
          <Popover.Popup className="z-50 w-72 rounded-xl border border-border bg-popover p-3 text-sm text-popover-foreground shadow-xl outline-none">
            <div className="space-y-2">
              <h4 className="font-medium">{title}</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
