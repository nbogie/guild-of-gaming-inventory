import raw from '../data/games.json'
import type { Inventory, Game } from './types'

export const inventory = raw as Inventory

export const categoryById = Object.fromEntries(inventory.categories.map((c) => [c.id, c]))

export const hasComplexityData = inventory.games.some((g) => g.complexity != null)

export function playersLabel(g: Game): string {
  const { min, max } = g.players
  if (max == null) return `${min}+ players`
  if (min === max) return `${min} players`
  return `${min}-${max} players`
}

export function playtimeLabel(g: Game): string {
  const { min, max } = g.playtimeMinutes
  if (max == null || min === max) return `${min} min`
  return `${min}-${max} min`
}
