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
  savedProfiles: Array<{ id: string; name: string }>
  selectedProfileId: string | null
  onChange: (nextValue: string) => void
  onLoad: () => void
  onResetDefault: () => void
  onSelectProfile: (profileId: string) => void
  onSaveNewProfile: () => void
  onOverwriteProfile: () => void
  onDeleteProfile: () => void
}

export function DatasetEditor({
  value,
  savedProfiles,
  selectedProfileId,
  onChange,
  onLoad,
  onResetDefault,
  onSelectProfile,
  onSaveNewProfile,
  onOverwriteProfile,
  onDeleteProfile,
}: DatasetEditorProps) {
  const hasSelectedProfile = selectedProfileId !== null

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>1. Load Profile</CardTitle>
        <CardDescription>
          Load a saved profile first, or paste level:value pairs manually below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-4">
        <div className="space-y-2 rounded-xl border border-border/70 bg-muted/15 p-3">
          <Label htmlFor="saved-profile-select">Saved profiles</Label>
          <select
            id="saved-profile-select"
            value={selectedProfileId ?? ""}
            onChange={(event) => onSelectProfile(event.target.value)}
            className="h-9 w-full rounded-4xl border border-input bg-input/30 px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Current unsaved state</option>
            {savedProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onSaveNewProfile}>
              Save New
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!hasSelectedProfile}
              onClick={onOverwriteProfile}
            >
              Overwrite
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={!hasSelectedProfile}
              onClick={onDeleteProfile}
            >
              Delete
            </Button>
          </div>
        </div>

        <Label htmlFor="spread-input">Level spread input</Label>
        <Textarea
          id="spread-input"
          rows={9}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-40 resize-y font-mono text-sm"
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
