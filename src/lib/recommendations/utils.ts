import { FoundationLevel } from './types';

// Memoized foundation multiplier calculation
const foundationMultiplierCache = new Map<FoundationLevel, number>();

export function getFoundationMultiplier(level: FoundationLevel): number {
  if (foundationMultiplierCache.has(level)) {
    return foundationMultiplierCache.get(level)!;
  }

  let multiplier: number;
  switch (level) {
    case FoundationLevel.BEGINNER:
      multiplier = 1.0;
      break;
    case FoundationLevel.MODERATE:
      multiplier = 0.7;
      break;
    case FoundationLevel.ADVANCED:
      multiplier = 0.4;
      break;
  }

  foundationMultiplierCache.set(level, multiplier);
  return multiplier;
}

// Memoized time urgency calculation
const timeUrgencyCache = new Map<number, number>();

export function getTimeUrgency(daysLeft: number): number {
  if (timeUrgencyCache.has(daysLeft)) {
    return timeUrgencyCache.get(daysLeft)!;
  }

  const urgency = Math.min(100, Math.exp((60 - daysLeft) / 20) * 20);
  timeUrgencyCache.set(daysLeft, urgency);
  return urgency;
}

// Clear caches
export function clearUtilCaches(): void {
  foundationMultiplierCache.clear();
  timeUrgencyCache.clear();
} 