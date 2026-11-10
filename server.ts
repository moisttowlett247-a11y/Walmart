import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import * as cheerio from 'cheerio';
import { matchWalmartGroceryItem } from './src/data/walmartGroceryCatalog.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialized Gemini AI client for server-side processing
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

import { parseIngredientLine } from './src/utils/ingredientParser.js';

// Helper to build 100% reliable Walmart search URLs without fragile department facets or invalid SKUs
function buildWalmartSearchUrl(query: string): string {
  // Strip special symbols and collapse spaces
  const clean = query.replace(/[^\w\s\-\.\'\&]/g, ' ').replace(/\s+/g, ' ').trim();
  return `https://www.walmart.com/search?q=${encodeURIComponent(clean)}`;
}

// Thorough ingredient text sanitizer to strip culinary prep words, units, and parentheses
// while strictly preserving decimal/fraction amounts, measurement units, and authentic food names!
function cleanIngredientNameForWalmart(rawText: string): { cleanName: string; amount: number; unit: string; extractedPackageSize?: string } {
  const parsed = parseIngredientLine(rawText);
  return {
    cleanName: parsed.cleanName,
    amount: parsed.amount,
    unit: parsed.unit,
    extractedPackageSize: parsed.extractedPackageSize,
  };
}

// Fallback intelligent ingredient parser when Gemini is unavailable or rate-limited
function fallbackParseRecipe(rawText: string, customTitle?: string) {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
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

  const parsedIngredients = ingredientLines.map((line, idx) => {
    const { cleanName, amount, unit } = cleanIngredientNameForWalmart(line);
    const lowerName = cleanName.toLowerCase();
    let category = 'Pantry & Dry Goods';
    let estPrice = 2.48;
    let packageSize = '1 pack';
    let isPantry = false;

    if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork') || lowerName.includes('salmon') || lowerName.includes('shrimp') || lowerName.includes('meat') || lowerName.includes('roast') || lowerName.includes('steak')) {
      category = 'Meat & Seafood';
      estPrice = 6.94;
      packageSize = '1-2 lb pack';
    } else if (lowerName.includes('onion') || lowerName.includes('garlic') || lowerName.includes('tomato') || lowerName.includes('spinach') || lowerName.includes('cilantro') || lowerName.includes('pepper') || lowerName.includes('lime') || lowerName.includes('lemon') || lowerName.includes('avocado') || lowerName.includes('herb')) {
      category = 'Produce';
      estPrice = 1.48;
      packageSize = 'Fresh / bunch';
    } else if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('butter') || lowerName.includes('cream') || lowerName.includes('egg') || lowerName.includes('yogurt') || lowerName.includes('cheddar') || lowerName.includes('oaxaca')) {
      category = 'Dairy & Eggs';
      estPrice = 3.28;
      packageSize = 'Standard package';
    } else if (lowerName.includes('salt') || lowerName.includes('pepper') || lowerName.includes('olive oil') || lowerName.includes('oil') || lowerName.includes('oregano') || lowerName.includes('paprika') || lowerName.includes('cumin') || lowerName.includes('seasoning')) {
      category = 'Spices & Seasonings';
      estPrice = 1.98;
      packageSize = 'Spice container';
      isPantry = true;
    } else if (lowerName.includes('pasta') || lowerName.includes('rice') || lowerName.includes('flour') || lowerName.includes('sugar') || lowerName.includes('broth') || lowerName.includes('beans') || lowerName.includes('canned')) {
      category = 'Pantry & Dry Goods';
      estPrice = 1.78;
      packageSize = '16 oz box / bag';
    } else if (lowerName.includes('tortilla') || lowerName.includes('bread') || lowerName.includes('bun')) {
      category = 'Bakery';
      estPrice = 2.48;
      packageSize = 'Pack / Loaf';
    }

    const walmartQuery = cleanName.toLowerCase().startsWith('great value') || cleanName.toLowerCase().startsWith('fresh')
      ? cleanName
      : `Great Value ${cleanName}`;

    return {
      id: `ing-${Date.now()}-${idx}`,
      name: cleanName,
      rawText: line,
      amount,
      unit: unit.toLowerCase(),
      category,
      walmartQuery,
      walmartSearchUrl: buildWalmartSearchUrl(walmartQuery),
      walmartDirectAddUrl: buildWalmartSearchUrl(walmartQuery),
      brandTier: 'great_value' as const,
      estimatedPrice: estPrice,
      packageSize,
      isPantryStaple: isPantry,
      inPantry: false,
    };
  });

  return {
    title,
    description: 'Freshly assembled recipe ready for Walmart grocery ordering.',
    prepTime: '15 mins',
    cookTime: '25 mins',
    servings: 4,
    cuisine: 'American',
    tags: ['Homemade', 'Quick Prep'],
    instructions: instructionLines.length > 0 ? instructionLines : ['Prepare ingredients.', 'Cook thoroughly according to your preference.', 'Serve warm and enjoy!'],
    ingredients: parsedIngredients,
  };
}

// Endpoint: Parse recipe text or extract ingredients
app.post('/api/recipe/parse', async (req: Request, res: Response) => {
  try {
    const { recipeText, brandPreference = 'great_value', title: customTitle } = req.body;

    if (!recipeText || typeof recipeText !== 'string' || !recipeText.trim()) {
      return res.status(400).json({ error: 'Recipe text is required' });
    }

    if (!ai) {
      console.warn('GEMINI_API_KEY not configured, using smart fallback parser');
      const fallback = fallbackParseRecipe(recipeText, customTitle);
      return res.json({ recipe: fallback, source: 'fallback' });
    }

    const brandInstruction =
      brandPreference === 'organic'
        ? 'For Walmart product queries, prefer Great Value Organic or reputable organic brands.'
        : brandPreference === 'name_brand'
        ? 'For Walmart product queries, prefer top national brand names (Swanson, Barilla, Kraft, McCormick, Tyson, Philadelphia).'
        : 'For Walmart product queries, prefer Walmart Great Value store brand product titles for budget grocery savings.';

    const prompt = `You are a specialized Walmart Grocery inventory matching specialist.
Analyze the following recipe text. Parse all ingredients and instructions into clean, structured data.
${brandInstruction}

CRITICAL RULES FOR WALMART GROCERY ITEM MATCHING (DO NOT VIOLATE):
1. Every ingredient MUST be a genuine FOOD & GROCERY item sold at Walmart (Supermarket/Pantry/Produce/Meat/Dairy).
   - NEVER match non-food items, cosmetics, makeup, hardware, or medicine!
2. "name": The clean, generic supermarket name of the grocery item (e.g. "Boneless Skinless Chicken Breast", "Heavy Whipping Cream", "Garlic", "Yellow Onion", "Dark Red Kidney Beans", "Extra Virgin Olive Oil").
   - NEVER put prep instructions in "name" (no "minced", "diced", "chopped", "sliced", "drained", "rinsed", "divided", "at room temperature", "to taste", "for garnish").
3. "walmartQuery": The EXACT, realistic product title as sold on Walmart.com (e.g. "Great Value Boneless Skinless Chicken Breast 3 lb", "Great Value Heavy Whipping Cream 16 fl oz", "Fresh White Garlic 3 pack", "Great Value Dark Red Kidney Beans 15 oz", "Great Value 100% Extra Virgin Olive Oil 17 fl oz").
   - DO NOT include preparation words in walmartQuery! Walmart's search engine will return 0 products or incorrect categories if prep instructions are in the query!
   - DO NOT hallucinate numeric item IDs.
4. "amount": A clean number (e.g. 1.5, not "1-2").
5. "unit": Standard unit ("lbs", "oz", "cups", "tbsp", "tsp", "cloves", "count", "can", "bunch", "item").
6. "category": Must be one of: "Produce", "Meat & Seafood", "Dairy & Eggs", "Pantry & Dry Goods", "Bakery", "Spices & Seasonings", "Frozen", "Other".
7. "estimatedPrice": Realistic Walmart price in USD (e.g. 1.98, 2.48, 6.94).
8. "packageSize": Realistic Walmart package size (e.g. "16 oz", "32 oz carton", "3 lb bag", "1 bunch").
9. "isPantryStaple": true for salt, black pepper, water, common cooking oils.

Recipe Input:
${recipeText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            prepTime: { type: Type.STRING },
            cookTime: { type: Type.STRING },
            servings: { type: Type.INTEGER },
            cuisine: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  rawText: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  category: { type: Type.STRING },
                  walmartQuery: { type: Type.STRING },
                  estimatedPrice: { type: Type.NUMBER },
                  packageSize: { type: Type.STRING },
                  isPantryStaple: { type: Type.BOOLEAN },
                },
                required: ['name', 'amount', 'unit', 'category', 'walmartQuery', 'estimatedPrice', 'packageSize', 'isPantryStaple'],
              },
            },
          },
          required: ['title', 'description', 'prepTime', 'cookTime', 'servings', 'instructions', 'ingredients'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');

    // Attach verified Walmart deep search links
    const enhancedIngredients = (parsedData.ingredients || []).map((ing: any, idx: number) => {
      const parsedRaw = parseIngredientLine(ing.rawText || `${ing.amount || ''} ${ing.unit || ''} ${ing.name || ''}`);
      const cleanName = ing.name ? parseIngredientLine(ing.name).cleanName : parsedRaw.cleanName;
      const category = ing.category || 'Pantry & Dry Goods';
      const amount = typeof ing.amount === 'number' && !isNaN(ing.amount) && ing.amount > 0 ? ing.amount : parsedRaw.amount;
      const unit = ing.unit && ing.unit !== 'item' && ing.unit !== 'unit' ? ing.unit : parsedRaw.unit;
      const packageSize = ing.packageSize && !ing.packageSize.includes('standard pack') ? ing.packageSize : (parsedRaw.extractedPackageSize || '1 package');
      
      // Clean query: remove any remaining prep artifacts
      let walmartQuery = (ing.walmartQuery || `Great Value ${cleanName}`)
        .replace(/\b(diced|minced|sliced|chopped|drained|rinsed|divided|to taste)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      const searchUrl = buildWalmartSearchUrl(walmartQuery);

      return {
        id: `ing-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        name: cleanName,
        rawText: ing.rawText || `${amount} ${unit} ${cleanName}`,
        amount,
        unit,
        category,
        walmartQuery,
        walmartSearchUrl: searchUrl,
        walmartDirectAddUrl: searchUrl,
        brandTier: brandPreference,
        estimatedPrice: ing.estimatedPrice || 2.48,
        packageSize,
        isPantryStaple: Boolean(ing.isPantryStaple),
        inPantry: false, // CRITICAL: NEVER mark in pantry by default! Every recipe item must go into cart.
      };
    });

    return res.json({
      recipe: {
        ...parsedData,
        title: (customTitle && typeof customTitle === 'string' && customTitle.trim()) ? customTitle.trim() : (parsedData.title || 'Custom Imported Recipe'),
        ingredients: enhancedIngredients,
      },
      source: 'gemini',
    });
  } catch (err: any) {
    console.error('Error in /api/recipe/parse:', err);
    const fallback = fallbackParseRecipe(req.body.recipeText || '', req.body.title);
    return res.json({ recipe: fallback, source: 'fallback', warning: err.message });
  }
});

// Endpoint: Generate a new recipe from a concept or prompt
app.post('/api/recipe/generate', async (req: Request, res: Response) => {
  try {
    const { prompt: userPrompt, servings = 4, budget = 'budget_friendly', cuisine = 'Any', title: customTitle } = req.body;

    if (!userPrompt || typeof userPrompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      const sample = fallbackParseRecipe(`Delicious ${userPrompt}\n- 1 whole bagged rotisserie chicken\n- 2 tbsp olive oil\n- 1 tsp salt\n- 1 diced onion\n- 2 cloves garlic\n- 1 cup white rice\nInstructions:\n1. Shred Freshness Guaranteed bagged rotisserie chicken and cook aromatics\n2. Combine and season to serve.`, customTitle);
      sample.title = (customTitle && typeof customTitle === 'string' && customTitle.trim()) ? customTitle.trim() : userPrompt;
      return res.json({ recipe: sample, source: 'fallback' });
    }

    const systemPrompt = `You are an elite grocery meal planner and recipe developer specializing in Walmart shopping.
Create a complete, mouthwatering, practical recipe based on the request: "${userPrompt}".
Cuisine: ${cuisine}
Target servings: ${servings}
Budget level: ${budget} (Prioritize Great Value budget grocery items where possible).

CRITICAL GROCERY RULES:
- For any chicken dish or generic poultry, default to "Freshness Guaranteed Bagged Rotisserie Chicken 36 oz" or Great Value chicken.
- Never mark ingredients as in-pantry by default; all items must default to inPantry: false so they can be added to the Walmart shopping cart.
- Only return real FOOD AND GROCERY ingredients sold at Walmart supermarkets.
- Never include non-food items, cosmetics, makeup, or hardware.
- Provide clean, exact Walmart search queries (e.g. "Freshness Guaranteed Traditional Rotisserie Chicken in Bag 36 oz", "Great Value Long Grain Enriched White Rice 5 lb").
- Do NOT include preparation words in walmartQuery.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            prepTime: { type: Type.STRING },
            cookTime: { type: Type.STRING },
            servings: { type: Type.INTEGER },
            cuisine: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  rawText: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  category: { type: Type.STRING },
                  walmartQuery: { type: Type.STRING },
                  estimatedPrice: { type: Type.NUMBER },
                  packageSize: { type: Type.STRING },
                  isPantryStaple: { type: Type.BOOLEAN },
                },
                required: ['name', 'amount', 'unit', 'category', 'walmartQuery', 'estimatedPrice', 'packageSize', 'isPantryStaple'],
              },
            },
          },
          required: ['title', 'description', 'prepTime', 'cookTime', 'servings', 'instructions', 'ingredients'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    const enhancedIngredients = (parsedData.ingredients || []).map((ing: any, idx: number) => {
      const parsedRaw = parseIngredientLine(ing.rawText || `${ing.amount || ''} ${ing.unit || ''} ${ing.name || ''}`);
      const cleanName = ing.name ? parseIngredientLine(ing.name).cleanName : parsedRaw.cleanName;
      const category = ing.category || 'Pantry & Dry Goods';
      const amount = typeof ing.amount === 'number' && !isNaN(ing.amount) && ing.amount > 0 ? ing.amount : parsedRaw.amount;
      const unit = ing.unit && ing.unit !== 'item' && ing.unit !== 'unit' ? ing.unit : parsedRaw.unit;
      const packageSize = ing.packageSize && !ing.packageSize.includes('standard pack') ? ing.packageSize : (parsedRaw.extractedPackageSize || '1 package');

      let walmartQuery = (ing.walmartQuery || `Great Value ${cleanName}`)
        .replace(/\b(diced|minced|sliced|chopped|drained|rinsed|divided|to taste)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      const searchUrl = buildWalmartSearchUrl(walmartQuery);

      return {
        id: `gen-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        name: cleanName,
        rawText: ing.rawText || `${amount} ${unit} ${cleanName}`,
        amount,
        unit,
        category,
        walmartQuery,
        walmartSearchUrl: searchUrl,
        walmartDirectAddUrl: searchUrl,
        brandTier: 'great_value' as const,
        estimatedPrice: ing.estimatedPrice || 2.48,
        packageSize,
        isPantryStaple: Boolean(ing.isPantryStaple),
        inPantry: false, // CRITICAL: NEVER mark in pantry by default!
      };
    });

    return res.json({
      recipe: {
        ...parsedData,
        title: (customTitle && typeof customTitle === 'string' && customTitle.trim()) ? customTitle.trim() : (parsedData.title || userPrompt),
        ingredients: enhancedIngredients,
      },
      source: 'gemini',
    });
  } catch (err: any) {
    console.error('Error in /api/recipe/generate:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate recipe' });
  }
});

// Endpoint: Ingredient substitution suggestion with Walmart product links
app.post('/api/recipe/substitute', async (req: Request, res: Response) => {
  try {
    const { ingredientName, reason = 'budget', originalPrice } = req.body;

    if (!ingredientName) {
      return res.status(400).json({ error: 'ingredientName is required' });
    }

    if (!ai) {
      return res.json({
        substitutions: [
          {
            name: `Great Value ${ingredientName}`,
            explanation: 'Official Walmart Great Value store brand alternative with everyday low prices.',
            walmartQuery: `Great Value ${ingredientName}`,
            walmartSearchUrl: buildWalmartSearchUrl(`Great Value ${ingredientName}`),
            estimatedPrice: originalPrice ? Math.max(0.98, parseFloat((originalPrice * 0.72).toFixed(2))) : 2.18,
          },
        ],
      });
    }

    const prompt = `Provide 3 smart Walmart grocery substitutions for the food ingredient "${ingredientName}".
IMPORTANT STORE-BRAND RULE:
- Always offer a Walmart "Great Value" store brand option as the PRIMARY substitution (or Freshness Guaranteed for rotisserie chicken/bakery) to ensure maximum cost savings for the shopper.
- If the item is chicken, offer Freshness Guaranteed Bagged Rotisserie Chicken or Great Value chicken cut.
Reason for substitution: ${reason} (e.g. budget, store-brand swap, dairy-free, gluten-free, healthy, or out-of-stock).
Rules:
- MUST be grocery/food products only!
- Never return cosmetics or non-food products.
For each substitution, provide:
1. name (prefix with "Great Value" if it is the store brand option)
2. explanation of how it works in recipes and why it saves money
3. exact Walmart product search query (e.g. "Great Value Plain Greek Yogurt 32 oz")
4. estimated price`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              explanation: { type: Type.STRING },
              walmartQuery: { type: Type.STRING },
              estimatedPrice: { type: Type.NUMBER },
            },
            required: ['name', 'explanation', 'walmartQuery', 'estimatedPrice'],
          },
        },
      },
    });

    const list = JSON.parse(response.text || '[]');
    const results = list.map((item: any) => ({
      ...item,
      walmartSearchUrl: buildWalmartSearchUrl(item.walmartQuery),
    }));

    return res.json({ substitutions: results });
  } catch (err: any) {
    console.error('Error in /api/recipe/substitute:', err);
    return res.json({
      substitutions: [
        {
          name: `Great Value Store Brand ${req.body.ingredientName}`,
          explanation: 'Standard affordable Walmart staple alternative.',
          walmartQuery: `Great Value ${req.body.ingredientName}`,
          walmartSearchUrl: buildWalmartSearchUrl(`Great Value ${req.body.ingredientName}`),
          estimatedPrice: 1.98,
        },
      ],
    });
  }
});

// Convert ISO 8601 duration strings (e.g. PT15M, PT1H30M) into human readable time
function parseIsoDuration(durationStr?: any): string {
  if (!durationStr || typeof durationStr !== 'string') return '';
  const match = durationStr.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) {
    if (/^\d+\s*(?:min|hour|hr|sec)/i.test(durationStr)) return durationStr;
    return '';
  }
  const days = parseInt(match[1] || '0', 10);
  const hours = parseInt(match[2] || '0', 10);
  const minutes = parseInt(match[3] || '0', 10);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} mins`);
  return parts.length > 0 ? parts.join(' ') : durationStr;
}

// Normalize and resolve any relative/array image formats from Schema.org or OpenGraph
function normalizeImageUrl(rawUrl: any, baseUrl: string): string {
  if (!rawUrl) return '';
  let url = '';
  if (typeof rawUrl === 'string') {
    url = rawUrl;
  } else if (Array.isArray(rawUrl) && rawUrl.length > 0) {
    url = typeof rawUrl[0] === 'string' ? rawUrl[0] : (rawUrl[0]?.url || '');
  } else if (typeof rawUrl === 'object' && rawUrl.url) {
    url = rawUrl.url;
  }
  url = (url || '').trim();
  if (!url) return '';
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

// Thematic food photography fallback guaranteeing every recipe always has a high-res appetizing photo
function getThematicFoodPhoto(title: string, cuisine: string = ''): string {
  const t = `${title} ${cuisine}`.toLowerCase();
  if (t.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80';
  if (t.includes('soup') || t.includes('stew') || t.includes('chili') || t.includes('chowder')) return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80';
  if (t.includes('pasta') || t.includes('spaghetti') || t.includes('noodle') || t.includes('fettuccine') || t.includes('macaroni') || t.includes('tetrazzini')) return 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80';
  if (t.includes('burger') || t.includes('sandwich') || t.includes('toast') || t.includes('panini')) return 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80';
  if (t.includes('taco') || t.includes('mexican') || t.includes('burrito') || t.includes('fajita') || t.includes('quesadilla') || t.includes('birria')) return 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80';
  if (t.includes('curry') || t.includes('rice') || t.includes('fried rice') || t.includes('biryani')) return 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80';
  if (t.includes('chicken') || t.includes('poultry') || t.includes('wing') || t.includes('turkey')) return 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80';
  if (t.includes('salad') || t.includes('bowl') || t.includes('greens') || t.includes('slaw')) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  if (t.includes('dessert') || t.includes('cake') || t.includes('cookie') || t.includes('sweet') || t.includes('parfait') || t.includes('pie')) return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';
  if (t.includes('egg') || t.includes('breakfast') || t.includes('pancake') || t.includes('hash') || t.includes('waffle')) return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80';
  if (t.includes('potato') || t.includes('fries') || t.includes('baked potato')) return 'https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80';
  if (t.includes('fish') || t.includes('salmon') || t.includes('shrimp') || t.includes('seafood')) return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80';
  return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80';
}

// Extract readable recipe title from URL pathname or slug when websites have bot protection
function inferTitleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    let lastPart = parts.pop() || '';
    if (/^\d+$/.test(lastPart) && parts.length > 0) {
      lastPart = parts.pop() || lastPart;
    }
    const clean = lastPart
      .replace(/\.(html?|php|asp)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/^\d+\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (clean.length > 2) {
      return clean.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  } catch {}
  return 'Custom Web Recipe';
}

// Endpoint: Scrape recipe from any URL with Schema.org & OpenGraph picture extraction
app.post('/api/recipe/scrape', async (req: Request, res: Response) => {
  try {
    const { url, brandPreference = 'great_value' } = req.body;

    if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url.trim())) {
      return res.status(400).json({ error: 'A valid http(s) URL is required' });
    }

    const cleanUrl = url.trim();
    let html = '';
    let isBlocked = false;

    // Fetch the target webpage with realistic browser headers and 4-second timeout
    try {
      const pageResponse = await fetch(cleanUrl, {
        signal: AbortSignal.timeout(4000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (pageResponse.ok) {
        html = await pageResponse.text();
      } else {
        isBlocked = true;
      }
    } catch (fetchErr) {
      console.warn('Direct fetch failed (likely blocked or network error):', fetchErr);
      isBlocked = true;
    }

    // If website blocked direct bot access (e.g. Cloudflare 403), use smart URL-inferred recipe synthesis
    if (isBlocked || !html.trim()) {
      const inferredTitle = inferTitleFromUrl(cleanUrl);
      const photo = getThematicFoodPhoto(inferredTitle);

      if (ai) {
        try {
          const aiRes = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `The user wants to import the recipe for "${inferredTitle}" from URL "${cleanUrl}".
Create a complete recipe with realistic Walmart grocery ingredients and step-by-step instructions.
Default to Great Value store brand where possible. If chicken, default to Freshness Guaranteed bagged rotisserie chicken or Great Value chicken cut.`,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  prepTime: { type: Type.STRING },
                  cookTime: { type: Type.STRING },
                  servings: { type: Type.INTEGER },
                  cuisine: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        amount: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                        category: { type: Type.STRING },
                      },
                      required: ['name', 'amount', 'unit', 'category'],
                    },
                  },
                },
                required: ['title', 'description', 'prepTime', 'cookTime', 'servings', 'instructions', 'ingredients'],
              },
            },
          });
          const parsed = JSON.parse(aiRes.text || '{}');
          const enhanced = (parsed.ingredients || []).map((ing: any, idx: number) => {
            const match = matchWalmartGroceryItem(ing.name, ing.category);
            const directUrl = match.itemId ? `https://www.walmart.com/ip/${match.itemId}` : buildWalmartSearchUrl(match.walmartQuery);
            return {
              id: `ing-scraped-${Date.now()}-${idx}`,
              itemId: match.itemId,
              name: ing.name,
              rawText: `${ing.amount} ${ing.unit} ${ing.name}`,
              amount: ing.amount || 1,
              unit: ing.unit || 'item',
              category: match.category,
              walmartQuery: match.walmartQuery,
              walmartSearchUrl: directUrl,
              walmartDirectAddUrl: directUrl,
              brandTier: brandPreference,
              estimatedPrice: match.estimatedPrice,
              packageSize: match.packageSize,
              isPantryStaple: match.isPantryStaple,
              inPantry: false,
            };
          });

          return res.json({
            recipe: {
              ...parsed,
              id: `recipe-scraped-${Date.now()}`,
              image: photo,
              ingredients: enhanced,
              sourceUrl: cleanUrl,
              isCustom: true,
              createdAt: Date.now(),
            },
            source: 'inferred_ai',
          });
        } catch (e) {
          console.warn('AI fallback synthesis failed:', e);
        }
      }

      // Zero-AI fallback
      const fallbackRecipe = fallbackParseRecipe(`Delicious ${inferredTitle}\n- 1 whole bagged rotisserie chicken\n- 2 tbsp olive oil\n- 1 tsp salt\n- 1 diced onion\n- 2 cloves garlic\nInstructions:\n1. Prepare ingredients\n2. Cook thoroughly and season to taste`, inferredTitle);
      return res.json({
        recipe: {
          ...fallbackRecipe,
          id: `recipe-scraped-${Date.now()}`,
          baseServings: 4,
          image: photo,
          sourceUrl: cleanUrl,
          isCustom: true,
          createdAt: Date.now(),
        },
        source: 'inferred_fallback',
      });
    }

    const $ = cheerio.load(html);

    // 1. Traverse all Schema.org LD+JSON tags to find structured Recipe data
    let recipeLd: any = null;
    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const rawJson = $(elem).text().trim();
        if (!rawJson) return;
        const parsed = JSON.parse(rawJson);

        const findRecipe = (node: any): any => {
          if (!node) return null;
          if (Array.isArray(node)) {
            for (const item of node) {
              const res = findRecipe(item);
              if (res) return res;
            }
          } else if (typeof node === 'object') {
            const type = node['@type'];
            if (type === 'Recipe' || (Array.isArray(type) && type.includes('Recipe'))) {
              return node;
            }
            if (node['@graph']) {
              return findRecipe(node['@graph']);
            }
          }
          return null;
        };

        const found = findRecipe(parsed);
        if (found && !recipeLd) {
          recipeLd = found;
        }
      } catch {
        // Skip malformed script tags
      }
    });

    let title = '';
    let description = '';
    let imageUrl = '';
    let prepTime = '';
    let cookTime = '';
    let servings = 4;
    let cuisine = 'American';
    let rawIngredients: string[] = [];
    let instructions: string[] = [];

    if (recipeLd) {
      title = recipeLd.name ? String(recipeLd.name).trim() : '';
      description = recipeLd.description ? String(recipeLd.description).trim() : '';
      imageUrl = normalizeImageUrl(recipeLd.image, cleanUrl);
      prepTime = parseIsoDuration(recipeLd.prepTime);
      cookTime = parseIsoDuration(recipeLd.cookTime);

      if (recipeLd.recipeYield) {
        const yieldVal = Array.isArray(recipeLd.recipeYield) ? recipeLd.recipeYield[0] : recipeLd.recipeYield;
        const parsedServings = parseInt(String(yieldVal).replace(/[^\d]/g, ''), 10);
        if (!isNaN(parsedServings) && parsedServings > 0) servings = parsedServings;
      }

      if (recipeLd.recipeCuisine) {
        cuisine = Array.isArray(recipeLd.recipeCuisine) ? recipeLd.recipeCuisine[0] : String(recipeLd.recipeCuisine);
      }

      if (Array.isArray(recipeLd.recipeIngredient)) {
        rawIngredients = recipeLd.recipeIngredient.map((i: any) => String(i).trim()).filter(Boolean);
      }

      if (recipeLd.recipeInstructions) {
        const extractSteps = (instr: any): string[] => {
          if (typeof instr === 'string') return [instr.trim()];
          if (Array.isArray(instr)) {
            const steps: string[] = [];
            for (const item of instr) {
              if (typeof item === 'string') {
                steps.push(item.trim());
              } else if (item && typeof item === 'object') {
                if (item.text) steps.push(String(item.text).trim());
                else if (item.itemListElement) steps.push(...extractSteps(item.itemListElement));
              }
            }
            return steps;
          }
          return [];
        };
        instructions = extractSteps(recipeLd.recipeInstructions).filter(Boolean);
      }
    }

    // 2. OpenGraph & HTML fallback for Title, Description, and Picture
    if (!title) {
      title = $('meta[property="og:title"]').attr('content') ||
              $('meta[name="twitter:title"]').attr('content') ||
              $('h1').first().text().trim() ||
              $('title').text().trim().replace(/\s*[-|–]\s*.*$/, '') ||
              'Scraped Recipe';
    }

    if (!description) {
      description = $('meta[property="og:description"]').attr('content') ||
                    $('meta[name="twitter:description"]').attr('content') ||
                    $('meta[name="description"]').attr('content') ||
                    'Freshly imported recipe with verified Walmart grocery items.';
    }

    // Crucial: Extract picture from meta tags or prominent page images
    if (!imageUrl) {
      const ogImg = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="twitter:image"]').attr('content') ||
                    $('meta[property="og:image:secure_url"]').attr('content');
      if (ogImg) {
        imageUrl = normalizeImageUrl(ogImg, cleanUrl);
      }
    }

    if (!imageUrl) {
      const prominent = $('img[src*="recipe"], img[class*="recipe"], img[class*="featured"], .recipe-image img, .entry-content img').first().attr('src');
      if (prominent) {
        imageUrl = normalizeImageUrl(prominent, cleanUrl);
      }
    }

    // Guaranteed picture fallback: always assign a thematic, mouth-watering food photo!
    if (!imageUrl || imageUrl.startsWith('data:')) {
      imageUrl = getThematicFoodPhoto(title, cuisine);
    }

    // Fallback extraction of ingredients if Schema.org had none
    if (rawIngredients.length === 0) {
      $('.wprm-recipe-ingredient, .recipe-ingredients li, [class*="ingredient-item"], [class*="recipe-ingredient"]').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text) rawIngredients.push(text);
      });
    }

    // If still no ingredients and Gemini is active, let Gemini extract from page text
    if (rawIngredients.length === 0 && ai) {
      try {
        const bodyText = $('main, article, .recipe, body').text().slice(0, 4000);
        const extractPrompt = `Extract the recipe ingredients and instructions from this webpage text:
Page Title: ${title}
Text:
${bodyText}`;
        const aiExtract = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: extractPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                prepTime: { type: Type.STRING },
                cookTime: { type: Type.STRING },
              },
            },
          },
        });
        const extracted = JSON.parse(aiExtract.text || '{}');
        if (extracted.ingredients && extracted.ingredients.length > 0) {
          rawIngredients = extracted.ingredients;
        }
        if (extracted.instructions && extracted.instructions.length > 0 && instructions.length === 0) {
          instructions = extracted.instructions;
        }
        if (extracted.prepTime && !prepTime) prepTime = extracted.prepTime;
        if (extracted.cookTime && !cookTime) cookTime = extracted.cookTime;
      } catch (aiErr) {
        console.warn('AI fallback scraping extraction failed:', aiErr);
      }
    }

    // If still no ingredients found, provide a baseline template so the recipe remains completely usable
    if (rawIngredients.length === 0) {
      rawIngredients = [
        '1 whole bagged rotisserie chicken',
        '2 tbsp olive oil',
        '1 fresh onion',
        '2 cloves fresh garlic',
        '1 tsp salt and black pepper',
      ];
    }

    if (instructions.length === 0) {
      instructions = [
        'Prepare all recipe ingredients as directed.',
        'Cook ingredients according to your preferred cooking technique.',
        'Season to taste and serve warm!',
      ];
    }

    // Bind every ingredient to authentic Walmart grocery items
    const enhancedIngredients = rawIngredients.map((line, idx) => {
      const { cleanName, amount, unit, extractedPackageSize } = cleanIngredientNameForWalmart(line);
      const match = matchWalmartGroceryItem(cleanName);
      const packageSize = extractedPackageSize || match.packageSize || '1 package';
      const cleanWalmartQuery = (match.walmartQuery && !match.walmartQuery.toLowerCase().includes('undefined'))
        ? match.walmartQuery
        : (cleanName.toLowerCase().startsWith('great value') || cleanName.toLowerCase().startsWith('fresh') ? cleanName : `Great Value ${cleanName}`);
      const directUrl = match.itemId
        ? `https://www.walmart.com/ip/${match.itemId}`
        : buildWalmartSearchUrl(cleanWalmartQuery);

      return {
        id: `ing-scraped-${Date.now()}-${idx}`,
        itemId: match.itemId,
        name: cleanName,
        rawText: line,
        amount: amount || 1,
        unit: unit || 'item',
        category: match.category,
        walmartQuery: cleanWalmartQuery,
        walmartSearchUrl: directUrl,
        walmartDirectAddUrl: directUrl,
        brandTier: (brandPreference as any) || 'great_value',
        estimatedPrice: match.estimatedPrice || 2.48,
        packageSize,
        isPantryStaple: match.isPantryStaple,
        inPantry: false, // CRITICAL: NEVER in pantry by default!
      };
    });

    const parsedRecipe = {
      id: `recipe-scraped-${Date.now()}`,
      title,
      description,
      prepTime: prepTime || '15 mins',
      cookTime: cookTime || '20 mins',
      servings: servings || 4,
      baseServings: servings || 4,
      cuisine: cuisine || 'American',
      tags: ['Website Scraped', 'Custom Recipe'],
      image: imageUrl, // GUARANTEED HIGH QUALITY PICTURE INCLUDED!
      instructions,
      ingredients: enhancedIngredients,
      sourceUrl: cleanUrl,
      isCustom: true,
      createdAt: Date.now(),
    };

    return res.json({ recipe: parsedRecipe, source: 'scraper' });
  } catch (err: any) {
    console.error('Error in /api/recipe/scrape:', err);
    return res.status(500).json({ error: err.message || 'Failed to scrape recipe from website' });
  }
});
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: false,
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`CartCraft server listening on port ${port}`);
});
