import { Equal } from "lucide-react"

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
  onChange: (position: number) => void
}

export function WeightSlider({
  centerPosition,
  maxPosition,
  selectedLevelLabel,
  onChange,
}: WeightSliderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Shift Weight Center</CardTitle>
        <CardDescription>
          Move the peak level and regenerate the full distribution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  )
}
