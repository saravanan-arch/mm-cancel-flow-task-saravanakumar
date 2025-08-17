/**
 * A/B Testing Utilities
 * Provides cryptographically secure random variant assignment for deterministic A/B testing
 */

/**
 * Generate a cryptographically secure random variant (A or B)
 * Uses crypto.getRandomValues() for secure randomness
 * @returns "A" or "B"
 */
export function generateSecureVariant(): "A" | "B" {
  // Use crypto.getRandomValues for cryptographically secure randomness
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  
  // Convert to 0 or 1, then map to A or B
  const randomBit = array[0] % 2;
  return randomBit === 0 ? "A" : "B";
}

/**
 * Generate a deterministic variant based on user ID
 * This ensures the same user always gets the same variant
 * @param userId - The user's unique identifier
 * @returns "A" or "B"
 */
export function generateDeterministicVariant(userId: string): "A" | "B" {
  // Create a simple hash of the user ID for deterministic assignment
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use the hash to determine variant (50/50 split)
  return Math.abs(hash) % 2 === 0 ? "A" : "B";
}

/**
 * Get or assign variant for a user
 * If no variant exists, generates and assigns one
 * @param userId - The user's unique identifier
 * @param existingVariant - Existing variant if any
 * @returns "A" or "B"
 */
export function getOrAssignVariant(userId: string, existingVariant?: "A" | "B"): "A" | "B" {
  // If variant already exists, reuse it (never re-randomize)
  if (existingVariant) {
    return existingVariant;
  }
  
  // For new users, generate deterministic variant
  return generateDeterministicVariant(userId);
}

/**
 * Check if a variant should show the downsell offer
 * @param variant - The user's assigned variant
 * @returns true if downsell offer should be shown
 */
export function shouldShowDownsellOffer(variant: "A" | "B"): boolean {
  // Variant B shows the downsell offer
  return variant === "B";
}
