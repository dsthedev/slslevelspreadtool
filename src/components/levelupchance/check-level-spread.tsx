import { useMemo, useState } from "react"

import type { LevelEntry } from "@/components/levelupchance/types"
import { getEffectiveLevelChances } from "@/components/levelupchance/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type CheckLevelSpreadProps = {
  expectedEntries: LevelEntry[]
  className?: string
}

type ParsedLevelRow = {
  level: number
  count: number
  observedPercent: number
  expectedPercent: number
  differencePercent: number
}

type AccuracySummary = {
  averageAbsoluteDifference: number
  levelCount: number
  totalVariationDistance: number
  accuracyPercent: number
}

const SELECTED_LEVEL_PATTERN = /Selected Level:\s*(\d+)/

export function CheckLevelSpread({ expectedEntries, className }: CheckLevelSpreadProps) {
  const [logInput, setLogInput] = useState("")
  const hasInput = logInput.trim().length > 0

  const expectedByLevel = useMemo(() => {
    const effectiveEntries = getEffectiveLevelChances(expectedEntries)
    const totalEffective = effectiveEntries.reduce(
      (sum, entry) => sum + entry.effectiveChance,
      0
    )

    return new Map(
      effectiveEntries.map((entry) => [
        entry.level,
        totalEffective > 0 ? (entry.effectiveChance / totalEffective) * 100 : 0,
      ])
    )
  }, [expectedEntries])

  const parseResult = useMemo(() => {
    const lines = logInput
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    const counts = new Map<number, number>()
    let matched = 0

    for (const line of lines) {
      const match = line.match(SELECTED_LEVEL_PATTERN)

      if (!match) {
        continue
      }

      const parsedLevel = Number.parseInt(match[1], 10)

      if (!Number.isFinite(parsedLevel) || parsedLevel <= 0) {
        continue
      }

      matched += 1
      counts.set(parsedLevel, (counts.get(parsedLevel) ?? 0) + 1)
    }

    const allLevels = Array.from(
      new Set([...expectedByLevel.keys(), ...counts.keys()])
    ).sort((a, b) => a - b)

    const rows = allLevels.map((level): ParsedLevelRow => {
      const count = counts.get(level) ?? 0
      const observedPercent = matched > 0 ? (count / matched) * 100 : 0
      const expectedPercent = expectedByLevel.get(level) ?? 0

      return {
        level,
        count,
        observedPercent,
        expectedPercent,
        differencePercent: Math.abs(observedPercent - expectedPercent),
      }
    })

    return {
      totalLines: lines.length,
      matchedLines: matched,
      rows,
    }
  }, [expectedByLevel, logInput])

  const maxBarValue = useMemo(() => {
    return parseResult.rows.reduce(
      (maxValue, row) =>
        Math.max(maxValue, row.observedPercent, row.expectedPercent),
      0
    )
  }, [parseResult.rows])

  const accuracySummary = useMemo<AccuracySummary>(() => {
    if (parseResult.rows.length === 0) {
      return {
        averageAbsoluteDifference: 0,
        levelCount: 0,
        totalVariationDistance: 0,
        accuracyPercent: 0,
      }
    }

    const totalDifference = parseResult.rows.reduce(
      (sum, row) => sum + row.differencePercent,
      0
    )
    const averageAbsoluteDifference = totalDifference / parseResult.rows.length
    const totalVariationDistance = Math.min(100, totalDifference / 2)

    return {
      averageAbsoluteDifference,
      levelCount: parseResult.rows.length,
      totalVariationDistance,
      accuracyPercent: Math.max(0, 100 - totalVariationDistance),
    }
  }, [parseResult.rows])

  return (
    <Card className={cn("h-full rounded-xl border-0", className)}>
      <CardHeader>
        <CardTitle>6. Check Level Spread</CardTitle>
        <CardDescription>
          Paste StarLevelSystem logs to parse Selected Level rolls, then compare observed distribution against the current generated spread. For example, depending on PC specs, you could use <code>spawn greyling 999</code> to get a decent sample size. Check <code>BepInEx/Logutput.log</code> for the results at the tail end.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="check-level-spread-input">Log input</Label>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                disabled={!hasInput}
                onClick={() => setLogInput("")}
              >
                Clear
              </Button>
            </div>
            <Textarea
              id="check-level-spread-input"
              value={logInput}
              onChange={(event) => setLogInput(event.target.value)}
              rows={16}
              className="min-h-72 resize-y font-mono text-xs text-muted-foreground"
              placeholder="Paste log lines containing 'Selected Level: <number>'"
            />
            {hasInput ? (
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Parsed {parseResult.matchedLines} matching roll lines out of {parseResult.totalLines} total non-empty lines.
                </p>
                <p>
                  Avg absolute level diff: {accuracySummary.averageAbsoluteDifference.toFixed(2)}% across {accuracySummary.levelCount} levels
                  {" "}(distribution mismatch {accuracySummary.totalVariationDistance.toFixed(2)}%, match score {accuracySummary.accuracyPercent.toFixed(2)}%).
                </p>
              </div>
            ) : (
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Example supported lines:</p>
                <pre className="overflow-x-auto rounded-md border border-border/70 bg-muted/40 p-2 font-mono text-[11px] leading-relaxed">
                  <code>{`[Info   :StarLevelSystem] Level Roll: 73.49974 >= 70.3588 ... Selected Level: 4
[Info   :StarLevelSystem] Level Roll: 38.75334 >= 37.6603 ... Selected Level: 6
[Info   :StarLevelSystem] Level Roll: 59.78273 >= 53.5261 ... Selected Level: 5`}</code>
                </pre>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-border/70 p-3">
              <p className="text-xs text-muted-foreground">Mini Dist Preview</p>
              {parseResult.rows.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  No matching "Selected Level" lines parsed yet.
                </p>
              ) : (
                <div className="mt-2 max-h-48 overflow-x-auto overflow-y-hidden">
                  <div className="flex min-w-max items-end gap-2">
                    {parseResult.rows.map((row) => {
                      const observedHeight =
                        maxBarValue > 0 ? (row.observedPercent / maxBarValue) * 100 : 0
                      const expectedHeight =
                        maxBarValue > 0 ? (row.expectedPercent / maxBarValue) * 100 : 0

                      return (
                        <div key={row.level} className="flex w-8 flex-col items-center gap-1">
                          <div className="flex h-24 w-full items-end justify-center gap-0.5 rounded bg-muted/40 p-1">
                            <div
                              className="w-2 rounded-sm bg-lime-500"
                              style={{ height: `${observedHeight}%` }}
                              title={`Observed L${row.level}: ${row.observedPercent.toFixed(2)}%`}
                            />
                            <div
                              className="w-2 rounded-sm bg-stone-500"
                              style={{ height: `${expectedHeight}%` }}
                              title={`Expected L${row.level}: ${row.expectedPercent.toFixed(2)}%`}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">L{row.level}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block size-2 rounded-sm bg-lime-500" />
                  Observed
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block size-2 rounded-sm bg-stone-500" />
                  Expected
                </span>
              </div>
            </div>

            <div className="max-h-72 overflow-auto rounded-lg border border-border/80">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Observed %</TableHead>
                    <TableHead className="text-right">Expected %</TableHead>
                    <TableHead className="text-right">Diff %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parseResult.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No parsed levels yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    parseResult.rows.map((row) => (
                      <TableRow key={row.level}>
                        <TableCell>L{row.level}</TableCell>
                        <TableCell className="text-right font-mono">{row.count}</TableCell>
                        <TableCell className="text-right font-mono">
                          {row.observedPercent.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {row.expectedPercent.toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {row.differencePercent.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
