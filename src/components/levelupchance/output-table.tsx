import { Copy } from "lucide-react"

import type { LevelEntry } from "@/components/levelupchance/types"
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

type OutputTableProps = {
  entries: LevelEntry[]
  onCopy: () => void
  copied: boolean
}

export function OutputTable({ entries, onCopy, copied }: OutputTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Copy New Spread</CardTitle>
        <CardDescription>
          Use this list directly in your next paste destination.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-80 overflow-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Weight</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.level}>
                  <TableCell>L{entry.level}</TableCell>
                  <TableCell className="text-right font-mono">
                    {entry.value.toFixed(4)}
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
