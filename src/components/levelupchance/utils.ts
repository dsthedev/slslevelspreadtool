import { DECAY_FACTOR, DEFAULT_STEP_AMOUNT } from "@/components/levelupchance/constants"
import type { LevelEntry } from "@/components/levelupchance/types"

export type AlgorithmControl =
  | "centerPosition"
  | "centerWeight"
  | "stepAmount"

export const distributionAlgorithms = [
  {
    value: "exponential",
    label: "Exponential (original)",
    controls: ["centerPosition", "centerWeight"],
  },
  {
    value: "gaussian",
    label: "Gaussian",
    controls: ["centerPosition", "centerWeight"],
  },
  {
    value: "linear",
    label: "Linear taper",
    controls: ["centerPosition", "centerWeight", "stepAmount"],
  },
  {
    value: "evenish",
    label: "Even-ish",
    controls: [],
  },
  {
    value: "fibonacci",
    label: "Fibonacci (from max level)",
    controls: [],
  },
  {
    value: "geometric",
    label: "Geometric decay",
    controls: ["centerWeight", "stepAmount"],
  },
  {
    value: "powerLaw",
    label: "Power-law decay",
    controls: ["centerWeight", "stepAmount"],
  },
] as const

export type DistributionAlgorithm =
  (typeof distributionAlgorithms)[number]["value"]

export type AlgorithmTuningOptions = {
  stepAmount: number
}

export type LevelChanceEntry = LevelEntry & {
  effectiveChance: number
}

export type AlgorithmDescription = {
  title: string
  summary: string
  gameplay: string
}

export const algorithmDescriptions: Record<DistributionAlgorithm, AlgorithmDescription> =
  {
    exponential: {
      title: "Exponential (original)",
      summary:
        "Drops off by a fixed multiplier from the selected center level, so values collapse quickly as you move away from center.",
      gameplay:
        "Creates a sharp peak around your chosen level. Expect consistent mid-target results with rare outliers.",
    },
    gaussian: {
      title: "Gaussian",
      summary:
        "Forms a bell curve around the center with smooth falloff in both directions.",
      gameplay:
        "Best for a natural cluster around one level band. Extremes become uncommon, but not instantly impossible.",
    },
    linear: {
      title: "Linear taper",
      summary:
        "Falls by a constant amount per step from center based on step amount.",
      gameplay:
        "Predictable and easy to tune. Increasing step amount makes high and low extremes disappear quickly.",
    },
    evenish: {
      title: "Even-ish",
      summary:
        "Spreads values in an almost uniform staircase from low levels toward high levels.",
      gameplay:
        "Good for testing and broad variety. High levels appear more often than typical progression curves.",
    },
    fibonacci: {
      title: "Fibonacci (from max level)",
      summary:
        "Assigns Fibonacci numbers from the max level backward (1, 1, 2, 3, 5...).",
      gameplay:
        "Very aggressive scaling toward lower levels. High levels can become extremely rare unless you post-process caps.",
    },
    geometric: {
      title: "Geometric decay",
      summary:
        "Uses a fixed decay ratio per level from level 1 upward; step amount controls decay steepness.",
      gameplay:
        "Excellent for RPG-style rarity tails. Low levels stay common while higher stars taper in a smooth, predictable way.",
    },
    powerLaw: {
      title: "Power-law decay",
      summary:
        "Uses level^-exponent scaling from level 1 upward; step amount acts as exponent.",
      gameplay:
        "Heavier tail than geometric at comparable settings. You get more occasional high-star spawns without fully flattening the curve.",
    },
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
      index,
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
  index: number,
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
    case "evenish": {
      const maxIndex = Math.max(totalEntries - 1, 1)
      const step = 99 / maxIndex
      return Math.max(1, 100 - step * index)
    }
    case "fibonacci": {
      const distanceFromMax = Math.max(totalEntries - 1 - index, 0)
      return getFibonacciValue(distanceFromMax)
    }
    case "geometric": {
      const ratio = 1 / (1 + tuningOptions.stepAmount)
      return centerWeight * ratio ** index
    }
    case "powerLaw": {
      const exponent = Math.max(tuningOptions.stepAmount, 0.1)
      return centerWeight / (index + 1) ** exponent
    }
    case "exponential":
    default:
      return centerWeight * DECAY_FACTOR ** distance
  }
}

function getFibonacciValue(position: number) {
  if (position <= 1) {
    return 1
  }

  let previous = 1
  let current = 1

  for (let step = 2; step <= position; step += 1) {
    const next = previous + current
    previous = current
    current = next
  }

  return current
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

export function normalizeLevelWeights(
  entries: LevelEntry[],
  targetTotal = 100
): LevelEntry[] {
  if (!Number.isFinite(targetTotal) || targetTotal <= 0 || entries.length === 0) {
    return entries
  }

  const currentTotal = entries.reduce((sum, entry) => sum + sanitizeWeight(entry.value), 0)

  if (!Number.isFinite(currentTotal) || currentTotal <= 0) {
    return entries
  }

  const scale = targetTotal / currentTotal

  return entries.map((entry) => ({
    level: entry.level,
    value: sanitizeWeight(entry.value) * scale,
  }))
}

export function normalizeEffectiveLevelWeights(
  entries: LevelEntry[],
  targetTotal = 100
): LevelEntry[] {
  if (!Number.isFinite(targetTotal) || targetTotal <= 0 || entries.length === 0) {
    return entries
  }

  const currentEffectiveTotal = getEffectiveLevelChances(entries).reduce(
    (sum, entry) => sum + entry.effectiveChance,
    0
  )

  if (!Number.isFinite(currentEffectiveTotal) || currentEffectiveTotal <= 0) {
    return entries
  }

  const scale = targetTotal / currentEffectiveTotal

  return entries.map((entry) => ({
    level: entry.level,
    value: sanitizeWeight(entry.value) * scale,
  }))
}

export function getEffectiveLevelChances(entries: LevelEntry[]): LevelChanceEntry[] {
  let highestCoveredThreshold = 0

  const chancesByLevel = new Map<number, LevelChanceEntry>()

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index]
    const threshold = clampToRollRange(entry.value)
    const effectiveChance = Math.max(0, threshold - highestCoveredThreshold)

    chancesByLevel.set(entry.level, {
      level: entry.level,
      value: entry.value,
      effectiveChance,
    })

    highestCoveredThreshold = Math.max(highestCoveredThreshold, threshold)
  }

  return entries
    .map((entry) => chancesByLevel.get(entry.level))
    .filter((entry): entry is LevelChanceEntry => entry !== undefined)
}

function clampToRollRange(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(Math.max(value, 0), 100)
}
