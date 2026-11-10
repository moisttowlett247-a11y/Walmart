/**
 * Intelligent Culinary Ingredient Text & Quantity Parser
 * Accurately extracts numerical amount, measurement unit, package size annotations,
 * and pristine culinary food names from raw recipe lines.
 */

export interface ParsedIngredientLine {
  rawText: string;
  amount: number;
  unit: string;
  cleanName: string;
  extractedPackageSize?: string;
}

// Map common unicode fraction symbols to decimal values
const UNICODE_FRACTIONS: Record<string, number> = {
  '½': 0.5,
  '⅓': 0.333,
  '⅔': 0.667,
  '¼': 0.25,
  '¾': 0.75,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
};

export function parseIngredientLine(rawLine: string): ParsedIngredientLine {
  if (!rawLine || typeof rawLine !== 'string') {
    return {
      rawText: '',
      amount: 1,
      unit: 'count',
      cleanName: 'Food item',
    };
  }

  let text = rawLine.trim().replace(/^[-*•\d+.]\s*/, '').trim();

  // 1. Replace unicode fractions with space-separated numbers
  for (const [char, val] of Object.entries(UNICODE_FRACTIONS)) {
    if (text.includes(char)) {
      text = text.replace(new RegExp(char, 'g'), ` ${val} `);
    }
  }

  // 2. Extract package size annotations inside parentheses, e.g. "1 (15 oz) can black beans"
  let extractedPackageSize: string | undefined;
  const pkgSizeMatch = text.match(/\((\s*\d+(?:\.\d+)?\s*(?:oz|fl\s*oz|ounce|ounces|lb|lbs|pound|pounds|g|ml|count|ct)\b[^)]*)\)/i);
  if (pkgSizeMatch) {
    extractedPackageSize = pkgSizeMatch[1].trim();
    // Remove the parenthetical package size from text
    text = text.replace(pkgSizeMatch[0], ' ').trim();
  } else {
    // Remove other non-package parenthetical remarks like (drained), (about 2 cups), (optional)
    text = text.replace(/\([^)]*\)/g, ' ').trim();
  }

  // 3. Extract amount: handle mixed fractions ("1 1/2", "1-1/2"), standalone fractions ("1/2", "3/4"), decimals ("1.5", "0.5"), integers ("4")
  let amount = 1;
  let amountExtracted = false;

  // Try mixed fraction: e.g. "1 1/2" or "2 1/4" or "1-1/2"
  const mixedMatch = text.match(/^(\d+)\s*[- ]\s*(\d+)\/(\d+)\b/);
  if (mixedMatch) {
    const whole = parseFloat(mixedMatch[1]) || 0;
    const num = parseFloat(mixedMatch[2]) || 0;
    const den = parseFloat(mixedMatch[3]) || 1;
    amount = whole + (num / den);
    amountExtracted = true;
    text = text.substring(mixedMatch[0].length).trim();
  }

  // Try simple fraction: e.g. "1/2" or "3/4"
  if (!amountExtracted) {
    const fracMatch = text.match(/^(\d+)\/(\d+)\b/);
    if (fracMatch) {
      const num = parseFloat(fracMatch[1]) || 0;
      const den = parseFloat(fracMatch[2]) || 1;
      amount = num / den;
      amountExtracted = true;
      text = text.substring(fracMatch[0].length).trim();
    }
  }

  // Try decimals or integers: e.g. "1.5", "0.5", "2", "18"
  if (!amountExtracted) {
    const numMatch = text.match(/^(\d+(?:\.\d+)?)\b/);
    if (numMatch) {
      amount = parseFloat(numMatch[1]) || 1;
      amountExtracted = true;
      text = text.substring(numMatch[0].length).trim();
    }
  }

  // 4. Extract standard measurement unit
  let unit = 'count';
  const unitRegex = /^(lbs|lb|pounds|pound|oz|ounces|ounce|cups|cup|tbsp|tablespoons|tablespoon|tbs|tsp|teaspoons|teaspoon|cloves|clove|heads|head|bulbs|bulb|cans|can|jars|jar|bottles|bottle|packages|package|pack|packs|bags|bag|pints|pint|quarts|quart|slices|slice|pieces|piece|stalks|stalk|bunches|bunch|tortillas|tortilla|ears|ear|sprigs|sprig)\b/i;
  const unitMatch = text.match(unitRegex);
  if (unitMatch) {
    unit = unitMatch[1].toLowerCase();
    text = text.substring(unitMatch[0].length).trim();
    // Normalize abbreviations
    if (unit === 'pounds' || unit === 'pound') unit = 'lbs';
    if (unit === 'ounces' || unit === 'ounce') unit = 'oz';
    if (unit === 'tablespoons' || unit === 'tablespoon' || unit === 'tbs') unit = 'tbsp';
    if (unit === 'teaspoons' || unit === 'teaspoon') unit = 'tsp';
    if (unit === 'cups') unit = 'cup';
  } else {
    // If unit was not an explicit measurement word, check if food name is plural count
    unit = 'count';
  }

  // 5. Strip pure preparation instructions and descriptors (minced, diced, chopped, drained, etc.)
  // CRITICAL: We DO NOT strip cuts/descriptors like 'boneless skinless', 'lean', 'chuck roast', 'guajillo'
  const prepWords = [
    'minced', 'diced', 'chopped', 'sliced', 'grated', 'shredded', 'crushed', 'melted',
    'softened', 'divided', 'rinsed', 'drained', 'peeled', 'trimmed', 'seeded', 'stemmed',
    'pitted', 'halved', 'quartered', 'julienned', 'cooked', 'uncooked', 'thawed', 'frozen',
    'room temperature', 'at room temperature', 'to taste', 'for serving', 'for garnish',
    'optional', 'freshly ground', 'coarsely', 'finely', 'thinly', 'thickly', 'packed',
    'loosely', 'cut into strips', 'cut into cubes', 'cut into pieces', 'cut into wedges',
    'at room temp'
  ];

  for (const pw of prepWords) {
    const re = new RegExp(`\\b${pw}\\b`, 'gi');
    text = text.replace(re, ' ');
  }

  // 6. Clean punctuation and excess whitespace
  text = text.replace(/^[,\-\.\s]+|[,\-\.\s]+$/g, '').replace(/\s+/g, ' ').trim();

  // If text became empty, fallback to clean raw line
  const cleanName = text || rawLine.replace(/^[,\-\.\s]+|[,\-\.\s]+$/g, '').trim();

  return {
    rawText: rawLine,
    amount: Math.round(amount * 100) / 100 || 1,
    unit: unit || 'count',
    cleanName,
    extractedPackageSize,
  };
}
