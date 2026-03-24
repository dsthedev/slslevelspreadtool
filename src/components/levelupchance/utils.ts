import { BASE_WEIGHT, DECAY_FACTOR } from "@/components/levelupchance/constants"
import type { LevelEntry } from "@/components/levelupchance/types"

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
  centerIndex: number
): LevelEntry[] {
  return entries.map((entry, index) => {
    const distance = Math.abs(index - centerIndex)
    const value = BASE_WEIGHT * DECAY_FACTOR ** distance

    return {
      level: entry.level,
      value,
    }
  })
}

export function formatLevelSpread(entries: LevelEntry[]): string {
  return entries.map((entry) => `${entry.level}: ${entry.value.toFixed(4)}`).join("\n")
}
