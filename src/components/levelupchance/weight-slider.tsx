import { Equal } from "lucide-react"

import type {
  AlgorithmControl,
  DistributionAlgorithm,
} from "@/components/levelupchance/utils"
import { algorithmDescriptions } from "@/components/levelupchance/utils"
import { AlgorithmSelect } from "@/components/levelupchance/algorithm-select"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type WeightSliderProps = {
  centerPosition: number
  maxPosition: number
  selectedLevelLabel: number
  centerWeight: number
  maxLevel: number
  algorithm: DistributionAlgorithm
  algorithmOptions: Array<{ value: DistributionAlgorithm; label: string }>
  algorithmControls: AlgorithmControl[]
  stepAmount: number
  normalizeToHundred: boolean
  onChange: (position: number) => void
  onCenterWeightChange: (value: number) => void
  onMaxLevelChange: (value: number) => void
  onStepAmountChange: (value: number) => void
  onNormalizeToHundredChange: (enabled: boolean) => void
  onAlgorithmChange: (value: DistributionAlgorithm) => void
}

export function WeightSlider({
  centerPosition,
  maxPosition,
  selectedLevelLabel,
  centerWeight,
  maxLevel,
  algorithm,
  algorithmOptions,
  algorithmControls,
  stepAmount,
  normalizeToHundred,
  onChange,
  onCenterWeightChange,
  onMaxLevelChange,
  onStepAmountChange,
  onNormalizeToHundredChange,
  onAlgorithmChange,
}: WeightSliderProps) {
  const selectedAlgorithmDescription = algorithmDescriptions[algorithm]

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>2. Adjustify</CardTitle>
        <CardDescription>
          Move the peak level and regenerate the full distribution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AlgorithmSelect
          value={algorithm}
          options={algorithmOptions}
          infoTitle={selectedAlgorithmDescription.title}
          infoSummary={selectedAlgorithmDescription.summary}
          infoGameplay={selectedAlgorithmDescription.gameplay}
          onChange={(nextValue) => onAlgorithmChange(nextValue as DistributionAlgorithm)}
        />

        <label className="flex items-center gap-2 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 text-xs">
          <input
            type="checkbox"
            checked={normalizeToHundred}
            onChange={(event) => onNormalizeToHundredChange(event.target.checked)}
            className="size-4 rounded border border-input"
          />
          Normalize total weight to 100
        </label>

        {algorithmControls.includes("centerPosition") ? (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="weight-center">Weight center level</Label>
              <Badge variant="outline">
                <Equal />
                L{selectedLevelLabel}
              </Badge>
            </div>
            <Input
              id="weight-center"
              type="range"
              value={centerPosition}
              min={1}
              max={maxPosition}
              step={1}
              onChange={(event) => onChange(Number.parseInt(event.target.value, 10))}
              className="h-3 cursor-pointer appearance-none rounded-full border-0 bg-transparent px-0 py-0 [&::-webkit-slider-runnable-track]:h-3 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted [&::-webkit-slider-thumb]:-mt-0.5 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-track]:h-3 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pos 1</span>
              <span>Pos {maxPosition}</span>
            </div>
          </>
        ) : null}

        {algorithmControls.includes("centerWeight") ? (
          <div className="space-y-2">
            <Label htmlFor="center-weight">Center weight (1-100)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="center-weight"
                type="range"
                min={1}
                max={100}
                step={1}
                value={centerWeight}
                onChange={(event) =>
                  onCenterWeightChange(Number.parseInt(event.target.value, 10))
                }
                className="h-3 cursor-pointer appearance-none rounded-full border-0 bg-transparent px-0 py-0 [&::-webkit-slider-runnable-track]:h-3 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted [&::-webkit-slider-thumb]:-mt-0.5 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-track]:h-3 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background"
              />
              <Input
                type="number"
                min={1}
                max={100}
                value={centerWeight}
                onChange={(event) =>
                  onCenterWeightChange(Number.parseInt(event.target.value, 10))
                }
                className="w-20"
              />
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="max-level">Max level (2-200)</Label>
          <div className="flex items-center gap-3">
            <Input
              id="max-level"
              type="range"
              min={2}
              max={200}
              step={1}
              value={maxLevel}
              onChange={(event) =>
                onMaxLevelChange(Number.parseInt(event.target.value, 10))
              }
              className="h-3 cursor-pointer appearance-none rounded-full border-0 bg-transparent px-0 py-0 [&::-webkit-slider-runnable-track]:h-3 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted [&::-webkit-slider-thumb]:-mt-0.5 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-track]:h-3 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background"
            />
            <Input
              type="number"
              min={2}
              max={200}
              value={maxLevel}
              onChange={(event) =>
                onMaxLevelChange(Number.parseInt(event.target.value, 10))
              }
              className="w-20"
            />
          </div>
        </div>

        {algorithmControls.includes("stepAmount") ? (
          <div className="space-y-2">
            <Label htmlFor="step-amount">Step amount (0.1-10)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="step-amount"
                type="range"
                min={0.1}
                max={10}
                step={0.1}
                value={stepAmount}
                onChange={(event) =>
                  onStepAmountChange(Number.parseFloat(event.target.value))
                }
                className="h-3 cursor-pointer appearance-none rounded-full border-0 bg-transparent px-0 py-0 [&::-webkit-slider-runnable-track]:h-3 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-muted [&::-webkit-slider-thumb]:-mt-0.5 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-track]:h-3 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-muted [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background"
              />
              <Input
                type="number"
                min={0.1}
                max={10}
                step={0.1}
                value={stepAmount}
                onChange={(event) =>
                  onStepAmountChange(Number.parseFloat(event.target.value))
                }
                className="w-20"
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
