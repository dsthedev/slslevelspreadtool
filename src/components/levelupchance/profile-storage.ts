import type { DistributionAlgorithm } from "@/components/levelupchance/utils"

const STORAGE_KEY = "levelupscale.savedProfiles"
const STORAGE_VERSION = 1

export type SavedProfileDraft = {
  rawInput: string
  maxLevel: number
  centerWeight: number
  stepAmount: number
  algorithm: DistributionAlgorithm
  centerPosition: number
  normalizeToHundred: boolean
  normalizeEffectiveToHundred?: boolean
  normalizationMode?: "none" | "weight" | "chance"
}

export type SavedProfile = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  data: SavedProfileDraft
}

type SavedProfilesStore = {
  version: number
  profiles: SavedProfile[]
  lastSelectedProfileId: string | null
}

export function loadSavedProfilesStore(): {
  profiles: SavedProfile[]
  lastSelectedProfileId: string | null
} {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return { profiles: [], lastSelectedProfileId: null }
    }

    const parsed: unknown = JSON.parse(raw)

    if (!isSavedProfilesStore(parsed)) {
      return { profiles: [], lastSelectedProfileId: null }
    }

    return {
      profiles: parsed.profiles,
      lastSelectedProfileId: parsed.lastSelectedProfileId,
    }
  } catch {
    return { profiles: [], lastSelectedProfileId: null }
  }
}

export function saveSavedProfilesStore(
  profiles: SavedProfile[],
  lastSelectedProfileId: string | null
) {
  try {
    const store: SavedProfilesStore = {
      version: STORAGE_VERSION,
      profiles,
      lastSelectedProfileId,
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Ignore storage failures in the minimal local-only version.
  }
}

function isSavedProfilesStore(value: unknown): value is SavedProfilesStore {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Partial<SavedProfilesStore>

  if (candidate.version !== STORAGE_VERSION) {
    return false
  }

  if (!Array.isArray(candidate.profiles)) {
    return false
  }

  if (
    candidate.lastSelectedProfileId !== null &&
    typeof candidate.lastSelectedProfileId !== "string"
  ) {
    return false
  }

  return candidate.profiles.every(isSavedProfile)
}

function isSavedProfile(value: unknown): value is SavedProfile {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Partial<SavedProfile>

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string" &&
    isSavedProfileDraft(candidate.data)
  )
}

function isSavedProfileDraft(value: unknown): value is SavedProfileDraft {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Partial<SavedProfileDraft>

  return (
    typeof candidate.rawInput === "string" &&
    typeof candidate.maxLevel === "number" &&
    typeof candidate.centerWeight === "number" &&
    typeof candidate.stepAmount === "number" &&
    typeof candidate.algorithm === "string" &&
    typeof candidate.centerPosition === "number" &&
    typeof candidate.normalizeToHundred === "boolean" &&
    (candidate.normalizeEffectiveToHundred === undefined ||
      typeof candidate.normalizeEffectiveToHundred === "boolean") &&
    (candidate.normalizationMode === undefined ||
      candidate.normalizationMode === "none" ||
      candidate.normalizationMode === "weight" ||
      candidate.normalizationMode === "chance")
  )
}