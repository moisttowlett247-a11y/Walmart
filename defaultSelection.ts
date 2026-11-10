import { Ingredient, DefaultSelectionSettings } from '../types';

export const COMMON_HOME_STAPLES_PRESETS: { id: string; label: string; keywords: string[] }[] = [
  { id: 'salt_pepper', label: 'Salt & Black Pepper', keywords: ['salt', 'black pepper', 'sea salt', 'kosher salt'] },
  { id: 'cooking_oils', label: 'Olive Oil & Cooking Oils', keywords: ['olive oil', 'vegetable oil', 'canola oil', 'cooking oil', 'extra virgin olive oil'] },
  { id: 'butter', label: 'Butter & Cooking Fats', keywords: ['butter', 'unsalted butter', 'salted butter'] },
  { id: 'garlic_onion', label: 'Garlic & Onions', keywords: ['garlic', 'white onion', 'yellow onion'] },
  { id: 'baking_staples', label: 'Flour & Sugar', keywords: ['flour', 'all-purpose flour', 'sugar', 'granulated sugar', 'brown sugar'] },
  { id: 'condiments', label: 'Soy Sauce & Vinegars', keywords: ['soy sauce', 'vinegar', 'apple cider vinegar'] },
  { id: 'water', label: 'Water & Ice', keywords: ['water', 'tap water', 'ice'] },
];

export const DEFAULT_HOME_STAPLES: string[] = [
  'salt',
  'black pepper',
  'olive oil',
  'cooking oil',
  'butter',
  'flour',
  'sugar',
  'water',
];

export const DEFAULT_SELECTION_SETTINGS: DefaultSelectionSettings = {
  mode: 'all', // Defaults to 'all' as requested: everything selected by default unless configured
  homeStaples: DEFAULT_HOME_STAPLES,
  autoApplyOnOpen: true,
};

/**
 * Checks whether an ingredient matches any keyword in the home staples list
 */
export function isIngredientAHomeStaple(ingredient: Ingredient, homeStaples: string[]): boolean {
  const nameLower = ingredient.name.toLowerCase();
  const rawLower = (ingredient.rawText || '').toLowerCase();
  const category = (ingredient.category || '').toLowerCase();

  // Frozen pizzas, ramen, and prepared entrees are never pantry staples
  if (category.includes('frozen') || nameLower.includes('pizza') || nameLower.includes('ramen')) {
    return false;
  }

  return homeStaples.some((staple) => {
    const s = staple.toLowerCase().trim();
    if (!s) return false;
    try {
      const regex = new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(nameLower) || regex.test(rawLower);
    } catch {
      return nameLower === s;
    }
  });
}

/**
 * Determines whether an ingredient should be selected by default based on user settings
 */
export function shouldSelectIngredientByDefault(
  ingredient: Ingredient,
  settings: DefaultSelectionSettings
): boolean {
  // If explicitly flagged in pantry by the user, do not select by default
  if (ingredient.inPantry) {
    return false;
  }

  // Mode: All ingredients selected
  if (settings.mode === 'all') {
    return true;
  }

  // Mode: Only fresh perishables & proteins (also include Frozen main foods like pizza so user is never stranded)
  if (settings.mode === 'perishables_only') {
    return ['Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery', 'Frozen'].includes(ingredient.category);
  }

  // Mode: Exclude home staples
  if (settings.mode === 'exclude_staples') {
    const isStaple = isIngredientAHomeStaple(ingredient, settings.homeStaples);
    return !isStaple;
  }

  return true;
}

/**
 * Calculates the initial Set of selected ingredient IDs for any recipe (custom or pre-made)
 */
export function applyDefaultSelectionToRecipe(
  ingredients: Ingredient[],
  settings: DefaultSelectionSettings
): Set<string> {
  const selected = new Set<string>();
  ingredients.forEach((ing) => {
    if (shouldSelectIngredientByDefault(ing, settings)) {
      selected.add(ing.id);
    }
  });
  return selected;
}
