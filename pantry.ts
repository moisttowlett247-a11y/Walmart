import { Ingredient } from '../types';

/**
 * Escapes regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Determines whether an ingredient matches an item in the user's global pantry.
 * Safe matching:
 * 1. Exact normalized name match
 * 2. Exact Walmart Item ID match
 * 3. Whole-word boundary match for multi-word items (e.g. "black pepper", "olive oil")
 * 4. Strict prevention of partial word substrings (e.g. "pepper" will NEVER match "pepperoni")
 * 5. Main prepared meals & frozen pizzas/ramen never auto-match generic staple keywords
 */
export function isItemInGlobalPantry(
  ing: { name: string; rawText?: string; walmartQuery?: string; itemId?: string; category?: string },
  pantrySet: Set<string>
): boolean {
  if (!pantrySet || pantrySet.size === 0) return false;
  const lowerName = ing.name.toLowerCase().trim();
  const lowerRaw = (ing.rawText || '').toLowerCase().trim();
  const category = (ing.category || '').toLowerCase();

  // Entrees, frozen pizzas, and main dishes should not accidentally match generic staples
  const isMainDishOrFrozen = category.includes('frozen') || category.includes('meat') || lowerName.includes('pizza') || lowerName.includes('ramen');

  for (const item of pantrySet) {
    const lItem = item.toLowerCase().trim();
    if (!lItem || lItem.length < 2) continue;

    // 1. Exact Item ID match
    if (ing.itemId && /^\d+$/.test(lItem) && ing.itemId === lItem) {
      return true;
    }

    // 2. Exact full name match
    if (lowerName === lItem) {
      return true;
    }

    // 3. For main dishes/frozen pizza/ramen, only match if the pantry item explicitly names the specific food
    if (isMainDishOrFrozen) {
      if (lItem === lowerName || (lItem.length >= 7 && lowerName.includes(lItem))) {
        return true;
      }
      continue;
    }

    // 4. Whole-word boundary regex match (e.g. \bblack pepper\b, \bsalt\b)
    // NEVER allow partial substring matches (e.g. "pepper" inside "pepperoni", "ice" inside "rice")
    try {
      const regex = new RegExp(`\\b${escapeRegex(lItem)}\\b`, 'i');
      if (regex.test(lowerName) || regex.test(lowerRaw)) {
        return true;
      }
    } catch {
      if (lowerName === lItem) return true;
    }
  }

  return false;
}

export function isIngredientInPantry(ing: Ingredient, pantrySet?: Set<string>): boolean {
  if (ing.inPantry) return true;
  if (pantrySet && isItemInGlobalPantry(ing, pantrySet)) return true;
  return false;
}
