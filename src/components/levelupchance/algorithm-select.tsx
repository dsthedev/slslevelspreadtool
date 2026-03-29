import { Popover } from "@base-ui/react/popover"
import { CircleHelp } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type AlgorithmOption = {
  value: string
  label: string
}

type AlgorithmSelectProps = {
  value: string
  options: AlgorithmOption[]
  infoTitle: string
  infoSummary: string
  infoGameplay: string
  onChange: (nextValue: string) => void
}

export function AlgorithmSelect({
  value,
  options,
  infoTitle,
  infoSummary,
  infoGameplay,
  onChange,
}: AlgorithmSelectProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Label htmlFor="algorithm-select" className="text-xs text-muted-foreground">
          Algorithm
        </Label>
        <Popover.Root>
          <Popover.Trigger
            type="button"
            aria-label="Show algorithm details"
            className={cn(
              "inline-flex size-6 items-center justify-center rounded-full border border-input bg-input/20 text-muted-foreground transition-colors",
              "hover:bg-input/40 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            )}
          >
            <CircleHelp className="size-3.5" />
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side="bottom" align="center" sideOffset={8}>
              <Popover.Popup className="z-50 w-80 rounded-xl border border-border bg-popover p-3 text-sm text-popover-foreground shadow-xl outline-none">
                <div className="space-y-2">
                  <h4 className="font-medium">{infoTitle}</h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <strong className="font-semibold text-foreground/90">
                      How it works:
                    </strong>{" "}
                    {infoSummary}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <strong className="font-semibold text-foreground/90">
                      In-game feel:
                    </strong>{" "}
                    {infoGameplay}
                  </p>
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <Select value={value} onValueChange={(newValue) => onChange(newValue ?? value)}>
        <SelectTrigger id="algorithm-select" className='w-full'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
