import { useMemo, useState } from "react"

import { DEFAULT_LEVEL_SPREAD } from "@/components/levelupchance/constants"
import { DatasetEditor } from "@/components/levelupchance/dataset-editor"
import { OutputTable } from "@/components/levelupchance/output-table"
import { SpreadChart } from "@/components/levelupchance/spread-chart"
import type { LevelEntry } from "@/components/levelupchance/types"
import {
  applyCenteredWeights,
  formatLevelSpread,
  parseLevelSpread,
} from "@/components/levelupchance/utils"
import { WeightSlider } from "@/components/levelupchance/weight-slider"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function App() {
  const [rawInput, setRawInput] = useState(DEFAULT_LEVEL_SPREAD)
  const [sourceEntries, setSourceEntries] = useState<LevelEntry[]>(() =>
    parseLevelSpread(DEFAULT_LEVEL_SPREAD)
  )
  const [centerPosition, setCenterPosition] = useState(1)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clampPosition = (position: number, length: number) => {
    if (length <= 0) {
      return 1
    }

    if (!Number.isFinite(position)) {
      return 1
    }

    return Math.min(Math.max(position, 1), length)
  }

  const safeCenterPosition = clampPosition(centerPosition, sourceEntries.length)

  const weightedEntries = useMemo(() => {
    if (sourceEntries.length === 0) {
      return []
    }

    return applyCenteredWeights(sourceEntries, safeCenterPosition - 1)
  }, [sourceEntries, safeCenterPosition])

  const selectedLevel =
    sourceEntries[Math.max(0, safeCenterPosition - 1)]?.level ??
    sourceEntries[0]?.level

  const peakValue = weightedEntries[safeCenterPosition - 1]?.value ?? 0

  const handleLoad = () => {
    const parsed = parseLevelSpread(rawInput)

    if (parsed.length === 0) {
      setError("No valid level:value pairs found. Check the format and try again.")
      return
    }

    setSourceEntries(parsed)
    setCenterPosition((current) => clampPosition(current, parsed.length))
    setError(null)
    setCopied(false)
  }

  const handleResetDefault = () => {
    const parsedDefault = parseLevelSpread(DEFAULT_LEVEL_SPREAD)
    setRawInput(DEFAULT_LEVEL_SPREAD)
    setSourceEntries(parsedDefault)
    setCenterPosition(1)
    setCopied(false)
    setError(null)
  }

  const handleCopy = async () => {
    if (weightedEntries.length === 0) {
      return
    }

    const output = formatLevelSpread(weightedEntries)
    await navigator.clipboard.writeText(output)
    setCopied(true)
  }

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.25),transparent_40%),radial-gradient(circle_at_85%_90%,rgba(16,185,129,0.2),transparent_35%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card className="border border-border/80 bg-card/85 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">LevelUpChance Editor</CardTitle>
            <CardDescription>
              Paste your current spread, move the weight center, and copy a fresh
              output list.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Levels: {sourceEntries.length}</Badge>
            <Badge variant="secondary">Center: L{selectedLevel ?? "-"}</Badge>
            <Badge variant="secondary">Peak: {peakValue.toFixed(4)}</Badge>
            {error ? <Badge variant="destructive">{error}</Badge> : null}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
          <DatasetEditor
            value={rawInput}
            onChange={setRawInput}
            onLoad={handleLoad}
            onResetDefault={handleResetDefault}
          />

          <div className="flex flex-col gap-6">
            <WeightSlider
              centerPosition={safeCenterPosition}
              maxPosition={Math.max(1, sourceEntries.length)}
              selectedLevelLabel={selectedLevel ?? 1}
              onChange={(position) => {
                setCenterPosition(clampPosition(position, sourceEntries.length))
                setCopied(false)
              }}
            />
            <SpreadChart
              entries={weightedEntries}
              centerPosition={safeCenterPosition}
            />
          </div>
        </div>

        <OutputTable entries={weightedEntries} onCopy={handleCopy} copied={copied} />
      </div>
    </main>
  )
}

export default App
