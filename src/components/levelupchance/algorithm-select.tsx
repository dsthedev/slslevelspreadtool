import { Label } from "@/components/ui/label"

type AlgorithmOption = {
  value: string
  label: string
}

type AlgorithmSelectProps = {
  value: string
  options: AlgorithmOption[]
  onChange: (nextValue: string) => void
}

export function AlgorithmSelect({
  value,
  options,
  onChange,
}: AlgorithmSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="algorithm-select" className="text-xs text-muted-foreground">
        Algorithm
      </Label>
      <select
        id="algorithm-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-4xl border border-input bg-input/30 px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
