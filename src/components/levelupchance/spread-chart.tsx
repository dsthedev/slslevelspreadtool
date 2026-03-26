import type { LevelEntry } from "@/components/levelupchance/types"
import type { DistributionAlgorithm } from "@/components/levelupchance/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type SpreadChartProps = {
  entries: LevelEntry[]
  centerPosition: number
  algorithm: DistributionAlgorithm
}

function getBandColorClass(
  algorithm: DistributionAlgorithm,
  distanceFromCenter: number
) {
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
}: SpreadChartProps) {
  const maxScaleValue = 100
  const centerIndex = Math.max(centerPosition - 1, 0)
  const totalWeight = entries.reduce((sum, entry) => sum + entry.value, 0)
  const totalWeightFieldStyle = getTotalWeightFieldStyle(totalWeight)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Distribution Preview</CardTitle>
        <CardDescription>Bars use a fixed vertical scale from 0 to 100.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1">
        <div className="relative h-full min-h-64 w-full overflow-hidden rounded-xl border border-border bg-linear-to-b from-primary/10 to-background p-3">
          <div className="absolute top-3 right-3 z-20 space-y-1 rounded-lg border border-border/60 bg-background/85 p-2 backdrop-blur-sm">
            <Label htmlFor="total-weight" className="text-[10px] text-muted-foreground">
              Total weight
            </Label>
            <Input
              id="total-weight"
              readOnly
              value={totalWeight.toFixed(4)}
              aria-label="Total sum of level weights"
              className="h-8 w-28 text-right font-mono text-xs"
              style={totalWeightFieldStyle}
            />
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

                return (
                  <div
                    key={entry.level}
                    className="relative flex h-full min-w-0 flex-1 items-end"
                  >
                    <div
                      className={cn(
                        "w-full rounded-t-md transition-all duration-200 hover:brightness-110",
                        getBandColorClass(algorithm, distanceFromCenter)
                      )}
                      style={{ height: `${normalizedHeight}%`, maxHeight: "100%" }}
                      title={`L${entry.level}: ${entry.value.toFixed(4)}`}
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

function getTotalWeightFieldStyle(totalWeight: number) {
  const red = { r: 239, g: 68, b: 68 }
  const blue = { r: 59, g: 130, b: 246 }

  if (!Number.isFinite(totalWeight) || totalWeight > 100) {
    return {
      color: `rgb(${red.r} ${red.g} ${red.b})`,
      borderColor: `rgb(${red.r} ${red.g} ${red.b} / 65%)`,
      backgroundColor: `rgb(${red.r} ${red.g} ${red.b} / 12%)`,
    }
  }

  const progress = Math.min(Math.max(totalWeight / 100, 0), 1)
  const r = Math.round(red.r + (blue.r - red.r) * progress)
  const g = Math.round(red.g + (blue.g - red.g) * progress)
  const b = Math.round(red.b + (blue.b - red.b) * progress)

  return {
    color: `rgb(${r} ${g} ${b})`,
    borderColor: `rgb(${r} ${g} ${b} / 65%)`,
    backgroundColor: `rgb(${r} ${g} ${b} / 12%)`,
  }
}
