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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const selectedProfileName =
    selectedProfileId === null || selectedProfileId === ""
      ? "Current unsaved state"
      : savedProfiles.find((p) => p.id === selectedProfileId)?.name ?? selectedProfileId

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
          <Select value={selectedProfileId ?? ""} onValueChange={(newValue) => onSelectProfile(newValue ?? "")}>
            <SelectTrigger id="saved-profile-select" className="w-full">
              <SelectValue placeholder={selectedProfileName} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Current unsaved state</SelectItem>
              {savedProfiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
