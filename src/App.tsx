import { useEffect, useMemo, useState } from "react"

import {
  DEFAULT_CENTER_WEIGHT,
  DEFAULT_GAUSSIAN_MID_BOOST,
  DEFAULT_GAUSSIAN_SPREAD,
  DEFAULT_LEVEL_SPREAD,
  DEFAULT_MAX_LEVEL,
  DEFAULT_STEP_AMOUNT,
} from "@/components/levelupchance/constants"
import {
  ManualInputCard,
  ProfileManagerCard,
} from "@/components/levelupchance/dataset-editor"
import { CheckLevelSpread } from "@/components/levelupchance/check-level-spread"
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
  normalizeEffectiveLevelWeights,
  normalizeLevelWeights,
  type AlgorithmControl,
  type DistributionAlgorithm,
  formatLevelSpread,
  parseLevelSpread,
} from "@/components/levelupchance/utils"
import { WeightSlider } from "@/components/levelupchance/weight-slider"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Heart, Plus, TerminalIcon } from "lucide-react"

export function App() {
  const [rawInput, setRawInput] = useState(DEFAULT_LEVEL_SPREAD)
  const [sourceEntries, setSourceEntries] = useState<LevelEntry[]>(() =>
    buildLevelEntries(DEFAULT_MAX_LEVEL)
  )
  const [maxLevel, setMaxLevel] = useState(DEFAULT_MAX_LEVEL)
  const [centerWeight, setCenterWeight] = useState(DEFAULT_CENTER_WEIGHT)
  const [stepAmount, setStepAmount] = useState(DEFAULT_STEP_AMOUNT)
  const [gaussianSpread, setGaussianSpread] = useState(DEFAULT_GAUSSIAN_SPREAD)
  const [gaussianMidBoost, setGaussianMidBoost] = useState(
    DEFAULT_GAUSSIAN_MID_BOOST
  )
  const [algorithm, setAlgorithm] = useState<DistributionAlgorithm>(
    "gaussian"
  )
  const [normalizationMode, setNormalizationMode] = useState<
    "none" | "weight" | "chance"
  >("none")
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

    if (algorithm === "manual") {
      if (normalizationMode === "weight") {
        return normalizeLevelWeights(sourceEntries, 100)
      }

      if (normalizationMode === "chance") {
        return normalizeEffectiveLevelWeights(sourceEntries, 100)
      }

      return sourceEntries
    }

    const generated = applyCenteredWeights(
      sourceEntries,
      safeCenterPosition - 1,
      algorithm,
      centerWeight,
      { stepAmount, gaussianSpread, gaussianMidBoost }
    )

    if (normalizationMode === "weight") {
      return normalizeLevelWeights(generated, 100)
    }

    if (normalizationMode === "chance") {
      return normalizeEffectiveLevelWeights(generated, 100)
    }

    return generated
  }, [
    sourceEntries,
    safeCenterPosition,
    algorithm,
    centerWeight,
    stepAmount,
    gaussianSpread,
    gaussianMidBoost,
    normalizationMode,
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
      : "gaussian"
    const parsedDraftEntries = parseLevelSpread(draft.rawInput)
    const nextSourceEntries =
      resolvedAlgorithm === "manual" && parsedDraftEntries.length > 0
        ? buildEntriesFromParsed(parsedDraftEntries, clampedMaxLevel)
        : buildLevelEntries(clampedMaxLevel)

    setRawInput(draft.rawInput)
    setMaxLevel(clampedMaxLevel)
    setCenterWeight(clampCenterWeight(draft.centerWeight))
    setStepAmount(clampStepAmount(draft.stepAmount))
    setGaussianSpread(clampGaussianSpread(draft.gaussianSpread))
    setGaussianMidBoost(clampGaussianMidBoost(draft.gaussianMidBoost))
    setAlgorithm(resolvedAlgorithm)
    setNormalizationMode(resolveNormalizationMode(draft))
    setSourceEntries(nextSourceEntries)
    setCenterPosition(clampPosition(draft.centerPosition, clampedMaxLevel))
    setCopied(false)
    setError(null)
  }

  const createProfileDraft = (): SavedProfileDraft => ({
    rawInput,
    maxLevel,
    centerWeight,
    stepAmount,
    gaussianSpread,
    gaussianMidBoost,
    algorithm,
    centerPosition: safeCenterPosition,
    normalizeToHundred: normalizationMode === "weight",
    normalizeEffectiveToHundred: normalizationMode === "chance",
    normalizationMode,
  })

  const handleLoad = () => {
    const parsed = parseLevelSpread(rawInput)

    if (parsed.length === 0) {
      setError("No valid level:value pairs found. Check the format and try again.")
      return
    }

    const inferredMaxLevel = clampMaxLevel(Math.max(...parsed.map((entry) => entry.level)))

    setMaxLevel(inferredMaxLevel)
    setSourceEntries(buildEntriesFromParsed(parsed, inferredMaxLevel))
    setAlgorithm("manual")
    setCenterPosition((current) => clampPosition(current, inferredMaxLevel))
    setError(null)
    setCopied(false)
  }

  const handleRawInputChange = (nextValue: string) => {
    setRawInput(nextValue)

    if (algorithm !== "manual") {
      return
    }

    const parsed = parseLevelSpread(nextValue)

    if (parsed.length === 0) {
      return
    }

    const inferredMaxLevel = clampMaxLevel(Math.max(...parsed.map((entry) => entry.level)))

    setMaxLevel(inferredMaxLevel)
    setSourceEntries(buildEntriesFromParsed(parsed, inferredMaxLevel))
    setCenterPosition((current) => clampPosition(current, inferredMaxLevel))
    setCopied(false)
    setError(null)
  }

  const handleResetDefault = () => {
    setRawInput(DEFAULT_LEVEL_SPREAD)
    setMaxLevel(DEFAULT_MAX_LEVEL)
    setCenterWeight(DEFAULT_CENTER_WEIGHT)
    setStepAmount(DEFAULT_STEP_AMOUNT)
    setGaussianSpread(DEFAULT_GAUSSIAN_SPREAD)
    setGaussianMidBoost(DEFAULT_GAUSSIAN_MID_BOOST)
    setNormalizationMode("none")
    setSourceEntries(buildLevelEntries(DEFAULT_MAX_LEVEL))
    setCenterPosition(1)
    setCopied(false)
    setError(null)
  }

  const handleMaxLevelChange = (nextValue: number) => {
    const clamped = clampMaxLevel(nextValue)
    setMaxLevel(clamped)
    setSourceEntries((current) => resizeLevelEntries(current, clamped))
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

  const handleGaussianSpreadChange = (nextValue: number) => {
    const clamped = clampGaussianSpread(nextValue)
    setGaussianSpread(clamped)
    setCopied(false)
  }

  const handleGaussianMidBoostChange = (nextValue: number) => {
    const clamped = clampGaussianMidBoost(nextValue)
    setGaussianMidBoost(clamped)
    setCopied(false)
  }

  const handleCopy = async () => {
    if (weightedEntries.length === 0) {
      return
    }

    const selectedProfileName =
      selectedProfileId !== null
        ? savedProfiles.find((profile) => profile.id === selectedProfileId)?.name ??
          "Unknown profile"
        : "Unsaved profile"
    const selectedAlgorithmLabel =
      distributionAlgorithms.find((item) => item.value === algorithm)?.label ??
      algorithm
    const metadataLine = `# Generated via ${selectedAlgorithmLabel} | ${selectedProfileName}`
    const formattedSpread = formatLevelSpread(weightedEntries)
    const output = [metadataLine, formattedSpread]
      .join("\n")
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n")

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

  const handleDeleteAllProfiles = () => {
    if (savedProfiles.length === 0) {
      return
    }

    const confirmed = window.confirm("Delete all saved profiles?")

    if (!confirmed) {
      return
    }

    setSavedProfiles([])
    setSelectedProfileId(null)
  }

  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.25),transparent_40%),radial-gradient(circle_at_85%_90%,rgba(16,185,129,0.2),transparent_35%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex mx-auto flex-row my-6 justify-center"><h1 className="text-3xl">SLS Level Spread Tool</h1></div>
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-2">
        <div id="hero-section" className="h-full rounded-xl border-2 border-red-900 p-0">
          <Card className="h-full rounded-xl border-0 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl"></CardTitle>
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
                . When a creature spawns, the mod makes a <strong>single 0-100 roll</strong> and selects the highest level whose chance value the roll falls within - checking from the highest level down.
                For example, with{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">1: 20, 2: 10, 3: 5</code>
                {" "}a roll of 8 lands within level 2 (&le; 10) but not level 3 (&le; 5), so the creature is 2-star. A roll of 50 exceeds all thresholds - the creature spawns at base level (no stars). Level 1 is not required to be 100; its value controls how often any leveled creature appears at all.
              </p>
            </CardContent>
          </Card>
        </div>

        <div
          id="profile-manager-section"
          className="h-full rounded-xl border-2 border-orange-900 p-0"
        >
          <ProfileManagerCard
            className="h-full rounded-xl border-0"
            savedProfiles={savedProfiles.map((profile) => ({
              id: profile.id,
              name: profile.name,
            }))}
            selectedProfileId={selectedProfileId}
            onSelectProfile={handleSelectProfile}
            onSaveNewProfile={handleSaveNewProfile}
            onOverwriteProfile={handleOverwriteProfile}
            onDeleteProfile={handleDeleteProfile}
            onDeleteAllProfiles={handleDeleteAllProfiles}
          />
        </div>

        <div
          id="adjustify-section"
          className="h-full rounded-xl border-2 border-yellow-900 p-0"
        >
          <WeightSlider
            className="h-full rounded-xl border-0"
            centerPosition={safeCenterPosition}
            maxPosition={Math.max(1, sourceEntries.length)}
            selectedLevelLabel={selectedLevel ?? 1}
            centerWeight={centerWeight}
            gaussianSpread={gaussianSpread}
            gaussianMidBoost={gaussianMidBoost}
            maxLevel={maxLevel}
            algorithm={algorithm}
            algorithmOptions={distributionAlgorithms.map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            algorithmControls={algorithmControls}
            stepAmount={stepAmount}
            normalizationMode={normalizationMode}
            onChange={(position) => {
              setCenterPosition(clampPosition(position, sourceEntries.length))
              setCopied(false)
            }}
            onCenterWeightChange={handleCenterWeightChange}
            onGaussianSpreadChange={handleGaussianSpreadChange}
            onGaussianMidBoostChange={handleGaussianMidBoostChange}
            onMaxLevelChange={handleMaxLevelChange}
            onStepAmountChange={handleStepAmountChange}
            onNormalizationModeChange={(mode) => {
              setNormalizationMode(mode)
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

        <div
          id="distribution-preview-section"
          className="h-full rounded-xl border-2 border-green-900 p-0"
        >
          <SpreadChart
            className="h-full rounded-xl border-0"
            entries={weightedEntries}
            centerPosition={safeCenterPosition}
            algorithm={algorithm}
            levelsCount={sourceEntries.length}
            selectedLevel={selectedLevel ?? null}
            peakValue={peakValue}
            error={error}
          />
        </div>

        <div
          id="input-section"
          className="h-full rounded-xl border-2 border-blue-900 p-0"
        >
          <ManualInputCard
            className="h-full rounded-xl border-0"
            value={rawInput}
            onChange={handleRawInputChange}
            onLoad={handleLoad}
            onResetDefault={handleResetDefault}
          />
        </div>

        <div
          id="copy-section"
          className="h-full rounded-xl border-2 border-sky-900 p-0"
        >
          <OutputTable
            className="h-full rounded-xl border-0"
            entries={weightedEntries}
            onCopy={handleCopy}
            copied={copied}
          />
        </div>

        <div
          id="check-level-spread-section"
          className="h-full rounded-xl border-2 border-purple-900 p-0 lg:col-span-2"
        >
          <CheckLevelSpread
            className="h-full rounded-xl border-0"
            expectedEntries={weightedEntries}
          />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 pt-6 text-center text-xs text-muted-foreground">
        <Heart size={20} strokeWidth={1.625} className="text-red-500" />
        <Plus size={16} strokeWidth={1.625} />
        <a
          href="https://github.com/dsthedev/slslevelspreadtool"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          <TerminalIcon size={24} strokeWidth={1.625} className="text-slate-500" />
          <span className="sr-only">made by d11z</span>
        </a>
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

function buildEntriesFromParsed(parsed: LevelEntry[], maxLevel: number): LevelEntry[] {
  const byLevel = new Map(parsed.map((entry) => [entry.level, entry.value]))

  return Array.from({ length: maxLevel }, (_, index) => {
    const level = index + 1

    return {
      level,
      value: byLevel.get(level) ?? 0,
    }
  })
}

function resizeLevelEntries(entries: LevelEntry[], maxLevel: number): LevelEntry[] {
  const byLevel = new Map(entries.map((entry) => [entry.level, entry.value]))

  return Array.from({ length: maxLevel }, (_, index) => {
    const level = index + 1

    return {
      level,
      value: byLevel.get(level) ?? 0,
    }
  })
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

function clampGaussianSpread(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return DEFAULT_GAUSSIAN_SPREAD
  }

  const numericValue = value ?? DEFAULT_GAUSSIAN_SPREAD
  return Math.min(Math.max(Math.round(numericValue * 10) / 10, 0.3), 3)
}

function clampGaussianMidBoost(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return DEFAULT_GAUSSIAN_MID_BOOST
  }

  const numericValue = value ?? DEFAULT_GAUSSIAN_MID_BOOST
  return Math.min(Math.max(Math.round(numericValue * 10) / 10, 0.5), 3)
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

function resolveNormalizationMode(draft: SavedProfileDraft) {
  if (draft.normalizationMode === "weight" || draft.normalizationMode === "chance") {
    return draft.normalizationMode
  }

  if (draft.normalizeEffectiveToHundred) {
    return "chance"
  }

  if (draft.normalizeToHundred) {
    return "weight"
  }

  return "none"
}
