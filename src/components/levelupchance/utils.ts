import { BASE_WEIGHT, DECAY_FACTOR } from "@/components/levelupchance/constants"
import type { LevelEntry } from "@/components/levelupchance/types"

export const distributionAlgorithms = [
  { value: "exponential", label: "Exponential (original)" },
  { value: "gaussian", label: "Gaussian" },
  { value: "linear", label: "Linear taper" },
] as const

export type DistributionAlgorithm =
  (typeof distributionAlgorithms)[number]["value"]

export function isDistributionAlgorithm(
  value: string
): value is DistributionAlgorithm {
  return distributionAlgorithms.some((item) => item.value === value)
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
  algorithm: DistributionAlgorithm
): LevelEntry[] {
  const safeCenter = Math.min(Math.max(centerIndex, 0), Math.max(entries.length - 1, 0))

  return entries.map((entry, index) => {
    const distance = Math.abs(index - safeCenter)
    const rawValue = getWeightByAlgorithm(algorithm, distance, entries.length)
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
  totalEntries: number
) {
  switch (algorithm) {
    case "gaussian": {
      const sigma = Math.max(totalEntries / 6, 1)
      return BASE_WEIGHT * Math.exp(-(distance ** 2) / (2 * sigma ** 2))
    }
    case "linear": {
      const maxDistance = Math.max(totalEntries - 1, 1)
      return BASE_WEIGHT * Math.max(0, 1 - distance / maxDistance)
    }
    case "exponential":
    default:
      return BASE_WEIGHT * DECAY_FACTOR ** distance
  }
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
