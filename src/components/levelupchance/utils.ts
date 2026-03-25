import { DECAY_FACTOR, DEFAULT_STEP_AMOUNT } from "@/components/levelupchance/constants"
import type { LevelEntry } from "@/components/levelupchance/types"

export type AlgorithmControl = "stepAmount"

export const distributionAlgorithms = [
  { value: "exponential", label: "Exponential (original)", controls: [] },
  { value: "gaussian", label: "Gaussian", controls: [] },
  { value: "linear", label: "Linear taper", controls: ["stepAmount"] },
] as const

export type DistributionAlgorithm =
  (typeof distributionAlgorithms)[number]["value"]

export type AlgorithmTuningOptions = {
  stepAmount: number
}

export function isDistributionAlgorithm(
  value: string
): value is DistributionAlgorithm {
  return distributionAlgorithms.some((item) => item.value === value)
}

export function getAlgorithmControls(
  algorithm: DistributionAlgorithm
): AlgorithmControl[] {
  const matched = distributionAlgorithms.find((item) => item.value === algorithm)
  return matched ? [...matched.controls] : []
}

export function parseLevelSpread(raw: string): LevelEntry[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.includes(":"))
    .map((line) => {
      const [levelRaw, valueRaw] = line.split(":")
      const level = Number.parseInt(levelRaw.trim(), 10)
      const value = Number.parseFloat(valueRaw.trim())

      return { level, value }
    })
    .filter((entry) => Number.isFinite(entry.level) && Number.isFinite(entry.value))
    .sort((a, b) => a.level - b.level)
}

export function applyCenteredWeights(
  entries: LevelEntry[],
  centerIndex: number,
  algorithm: DistributionAlgorithm,
  centerWeight: number,
  tuningOptions: Partial<AlgorithmTuningOptions> = {}
): LevelEntry[] {
  const safeCenter = Math.min(Math.max(centerIndex, 0), Math.max(entries.length - 1, 0))
  const resolvedTuning: AlgorithmTuningOptions = {
    stepAmount: sanitizeStepAmount(tuningOptions.stepAmount),
  }

  return entries.map((entry, index) => {
    const distance = Math.abs(index - safeCenter)
    const rawValue = getWeightByAlgorithm(
      algorithm,
      distance,
      entries.length,
      centerWeight,
      resolvedTuning
    )
    const value = sanitizeWeight(rawValue)

    return {
      level: entry.level,
      value,
    }
  })
}

function getWeightByAlgorithm(
  algorithm: DistributionAlgorithm,
  distance: number,
  totalEntries: number,
  centerWeight: number,
  tuningOptions: AlgorithmTuningOptions
) {
  switch (algorithm) {
    case "gaussian": {
      const sigma = Math.max(totalEntries / 6, 1)
      return centerWeight * Math.exp(-(distance ** 2) / (2 * sigma ** 2))
    }
    case "linear": {
      const maxDistance = Math.max(totalEntries - 1, 1)
      const adjustedDistance = distance * tuningOptions.stepAmount
      return centerWeight * Math.max(0, 1 - adjustedDistance / maxDistance)
    }
    case "exponential":
    default:
      return centerWeight * DECAY_FACTOR ** distance
  }
}

function sanitizeStepAmount(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return DEFAULT_STEP_AMOUNT
  }

  return Math.max(0.1, value ?? DEFAULT_STEP_AMOUNT)
}

function sanitizeWeight(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, value)
}

export function formatLevelSpread(entries: LevelEntry[]): string {
  return entries.map((entry) => `${entry.level}: ${entry.value.toFixed(4)}`).join("\n")
}
