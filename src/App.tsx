import { useEffect, useMemo, useState } from "react"

import {
  DEFAULT_CENTER_WEIGHT,
  DEFAULT_LEVEL_SPREAD,
  DEFAULT_MAX_LEVEL,
  DEFAULT_STEP_AMOUNT,
} from "@/components/levelupchance/constants"
import { DatasetEditor } from "@/components/levelupchance/dataset-editor"
import { OutputTable } from "@/components/levelupchance/output-table"
import {
  loadSavedProfilesStore,
  saveSavedProfilesStore,
  type SavedProfile,
  type SavedProfileDraft,
} from "@/components/levelupchance/profile-storage"
import { SpreadChart } from "@/components/levelupchance/spread-chart"
import type { LevelEntry } from "@/components/levelupchance/types"
import {
  applyCenteredWeights,
  distributionAlgorithms,
  getAlgorithmControls,
  isDistributionAlgorithm,
  normalizeLevelWeights,
  type AlgorithmControl,
  type DistributionAlgorithm,
  formatLevelSpread,
  parseLevelSpread,
} from "@/components/levelupchance/utils"
import { WeightSlider } from "@/components/levelupchance/weight-slider"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function App() {
  const [rawInput, setRawInput] = useState(DEFAULT_LEVEL_SPREAD)
  const [sourceEntries, setSourceEntries] = useState<LevelEntry[]>(() =>
    buildLevelEntries(DEFAULT_MAX_LEVEL)
  )
  const [maxLevel, setMaxLevel] = useState(DEFAULT_MAX_LEVEL)
  const [centerWeight, setCenterWeight] = useState(DEFAULT_CENTER_WEIGHT)
  const [stepAmount, setStepAmount] = useState(DEFAULT_STEP_AMOUNT)
  const [algorithm, setAlgorithm] = useState<DistributionAlgorithm>(
    "exponential"
  )
  const [normalizeToHundred, setNormalizeToHundred] = useState(false)
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [hasLoadedProfiles, setHasLoadedProfiles] = useState(false)
  const [centerPosition, setCenterPosition] = useState(1)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clampPosition = (position: number, length: number) => {
    if (length <= 0) {
      return 1
    }

    if (!Number.isFinite(position)) {
      return 1
    }

    return Math.min(Math.max(position, 1), length)
  }

  const safeCenterPosition = clampPosition(centerPosition, sourceEntries.length)

  useEffect(() => {
    const stored = loadSavedProfilesStore()
    setSavedProfiles(stored.profiles)
    setSelectedProfileId(stored.lastSelectedProfileId)
    setHasLoadedProfiles(true)
  }, [])

  useEffect(() => {
    if (!hasLoadedProfiles) {
      return
    }

    saveSavedProfilesStore(savedProfiles, selectedProfileId)
  }, [savedProfiles, selectedProfileId, hasLoadedProfiles])

  const weightedEntries = useMemo(() => {
    if (sourceEntries.length === 0) {
      return []
    }

    const generated = applyCenteredWeights(
      sourceEntries,
      safeCenterPosition - 1,
      algorithm,
      centerWeight,
      { stepAmount }
    )

    if (!normalizeToHundred) {
      return generated
    }

    return normalizeLevelWeights(generated, 100)
  }, [
    sourceEntries,
    safeCenterPosition,
    algorithm,
    centerWeight,
    stepAmount,
    normalizeToHundred,
  ])

  const algorithmControls: AlgorithmControl[] = getAlgorithmControls(algorithm)

  const selectedLevel =
    sourceEntries[Math.max(0, safeCenterPosition - 1)]?.level ??
    sourceEntries[0]?.level

  const peakValue = weightedEntries[safeCenterPosition - 1]?.value ?? 0

  const applyProfileDraft = (draft: SavedProfileDraft) => {
    const clampedMaxLevel = clampMaxLevel(draft.maxLevel)
    const resolvedAlgorithm = isDistributionAlgorithm(draft.algorithm)
      ? draft.algorithm
      : "exponential"

    setRawInput(draft.rawInput)
    setMaxLevel(clampedMaxLevel)
    setCenterWeight(clampCenterWeight(draft.centerWeight))
    setStepAmount(clampStepAmount(draft.stepAmount))
    setAlgorithm(resolvedAlgorithm)
    setNormalizeToHundred(draft.normalizeToHundred)
    setSourceEntries(buildLevelEntries(clampedMaxLevel))
    setCenterPosition(clampPosition(draft.centerPosition, clampedMaxLevel))
    setCopied(false)
    setError(null)
  }

  const createProfileDraft = (): SavedProfileDraft => ({
    rawInput,
    maxLevel,
    centerWeight,
    stepAmount,
    algorithm,
    centerPosition: safeCenterPosition,
    normalizeToHundred,
  })

  const handleLoad = () => {
    const parsed = parseLevelSpread(rawInput)

    if (parsed.length === 0) {
      setError("No valid level:value pairs found. Check the format and try again.")
      return
    }

    const inferredMaxLevel = clampMaxLevel(
      Math.max(...parsed.map((entry) => entry.level), DEFAULT_MAX_LEVEL)
    )

    setMaxLevel(inferredMaxLevel)
    setSourceEntries(buildLevelEntries(inferredMaxLevel))
    setCenterPosition((current) => clampPosition(current, inferredMaxLevel))
    setError(null)
    setCopied(false)
  }

  const handleResetDefault = () => {
    setRawInput(DEFAULT_LEVEL_SPREAD)
    setMaxLevel(DEFAULT_MAX_LEVEL)
    setCenterWeight(DEFAULT_CENTER_WEIGHT)
    setStepAmount(DEFAULT_STEP_AMOUNT)
    setNormalizeToHundred(false)
    setSourceEntries(buildLevelEntries(DEFAULT_MAX_LEVEL))
    setCenterPosition(1)
    setCopied(false)
    setError(null)
  }

  const handleMaxLevelChange = (nextValue: number) => {
    const clamped = clampMaxLevel(nextValue)
    setMaxLevel(clamped)
    setSourceEntries(buildLevelEntries(clamped))
    setCenterPosition((current) => clampPosition(current, clamped))
    setCopied(false)
  }

  const handleCenterWeightChange = (nextValue: number) => {
    const clamped = clampCenterWeight(nextValue)
    setCenterWeight(clamped)
    setCopied(false)
  }

  const handleStepAmountChange = (nextValue: number) => {
    const clamped = clampStepAmount(nextValue)
    setStepAmount(clamped)
    setCopied(false)
  }

  const handleCopy = async () => {
    if (weightedEntries.length === 0) {
      return
    }

    const output = formatLevelSpread(weightedEntries)
    await navigator.clipboard.writeText(output)
    setCopied(true)
  }

  const handleSelectProfile = (profileId: string) => {
    if (!profileId) {
      setSelectedProfileId(null)
      return
    }

    const selectedProfile = savedProfiles.find((profile) => profile.id === profileId)

    if (!selectedProfile) {
      return
    }

    setSelectedProfileId(selectedProfile.id)
    applyProfileDraft(selectedProfile.data)
  }

  const handleSaveNewProfile = () => {
    const requestedName = window.prompt("Profile name", getSuggestedProfileName(savedProfiles))

    if (requestedName === null) {
      return
    }

    const trimmedName = requestedName.trim()

    if (!trimmedName) {
      return
    }

    const now = new Date().toISOString()
    const nextProfile: SavedProfile = {
      id: createProfileId(),
      name: getUniqueProfileName(trimmedName, savedProfiles),
      createdAt: now,
      updatedAt: now,
      data: createProfileDraft(),
    }

    setSavedProfiles((current) => [...current, nextProfile])
    setSelectedProfileId(nextProfile.id)
  }

  const handleOverwriteProfile = () => {
    if (!selectedProfileId) {
      return
    }

    setSavedProfiles((current) =>
      current.map((profile) =>
        profile.id === selectedProfileId
          ? {
              ...profile,
              updatedAt: new Date().toISOString(),
              data: createProfileDraft(),
            }
          : profile
      )
    )
  }

  const handleDeleteProfile = () => {
    if (!selectedProfileId) {
      return
    }

    const selectedProfile = savedProfiles.find((profile) => profile.id === selectedProfileId)

    if (!selectedProfile) {
      return
    }

    const confirmed = window.confirm(`Delete saved profile "${selectedProfile.name}"?`)

    if (!confirmed) {
      return
    }

    setSavedProfiles((current) =>
      current.filter((profile) => profile.id !== selectedProfileId)
    )
    setSelectedProfileId(null)
  }

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.25),transparent_40%),radial-gradient(circle_at_85%_90%,rgba(16,185,129,0.2),transparent_35%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Card className="border border-border/80 bg-card/85 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl">SLS Level Spread Tool</CardTitle>
            <CardDescription>
              Upload a level spread dataset, adjust the distribution settings, and copy the modified spread for use in your SLS configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Controls the{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                defaultCreatureLevelUpChance
              </code>{" "}
              table in{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                BepInEx/StarLevelSystem/LevelSettings.yaml
              </code>
              . When a creature spawns, the mod makes a <strong>single 0–100 roll</strong> and selects the highest level whose chance value the roll falls within — checking from the highest level down.
              For example, with{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">1: 20, 2: 10, 3: 5</code>
              {" "}a roll of 8 lands within level 2 (≤ 10) but not level 3 (≤ 5), so the creature is 2-star. A roll of 50 exceeds all thresholds — the creature spawns at base level (no stars). Level 1 is not required to be 100; its value controls how often any leveled creature appears at all.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Levels: {sourceEntries.length}</Badge>
              <Badge variant="secondary">Center: L{selectedLevel ?? "-"}</Badge>
              <Badge variant="secondary">Peak: {peakValue.toFixed(4)}</Badge>
              {error ? <Badge variant="destructive">{error}</Badge> : null}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:auto-rows-fr xl:grid-cols-[1.15fr_1fr]">
          <div className="order-1 h-full">
            <DatasetEditor
              value={rawInput}
              savedProfiles={savedProfiles.map((profile) => ({
                id: profile.id,
                name: profile.name,
              }))}
              selectedProfileId={selectedProfileId}
              onChange={setRawInput}
              onLoad={handleLoad}
              onResetDefault={handleResetDefault}
              onSelectProfile={handleSelectProfile}
              onSaveNewProfile={handleSaveNewProfile}
              onOverwriteProfile={handleOverwriteProfile}
              onDeleteProfile={handleDeleteProfile}
            />
          </div>

          <div className="order-2 h-full">
            <WeightSlider
              centerPosition={safeCenterPosition}
              maxPosition={Math.max(1, sourceEntries.length)}
              selectedLevelLabel={selectedLevel ?? 1}
              centerWeight={centerWeight}
              maxLevel={maxLevel}
              algorithm={algorithm}
              algorithmOptions={distributionAlgorithms.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              algorithmControls={algorithmControls}
              stepAmount={stepAmount}
              normalizeToHundred={normalizeToHundred}
              onChange={(position) => {
                setCenterPosition(clampPosition(position, sourceEntries.length))
                setCopied(false)
              }}
              onCenterWeightChange={handleCenterWeightChange}
              onMaxLevelChange={handleMaxLevelChange}
              onStepAmountChange={handleStepAmountChange}
              onNormalizeToHundredChange={(enabled) => {
                setNormalizeToHundred(enabled)
                setCopied(false)
              }}
              onAlgorithmChange={(nextValue) => {
                if (isDistributionAlgorithm(nextValue)) {
                  setAlgorithm(nextValue)
                  setCopied(false)
                }
              }}
            />
          </div>

          <div className="order-3 h-full xl:order-4">
            <SpreadChart
              entries={weightedEntries}
              centerPosition={safeCenterPosition}
              algorithm={algorithm}
            />
          </div>

          <div className="order-4 h-full xl:order-3">
            <OutputTable entries={weightedEntries} onCopy={handleCopy} copied={copied} />
          </div>
        </div>
      </div>
    </main>
  )
}

function buildLevelEntries(maxLevel: number): LevelEntry[] {
  return Array.from({ length: maxLevel }, (_, index) => ({
    level: index + 1,
    value: 0,
  }))
}

function clampMaxLevel(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_MAX_LEVEL
  }

  return Math.min(Math.max(Math.round(value), 2), 200)
}

function clampCenterWeight(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_CENTER_WEIGHT
  }

  return Math.min(Math.max(Math.round(value), 1), 100)
}

function clampStepAmount(value: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_STEP_AMOUNT
  }

  return Math.min(Math.max(Math.round(value * 10) / 10, 0.1), 10)
}

export default App

function createProfileId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function getSuggestedProfileName(profiles: SavedProfile[]) {
  return `Profile ${profiles.length + 1}`
}

function getUniqueProfileName(name: string, profiles: SavedProfile[]) {
  const normalizedName = name.trim()

  if (!profiles.some((profile) => profile.name === normalizedName)) {
    return normalizedName
  }

  let suffix = 2

  while (profiles.some((profile) => profile.name === `${normalizedName} (${suffix})`)) {
    suffix += 1
  }

  return `${normalizedName} (${suffix})`
}
