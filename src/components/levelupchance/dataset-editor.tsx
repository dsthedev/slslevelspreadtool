import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type DatasetEditorProps = {
  value: string
  onChange: (nextValue: string) => void
  onLoad: () => void
  onResetDefault: () => void
}

export function DatasetEditor({
  value,
  onChange,
  onLoad,
  onResetDefault,
}: DatasetEditorProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>1. Paste Existing Level Spread</CardTitle>
        <CardDescription>
          Use level:value pairs, one per line. Example: 12: 0.0078
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-4">
        <Label htmlFor="spread-input">Level spread input</Label>
        <Textarea
          id="spread-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-64 font-mono text-sm"
          placeholder="1: 20"
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={onLoad}>
            <Upload />
            Load Dataset
          </Button>
          <Button variant="outline" onClick={onResetDefault}>
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
