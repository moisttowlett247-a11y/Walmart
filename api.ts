import { Recipe, SubstitutionOption, Ingredient } from '../types';
import { matchWalmartGroceryItem, searchWalmartCatalog, findGreatValueSubstitution } from '../data/walmartGroceryCatalog';
import { parseIngredientLine } from '../utils/ingredientParser';
import { heroImg } from '../assets/images';

function bindIngredientsToWalmartCatalog(ingredients: Ingredient[]): Ingredient[] {
  return (ingredients || []).map((ing, idx) => {
    const authenticName = (ing.name || ing.rawText || 'Food item').trim();
    const match = matchWalmartGroceryItem(authenticName, ing.category);
    const walmartQuery = ing.walmartQuery && ing.walmartQuery.trim() !== '' && !ing.walmartQuery.toLowerCase().includes('undefined')
      ? ing.walmartQuery.trim()
      : match.walmartQuery;
    const packageSize = ing.packageSize && ing.packageSize.trim() !== '' && !ing.packageSize.toLowerCase().includes('standard pack')
      ? ing.packageSize.trim()
      : match.packageSize;
    const itemId = (ing.itemId && /^\d+$/.test(ing.itemId))
      ? ing.itemId
      : (match.itemId && /^\d+$/.test(match.itemId) ? match.itemId : undefined);

    const directUrl = (ing.walmartDirectAddUrl && ing.walmartDirectAddUrl.trim() !== '')
      ? ing.walmartDirectAddUrl
      : (itemId ? `https://www.walmart.com/ip/${itemId}` : `https://www.walmart.com/search?q=${encodeURIComponent(walmartQuery)}`);

    const searchUrl = (ing.walmartSearchUrl && ing.walmartSearchUrl.trim() !== '')
      ? ing.walmartSearchUrl
      : directUrl;

    return {
      ...ing,
      id: ing.id || `ing-${Date.now()}-${idx}`,
      itemId,
      name: authenticName, // NEVER OVERWRITE AUTHENTIC FOOD NAME!
      amount: typeof ing.amount === 'number' && !isNaN(ing.amount) ? ing.amount : 1,
      unit: ing.unit || 'count',
      category: ing.category || match.category || 'Pantry & Dry Goods',
      walmartQuery,
      walmartSearchUrl: searchUrl,
      walmartDirectAddUrl: directUrl,
      brandTier: ing.brandTier || 'great_value',
      estimatedPrice: ing.estimatedPrice && ing.estimatedPrice > 0 ? ing.estimatedPrice : (match.estimatedPrice || 2.48),
      packageSize,
      isPantryStaple: ing.isPantryStaple ?? match.isPantryStaple ?? false,
      inPantry: false, // CRITICAL: NEVER mark in pantry by default! Every item must be added to cart.
    };
  });
}

/**
 * Intelligent Client-Side Recipe Parser for standalone GitHub Pages hosting
 */
function clientSideParseRecipe(recipeText: string, brandPreference: string = 'great_value', customTitle?: string): Recipe {
  const lines = recipeText.split('\n').map((l) => l.trim()).filter(Boolean);
  let title = customTitle && customTitle.trim() ? customTitle.trim() : '';
  let startIndex = 1;

  if (!title) {
    if (lines[0] && !lines[0].startsWith('-') && !lines[0].startsWith('*') && !lines[0].startsWith('•') && !/^\d+/.test(lines[0])) {
      title = lines[0].replace(/^#+\s*/, '');
      startIndex = 1;
    } else {
      title = 'Custom Imported Recipe';
      startIndex = 0;
    }
  } else if (lines[0] && !lines[0].startsWith('-') && !lines[0].startsWith('*') && !lines[0].startsWith('•') && !/^\d+/.test(lines[0])) {
    startIndex = 1;
  } else {
    startIndex = 0;
  }

  const ingredientLines: string[] = [];
  const instructionLines: string[] = [];
  let isIngredients = true;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    if (lower.includes('instruction') || lower.includes('direction') || lower.includes('method') || lower.includes('steps:')) {
      isIngredients = false;
      continue;
    }
    if (lower.includes('ingredient')) {
      isIngredients = true;
      continue;
    }

    if (isIngredients) {
      if (line.startsWith('-') || line.startsWith('*') || /^\d+/.test(line)) {
        ingredientLines.push(line.replace(/^[-*•\d+.]\s*/, ''));
      } else {
        ingredientLines.push(line);
      }
    } else {
      instructionLines.push(line.replace(/^[-*•\d+.]\s*/, ''));
    }
  }

  // If no separate instructions were found, treat lines with amounts as ingredients and the rest as instructions
  if (ingredientLines.length === 0) {
    lines.slice(1).forEach((line) => {
      if (/\d/.test(line) || line.startsWith('-') || line.startsWith('*')) {
        ingredientLines.push(line.replace(/^[-*•]\s*/, ''));
      } else {
        instructionLines.push(line);
      }
    });
  }

  const ingredients: Ingredient[] = ingredientLines.map((line, idx) => {
    const parsed = parseIngredientLine(line);
    const match = matchWalmartGroceryItem(parsed.cleanName);
    const itemId = match.itemId;
    const packageSize = parsed.extractedPackageSize || match.packageSize || '1 package';

    return {
      id: `ing-client-${Date.now()}-${idx}`,
      itemId,
      name: parsed.cleanName,
      rawText: line,
      amount: parsed.amount,
      unit: parsed.unit,
      category: match.category,
      walmartQuery: match.walmartQuery,
      walmartSearchUrl: match.walmartSearchUrl,
      walmartDirectAddUrl: match.walmartSearchUrl,
      brandTier: (brandPreference as any) || 'great_value',
      estimatedPrice: match.estimatedPrice,
      packageSize,
      isPantryStaple: match.isPantryStaple,
      inPantry: false,
    };
  });

  return {
    id: `recipe-${Date.now()}`,
    title,
    description: 'Freshly assembled recipe paired with verified Walmart grocery items.',
    prepTime: '15 mins',
    cookTime: '25 mins',
    servings: 4,
    baseServings: 4,
    cuisine: 'American',
    tags: ['Custom Recipe', 'Quick Prep'],
    image: heroImg,
    instructions: instructionLines.length > 0 ? instructionLines : [
      'Prepare all recipe ingredients.',
      'Cook ingredients according to your preferred technique.',
      'Season to taste and enjoy hot!'
    ],
    ingredients,
    isCustom: true,
    createdAt: Date.now(),
  };
}

/**
 * Intelligent Client-Side Recipe Generator for standalone GitHub Pages hosting
 */
function clientSideGenerateRecipe(prompt: string, servings: number = 4, budget: string = 'budget_friendly', cuisine: string = 'Any', customTitle?: string): Recipe {
  const p = prompt.toLowerCase();
  let title = customTitle && customTitle.trim() ? customTitle.trim() : prompt.trim();
  if (!customTitle && !title.toLowerCase().includes('recipe') && !title.toLowerCase().includes('skillet') && !title.toLowerCase().includes('bowl')) {
    title = `${prompt.trim().charAt(0).toUpperCase() + prompt.trim().slice(1)} Dish`;
  }

  // Derive ingredients based on prompt keywords
  const candidateNames: string[] = [];

  if (p.includes('chicken')) {
    candidateNames.push('Freshness Guaranteed Traditional Rotisserie Chicken (Chilled)', 'Extra Virgin Olive Oil', 'Fresh Garlic Bulbs', 'Fresh Yellow Onions');
  } else if (p.includes('beef') || p.includes('taco') || p.includes('steak')) {
    candidateNames.push('80/20 Ground Beef', 'White Corn Street Taco Tortillas', 'Fresh Yellow Onions', 'Fresh Cilantro');
  } else if (p.includes('pasta') || p.includes('italian')) {
    candidateNames.push('Penne Rigate Pasta', 'Heavy Whipping Cream', 'Grated Parmesan Cheese', 'Extra Virgin Olive Oil', 'Fresh Garlic Bulbs');
  } else if (p.includes('salmon') || p.includes('fish')) {
    candidateNames.push('Atlantic Salmon Fillets', 'Fresh Whole Lemons', 'Unsalted Sweet Cream Butter', 'Fresh Garlic Bulbs');
  } else {
    // General delicious dish with default bagged rotisserie chicken
    candidateNames.push('Freshness Guaranteed Traditional Rotisserie Chicken (Chilled)', 'Long Grain White Rice', 'Fresh Baby Spinach', 'Extra Virgin Olive Oil', 'Fresh Garlic Bulbs');
  }

  // Add seasonings and staples
  candidateNames.push('Salt and Black Pepper');

  const ingredients: Ingredient[] = candidateNames.map((name, idx) => {
    const match = matchWalmartGroceryItem(name);
    return {
      id: `gen-ing-${Date.now()}-${idx}`,
      itemId: match.itemId,
      name: match.name,
      rawText: `1 package ${match.name}`,
      amount: 1,
      unit: 'pack',
      category: match.category,
      walmartQuery: match.walmartQuery,
      walmartSearchUrl: match.walmartSearchUrl,
      walmartDirectAddUrl: match.walmartSearchUrl,
      brandTier: 'great_value',
      estimatedPrice: match.estimatedPrice,
      packageSize: match.packageSize,
      isPantryStaple: match.isPantryStaple,
      inPantry: false, // CRITICAL: NEVER mark in pantry by default! Every item is added to cart.
    };
  });

  return {
    id: `recipe-ai-${Date.now()}`,
    title,
    description: `A delicious ${cuisine !== 'Any' ? cuisine : 'flavorful'} dish planned with Walmart grocery items.`,
    prepTime: '15 mins',
    cookTime: '20 mins',
    servings,
    baseServings: servings,
    cuisine: cuisine !== 'Any' ? cuisine : 'American',
    tags: ['AI Recipe', budget === 'budget_friendly' ? 'Budget Friendly' : 'Gourmet'],
    image: heroImg,
    instructions: [
      'Prepare and shred or dice the fresh ingredients.',
      'Heat olive oil in a skillet or pan over medium-high heat.',
      'Sauté the aromatics and fold in the rotisserie chicken until heated through.',
      'Simmer with sauce and vegetables until tender and fragrant.',
      'Season to taste and serve warm.'
    ],
    ingredients,
    isCustom: true,
    createdAt: Date.now(),
  };
}

/**
 * Intelligent Client-Side Ingredient Substitutions with Great Value store brand priority
 */
function clientSideSubstitutions(ingredientName: string, originalPrice?: number): SubstitutionOption[] {
  const gvOption = findGreatValueSubstitution(ingredientName, originalPrice);
  const catalogMatches = searchWalmartCatalog(ingredientName, 5)
    .filter((m) => m.name.toLowerCase() !== gvOption.name.toLowerCase() && m.itemId !== gvOption.itemId)
    .slice(0, 3)
    .map((m) => ({
      name: m.name,
      explanation: `Verified alternative available at Walmart (${m.packageSize}).`,
      walmartQuery: m.walmartQuery,
      walmartSearchUrl: m.walmartSearchUrl,
      walmartDirectAddUrl: m.itemId ? `https://www.walmart.com/ip/${m.itemId}` : m.walmartSearchUrl,
      itemId: m.itemId,
      estimatedPrice: m.estimatedPrice,
      isGreatValue: m.brand === 'Great Value' || m.name.toLowerCase().includes('great value'),
    }));

  return [gvOption, ...catalogMatches];
}

export async function parseRecipeText(recipeText: string, brandPreference: string = 'great_value', customTitle?: string): Promise<Recipe> {
  try {
    const res = await fetch('/api/recipe/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeText, brandPreference, title: customTitle }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.recipe && data.recipe.ingredients) {
        const boundIngredients = bindIngredientsToWalmartCatalog(data.recipe.ingredients);
        return {
          ...data.recipe,
          title: customTitle?.trim() || data.recipe.title || 'Custom Imported Recipe',
          id: `recipe-${Date.now()}`,
          baseServings: data.recipe.servings || 4,
          image: heroImg,
          ingredients: boundIngredients,
          isCustom: true,
          createdAt: Date.now(),
        };
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable (e.g. GitHub Pages environment). Using client-side recipe parser.', err);
  }

  // Instant zero-failure fallback for static GitHub Pages hosting
  return clientSideParseRecipe(recipeText, brandPreference, customTitle);
}

export async function generateAiRecipe(prompt: string, servings: number = 4, budget: string = 'budget_friendly', cuisine: string = 'Any', customTitle?: string): Promise<Recipe> {
  try {
    const res = await fetch('/api/recipe/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, servings, budget, cuisine, title: customTitle }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.recipe && data.recipe.ingredients) {
        const boundIngredients = bindIngredientsToWalmartCatalog(data.recipe.ingredients);
        return {
          ...data.recipe,
          title: customTitle?.trim() || data.recipe.title || 'Custom AI Recipe',
          id: `recipe-ai-${Date.now()}`,
          baseServings: data.recipe.servings || 4,
          image: heroImg,
          ingredients: boundIngredients,
          isCustom: true,
          createdAt: Date.now(),
        };
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable (e.g. GitHub Pages environment). Using client-side recipe synthesizer.', err);
  }

  // Instant zero-failure fallback for static GitHub Pages hosting
  return clientSideGenerateRecipe(prompt, servings, budget, cuisine, customTitle);
}

export async function getIngredientSubstitutions(ingredientName: string, reason: string = 'budget', originalPrice?: number): Promise<SubstitutionOption[]> {
  try {
    const res = await fetch('/api/recipe/substitute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredientName, reason, originalPrice }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.substitutions && Array.isArray(data.substitutions)) {
        const mapped: SubstitutionOption[] = data.substitutions.map((sub: any) => {
          const match = matchWalmartGroceryItem(sub.name || ingredientName);
          const isGV = (sub.name && sub.name.toLowerCase().includes('great value')) ||
                       (match.brand === 'Great Value') ||
                       (match.name.toLowerCase().includes('great value'));
          return {
            name: match.name,
            explanation: sub.explanation || 'Verified alternative food product at Walmart.',
            walmartQuery: match.walmartQuery,
            walmartSearchUrl: match.walmartSearchUrl,
            walmartDirectAddUrl: match.itemId ? `https://www.walmart.com/ip/${match.itemId}` : match.walmartSearchUrl,
            itemId: match.itemId,
            estimatedPrice: sub.estimatedPrice || match.estimatedPrice,
            isGreatValue: isGV,
            savingsVsOriginal: originalPrice && originalPrice > (sub.estimatedPrice || match.estimatedPrice)
              ? parseFloat((originalPrice - (sub.estimatedPrice || match.estimatedPrice)).toFixed(2))
              : undefined,
          };
        });

        // Ensure at least one Great Value option is at index 0
        const hasGV = mapped.some((s) => s.isGreatValue);
        if (!hasGV) {
          const gvOption = findGreatValueSubstitution(ingredientName, originalPrice);
          return [gvOption, ...mapped];
        }
        return mapped;
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable. Using client-side catalog search for substitutions.', err);
  }

  // Instant zero-failure fallback for static GitHub Pages hosting
  return clientSideSubstitutions(ingredientName, originalPrice);
}

export async function scrapeRecipeFromUrl(url: string, brandPreference: string = 'great_value'): Promise<Recipe> {
  const cleanUrl = url.trim();
  if (!cleanUrl || !/^https?:\/\//i.test(cleanUrl)) {
    throw new Error('Please enter a valid recipe website URL starting with http:// or https://');
  }

  const res = await fetch('/api/recipe/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: cleanUrl, brandPreference }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to scrape recipe (Status: ${res.status})`);
  }

  const data = await res.json();
  if (!data.recipe || !data.recipe.ingredients) {
    throw new Error('No recipe data could be extracted from this webpage.');
  }

  const boundIngredients = bindIngredientsToWalmartCatalog(data.recipe.ingredients);

  return {
    ...data.recipe,
    id: `recipe-scraped-${Date.now()}`,
    baseServings: data.recipe.servings || 4,
    image: data.recipe.image || heroImg,
    ingredients: boundIngredients,
    sourceUrl: cleanUrl,
    isCustom: true,
    createdAt: Date.now(),
  };
}

