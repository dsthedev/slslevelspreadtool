import { useMemo } from "react"
import { Copy } from "lucide-react"

import type { LevelEntry } from "@/components/levelupchance/types"
import { getEffectiveLevelChances } from "@/components/levelupchance/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type OutputTableProps = {
  entries: LevelEntry[]
  onCopy: () => void
  copied: boolean
  className?: string
}

export function OutputTable({ entries, onCopy, copied, className }: OutputTableProps) {
  const effectiveEntries = useMemo(() => getEffectiveLevelChances(entries), [entries])

  return (
    <Card className={cn("flex h-full flex-col", className)}>
      <CardHeader>
        <CardTitle>5. Copy Spread</CardTitle>
        <CardDescription>
          Shows raw thresholds and the actual effective spawn chance per level.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="max-h-72 overflow-auto rounded-lg border border-border/80">
          <Table className="text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="py-2">Level</TableHead>
                <TableHead className="py-2 text-right">Weight</TableHead>
                <TableHead className="py-2 text-right">Effective %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {effectiveEntries.map((entry) => (
                <TableRow key={entry.level}>
                  <TableCell className="py-2">L{entry.level}</TableCell>
                  <TableCell className="py-2 text-right font-mono text-lg leading-none font-semibold">
                    {entry.value.toFixed(4)}
                  </TableCell>
                  <TableCell className="py-2 text-right font-mono text-sm">
                    {entry.effectiveChance.toFixed(4)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onCopy}>
            <Copy />
            Copy Output
          </Button>
          <span className="text-xs text-muted-foreground">
            {copied ? "Copied to clipboard." : "Ready to copy."}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
