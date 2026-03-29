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
import { cn } from "@/lib/utils"

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
  onDeleteAllProfiles: () => void
}

type ProfileManagerCardProps = Pick<
  DatasetEditorProps,
  | "savedProfiles"
  | "selectedProfileId"
  | "onSelectProfile"
  | "onSaveNewProfile"
  | "onOverwriteProfile"
  | "onDeleteProfile"
  | "onDeleteAllProfiles"
> & {
  className?: string
}

type ManualInputCardProps = Pick<
  DatasetEditorProps,
  "value" | "onChange" | "onLoad" | "onResetDefault"
> & {
  className?: string
}

export function ProfileManagerCard({
  savedProfiles,
  selectedProfileId,
  onSelectProfile,
  onSaveNewProfile,
  onOverwriteProfile,
  onDeleteProfile,
  onDeleteAllProfiles,
  className,
}: ProfileManagerCardProps) {
  const hasSelectedProfile = selectedProfileId !== null

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>1. Profile Manager</CardTitle>
        <CardDescription>
          Load, save, overwrite, or clear profiles for quick A/B testing.
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
            <Button
              size="sm"
              variant="destructive"
              disabled={savedProfiles.length === 0}
              onClick={onDeleteAllProfiles}
            >
              Delete All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ManualInputCard({
  value,
  onChange,
  onLoad,
  onResetDefault,
  className,
}: ManualInputCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>4. Manual Input</CardTitle>
        <CardDescription>
          Paste level:value pairs to build or tweak a spread directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-4">
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
  onDeleteAllProfiles,
}: DatasetEditorProps) {
  return (
    <div className="grid gap-4">
      <ProfileManagerCard
        savedProfiles={savedProfiles}
        selectedProfileId={selectedProfileId}
        onSelectProfile={onSelectProfile}
        onSaveNewProfile={onSaveNewProfile}
        onOverwriteProfile={onOverwriteProfile}
        onDeleteProfile={onDeleteProfile}
        onDeleteAllProfiles={onDeleteAllProfiles}
      />
      <ManualInputCard
        value={value}
        onChange={onChange}
        onLoad={onLoad}
        onResetDefault={onResetDefault}
      />
    </div>
  )
}
