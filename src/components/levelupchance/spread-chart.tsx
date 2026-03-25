import type { LevelEntry } from "@/components/levelupchance/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type SpreadChartProps = {
  entries: LevelEntry[]
  centerPosition: number
}

function getBandColorClass(distanceFromCenter: number) {
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

export function SpreadChart({ entries, centerPosition }: SpreadChartProps) {
  const maxScaleValue = 100
  const centerIndex = Math.max(centerPosition - 1, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution Preview</CardTitle>
        <CardDescription>Bars use a fixed vertical scale from 0 to 100.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-[1.5/1] w-full overflow-hidden rounded-xl border border-border bg-linear-to-b from-primary/10 to-background p-3">
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
                        getBandColorClass(distanceFromCenter)
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
