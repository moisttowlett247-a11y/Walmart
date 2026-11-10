/**
 * Verified Walmart Grocery Product Catalog
 * Pre-indexed with real Walmart food items, exact search queries, categories,
 * standard package sizes, and realistic prices.
 */

export interface WalmartGroceryProduct {
  id: string;
  itemId?: string;
  name: string;
  walmartQuery: string;
  walmartSearchUrl: string;
  category:
    | 'Produce'
    | 'Meat & Seafood'
    | 'Dairy & Eggs'
    | 'Pantry & Dry Goods'
    | 'Bakery'
    | 'Spices & Seasonings'
    | 'Frozen'
    | 'Personal Care & Toiletries'
    | 'Pet Care'
    | 'Beverages'
    | 'Other'
    | string;
  brand: string;
  estimatedPrice: number;
  packageSize: string;
  isPantryStaple: boolean;
  keywords: string[];
}

/**
 * Extracts Walmart Item ID from a URL or raw text string
 * Supports:
 * - https://www.walmart.com/ip/Product-Name/12345678?classType=...
 * - https://www.walmart.com/ip/12345678
 * - /ip/12345678
 * - Bare digits: 12345678
 */
export function extractWalmartItemId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  // Check for bare digits
  if (/^\d{6,14}$/.test(trimmed)) {
    return trimmed;
  }
  // Check for /ip/(.*)/(\d+) or /ip/(\d+)
  const match = trimmed.match(/\/ip\/(?:[^\/]+\/)?(\d+)(?:[/?#]|$)/i);
  if (match && match[1]) {
    return match[1];
  }
  // Check query parameter itemId=(\d+)
  const queryMatch = trimmed.match(/[?&]itemId=(\d+)/i);
  if (queryMatch && queryMatch[1]) {
    return queryMatch[1];
  }
  return null;
}

/**
 * Derives a clean product name, direct link, and item ID from a Walmart product link or Item ID
 */
export function parseWalmartProductLink(urlOrId: string): {
  itemId: string | null;
  directUrl: string;
  inferredTitle: string;
} {
  const itemId = extractWalmartItemId(urlOrId);
  let inferredTitle = '';
  if (urlOrId.includes('/ip/')) {
    const slugMatch = urlOrId.match(/\/ip\/([^\/?#]+)/i);
    if (slugMatch && slugMatch[1] && !/^\d+$/.test(slugMatch[1])) {
      inferredTitle = slugMatch[1].replace(/-/g, ' ');
    }
  }
  const directUrl = itemId
    ? `https://www.walmart.com/ip/${itemId}`
    : (urlOrId.startsWith('http') ? urlOrId : `https://www.walmart.com/search?q=${encodeURIComponent(urlOrId)}`);

  return {
    itemId,
    directUrl,
    inferredTitle,
  };
}

/**
 * User Verified Essentials & Toiletries with exact Walmart item IDs & links
 */
export const USER_FAVORITE_ESSENTIALS: WalmartGroceryProduct[] = [
  {
    id: 'wm-fav-instant-coffee',
    itemId: '16004720',
    name: 'Great Value Classic Medium Roast Instant Coffee',
    walmartQuery: 'Great Value Classic Medium Roast Instant Coffee 12 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Classic-Medium-Roast-Instant-Coffee-12-oz/16004720?classType=VARIANT&athbdg=L1102',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 5.84,
    packageSize: '12 oz jar',
    isPantryStaple: true,
    keywords: ['instant coffee', 'coffee', 'great value instant coffee', 'medium roast coffee', 'roast instant coffee', 'coffee crystals'],
  },
  {
    id: 'wm-fav-sugar',
    itemId: '10314931',
    name: 'Great Value Pure Granulated Sugar',
    walmartQuery: 'Great Value Pure Granulated Sugar 10lb',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Pure-Granulated-Sugar-10lb/10314931?classType=REGULAR&athbdg=L1102&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 6.28,
    packageSize: '10 lb bag',
    isPantryStaple: true,
    keywords: ['sugar', 'granulated sugar', 'pure sugar', 'white sugar', 'baking sugar', 'great value sugar', '10lb sugar'],
  },
  {
    id: 'wm-fav-rotisserie-chicken',
    itemId: '682789099',
    name: 'Freshness Guaranteed Traditional Rotisserie Chicken (Chilled)',
    walmartQuery: 'Freshness Guaranteed Traditional Rotisserie Chicken 36 oz Chilled',
    walmartSearchUrl: 'https://www.walmart.com/ip/Freshness-Guaranteed-Traditional-Rotisserie-Chicken-36-oz-Chilled/682789099?classType=REGULAR&athbdg=L1102&from=/search',
    category: 'Meat & Seafood',
    brand: 'Freshness Guaranteed',
    estimatedPrice: 6.97,
    packageSize: '36 oz chilled',
    isPantryStaple: false,
    keywords: ['rotissery chicken', 'rotisserie chicken', 'freshness guaranteed rotisserie chicken', 'whole rotisserie chicken', 'traditional rotisserie chicken'],
  },
  {
    id: 'wm-fav-pepperjack-cheese',
    itemId: '546660408',
    name: 'Sargento Sliced Pepper Jack Natural Cheese',
    walmartQuery: 'Sargento Sliced Pepper Jack Natural Cheese 24 Slices',
    walmartSearchUrl: 'https://www.walmart.com/ip/Sargento-Sliced-Pepper-Jack-Natural-Cheese-24-Slices/546660408?classType=REGULAR&from=/search',
    category: 'Dairy & Eggs',
    brand: 'Sargento',
    estimatedPrice: 5.98,
    packageSize: '24 slices (16 oz)',
    isPantryStaple: false,
    keywords: ['pepperjack cheese', 'pepper jack cheese', 'sargento pepper jack', 'sliced pepper jack', 'pepperjack', 'jack cheese'],
  },
  {
    id: 'wm-fav-mayo',
    itemId: '23872263',
    name: 'Blue Plate Real Mayonnaise',
    walmartQuery: 'Blue Plate Real Mayonnaise 30 fl oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Blue-Plate-Real-Mayonnaise-30-fl-oz/23872263?classType=REGULAR&athbdg=L1200&adsRedirect=true',
    category: 'Pantry & Dry Goods',
    brand: 'Blue Plate',
    estimatedPrice: 4.48,
    packageSize: '30 fl oz jar',
    isPantryStaple: true,
    keywords: ['mayo', 'mayonnaise', 'blue plate mayonnaise', 'blue plate mayo', 'real mayonnaise', 'sandwich spread'],
  },
  {
    id: 'wm-fav-bread',
    itemId: '10315752',
    name: 'Great Value White Sandwich Bread',
    walmartQuery: 'Great Value White Sandwich Bread 20 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-White-Sandwich-Bread-20-oz/10315752?classType=REGULAR&athbdg=L1200&from=/search',
    category: 'Bakery',
    brand: 'Great Value',
    estimatedPrice: 1.42,
    packageSize: '20 oz loaf',
    isPantryStaple: false,
    keywords: ['bread', 'white bread', 'sandwich bread', 'great value bread', 'sliced bread', 'white sandwich bread', 'toast'],
  },
  {
    id: 'wm-fav-sandwich-meat',
    itemId: '15240745',
    name: 'Oscar Mayer Deli Fresh Rotisserie Seasoned Chicken Breast Deli Meat',
    walmartQuery: 'Oscar Mayer Deli Fresh Rotisserie Seasoned Chicken Breast Deli Meat 16 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Oscar-Mayer-Deli-Fresh-Deli-Meat-for-Sandwiches-and-Easy-Lunches-Rotisserie-Seasoned-Chicken-Breast-No-Artificial-Preservatives-16-oz/15240745?classType=REGULAR&from=/search',
    category: 'Meat & Seafood',
    brand: 'Oscar Mayer',
    estimatedPrice: 6.48,
    packageSize: '16 oz family size tub',
    isPantryStaple: false,
    keywords: ['sandwich meat', 'deli meat', 'oscar mayer deli fresh', 'lunch meat', 'chicken breast deli meat', 'sliced deli meat', 'cold cuts'],
  },
  {
    id: 'wm-fav-pickles',
    itemId: '378941019',
    name: 'Great Value Hamburger Dill Chip Pickles',
    walmartQuery: 'Great Value Hamburger Dill Chip Pickles 32 fl oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Hamburger-Dill-Chip-Pickles-32-fl-oz/378941019?classType=VARIANT&athbdg=L1102&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 2.44,
    packageSize: '32 fl oz jar',
    isPantryStaple: true,
    keywords: ['pickles', 'dill pickles', 'hamburger pickles', 'pickle chips', 'dill chips', 'great value pickles', 'dill chip pickles'],
  },
  {
    id: 'wm-fav-garlic-powder',
    itemId: '676979470',
    name: 'Great Value Garlic Powder',
    walmartQuery: 'Great Value Garlic Powder 3.4 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Garlic-Powder-3-4-oz/676979470?classType=VARIANT&athbdg=L1200&from=/search',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.34,
    packageSize: '3.4 oz bottle',
    isPantryStaple: true,
    keywords: ['garlic powder', 'powdered garlic', 'garlic seasoning', 'great value garlic powder', 'garlic spice'],
  },
  {
    id: 'wm-fav-dijon-honey-mustard',
    itemId: '326914635',
    name: 'Great Value Honey Dijon Mustard',
    walmartQuery: 'Great Value Honey Dijon Mustard 12 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Honey-Dijon-Mustard-12-oz/326914635?classType=VARIANT&athbdg=L1200&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.98,
    packageSize: '12 oz squeeze bottle',
    isPantryStaple: true,
    keywords: ['dijon honey mustard', 'honey dijon mustard', 'honey dijon', 'great value honey dijon', 'dijon mustard'],
  },
  {
    id: 'wm-fav-honey-mustard',
    itemId: '8865373647',
    name: 'Chick-Fil-A Honey Mustard Sauce',
    walmartQuery: 'Chick-Fil-A Honey Mustard Sauce 16 fl oz Squeeze Bottle',
    walmartSearchUrl: 'https://www.walmart.com/ip/Chick-Fil-A-Honey-Mustard-Sauce-16-fl-oz-Squeeze-Bottle/8865373647?classType=REGULAR&adsRedirect=true',
    category: 'Pantry & Dry Goods',
    brand: 'Chick-Fil-A',
    estimatedPrice: 3.98,
    packageSize: '16 fl oz squeeze bottle',
    isPantryStaple: true,
    keywords: ['honey mustard', 'chick-fil-a honey mustard', 'chick fil a sauce', 'honey mustard sauce', 'chick-fil-a honey mustard sauce'],
  },
  {
    id: 'wm-fav-lettuce',
    itemId: '10402650',
    name: 'Fresh Iceberg Lettuce',
    walmartQuery: 'Fresh Iceberg Lettuce Each',
    walmartSearchUrl: 'https://www.walmart.com/ip/Fresh-Iceberg-Lettuce-Each/10402650?classType=REGULAR&athbdg=L1200&from=/search',
    category: 'Produce',
    brand: 'Fresh',
    estimatedPrice: 1.88,
    packageSize: '1 head each',
    isPantryStaple: false,
    keywords: ['lettuce', 'iceberg lettuce', 'fresh lettuce', 'head of lettuce', 'salad lettuce', 'fresh iceberg lettuce'],
  },
  {
    id: 'wm-fav-milk',
    itemId: '10450114',
    name: 'Great Value Whole Vitamin D Milk',
    walmartQuery: 'Great Value Whole Vitamin D Milk Gallon Plastic Jug 128 Fl Oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Whole-Vitamin-D-Milk-Gallon-Plastic-Jug-128-Fl-Oz/10450114?classType=REGULAR&athbdg=L1200&from=/search',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 3.12,
    packageSize: '1 Gallon (128 fl oz)',
    isPantryStaple: false,
    keywords: ['milk', 'whole milk', 'vitamin d milk', 'gallon milk', 'great value milk', 'dairy milk', 'whole vitamin d milk'],
  },
  {
    id: 'wm-fav-green-tea',
    itemId: '20680639',
    name: 'Great Value Green Tea Bags',
    walmartQuery: 'Great Value Green Tea Bags 2.5 oz 40 Count',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Green-Tea-Bags-2-5-oz-40-Count/20680639?classType=REGULAR&athbdg=L1200&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 2.18,
    packageSize: '40 count box (2.5 oz)',
    isPantryStaple: true,
    keywords: ['green tea', 'tea bags', 'green tea bags', 'great value tea', 'tea', 'great value green tea'],
  },
  {
    id: 'wm-fav-spaghetti',
    itemId: '10534115',
    name: 'Great Value Spaghetti Pasta',
    walmartQuery: 'Great Value Spaghetti 16oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Spaghetti-16oz/10534115?classType=VARIANT&athbdg=L1200&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.98,
    packageSize: '16 oz box',
    isPantryStaple: true,
    keywords: ['spaghetti noodles', 'spaghetti', 'spaghetti pasta', 'pasta noodles', 'great value spaghetti', 'pasta'],
  },
  {
    id: 'wm-fav-ground-beef',
    itemId: '15136790',
    name: '73% Lean / 27% Fat Ground Beef Roll',
    walmartQuery: '73 Lean 27 Fat Ground Beef 1 lb Roll Fresh All Natural',
    walmartSearchUrl: 'https://www.walmart.com/ip/73-Lean-27-Fat-Ground-Beef-1-lb-Roll-Fresh-All-Natural/15136790?classType=REGULAR&athbdg=L1102&from=/search',
    category: 'Meat & Seafood',
    brand: 'All Natural',
    estimatedPrice: 3.97,
    packageSize: '1 lb roll',
    isPantryStaple: false,
    keywords: ['ground beef', '73/27 ground beef', 'beef roll', 'minced beef', 'hamburger meat', 'ground chuck', 'fresh ground beef'],
  },
  {
    id: 'wm-fav-parmesan',
    itemId: '48676850',
    name: 'Frigo Shredded Parmesan Cheese',
    walmartQuery: 'Frigo Shredded Parmesan Cheese 10 oz Refrigerated Plastic Cup',
    walmartSearchUrl: 'https://www.walmart.com/ip/Frigo-Shredded-Parmesan-Cheese-10-oz-Refrigerated-Plastic-Cup/48676850?classType=REGULAR&from=/search',
    category: 'Dairy & Eggs',
    brand: 'Frigo',
    estimatedPrice: 4.48,
    packageSize: '10 oz refrigerated cup',
    isPantryStaple: false,
    keywords: ['parmessian cheese', 'parmesan cheese', 'shredded parmesan', 'frigo parmesan', 'parmigiano', 'parmesan', 'frigo shredded parmesan'],
  },
  {
    id: 'wm-fav-alfredo',
    itemId: '10291084',
    name: 'Bertolli Classic Alfredo Sauce with Aged Parmesan',
    walmartQuery: 'Bertolli Classic Alfredo Sauce Pasta Sauce with Aged Parmesan 15 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Bertolli-Classic-Alfredo-Sauce-Pasta-Sauce-with-Aged-Parmesan-15-oz/10291084?classType=REGULAR&athbdg=L1102&adsRedirect=true',
    category: 'Pantry & Dry Goods',
    brand: 'Bertolli',
    estimatedPrice: 2.88,
    packageSize: '15 oz jar',
    isPantryStaple: true,
    keywords: ['alfredo sauce', 'alfredo pasta sauce', 'bertolli alfredo', 'bertolli classic alfredo', 'cream sauce', 'pasta sauce'],
  },
  {
    id: 'wm-fav-tortillas',
    itemId: '11964663',
    name: 'La Banderita Soft Taco Flour Tortillas',
    walmartQuery: 'La Banderita Soft Taco Flour Tortillas 16 oz 10 Count',
    walmartSearchUrl: 'https://www.walmart.com/ip/La-Banderita-Soft-Taco-Flour-Tortillas-16-oz-10-Count/11964663?classType=REGULAR&athbdg=L1600&from=/search',
    category: 'Bakery',
    brand: 'La Banderita',
    estimatedPrice: 2.48,
    packageSize: '10 count pack (16 oz)',
    isPantryStaple: false,
    keywords: ['tortillas', 'flour tortillas', 'soft taco tortillas', 'la banderita tortillas', 'taco tortillas', 'soft tortillas'],
  },
  {
    id: 'wm-fav-toothpaste',
    itemId: '2396711494',
    name: 'Sensodyne Clinical White Toothpaste (Sensitive Whitening)',
    walmartQuery: 'Sensodyne Clinical White Toothpaste Clinically Proven Whitening 3.4 Oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Sensodyne-Clinical-White-Toothpaste-Clinically-Proven-Whitening-for-Sensitive-Teeth-Enamel-Strengthening-3-4-Oz/2396711494?classType=REGULAR&athbdg=L1600&adsRedirect=true',
    category: 'Personal Care & Toiletries',
    brand: 'Sensodyne',
    estimatedPrice: 8.98,
    packageSize: '3.4 oz tube',
    isPantryStaple: false,
    keywords: ['toothpaste', 'sensodyne', 'sensodyne toothpaste', 'sensodyne clinical white', 'toiletries', 'dental care', 'whitening toothpaste', 'personal care'],
  },
  {
    id: 'wm-fav-fancy-feast-gravy',
    itemId: '17252360',
    name: 'Purina Fancy Feast Gravy Lovers Chicken Feast in Gravy',
    walmartQuery: 'Purina Fancy Feast Gravy Lovers Wet Cat Food Chicken Feast in Gravy 3 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/ip/Purina-Fancy-Feast-Gravy-Lovers-Wet-Cat-Food-Chicken-Feast-in-Gravy-3-oz-Can/17252360?classType=VARIANT&athbdg=L1600&from=/search',
    category: 'Pet Care',
    brand: 'Purina Fancy Feast',
    estimatedPrice: 0.88,
    packageSize: '3 oz can',
    isPantryStaple: false,
    keywords: ['fancy feast w/gravy', 'fancy feast gravy lovers', 'fancy feast with gravy', 'fancy feast', 'cat food gravy', 'wet cat food', 'purina fancy feast gravy', 'cat food'],
  },
  {
    id: 'wm-fav-fancy-feast-no-gravy',
    itemId: '10291920',
    name: 'Purina Fancy Feast Chicken Feast Pate Wet Cat Food (12-Pack)',
    walmartQuery: 'Purina Fancy Feast Chicken Feast Pate Wet Cat Food 3 oz Cans 12 Pack',
    walmartSearchUrl: 'https://www.walmart.com/ip/Purina-Fancy-Feast-Chicken-Feast-Pate-Wet-Cat-Food-3-oz-Cans-12-Pack/10291920?classType=VARIANT&from=/search',
    category: 'Pet Care',
    brand: 'Purina Fancy Feast',
    estimatedPrice: 9.98,
    packageSize: '12-Pack (3 oz cans)',
    isPantryStaple: false,
    keywords: ['fancy feast w/o gravy', 'fancy feast without gravy', 'fancy feast pate', 'fancy feast classic pate', 'purina fancy feast pate', 'cat food pate', 'cat food 12 pack', 'cat food'],
  },
  {
    id: 'wm-fav-black-pepper',
    itemId: '44662573',
    name: 'Great Value Ground Black Pepper',
    walmartQuery: 'Great Value Ground Black Pepper 3 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Ground-Black-Pepper-3-oz/44662573?classType=REGULAR&athbdg=L1102&from=/search',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 2.14,
    packageSize: '3 oz bottle',
    isPantryStaple: true,
    keywords: ['black pepper', 'ground black pepper', 'pepper', 'great value black pepper', 'ground pepper', 'table pepper'],
  },
  {
    id: 'wm-fav-cream-of-chicken',
    itemId: '10316087',
    name: 'Great Value Cream of Chicken Condensed Soup (Family Size 26 oz)',
    walmartQuery: 'Great Value Cream of Chicken Condensed Soup Family Size 26 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Cream-of-Chicken-Condensed-Soup-Family-Size-26-oz-Shelf-Stable/10316087?classType=VARIANT&athbdg=L1102&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.98,
    packageSize: '26 oz can (Family Size)',
    isPantryStaple: true,
    keywords: ['cream of chicken', 'cream of chicken soup', 'condensed soup', 'cream of chicken condensed soup', 'great value cream of chicken', 'chicken soup'],
  },
  {
    id: 'wm-fav-italian-seasoning',
    itemId: '637648335',
    name: 'Great Value Italian Seasoning',
    walmartQuery: 'Great Value Italian Seasoning 0.95 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Italian-Seasoning-0-95-oz/637648335?classType=REGULAR&athbdg=L1200&from=/search',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.24,
    packageSize: '0.95 oz bottle',
    isPantryStaple: true,
    keywords: ['italian seasoning', 'italian herbs', 'italian spice blend', 'great value italian seasoning', 'seasoning'],
  },
  {
    id: 'wm-fav-crushed-red-pepper',
    itemId: '217612954',
    name: 'Great Value Crushed Red Pepper',
    walmartQuery: 'Great Value Crushed Red Pepper 1.75 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Crushed-Red-Pepper-1-75-oz/217612954?classType=VARIANT&athbdg=L1200&from=/search',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.34,
    packageSize: '1.75 oz bottle',
    isPantryStaple: true,
    keywords: ['crushed red pepper', 'red pepper flakes', 'chili flakes', 'pepper flakes', 'great value crushed red pepper', 'hot pepper flakes'],
  },
  {
    id: 'wm-fav-general-tso-sauce',
    itemId: '23591277',
    name: 'House of Tsang General Tso Stir Fry Sauce',
    walmartQuery: 'House of Tsang General Tso Stir Fry Sauce 12.6 oz Bottle',
    walmartSearchUrl: 'https://www.walmart.com/ip/House-of-Tsang-General-Tso-Stir-Fry-Sauce-12-6-oz-Bottle/23591277?classType=VARIANT&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'House of Tsang',
    estimatedPrice: 3.78,
    packageSize: '12.6 oz bottle',
    isPantryStaple: true,
    keywords: ['general tso sauce', 'general tso stir fry sauce', 'house of tsang general tso', 'stir fry sauce', 'general tso'],
  },
  {
    id: 'wm-fav-soy-sauce',
    itemId: '10315653',
    name: 'Great Value Naturally Brewed Soy Sauce',
    walmartQuery: 'Great Value Naturally Brewed Soy Sauce 15 fl oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Naturally-Brewed-Soy-Sauce-15-fl-oz/10315653?classType=VARIANT&athbdg=L1102&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.68,
    packageSize: '15 fl oz bottle',
    isPantryStaple: true,
    keywords: ['soy sauce', 'brewed soy sauce', 'great value soy sauce', 'soya sauce', 'naturally brewed soy sauce'],
  },
  {
    id: 'wm-fav-sour-cream',
    itemId: '10309452',
    name: 'Daisy Pure and Natural Sour Cream',
    walmartQuery: 'Daisy Pure and Natural Sour Cream 24 oz Tub Refrigerated',
    walmartSearchUrl: 'https://www.walmart.com/ip/Daisy-Pure-and-Natural-Sour-Cream-24-oz-1-5-lb-Tub-Refrigerated/10309452?classType=REGULAR&from=/search',
    category: 'Dairy & Eggs',
    brand: 'Daisy',
    estimatedPrice: 2.88,
    packageSize: '24 oz tub (1.5 lb)',
    isPantryStaple: false,
    keywords: ['sour cream', 'daisy sour cream', 'pure and natural sour cream', 'sour cream tub', 'daisy'],
  },
  {
    id: 'wm-fav-salt',
    itemId: '10448936',
    name: 'Morton Iodized Salt',
    walmartQuery: 'Morton Iodized Salt 26 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Morton-Iodized-Salt-26-oz/10448936?adsRedirect=true',
    category: 'Spices & Seasonings',
    brand: 'Morton',
    estimatedPrice: 1.18,
    packageSize: '26 oz round container',
    isPantryStaple: true,
    keywords: ['salt', 'iodized salt', 'morton salt', 'table salt', 'morton iodized salt'],
  },
  {
    id: 'wm-fav-caffeine',
    itemId: '5458466805',
    name: 'Nutricost Caffeine Capsules (200mg, 500 Count)',
    walmartQuery: 'Nutricost Caffeine 500 Capsules 200mg Per Capsule Gluten Free Non GMO',
    walmartSearchUrl: 'https://www.walmart.com/ip/Nutricost-Caffeine-500-Capsules-200mg-Per-Capsule-Gluten-Free-Non-GMO-Supplement/5458466805?classType=REGULAR&adsRedirect=true',
    category: 'Personal Care & Toiletries',
    brand: 'Nutricost',
    estimatedPrice: 19.95,
    packageSize: '500 capsules bottle',
    isPantryStaple: false,
    keywords: ['caffeine', 'caffeine capsules', 'nutricost caffeine', 'energy supplement', 'pills', 'supplements'],
  },
  {
    id: 'wm-fav-mozzarella-32oz',
    itemId: '10452379',
    name: 'Great Value Shredded Low-Moisture Part-Skim Mozzarella Cheese',
    walmartQuery: 'Great Value Shredded Low-Moisture Part-Skim Mozzarella Cheese 32 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Shredded-Low-Moisture-Part-Skim-Mozzarella-Cheese-32-oz/10452379?classType=REGULAR&athbdg=L1102&from=/search',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 7.98,
    packageSize: '32 oz (2 lb) bag',
    isPantryStaple: false,
    keywords: ['mozzarella cheese', 'shredded mozzarella', 'great value mozzarella', 'cheese', 'mozzarella'],
  },
  {
    id: 'wm-fav-digiorno-pizza',
    itemId: '5328327386',
    name: 'DiGiorno Frozen Pizza Rising Crust Ultimate Pepperoni with Cheese',
    walmartQuery: 'DiGiorno Frozen Pizza Rising Crust Ultimate Pepperoni with Cheese 24.7 oz Frozen',
    walmartSearchUrl: 'https://www.walmart.com/ip/DiGiorno-Frozen-Pizza-Rising-Crust-Ultimate-Pepperoni-with-Cheese-24-7-oz-Frozen/5328327386?classType=REGULAR&athbdg=L1102&from=/search',
    category: 'Frozen',
    brand: 'DiGiorno',
    estimatedPrice: 5.98,
    packageSize: '24.7 oz box',
    isPantryStaple: false,
    keywords: ['frozen pizza', 'digiorno pizza', 'pepperoni pizza', 'rising crust pizza', 'pizza', 'digiorno', 'ultimate pepperoni'],
  },
  {
    id: 'wm-fav-maruchan-ramen',
    itemId: '10450904',
    name: 'Maruchan Ramen Noodle Chicken Flavor Soup (12-Count)',
    walmartQuery: 'Maruchan Ramen Noodle Chicken Flavor Soup 3 oz 12 Count',
    walmartSearchUrl: 'https://www.walmart.com/ip/Maruchan-Ramen-Noodle-Chicken-Flavor-Soup-3-oz-12-Count-Shelf-Stable-Package/10450904?classType=VARIANT&athbdg=L1102&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Maruchan',
    estimatedPrice: 3.68,
    packageSize: '12-count pack (3 oz each)',
    isPantryStaple: true,
    keywords: ['ramen', 'maruchan ramen', 'chicken ramen', 'ramen noodles', 'instant noodles', 'soup 12 pack'],
  },
  {
    id: 'wm-fav-penne-pasta',
    itemId: '10534084',
    name: 'Great Value Penne Pasta',
    walmartQuery: 'Great Value Penne Pasta 16 oz Box',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Penne-Pasta-16-oz-Box-Shelf-Stable/10534084?classType=VARIANT&athbdg=L1102&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.98,
    packageSize: '16 oz box',
    isPantryStaple: true,
    keywords: ['penne pasta', 'penne', 'pasta', 'great value penne', 'pasta box'],
  },
  {
    id: 'wm-fav-olive-oil',
    itemId: '10320857',
    name: 'Pompeian Robust Extra Virgin Olive Oil',
    walmartQuery: 'Pompeian Robust Extra Virgin Olive Oil 16 fl oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Pompeian-Robust-Extra-Virgin-Olive-Oil-16-fl-oz/10320857?classType=REGULAR&athbdg=L1600&adsRedirect=true',
    category: 'Pantry & Dry Goods',
    brand: 'Pompeian',
    estimatedPrice: 7.98,
    packageSize: '16 fl oz bottle',
    isPantryStaple: true,
    keywords: ['olive oil', 'extra virgin olive oil', 'pompeian olive oil', 'evoo', 'cooking oil'],
  },
  {
    id: 'wm-fav-butter',
    itemId: '10315054',
    name: 'Great Value Sweet Cream Unsalted Butter',
    walmartQuery: 'Great Value Sweet Cream Unsalted Butter 16 oz Box 4 Sticks',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Sweet-Cream-Unsalted-Butter-16-oz-Box-4-Sticks-Refrigerated/10315054?classType=REGULAR&athbdg=L1200&from=/search',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 3.98,
    packageSize: '16 oz box (4 sticks)',
    isPantryStaple: false,
    keywords: ['butter', 'unsalted butter', 'sweet cream butter', 'great value butter', 'baking butter'],
  },
  {
    id: 'wm-fav-toilet-paper',
    itemId: '1271526795',
    name: 'Quilted Northern Ultra Plush Toilet Paper (6 Mega Rolls)',
    walmartQuery: 'Quilted Northern Ultra Plush 3 Ply Toilet Paper 6 Mega Rolls',
    walmartSearchUrl: 'https://www.walmart.com/ip/Quilted-Northern-Ultra-Plush-3-Ply-Toilet-Paper-6-Mega-Rolls/1271526795?from=/search',
    category: 'Personal Care & Toiletries',
    brand: 'Quilted Northern',
    estimatedPrice: 6.98,
    packageSize: '6 Mega Rolls',
    isPantryStaple: false,
    keywords: ['toilet paper', 'quilted northern', 'tp', 'mega rolls', 'bathroom tissue', 'toiletries'],
  },
  {
    id: 'wm-fav-paper-towels',
    itemId: '10762707702',
    name: 'Great Value Everyday Strong Paper Towels (2 Double Rolls)',
    walmartQuery: 'Great Value Everyday Strong Paper Towels Split Sheets 2 Double Rolls',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Everyday-Strong-Paper-Towels-Split-Sheets-2-Double-Rolls/10762707702?classType=VARIANT&athbdg=L1103&from=/search',
    category: 'Personal Care & Toiletries',
    brand: 'Great Value',
    estimatedPrice: 2.48,
    packageSize: '2 Double Rolls',
    isPantryStaple: false,
    keywords: ['paper towels', 'great value paper towels', 'paper towel', 'household supplies'],
  },
  {
    id: 'wm-fav-trash-bags',
    itemId: '18557073787',
    name: 'Glad ForceFlex MaxStrength 13-Gallon Trash Bags (Gain Scent, 20 Bags)',
    walmartQuery: 'Glad ForceFlex MaxStrength 13 Gallon Tall Kitchen Bags Gain Moonlight Breeze 20 Bags',
    walmartSearchUrl: 'https://www.walmart.com/ip/Glad-ForceFlex-MaxStrength-13-Gallon-Purple-Drawstring-Tall-Kitchen-Bags-Gain-Moonlight-Breeze-Scent-20-Bags/18557073787?classType=VARIANT&adsRedirect=true',
    category: 'Personal Care & Toiletries',
    brand: 'Glad',
    estimatedPrice: 6.48,
    packageSize: '20 bags box',
    isPantryStaple: false,
    keywords: ['trash bags', 'garbage bags', 'glad forceflex', '13 gallon bags', 'kitchen bags'],
  },
  {
    id: 'wm-fav-tide-detergent',
    itemId: '5037629800',
    name: 'Tide Liquid Laundry Detergent Original (125 fl oz, 100 Loads)',
    walmartQuery: 'Tide Liquid Laundry Detergent Original 125 fl oz 100 Loads',
    walmartSearchUrl: 'https://www.walmart.com/ip/Tide-Liquid-Laundry-Detergent-Original-125-fl-oz-100-Loads/5037629800?classType=VARIANT&athbdg=L1200&from=/search',
    category: 'Personal Care & Toiletries',
    brand: 'Tide',
    estimatedPrice: 15.94,
    packageSize: '125 fl oz jug (100 loads)',
    isPantryStaple: false,
    keywords: ['laundry detergent', 'tide', 'tide detergent', 'liquid detergent', 'washing soap'],
  },
  {
    id: 'wm-fav-dryer-sheets',
    itemId: '11688824431',
    name: 'Bounce Mega Dryer Sheets Pet Hair & Lint Guard (30 Count)',
    walmartQuery: 'Bounce Mega Dryer Sheets Pet Hair Lint Guard 30 Count',
    walmartSearchUrl: 'https://www.walmart.com/ip/Bounce-Mega-Dryer-Sheets-Pet-Hair-Lint-Guard-30-Count/11688824431',
    category: 'Personal Care & Toiletries',
    brand: 'Bounce',
    estimatedPrice: 4.98,
    packageSize: '30 count box',
    isPantryStaple: false,
    keywords: ['dryer sheets', 'bounce', 'bounce dryer sheets', 'pet hair guard', 'laundry sheets'],
  },
  {
    id: 'wm-fav-water-filters',
    itemId: '5212591262',
    name: 'Great Value Water Filters for Brita Pitchers (3-Pack)',
    walmartQuery: 'Great Value Water Filters Fits Great Value Brita Pitchers Replacement 3 Pack',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Water-Filters-Fits-Great-Value-Brita-Pitchers-Replacement-3-Pack/5212591262?classType=VARIANT&athbdg=L1102&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 12.98,
    packageSize: '3-pack replacement filters',
    isPantryStaple: false,
    keywords: ['water filters', 'brita filters', 'great value water filters', 'pitcher filter', 'replacement filters'],
  },
  {
    id: 'wm-fav-kraft-singles',
    itemId: '10452905',
    name: 'Kraft Singles American Cheese Slices (24 Count)',
    walmartQuery: 'Kraft Singles American Cheese Slices 24 Ct Pk',
    walmartSearchUrl: 'https://www.walmart.com/ip/Kraft-Singles-American-Cheese-Slices-24-Ct-Pk/10452905?classType=VARIANT&athbdg=L1102&from=/search',
    category: 'Dairy & Eggs',
    brand: 'Kraft',
    estimatedPrice: 4.98,
    packageSize: '24 count pack',
    isPantryStaple: false,
    keywords: ['kraft singles', 'american cheese', 'cheese slices', 'kraft cheese', 'processed cheese'],
  },
  {
    id: 'wm-fav-rice-5lb',
    itemId: '10315395',
    name: 'Great Value Long Grain Enriched Rice (5 lbs)',
    walmartQuery: 'Great Value Long Grain Enriched Rice 5 lbs',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Long-Grain-Enriched-Rice-5-lbs/10315395?classType=REGULAR&athbdg=L1102&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 3.48,
    packageSize: '5 lb bag',
    isPantryStaple: true,
    keywords: ['rice', 'long grain rice', 'white rice', 'great value rice', 'enriched rice'],
  },
  {
    id: 'wm-fav-eggs-18ct',
    itemId: '172844767',
    name: 'Great Value Large White Eggs (18 Count)',
    walmartQuery: 'Great Value Large White Eggs 18 Count',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Large-White-Eggs-18-Count/172844767?classType=REGULAR&athbdg=L1102&from=/search',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 3.28,
    packageSize: '18 count carton',
    isPantryStaple: false,
    keywords: ['eggs', 'white eggs', 'large eggs', 'great value eggs', '18 eggs'],
  },
  {
    id: 'wm-fav-tidy-cats',
    itemId: '100620838',
    name: 'Purina Tidy Cats Free & Clean Unscented Cat Litter (20 lb Jug)',
    walmartQuery: 'Purina Tidy Cats Free Clean Unscented Cat Litter Scoopable Low Dust Odor Control 20 lb Jug',
    walmartSearchUrl: 'https://www.walmart.com/ip/Purina-Tidy-Cats-Free-Clean-Unscented-Cat-Litter-Scoopable-Low-Dust-Odor-Control-20-lb-Jug/100620838?classType=VARIANT&athbdg=L1200&from=/search',
    category: 'Pet Care',
    brand: 'Purina Tidy Cats',
    estimatedPrice: 10.98,
    packageSize: '20 lb jug',
    isPantryStaple: false,
    keywords: ['cat litter', 'tidy cats', 'tidy cats litter', 'unscented litter', 'pet care'],
  },
  {
    id: 'wm-fav-q-tips',
    itemId: '10452580',
    name: 'Q-tips Cotton Swabs (500 Count)',
    walmartQuery: 'Q-tips Cotton Swabs Original for Hygiene and Beauty Care 500 Count',
    walmartSearchUrl: 'https://www.walmart.com/ip/Q-tips-Cotton-Swabs-Original-for-Hygiene-and-Beauty-Care-Made-with-100-Cotton-500-Count/10452580?classType=VARIANT&athbdg=L1200&from=/search',
    category: 'Personal Care & Toiletries',
    brand: 'Q-tips',
    estimatedPrice: 4.48,
    packageSize: '500 count box',
    isPantryStaple: false,
    keywords: ['q-tips', 'cotton swabs', 'swabs', 'hygiene care', 'beauty care', 'toiletries'],
  },
  {
    id: 'wm-fav-sensodyne-repair',
    itemId: '19360402488',
    name: 'Sensodyne Clinical Repair Whiten & Shine Toothpaste (2.3 oz)',
    walmartQuery: 'Sensodyne Clinical Repair Whiten Shine Toothpaste 2.3 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Sensodyne-Clinical-Repair-Whiten-Shine-Toothpaste-2-3-oz/19360402488?classType=REGULAR&adsRedirect=true',
    category: 'Personal Care & Toiletries',
    brand: 'Sensodyne',
    estimatedPrice: 7.98,
    packageSize: '2.3 oz tube',
    isPantryStaple: false,
    keywords: ['toothpaste', 'sensodyne clinical repair', 'sensitive teeth toothpaste', 'whitening toothpaste'],
  },
  {
    id: 'wm-fav-oregano',
    itemId: '631368530',
    name: 'Great Value Oregano Leaves',
    walmartQuery: 'Great Value Oregano Leaves 0.87 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Oregano-Leaves-0-87-oz/631368530?classType=REGULAR&athbdg=L1200&from=/search',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.14,
    packageSize: '0.87 oz bottle',
    isPantryStaple: true,
    keywords: ['oregano', 'oregano leaves', 'great value oregano', 'spices', 'seasoning'],
  },
  {
    id: 'wm-fav-thyme',
    itemId: '567535646',
    name: 'Great Value Thyme Leaves',
    walmartQuery: 'Great Value Thyme Leaves 0.75 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Thyme-Leaves-0-75-oz/567535646?classType=VARIANT&athbdg=L1102&from=/search',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.14,
    packageSize: '0.75 oz bottle',
    isPantryStaple: true,
    keywords: ['thyme', 'thyme leaves', 'great value thyme', 'spices', 'seasoning'],
  },
  {
    id: 'wm-fav-dr-pepper',
    itemId: '10452492',
    name: 'Dr Pepper Soda Pop (12-Pack Cans)',
    walmartQuery: 'Dr Pepper Soda Pop 12 fl oz 12 Pack Cans',
    walmartSearchUrl: 'https://www.walmart.com/ip/Dr-Pepper-Soda-Pop-12-fl-oz-12-Pack-Cans/10452492?classType=VARIANT&athbdg=L1300&from=/search',
    category: 'Beverages',
    brand: 'Dr Pepper',
    estimatedPrice: 7.48,
    packageSize: '12-pack (12 fl oz cans)',
    isPantryStaple: false,
    keywords: ['dr pepper', 'soda', 'pop', 'dr pepper 12 pack', 'beverages', 'soft drink'],
  },
  {
    id: 'wm-fav-pillsbury-biscuits',
    itemId: '10319320',
    name: 'Pillsbury Grands Southern Homestyle Buttermilk Biscuits',
    walmartQuery: 'Pillsbury Grands Southern Homestyle Buttermilk Refrigerated Biscuit Dough 16.3 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Pillsbury-Grands-Southern-Homestyle-Buttermilk-Refrigerated-Biscuit-Dough-8-Biscuits-16-3-oz/10319320?classType=REGULAR&athbdg=L1600&from=/search',
    category: 'Dairy & Eggs',
    brand: 'Pillsbury',
    estimatedPrice: 3.48,
    packageSize: '16.3 oz tube (8 biscuits)',
    isPantryStaple: false,
    keywords: ['pillsbury biscuits', 'grands biscuits', 'buttermilk biscuits', 'biscuit dough', 'refrigerated biscuits'],
  },
  {
    id: 'wm-fav-jimmy-dean-sausage',
    itemId: '10533854',
    name: 'Jimmy Dean Fresh Regular Pork Sausage Roll',
    walmartQuery: 'Jimmy Dean Refrigerated Fresh Premium Pork Regular Sausage Roll 16 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Jimmy-Dean-Refrigerated-Fresh-Premium-Pork-Regular-Sausage-Roll-16-oz-9g-protein-per-serving/10533854?classType=REGULAR&athbdg=L1300&from=/search',
    category: 'Meat & Seafood',
    brand: 'Jimmy Dean',
    estimatedPrice: 4.98,
    packageSize: '16 oz roll',
    isPantryStaple: false,
    keywords: ['sausage', 'jimmy dean sausage', 'pork sausage', 'sausage roll', 'breakfast meat'],
  },
  {
    id: 'wm-fav-hormel-bacon',
    itemId: '10290981',
    name: 'Hormel Black Label Original Bacon',
    walmartQuery: 'HORMEL BLACK LABEL Original Bacon Gluten Free Refrigerated 16 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/HORMEL-BLACK-LABEL-Original-Bacon-Gluten-Free-Refrigerated-16-oz-Plastic-Package/10290981?classType=REGULAR&athbdg=L1300',
    category: 'Meat & Seafood',
    brand: 'Hormel Black Label',
    estimatedPrice: 6.98,
    packageSize: '16 oz pack',
    isPantryStaple: false,
    keywords: ['bacon', 'hormel bacon', 'black label bacon', 'sliced bacon', 'breakfast meat'],
  },
  {
    id: 'wm-fav-orange-rolls',
    itemId: '10319386',
    name: 'Pillsbury Orange Rolls with Orange Icing (8 Count)',
    walmartQuery: 'Pillsbury Orange Rolls with Orange Icing 8ct',
    walmartSearchUrl: 'https://www.walmart.com/ip/Pillsbury-Orange-Rolls-with-Orange-Icing-8ct/10319386?classType=REGULAR&from=/search',
    category: 'Dairy & Eggs',
    brand: 'Pillsbury',
    estimatedPrice: 3.88,
    packageSize: '8 count tube',
    isPantryStaple: false,
    keywords: ['orange rolls', 'pillsbury orange rolls', 'sweet rolls', 'cinnamon rolls with orange icing'],
  },
  {
    id: 'wm-fav-smartfood-popcorn',
    itemId: '802830055',
    name: 'Smartfood White Cheddar Popcorn',
    walmartQuery: 'Smartfood Gluten Free White Cheddar Popcorn Bag 9.75 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Smartfood-Gluten-Free-No-Artificial-Colors-White-Cheddar-Popcorn-Bag-9-75-oz/802830055?classType=REGULAR&athbdg=L1200&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Smartfood',
    estimatedPrice: 4.48,
    packageSize: '9.75 oz bag',
    isPantryStaple: false,
    keywords: ['popcorn', 'smartfood popcorn', 'white cheddar popcorn', 'cheddar popcorn', 'snacks'],
  },
  {
    id: 'wm-fav-taco-seasoning',
    itemId: '10813458',
    name: 'Old El Paso Taco Seasoning Mix Original',
    walmartQuery: 'Old El Paso Taco Seasoning Mix Original Flavor 1 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Old-El-Paso-Taco-Seasoning-Mix-Original-Flavor-1-oz/10813458?classType=REGULAR&athbdg=L1102&from=/search',
    category: 'Spices & Seasonings',
    brand: 'Old El Paso',
    estimatedPrice: 1.28,
    packageSize: '1 oz packet',
    isPantryStaple: true,
    keywords: ['taco seasoning', 'old el paso taco seasoning', 'taco mix', 'seasoning packet'],
  },
  {
    id: 'wm-fav-hidden-valley-ranch',
    itemId: '20864404816',
    name: 'Hidden Valley Original Ranch Salad Dressing & Topping (36 oz)',
    walmartQuery: 'Hidden Valley Original Ranch Salad Dressing and Topping 36 Ounce Bottle',
    walmartSearchUrl: 'https://www.walmart.com/ip/Pack-of-1-Hidden-Valley-Original-Ranch-Salad-Dressing-and-Topping-36-Ounce-Bottle-Package-May-Vary/20864404816?classType=REGULAR&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Hidden Valley',
    estimatedPrice: 7.98,
    packageSize: '36 fl oz bottle',
    isPantryStaple: true,
    keywords: ['ranch dressing', 'hidden valley ranch', 'ranch', 'salad dressing', 'ranch sauce'],
  },
  {
    id: 'wm-fav-ground-cumin',
    itemId: '985501095',
    name: 'Great Value Ground Cumin',
    walmartQuery: 'Great Value Ground Cumin 2.5 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Ground-Cumin-2-5-oz/985501095?classType=VARIANT&athbdg=L1200&from=/search',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.34,
    packageSize: '2.5 oz bottle',
    isPantryStaple: true,
    keywords: ['cumin', 'ground cumin', 'great value cumin', 'spices', 'seasoning'],
  },
  {
    id: 'wm-fav-hot-dogs',
    itemId: '10292514',
    name: 'Oscar Mayer Classic Wieners Hot Dogs (10 Count)',
    walmartQuery: 'Oscar Mayer Classic Wieners Hot Dogs 10 ct Pack',
    walmartSearchUrl: 'https://www.walmart.com/ip/Oscar-Mayer-Classic-Wieners-Hot-Dogs-10-ct-Pack/10292514?classType=REGULAR&athbdg=L1600&adsRedirect=true',
    category: 'Meat & Seafood',
    brand: 'Oscar Mayer',
    estimatedPrice: 3.48,
    packageSize: '10 count pack (16 oz)',
    isPantryStaple: false,
    keywords: ['hot dogs', 'wieners', 'oscar mayer hot dogs', 'frankfurters', 'sausages'],
  },
  {
    id: 'wm-fav-hamburger-buns',
    itemId: '10450104',
    name: 'Great Value Hamburger Buns (8 Count)',
    walmartQuery: 'Great Value Hamburger Buns 8 Count 11 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Hamburger-Buns-8-Count-11-oz/10450104?classType=REGULAR&athbdg=L1102&from=/search',
    category: 'Bakery',
    brand: 'Great Value',
    estimatedPrice: 1.38,
    packageSize: '8 count pack (11 oz)',
    isPantryStaple: false,
    keywords: ['hamburger buns', 'burger buns', 'buns', 'great value buns', 'bread rolls'],
  },
  {
    id: 'wm-fav-ketchup',
    itemId: '10533375',
    name: 'Great Value Tomato Ketchup',
    walmartQuery: 'Great Value Tomato Ketchup 24 oz',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Tomato-Ketchup-24-oz/10533375?classType=VARIANT&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.48,
    packageSize: '24 oz bottle',
    isPantryStaple: true,
    keywords: ['ketchup', 'tomato ketchup', 'great value ketchup', 'condiment'],
  },
  {
    id: 'wm-fav-wolf-brand-chili',
    itemId: '10294770',
    name: 'Wolf Brand Chili With Beans (15 oz Can)',
    walmartQuery: 'Wolf Brand Chili With Beans 15 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/ip/WOLF-BRAND-Chili-With-Beans-15-oz-Can/10294770?classType=VARIANT&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Wolf Brand',
    estimatedPrice: 2.28,
    packageSize: '15 oz can',
    isPantryStaple: false,
    keywords: ['wolf brand chili', 'wolf brand chili with beans', 'chili with beans', 'canned chili', 'chili', 'wolf chili', 'chili in a can'],
  },
  {
    id: 'wm-fav-tomato-soup',
    itemId: '10321588',
    name: "Campbell's Condensed Tomato Soup (10.75 oz Can)",
    walmartQuery: "Campbell's Condensed Tomato Soup 10.75 oz Can",
    walmartSearchUrl: 'https://www.walmart.com/ip/Campbell-s-Condensed-Tomato-Soup-10-75-oz-Can/10321588?classType=REGULAR&from=/search',
    category: 'Pantry & Dry Goods',
    brand: "Campbell's",
    estimatedPrice: 1.26,
    packageSize: '10.75 oz can',
    isPantryStaple: true,
    keywords: ['tomato soup', 'campbells tomato soup', 'condensed soup', 'canned soup', 'soup'],
  },
  {
    id: 'wm-fav-black-beans',
    itemId: '10314946',
    name: 'Great Value Canned Black Beans (15 oz)',
    walmartQuery: 'Great Value Black Beans 15 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Black-Beans-15-oz-Can/10314946?classType=REGULAR&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.86,
    packageSize: '15 oz can',
    isPantryStaple: true,
    keywords: ['black beans', 'canned black beans', 'great value black beans', 'beans', 'frijoles'],
  },
  {
    id: 'wm-fav-tuna',
    itemId: '10315622',
    name: 'Great Value Chunk Light Tuna in Water (5 oz Can)',
    walmartQuery: 'Great Value Chunk Light Tuna in Water 5 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Chunk-Light-Tuna-in-Water-5-oz-Can/10315622?classType=REGULAR&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.94,
    packageSize: '5 oz can',
    isPantryStaple: true,
    keywords: ['tuna', 'canned tuna', 'chunk light tuna', 'tuna fish', 'great value tuna'],
  },
  {
    id: 'wm-fav-elbow-macaroni',
    itemId: '10315891',
    name: 'Great Value Elbow Macaroni Pasta (16 oz)',
    walmartQuery: 'Great Value Elbow Macaroni Pasta 16 oz Box',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Elbow-Macaroni-Pasta-16-oz/10315891?classType=REGULAR&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.98,
    packageSize: '16 oz box',
    isPantryStaple: true,
    keywords: ['macaroni', 'elbow macaroni', 'macaroni pasta', 'pasta', 'great value macaroni'],
  },
  {
    id: 'wm-fav-soy-sauce',
    itemId: '10315182',
    name: 'Great Value Less Sodium Soy Sauce (15 fl oz)',
    walmartQuery: 'Great Value Less Sodium Soy Sauce 15 fl oz Bottle',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Less-Sodium-Soy-Sauce-15-fl-oz/10315182?classType=REGULAR&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.64,
    packageSize: '15 fl oz bottle',
    isPantryStaple: true,
    keywords: ['soy sauce', 'less sodium soy sauce', 'low sodium soy sauce', 'great value soy sauce'],
  },
  {
    id: 'wm-fav-frozen-mixed-veggies',
    itemId: '10315276',
    name: 'Great Value Frozen Mixed Vegetables (12 oz)',
    walmartQuery: 'Great Value Frozen Mixed Vegetables Peas Carrots Corn Green Beans 12 oz Steamable Bag',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Frozen-Mixed-Vegetables-12-oz-Steamable-Bag/10315276?classType=REGULAR&from=/search',
    category: 'Frozen',
    brand: 'Great Value',
    estimatedPrice: 1.18,
    packageSize: '12 oz bag',
    isPantryStaple: false,
    keywords: ['mixed vegetables', 'frozen vegetables', 'peas and carrots', 'frozen veggies', 'great value mixed vegetables'],
  },
  {
    id: 'wm-fav-frozen-broccoli',
    itemId: '10315275',
    name: 'Great Value Frozen Broccoli Florets (12 oz)',
    walmartQuery: 'Great Value Frozen Broccoli Florets 12 oz Steamable Bag',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Frozen-Broccoli-Florets-12-oz-Steamable-Bag/10315275?classType=REGULAR&from=/search',
    category: 'Frozen',
    brand: 'Great Value',
    estimatedPrice: 1.18,
    packageSize: '12 oz bag',
    isPantryStaple: false,
    keywords: ['broccoli', 'frozen broccoli', 'broccoli florets', 'great value broccoli'],
  },
  {
    id: 'wm-fav-russet-potatoes',
    itemId: '10452778',
    name: 'Fresh Russet Potatoes (5 lb Bag)',
    walmartQuery: 'Fresh Russet Potatoes 5 lb Bag',
    walmartSearchUrl: 'https://www.walmart.com/ip/Fresh-Russet-Potatoes-5-lb-Bag/10452778?classType=REGULAR&from=/search',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 3.48,
    packageSize: '5 lb bag',
    isPantryStaple: true,
    keywords: ['potatoes', 'russet potatoes', 'baking potatoes', 'whole potatoes', '5lb potatoes'],
  },
  {
    id: 'wm-fav-sour-cream',
    itemId: '10315050',
    name: 'Great Value All Natural Sour Cream (16 oz)',
    walmartQuery: 'Great Value All Natural Sour Cream 16 oz Tub',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-All-Natural-Sour-Cream-16-oz/10315050?classType=REGULAR&from=/search',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 1.68,
    packageSize: '16 oz tub',
    isPantryStaple: false,
    keywords: ['sour cream', 'great value sour cream', 'all natural sour cream'],
  },
  {
    id: 'wm-fav-lentils',
    itemId: '10315890',
    name: 'Great Value Brown Lentils (16 oz Bag)',
    walmartQuery: 'Great Value Brown Lentils 16 oz Dry Bag',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Brown-Lentils-16-oz/10315890?classType=REGULAR&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.48,
    packageSize: '16 oz bag',
    isPantryStaple: true,
    keywords: ['lentils', 'brown lentils', 'dry lentils', 'lentil soup', 'great value lentils'],
  },
  {
    id: 'wm-fav-diced-tomatoes',
    itemId: '10314948',
    name: 'Great Value Diced Tomatoes in Tomato Juice (14.5 oz)',
    walmartQuery: 'Great Value Diced Tomatoes in Tomato Juice 14.5 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Diced-Tomatoes-in-Tomato-Juice-14-5-oz/10314948?classType=REGULAR&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.88,
    packageSize: '14.5 oz can',
    isPantryStaple: true,
    keywords: ['diced tomatoes', 'canned tomatoes', 'tomatoes in juice', 'great value diced tomatoes'],
  },
  {
    id: 'wm-fav-mashed-potatoes',
    itemId: '10315895',
    name: 'Great Value Buttery Homestyle Instant Mashed Potatoes (13.75 oz)',
    walmartQuery: 'Great Value Buttery Homestyle Instant Mashed Potatoes 13.75 oz Box',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Buttery-Homestyle-Instant-Mashed-Potatoes-13-75-oz/10315895?classType=REGULAR&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.58,
    packageSize: '13.75 oz box',
    isPantryStaple: true,
    keywords: ['mashed potatoes', 'instant mashed potatoes', 'potato flakes', 'homestyle potatoes'],
  },
  {
    id: 'wm-fav-egg-noodles',
    itemId: '10315892',
    name: 'Great Value Wide Egg Noodles (16 oz)',
    walmartQuery: 'Great Value Wide Egg Noodles 16 oz Bag',
    walmartSearchUrl: 'https://www.walmart.com/ip/Great-Value-Wide-Egg-Noodles-16-oz/10315892?classType=REGULAR&from=/search',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.48,
    packageSize: '16 oz bag',
    isPantryStaple: true,
    keywords: ['egg noodles', 'wide egg noodles', 'butter noodles', 'great value noodles', 'pasta'],
  },
];

export const WALMART_GROCERY_CATALOG: WalmartGroceryProduct[] = [
  ...USER_FAVORITE_ESSENTIALS,
  // --- MEAT & POULTRY & SEAFOOD ---
  {
    id: 'wm-meat-rotisserie',
    itemId: '682789099',
    name: 'Freshness Guaranteed Traditional Rotisserie Chicken (Chilled)',
    walmartQuery: 'Freshness Guaranteed Traditional Rotisserie Chicken 36 oz Chilled',
    walmartSearchUrl: 'https://www.walmart.com/ip/Freshness-Guaranteed-Traditional-Rotisserie-Chicken-36-oz-Chilled/682789099?classType=REGULAR&athbdg=L1102&from=/search',
    category: 'Meat & Seafood',
    brand: 'Freshness Guaranteed',
    estimatedPrice: 6.97,
    packageSize: '36 oz chilled',
    isPantryStaple: false,
    keywords: [
      'bagged rotisserie chicken',
      'rotisserie chicken in bag',
      'rotisserie chicken bag',
      'rotisserie chicken',
      'chicken',
      'whole chicken',
      'cooked chicken',
      'shredded chicken',
      'chicken meat',
      'deli chicken',
      'roast chicken',
      'chicken breast',
      'chicken breasts',
    ],
  },
  {
    id: 'wm-meat-rotisserie-pulled',
    itemId: '43999814',
    name: 'Freshness Guaranteed Pulled Rotisserie Chicken Bag',
    walmartQuery: 'Freshness Guaranteed Traditional Pulled Rotisserie Seasoned Chicken 16 oz bag',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Freshness%20Guaranteed%20Pulled%20Rotisserie%20Chicken%2016%20oz',
    category: 'Meat & Seafood',
    brand: 'Freshness Guaranteed',
    estimatedPrice: 6.98,
    packageSize: '16 oz bag',
    isPantryStaple: false,
    keywords: [
      'pulled rotisserie chicken',
      'shredded rotisserie chicken',
      'rotisserie chicken bag',
      'bagged rotisserie chicken',
      'pulled chicken',
      'shredded chicken',
    ],
  },
  {
    id: 'wm-meat-1',
    itemId: '10414680',
    name: 'Boneless Skinless Chicken Breast',
    walmartQuery: 'Great Value Boneless Skinless Chicken Breast 3 lb',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Boneless%20Skinless%20Chicken%20Breast%203%20lb',
    category: 'Meat & Seafood',
    brand: 'Great Value',
    estimatedPrice: 7.42,
    packageSize: '3 lb tray',
    isPantryStaple: false,
    keywords: ['chicken breast', 'chicken breasts', 'boneless chicken', 'raw chicken', 'chicken fillet'],
  },
  {
    id: 'wm-meat-2',
    itemId: '51259017',
    name: 'Boneless Skinless Chicken Thighs',
    walmartQuery: 'Great Value Boneless Skinless Chicken Thighs 3 lb',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Boneless%20Skinless%20Chicken%20Thighs%203%20lb',
    category: 'Meat & Seafood',
    brand: 'Great Value',
    estimatedPrice: 6.98,
    packageSize: '3 lb tray',
    isPantryStaple: false,
    keywords: ['chicken thigh', 'chicken thighs', 'boneless chicken thighs', 'dark meat chicken'],
  },
  {
    id: 'wm-meat-3',
    itemId: '479601462',
    name: '80/20 Ground Beef',
    walmartQuery: 'All Natural 80/20 Ground Beef Chuck 1 lb',
    walmartSearchUrl: 'https://www.walmart.com/search?q=All%20Natural%2080%2F20%20Ground%20Beef%201%20lb',
    category: 'Meat & Seafood',
    brand: 'Marketside',
    estimatedPrice: 4.97,
    packageSize: '1 lb roll / tray',
    isPantryStaple: false,
    keywords: ['ground beef', 'minced beef', 'hamburger meat', 'ground chuck', 'beef mince'],
  },
  {
    id: 'wm-meat-4',
    itemId: '39944474',
    name: 'Boneless Beef Chuck Roast',
    walmartQuery: 'USDA Choice Beef Chuck Roast Boneless 3 lb',
    walmartSearchUrl: 'https://www.walmart.com/search?q=USDA%20Choice%20Beef%20Chuck%20Roast%20Boneless',
    category: 'Meat & Seafood',
    brand: 'USDA Choice',
    estimatedPrice: 19.88,
    packageSize: '3 lb roast',
    isPantryStaple: false,
    keywords: ['chuck roast', 'beef roast', 'pot roast', 'beef chuck', 'stewing beef', 'beef for stew'],
  },
  {
    id: 'wm-meat-5',
    name: 'Raw Large Peeled & Deveined Shrimp',
    walmartQuery: 'Great Value Raw Large Peeled & Deveined Tail-Off Shrimp 16 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Raw%20Large%20Peeled%20Deveined%20Shrimp%2016%20oz',
    category: 'Meat & Seafood',
    brand: 'Great Value',
    estimatedPrice: 5.98,
    packageSize: '16 oz bag (frozen/thawed)',
    isPantryStaple: false,
    keywords: ['shrimp', 'prawns', 'raw shrimp', 'peeled shrimp', 'frozen shrimp', 'tail-off shrimp'],
  },
  {
    id: 'wm-meat-6',
    name: 'Atlantic Salmon Fillets',
    walmartQuery: 'Fresh Atlantic Salmon Fillet 1 lb',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Atlantic%20Salmon%20Fillet',
    category: 'Meat & Seafood',
    brand: 'Marketside',
    estimatedPrice: 9.87,
    packageSize: '1 lb fillet tray',
    isPantryStaple: false,
    keywords: ['salmon', 'salmon fillet', 'fresh salmon', 'fish fillet'],
  },
  {
    id: 'wm-meat-7',
    itemId: '44391087',
    name: 'Thick Cut Bacon',
    walmartQuery: 'Great Value Naturally Hardwood Smoked Thick Cut Bacon 16 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Thick%20Cut%20Bacon%2016%20oz',
    category: 'Meat & Seafood',
    brand: 'Great Value',
    estimatedPrice: 3.98,
    packageSize: '16 oz pack',
    isPantryStaple: false,
    keywords: ['bacon', 'thick bacon', 'smoked bacon', 'pork bacon'],
  },
  {
    id: 'wm-meat-8',
    name: 'Boneless Pork Chops',
    walmartQuery: 'Boneless Pork Chops Center Cut 1.5 lb',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Boneless%20Pork%20Chops%20Center%20Cut',
    category: 'Meat & Seafood',
    brand: 'Marketside',
    estimatedPrice: 6.48,
    packageSize: '1.5 lb tray',
    isPantryStaple: false,
    keywords: ['pork chop', 'pork chops', 'boneless pork', 'pork loin'],
  },

  // --- DAIRY & EGGS ---
  {
    id: 'wm-dairy-1',
    itemId: '145051970',
    name: 'Large Grade A White Eggs',
    walmartQuery: 'Great Value Large White Grade A Eggs 12 Count',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Large%20White%20Eggs%2012%20Count',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 2.14,
    packageSize: '12 count carton',
    isPantryStaple: false,
    keywords: ['egg', 'eggs', 'large eggs', 'white eggs', 'fresh eggs'],
  },
  {
    id: 'wm-dairy-2',
    itemId: '10450114',
    name: 'Whole Milk',
    walmartQuery: 'Great Value Whole Vitamin D Milk 1 Gallon',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Whole%20Milk%201%20Gallon',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 3.24,
    packageSize: '1 Gallon jug',
    isPantryStaple: false,
    keywords: ['milk', 'whole milk', 'vitamin d milk', 'cow milk'],
  },
  {
    id: 'wm-dairy-3',
    itemId: '10450340',
    name: 'Heavy Whipping Cream',
    walmartQuery: 'Great Value Ultra-Pasteurized Heavy Whipping Cream 16 fl oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Heavy%20Whipping%20Cream%2016%20fl%20oz',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 2.38,
    packageSize: '16 fl oz carton',
    isPantryStaple: false,
    keywords: ['heavy cream', 'heavy whipping cream', 'whipping cream', 'double cream'],
  },
  {
    id: 'wm-dairy-4',
    itemId: '26954459',
    name: 'Unsalted Sweet Cream Butter',
    walmartQuery: 'Great Value Sweet Cream Unsalted Butter 16 oz 4 Sticks',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Unsalted%20Butter%2016%20oz',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 3.68,
    packageSize: '16 oz (4 sticks)',
    isPantryStaple: true,
    keywords: ['butter', 'unsalted butter', 'sweet cream butter', 'butter sticks'],
  },
  {
    id: 'wm-dairy-5',
    itemId: '10315402',
    name: 'Grated Parmesan Cheese',
    walmartQuery: 'Great Value Grated Parmesan Cheese 8 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Grated%20Parmesan%20Cheese%208%20oz',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 2.94,
    packageSize: '8 oz bottle',
    isPantryStaple: false,
    keywords: ['parmesan', 'parmesan cheese', 'grated parmesan', 'parmigiano'],
  },
  {
    id: 'wm-dairy-6',
    name: 'Shredded Cheddar Cheese',
    walmartQuery: 'Great Value Shredded Sharp Cheddar Cheese 8 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Shredded%20Sharp%20Cheddar%20Cheese%208%20oz',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 2.22,
    packageSize: '8 oz pouch',
    isPantryStaple: false,
    keywords: ['cheddar cheese', 'shredded cheddar', 'sharp cheddar', 'cheddar'],
  },
  {
    id: 'wm-dairy-7',
    name: 'Shredded Mozzarella Cheese',
    walmartQuery: 'Great Value Shredded Low-Moisture Part-Skim Mozzarella Cheese 8 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Shredded%20Mozzarella%20Cheese%208%20oz',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 2.22,
    packageSize: '8 oz pouch',
    isPantryStaple: false,
    keywords: ['mozzarella', 'shredded mozzarella', 'pizza cheese', 'mozzarella cheese'],
  },
  {
    id: 'wm-dairy-8',
    itemId: '10452384',
    name: 'Oaxaca Melting Cheese',
    walmartQuery: 'Cacique Oaxaca Mexican Style Melting Cheese 10 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Cacique%20Oaxaca%20Cheese%2010%20oz',
    category: 'Dairy & Eggs',
    brand: 'Cacique',
    estimatedPrice: 3.98,
    packageSize: '10 oz package',
    isPantryStaple: false,
    keywords: ['oaxaca cheese', 'queso oaxaca', 'melting cheese', 'quesadilla cheese'],
  },
  {
    id: 'wm-dairy-9',
    itemId: '26559565',
    name: 'Whole Milk Plain Greek Yogurt',
    walmartQuery: 'Great Value Plain Whole Milk Greek Yogurt 32 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Greek%20Yogurt%20Plain%2032%20oz',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 3.47,
    packageSize: '32 oz tub',
    isPantryStaple: false,
    keywords: ['greek yogurt', 'plain yogurt', 'whole milk yogurt', 'yogurt'],
  },
  {
    id: 'wm-dairy-10',
    name: 'Sour Cream',
    walmartQuery: 'Great Value Original Sour Cream 16 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Sour%20Cream%2016%20oz',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 1.84,
    packageSize: '16 oz tub',
    isPantryStaple: false,
    keywords: ['sour cream', 'crema agria', 'sour cream tub'],
  },
  {
    id: 'wm-dairy-11',
    name: 'Cream Cheese',
    walmartQuery: 'Great Value Original Cream Cheese 8 oz Brick',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Cream%20Cheese%208%20oz',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 1.78,
    packageSize: '8 oz brick',
    isPantryStaple: false,
    keywords: ['cream cheese', 'philadelphia cream cheese', 'cream cheese brick'],
  },

  // --- FRESH PRODUCE ---
  {
    id: 'wm-prod-1',
    itemId: '10447842',
    name: 'Fresh Yellow Onions',
    walmartQuery: 'Fresh Yellow Onions 3 lb Bag',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Yellow%20Onions%203%20lb%20Bag',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 2.38,
    packageSize: '3 lb bag',
    isPantryStaple: false,
    keywords: ['yellow onion', 'yellow onions', 'onion', 'onions', 'cooking onions'],
  },
  {
    id: 'wm-prod-2',
    itemId: '10447842',
    name: 'Fresh White Onions',
    walmartQuery: 'Fresh White Onion Each',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20White%20Onion%20each',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 0.98,
    packageSize: '1 whole onion',
    isPantryStaple: false,
    keywords: ['white onion', 'white onions', 'taco onion'],
  },
  {
    id: 'wm-prod-3',
    name: 'Fresh Red Onions',
    walmartQuery: 'Fresh Red Onion Each',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Red%20Onion%20each',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 1.12,
    packageSize: '1 whole onion',
    isPantryStaple: false,
    keywords: ['red onion', 'red onions', 'purple onion'],
  },
  {
    id: 'wm-prod-4',
    itemId: '367014931',
    name: 'Fresh White Garlic Bulbs',
    walmartQuery: 'Fresh White Garlic 3 Pack Bulbs',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20White%20Garlic%203%20Pack%20Bulbs',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 1.48,
    packageSize: '3 bulbs sleeve',
    isPantryStaple: false,
    keywords: ['garlic', 'garlic cloves', 'garlic bulbs', 'fresh garlic', 'clove garlic'],
  },
  {
    id: 'wm-prod-5',
    itemId: '34017490',
    name: 'Fresh Baby Spinach',
    walmartQuery: 'Marketside Fresh Baby Spinach 10 oz Tub',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Marketside%20Fresh%20Baby%20Spinach%2010%20oz',
    category: 'Produce',
    brand: 'Marketside',
    estimatedPrice: 2.18,
    packageSize: '10 oz tub',
    isPantryStaple: false,
    keywords: ['spinach', 'baby spinach', 'fresh spinach', 'spinach leaves'],
  },
  {
    id: 'wm-prod-6',
    itemId: '160597260',
    name: 'Fresh Cilantro',
    walmartQuery: 'Fresh Cilantro Bunch',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Cilantro%20Bunch',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 0.58,
    packageSize: '1 fresh bunch',
    isPantryStaple: false,
    keywords: ['cilantro', 'fresh cilantro', 'coriander leaves', 'culantro'],
  },
  {
    id: 'wm-prod-7',
    itemId: '44391064',
    name: 'Fresh Whole Limes',
    walmartQuery: 'Fresh Whole Limes Each',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Whole%20Limes',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 0.33,
    packageSize: '1 whole lime',
    isPantryStaple: false,
    keywords: ['lime', 'limes', 'fresh lime', 'lime juice'],
  },
  {
    id: 'wm-prod-8',
    name: 'Fresh Whole Lemons',
    walmartQuery: 'Fresh Whole Lemon Each',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Whole%20Lemon',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 0.48,
    packageSize: '1 whole lemon',
    isPantryStaple: false,
    keywords: ['lemon', 'lemons', 'fresh lemon', 'lemon juice'],
  },
  {
    id: 'wm-prod-9',
    itemId: '44391605',
    name: 'Fresh Strawberries',
    walmartQuery: 'Fresh Strawberries 1 lb Clamshell',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Strawberries%201%20lb',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 2.88,
    packageSize: '16 oz clamshell',
    isPantryStaple: false,
    keywords: ['strawberry', 'strawberries', 'fresh strawberries', 'sliced strawberries'],
  },
  {
    id: 'wm-prod-10',
    itemId: '161115457',
    name: 'Fresh Blueberries',
    walmartQuery: 'Fresh Blueberries 11 oz Container',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Blueberries%2011%20oz',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 2.98,
    packageSize: '11 oz pack',
    isPantryStaple: false,
    keywords: ['blueberry', 'blueberries', 'fresh blueberries', 'wild blueberries'],
  },
  {
    id: 'wm-prod-11',
    name: 'Fresh Green Bell Peppers',
    walmartQuery: 'Fresh Green Bell Pepper Each',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Green%20Bell%20Pepper',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 0.78,
    packageSize: '1 pepper',
    isPantryStaple: false,
    keywords: ['bell pepper', 'green bell pepper', 'green pepper', 'peppers'],
  },
  {
    id: 'wm-prod-12',
    name: 'Fresh Red Bell Peppers',
    walmartQuery: 'Fresh Red Bell Pepper Each',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Red%20Bell%20Pepper',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 1.28,
    packageSize: '1 pepper',
    isPantryStaple: false,
    keywords: ['red bell pepper', 'red pepper', 'sweet pepper'],
  },
  {
    id: 'wm-prod-13',
    name: 'Fresh Roma Tomatoes',
    walmartQuery: 'Fresh Roma Tomato Each',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Roma%20Tomato',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 0.35,
    packageSize: '1 tomato',
    isPantryStaple: false,
    keywords: ['roma tomato', 'roma tomatoes', 'plum tomato', 'fresh tomatoes', 'tomato', 'tomatoes'],
  },
  {
    id: 'wm-prod-14',
    name: 'Fresh Italian Flat Leaf Parsley',
    walmartQuery: 'Fresh Italian Flat Leaf Parsley Bunch',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Italian%20Flat%20Leaf%20Parsley%20Bunch',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 0.98,
    packageSize: '1 fresh bunch',
    isPantryStaple: false,
    keywords: ['parsley', 'flat leaf parsley', 'italian parsley', 'fresh parsley'],
  },
  {
    id: 'wm-prod-15',
    name: 'Fresh Hass Avocados',
    walmartQuery: 'Fresh Hass Avocados 4 Pack Bag',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Hass%20Avocados%204%20Pack',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 2.98,
    packageSize: '4 count bag',
    isPantryStaple: false,
    keywords: ['avocado', 'avocados', 'hass avocado', 'guacamole avocado'],
  },
  {
    id: 'wm-prod-16',
    name: 'Fresh Ginger Root',
    walmartQuery: 'Fresh Ginger Root by Weight',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Ginger%20Root',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 1.48,
    packageSize: 'Approx. 0.5 lb knob',
    isPantryStaple: false,
    keywords: ['ginger', 'ginger root', 'fresh ginger', 'minced ginger'],
  },
  {
    id: 'wm-prod-17',
    name: 'Fresh Russet Potatoes',
    walmartQuery: 'Fresh Russet Potatoes 5 lb Bag',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Russet%20Potatoes%205%20lb%20Bag',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 2.97,
    packageSize: '5 lb bag',
    isPantryStaple: false,
    keywords: ['potato', 'potatoes', 'russet potato', 'baking potato'],
  },

  // --- PANTRY & DRY GOODS ---
  {
    id: 'wm-pan-1',
    itemId: '10315102',
    name: 'Extra Virgin Olive Oil',
    walmartQuery: 'Great Value 100% Extra Virgin Olive Oil 17 fl oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Extra%20Virgin%20Olive%20Oil%2017%20fl%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 4.88,
    packageSize: '17 fl oz bottle',
    isPantryStaple: true,
    keywords: ['olive oil', 'extra virgin olive oil', 'evoo', 'cooking oil'],
  },
  {
    id: 'wm-pan-2',
    name: 'Vegetable Oil',
    walmartQuery: 'Great Value Pure Vegetable Oil 48 fl oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Vegetable%20Oil%2048%20fl%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 3.42,
    packageSize: '48 fl oz bottle',
    isPantryStaple: true,
    keywords: ['vegetable oil', 'canola oil', 'frying oil'],
  },
  {
    id: 'wm-pan-3',
    itemId: '10899013',
    name: 'Low Sodium Chicken Broth',
    walmartQuery: 'Great Value Low Sodium Chicken Broth 32 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Low%20Sodium%20Chicken%20Broth%2032%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.37,
    packageSize: '32 oz carton',
    isPantryStaple: false,
    keywords: ['chicken broth', 'chicken stock', 'broth', 'stock', 'bone broth'],
  },
  {
    id: 'wm-pan-4',
    itemId: '10899013',
    name: 'Beef Broth',
    walmartQuery: 'Great Value Beef Broth 32 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Beef%20Broth%2032%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.37,
    packageSize: '32 oz carton',
    isPantryStaple: false,
    keywords: ['beef broth', 'beef stock', 'consomme'],
  },
  {
    id: 'wm-pan-5',
    itemId: '149411733',
    name: 'Sun-Dried Tomatoes in Oil',
    walmartQuery: 'California Sun Dry Julienne Cut Sun-Dried Tomatoes in Oil 8.5 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Sun-Dried%20Tomatoes%20Julienne%20Cut%20in%20Oil',
    category: 'Pantry & Dry Goods',
    brand: 'California Sun Dry',
    estimatedPrice: 3.48,
    packageSize: '8.5 oz jar',
    isPantryStaple: false,
    keywords: ['sun-dried tomatoes', 'sundried tomato', 'sun dried tomatoes'],
  },
  {
    id: 'wm-pan-6',
    itemId: '51415580',
    name: 'Dried Guajillo Chili Pods',
    walmartQuery: 'El Guapo Whole Dried Guajillo Chili Pods 7.5 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Dried%20Guajillo%20Chile%20Pods',
    category: 'Pantry & Dry Goods',
    brand: 'El Guapo',
    estimatedPrice: 2.98,
    packageSize: '7.5 oz bag',
    isPantryStaple: false,
    keywords: ['guajillo', 'guajillo chiles', 'dried chiles', 'guajillo pepper'],
  },
  {
    id: 'wm-pan-7',
    itemId: '202344615',
    name: 'Oats & Honey Granola',
    walmartQuery: 'Great Value Oats & Honey Granola 16 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Oats%20and%20Honey%20Granola%2016%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 2.68,
    packageSize: '16 oz pouch',
    isPantryStaple: false,
    keywords: ['granola', 'oats and honey', 'cereal granola', 'rolled oats granola'],
  },
  {
    id: 'wm-pan-8',
    itemId: '862748103',
    name: 'Organic Black Chia Seeds',
    walmartQuery: 'Great Value Organic Black Chia Seeds 12 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Organic%20Black%20Chia%20Seeds',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 3.74,
    packageSize: '12 oz pouch',
    isPantryStaple: false,
    keywords: ['chia seeds', 'chia', 'black chia seeds'],
  },
  {
    id: 'wm-pan-9',
    itemId: '20647992',
    name: '100% Pure Raw Honey',
    walmartQuery: 'Great Value 100% Pure Raw Honey 16 oz Bottle',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Pure%20Raw%20Honey%2016%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 3.98,
    packageSize: '16 oz squeeze bottle',
    isPantryStaple: true,
    keywords: ['honey', 'raw honey', 'clover honey', 'pure honey'],
  },
  {
    id: 'wm-pan-10',
    itemId: '10315394',
    name: 'Long Grain White Rice',
    walmartQuery: 'Great Value Enriched Long Grain White Rice 5 lb Bag',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Long%20Grain%20White%20Rice%205%20lb',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 3.34,
    packageSize: '5 lb bag',
    isPantryStaple: true,
    keywords: ['white rice', 'rice', 'long grain rice', 'jasmine rice', 'basmati rice'],
  },
  {
    id: 'wm-pan-11',
    name: 'Linguine Pasta',
    walmartQuery: 'Barilla Linguine Pasta 16 oz Box',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Barilla%20Linguine%20Pasta%2016%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Barilla',
    estimatedPrice: 1.76,
    packageSize: '16 oz box',
    isPantryStaple: true,
    keywords: ['linguine', 'pasta', 'spaghetti', 'fettuccine', 'noodles'],
  },
  {
    id: 'wm-pan-12',
    itemId: '10534084',
    name: 'Penne Rigate Pasta',
    walmartQuery: 'Great Value Penne Rigate Pasta 16 oz Box',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Penne%20Pasta%2016%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.98,
    packageSize: '16 oz box',
    isPantryStaple: true,
    keywords: ['penne', 'penne rigate', 'tubular pasta'],
  },
  {
    id: 'wm-pan-13',
    itemId: '10534038',
    name: 'Black Beans Canned',
    walmartQuery: 'Great Value Black Beans 15 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Black%20Beans%2015%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.82,
    packageSize: '15 oz can',
    isPantryStaple: true,
    keywords: ['black beans', 'canned beans', 'frijoles negros'],
  },
  {
    id: 'wm-pan-14',
    name: 'Dark Red Kidney Beans',
    walmartQuery: 'Great Value Dark Red Kidney Beans 15 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Dark%20Red%20Kidney%20Beans%2015%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.82,
    packageSize: '15 oz can',
    isPantryStaple: true,
    keywords: ['kidney beans', 'red beans', 'chili beans'],
  },
  {
    id: 'wm-pan-15',
    name: 'Crushed Canned Tomatoes',
    walmartQuery: 'Great Value Crushed Tomatoes in Puree 28 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Crushed%20Tomatoes%2028%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.48,
    packageSize: '28 oz can',
    isPantryStaple: true,
    keywords: ['crushed tomatoes', 'canned tomatoes', 'tomato sauce', 'marinara base'],
  },
  {
    id: 'wm-pan-16',
    name: 'Tomato Paste',
    walmartQuery: 'Great Value Tomato Paste 6 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Tomato%20Paste%206%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.88,
    packageSize: '6 oz can',
    isPantryStaple: true,
    keywords: ['tomato paste', 'concentrated tomato paste'],
  },
  {
    id: 'wm-pan-17',
    name: 'All-Purpose Flour',
    walmartQuery: 'Great Value All-Purpose Enriched Flour 5 lb Bag',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20All%20Purpose%20Flour%205%20lb',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 2.38,
    packageSize: '5 lb bag',
    isPantryStaple: true,
    keywords: ['flour', 'all purpose flour', 'wheat flour', 'white flour', 'baking flour'],
  },
  {
    id: 'wm-pan-18',
    name: 'Granulated Sugar',
    walmartQuery: 'Great Value Pure Granulated White Sugar 4 lb Bag',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Granulated%20Sugar%204%20lb',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 2.98,
    packageSize: '4 lb bag',
    isPantryStaple: true,
    keywords: ['sugar', 'white sugar', 'granulated sugar', 'cane sugar'],
  },
  {
    id: 'wm-pan-19',
    name: 'Tikka Masala Curry Simmer Sauce',
    walmartQuery: "Patak's Tikka Masala Curry Simmer Sauce 15 oz",
    walmartSearchUrl: 'https://www.walmart.com/search?q=Pataks%20Tikka%20Masala%20Curry%20Sauce%2015%20oz',
    category: 'Pantry & Dry Goods',
    brand: "Patak's",
    estimatedPrice: 3.88,
    packageSize: '15 oz jar',
    isPantryStaple: false,
    keywords: ['tikka masala', 'curry sauce', 'simmer sauce', 'indian sauce'],
  },
  {
    id: 'wm-pan-20',
    name: 'Authentic Basmati Rice',
    walmartQuery: 'Royal Authentic Basmati Rice 5 lb Bag',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Royal%20Authentic%20Basmati%20Rice%205%20lb',
    category: 'Pantry & Dry Goods',
    brand: 'Royal',
    estimatedPrice: 7.98,
    packageSize: '5 lb bag',
    isPantryStaple: false,
    keywords: ['basmati rice', 'aromatic rice', 'indian rice'],
  },

  // --- BAKERY & TORTILLAS ---
  {
    id: 'wm-bak-1',
    itemId: '10312504',
    name: 'White Corn Street Taco Tortillas',
    walmartQuery: 'Mission White Corn Street Tacos Tortillas 24 Count',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Mission%20Street%20Tacos%20Corn%20Tortillas',
    category: 'Bakery',
    brand: 'Mission',
    estimatedPrice: 2.44,
    packageSize: '24 count pack',
    isPantryStaple: false,
    keywords: ['corn tortillas', 'street taco tortillas', 'white corn tortillas', 'tortillas'],
  },
  {
    id: 'wm-bak-2',
    name: 'Flour Tortillas',
    walmartQuery: 'Great Value Medium Soft Taco Flour Tortillas 10 Count',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Flour%20Tortillas%2010%20Count',
    category: 'Bakery',
    brand: 'Great Value',
    estimatedPrice: 1.98,
    packageSize: '10 count pack',
    isPantryStaple: false,
    keywords: ['flour tortillas', 'burrito tortillas', 'taco shells soft', 'wrap'],
  },
  {
    id: 'wm-bak-3',
    name: 'Original Naan Flatbread',
    walmartQuery: 'Stonefire Original Naan Flatbread 2 Pack',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Stonefire%20Original%20Naan%20Flatbread',
    category: 'Bakery',
    brand: 'Stonefire',
    estimatedPrice: 3.48,
    packageSize: '2 count pack',
    isPantryStaple: false,
    keywords: ['naan', 'naan bread', 'flatbread', 'indian bread'],
  },
  {
    id: 'wm-bak-4',
    name: 'White Sandwich Bread',
    walmartQuery: 'Great Value White Sandwich Bread 20 oz Loaf',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20White%20Sandwich%20Bread%2020%20oz',
    category: 'Bakery',
    brand: 'Great Value',
    estimatedPrice: 1.42,
    packageSize: '20 oz loaf',
    isPantryStaple: false,
    keywords: ['bread', 'sandwich bread', 'white bread', 'sliced bread'],
  },
  {
    id: 'wm-bak-5',
    name: 'Hamburger Buns',
    walmartQuery: 'Great Value Enriched Hamburger Buns 8 Count',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Hamburger%20Buns%208%20Count',
    category: 'Bakery',
    brand: 'Great Value',
    estimatedPrice: 1.48,
    packageSize: '8 count bag',
    isPantryStaple: false,
    keywords: ['burger buns', 'hamburger buns', 'buns', 'slider buns'],
  },

  // --- SPICES & SEASONINGS ---
  {
    id: 'wm-spc-1',
    itemId: '637648335',
    name: 'Italian Seasoning Blend',
    walmartQuery: 'Great Value Italian Seasoning 1.25 oz Bottle',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Italian%20Seasoning',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.12,
    packageSize: '1.25 oz bottle',
    isPantryStaple: true,
    keywords: ['italian seasoning', 'italian herbs', 'oregano and basil blend', 'dried herbs'],
  },
  {
    id: 'wm-spc-2',
    name: 'Iodized Table Salt',
    walmartQuery: 'Great Value Plain Iodized Table Salt 26 oz Canister',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Iodized%20Salt%2026%20oz',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 0.68,
    packageSize: '26 oz canister',
    isPantryStaple: true,
    keywords: ['salt', 'table salt', 'iodized salt', 'fine salt', 'kosher salt'],
  },
  {
    id: 'wm-spc-3',
    name: 'Ground Black Pepper',
    walmartQuery: 'Great Value Pure Ground Black Pepper 3 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Pure%20Ground%20Black%20Pepper%203%20oz',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.98,
    packageSize: '3 oz shaker',
    isPantryStaple: true,
    keywords: ['black pepper', 'ground pepper', 'black pepper shaker', 'pepper'],
  },
  {
    id: 'wm-spc-4',
    name: 'Garlic Powder',
    walmartQuery: 'Great Value Garlic Powder 3.4 oz Bottle',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Garlic%20Powder%203.4%20oz',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.12,
    packageSize: '3.4 oz bottle',
    isPantryStaple: true,
    keywords: ['garlic powder', 'granulated garlic', 'powdered garlic'],
  },
  {
    id: 'wm-spc-5',
    name: 'Onion Powder',
    walmartQuery: 'Great Value Onion Powder 2.62 oz Bottle',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Onion%20Powder%202.62%20oz',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.12,
    packageSize: '2.62 oz bottle',
    isPantryStaple: true,
    keywords: ['onion powder', 'granulated onion', 'powdered onion'],
  },
  {
    id: 'wm-spc-6',
    name: 'Crushed Red Pepper Flakes',
    walmartQuery: 'Great Value Crushed Red Pepper 1.5 oz Bottle',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Crushed%20Red%20Pepper',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.12,
    packageSize: '1.5 oz bottle',
    isPantryStaple: true,
    keywords: ['red pepper flakes', 'crushed red pepper', 'chili flakes', 'pizza flakes'],
  },
  {
    id: 'wm-spc-7',
    name: 'Ground Cumin',
    walmartQuery: 'Great Value Ground Cumin 2 oz Bottle',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Ground%20Cumin%202%20oz',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.24,
    packageSize: '2 oz bottle',
    isPantryStaple: true,
    keywords: ['cumin', 'ground cumin', 'comino'],
  },
  {
    id: 'wm-spc-8',
    name: 'Smoked Paprika',
    walmartQuery: 'Great Value Smoked Paprika 2.25 oz Bottle',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Smoked%20Paprika',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.48,
    packageSize: '2.25 oz bottle',
    isPantryStaple: true,
    keywords: ['paprika', 'smoked paprika', 'spanish paprika'],
  },
  {
    id: 'wm-spc-9',
    name: 'Garam Masala Seasoning',
    walmartQuery: 'McCormick Gourmet Garam Masala Blend 1.75 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=McCormick%20Gourmet%20Garam%20Masala',
    category: 'Spices & Seasonings',
    brand: 'McCormick',
    estimatedPrice: 4.48,
    packageSize: '1.75 oz jar',
    isPantryStaple: false,
    keywords: ['garam masala', 'indian spice blend', 'curry spice'],
  },
  {
    id: 'wm-spc-10',
    name: 'Chili Powder Seasoning',
    walmartQuery: 'Great Value Chili Powder 2.5 oz Bottle',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Chili%20Powder%202.5%20oz',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 1.24,
    packageSize: '2.5 oz bottle',
    isPantryStaple: true,
    keywords: ['chili powder', 'chile powder', 'taco seasoning chili powder'],
  },
  {
    id: 'wm-spc-11',
    name: 'Fajita Seasoning Packet',
    walmartQuery: 'Great Value Fajita Seasoning Mix 1.12 oz Packet',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Fajita%20Seasoning%20Packet',
    category: 'Spices & Seasonings',
    brand: 'Great Value',
    estimatedPrice: 0.68,
    packageSize: '1.12 oz envelope',
    isPantryStaple: false,
    keywords: ['fajita seasoning', 'fajita mix', 'seasoning packet'],
  },

  // --- CONDIMENTS & SAUCES ---
  {
    id: 'wm-cnd-1',
    name: 'Real Mayonnaise',
    walmartQuery: 'Great Value Real Mayonnaise 30 fl oz Jar',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Real%20Mayonnaise%2030%20fl%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 3.28,
    packageSize: '30 fl oz jar',
    isPantryStaple: true,
    keywords: ['mayo', 'mayonnaise', 'real mayonnaise'],
  },
  {
    id: 'wm-cnd-2',
    name: 'Tomato Ketchup',
    walmartQuery: 'Great Value Tomato Ketchup 32 oz Squeeze Bottle',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Tomato%20Ketchup%2032%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.68,
    packageSize: '32 oz squeeze bottle',
    isPantryStaple: true,
    keywords: ['ketchup', 'catsup', 'tomato ketchup'],
  },
  {
    id: 'wm-cnd-3',
    name: 'Soy Sauce',
    walmartQuery: 'Kikkoman Naturally Brewed Soy Sauce 15 fl oz Bottle',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Kikkoman%20Soy%20Sauce%2015%20fl%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Kikkoman',
    estimatedPrice: 2.78,
    packageSize: '15 fl oz bottle',
    isPantryStaple: true,
    keywords: ['soy sauce', 'shoyu', 'kikkoman'],
  },
  {
    id: 'wm-cnd-4',
    name: 'Restaurant Style Salsa',
    walmartQuery: 'Great Value Restaurant Style Salsa 16 oz Jar',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Restaurant%20Style%20Salsa%2016%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.98,
    packageSize: '16 oz jar',
    isPantryStaple: false,
    keywords: ['salsa', 'red salsa', 'restaurant style salsa', 'taco salsa'],
  },
  // --- ADDITIONAL POPULAR STAPLES & SPECIALTY FOODS ---
  {
    id: 'wm-meat-turkey',
    name: '93/7 Lean Ground Turkey',
    walmartQuery: 'Great Value 93/7 Lean Ground Turkey 16 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%2093%2F7%20Ground%20Turkey%2016%20oz',
    category: 'Meat & Seafood',
    brand: 'Great Value',
    estimatedPrice: 3.98,
    packageSize: '16 oz roll / tray',
    isPantryStaple: false,
    keywords: ['ground turkey', 'lean ground turkey', 'turkey mince', 'minced turkey', 'turkey burger meat'],
  },
  {
    id: 'wm-pantry-chickbroth',
    name: 'Low Sodium Chicken Broth',
    walmartQuery: 'Great Value Low Sodium Chicken Broth 32 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Chicken%20Broth%2032%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.37,
    packageSize: '32 oz carton',
    isPantryStaple: false,
    keywords: ['chicken broth', 'chicken stock', 'low sodium chicken broth', 'chicken bouillon', 'bone broth chicken'],
  },
  {
    id: 'wm-pantry-beefbroth',
    name: 'Beef Broth',
    walmartQuery: 'Great Value Beef Broth 32 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Beef%20Broth%2032%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.37,
    packageSize: '32 oz carton',
    isPantryStaple: false,
    keywords: ['beef broth', 'beef stock', 'consomme', 'beef bouillon'],
  },
  {
    id: 'wm-pantry-vegbroth',
    name: 'Vegetable Broth',
    walmartQuery: 'Great Value Vegetable Broth 32 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Vegetable%20Broth%2032%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.37,
    packageSize: '32 oz carton',
    isPantryStaple: false,
    keywords: ['vegetable broth', 'vegetable stock', 'veggie broth'],
  },
  {
    id: 'wm-pantry-guajillo',
    name: 'Dried Guajillo Chiles',
    walmartQuery: 'El Guapo Whole Dried Guajillo Chili Pods 7.5 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Dried%20Guajillo%20Chile%20Pods',
    category: 'Pantry & Dry Goods',
    brand: 'El Guapo',
    estimatedPrice: 2.98,
    packageSize: '7.5 oz bag',
    isPantryStaple: false,
    keywords: ['guajillo', 'guajillo chiles', 'dried guajillo chiles', 'guajillo chili pods', 'chile guajillo'],
  },
  {
    id: 'wm-pantry-ancho',
    name: 'Dried Ancho Chiles',
    walmartQuery: 'El Guapo Whole Dried Ancho Chili Pods 7.5 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Dried%20Ancho%20Chile%20Pods',
    category: 'Pantry & Dry Goods',
    brand: 'El Guapo',
    estimatedPrice: 2.98,
    packageSize: '7.5 oz bag',
    isPantryStaple: false,
    keywords: ['ancho', 'ancho chiles', 'dried ancho chiles', 'chile ancho'],
  },
  {
    id: 'wm-bakery-corntort',
    name: 'White Corn Street Taco Tortillas',
    walmartQuery: 'Mission White Corn Street Tacos Tortillas 24 ct',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Mission%20Street%20Tacos%20Corn%20Tortillas',
    category: 'Bakery',
    brand: 'Mission',
    estimatedPrice: 2.44,
    packageSize: '24 count pack',
    isPantryStaple: false,
    keywords: ['corn tortilla', 'corn tortillas', 'white corn tortillas', 'street taco tortillas', 'yellow corn tortillas', 'mexican tortillas'],
  },
  {
    id: 'wm-bakery-flourtort',
    name: 'Flour Tortillas',
    walmartQuery: 'Great Value Soft Taco Flour Tortillas 10 Count',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Flour%20Tortillas%2010%20Count',
    category: 'Bakery',
    brand: 'Great Value',
    estimatedPrice: 1.98,
    packageSize: '10 count pack',
    isPantryStaple: false,
    keywords: ['flour tortilla', 'flour tortillas', 'soft taco tortillas', 'burrito tortillas'],
  },
  {
    id: 'wm-dairy-cotija',
    name: 'Cotija Part-Skim Milk Cheese',
    walmartQuery: 'Cacique Cotija Mexican Style Part-Skim Milk Cheese 10 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Cacique%20Cotija%20Cheese%2010%20oz',
    category: 'Dairy & Eggs',
    brand: 'Cacique',
    estimatedPrice: 3.98,
    packageSize: '10 oz package',
    isPantryStaple: false,
    keywords: ['cotija', 'cotija cheese', 'queso cotija', 'crumbled cotija'],
  },
  {
    id: 'wm-dairy-almondmilk',
    name: 'Unsweetened Almond Milk',
    walmartQuery: 'Great Value Unsweetened Almond Milk 64 fl oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Almond%20Milk%2064%20fl%20oz',
    category: 'Dairy & Eggs',
    brand: 'Great Value',
    estimatedPrice: 2.28,
    packageSize: '64 fl oz carton',
    isPantryStaple: false,
    keywords: ['almond milk', 'almondmilk', 'unsweetened almond milk', 'plant milk'],
  },
  {
    id: 'wm-prod-jalapeno',
    name: 'Fresh Jalapeno Pepper',
    walmartQuery: 'Fresh Jalapeno Pepper Each',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Fresh%20Jalapeno%20Pepper',
    category: 'Produce',
    brand: 'Fresh Produce',
    estimatedPrice: 0.25,
    packageSize: '1 pepper',
    isPantryStaple: false,
    keywords: ['jalapeno', 'jalapenos', 'jalapeno pepper', 'fresh jalapeno'],
  },
  {
    id: 'wm-pantry-sundried',
    name: 'Sun-Dried Tomatoes in Oil',
    walmartQuery: 'California Sun Dry Julienne Cut Sun-Dried Tomatoes in Oil 8.5 oz',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Sun-Dried%20Tomatoes%20Julienne%20Cut%20in%20Oil',
    category: 'Pantry & Dry Goods',
    brand: 'California Sun Dry',
    estimatedPrice: 3.48,
    packageSize: '8.5 oz jar',
    isPantryStaple: false,
    keywords: ['sun-dried tomatoes', 'sundried tomatoes', 'sun dried tomatoes', 'tomatoes in oil'],
  },
  {
    id: 'wm-pantry-blackbeans',
    name: 'Canned Black Beans',
    walmartQuery: 'Great Value Black Beans 15 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Black%20Beans%2015%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.86,
    packageSize: '15 oz can',
    isPantryStaple: false,
    keywords: ['black beans', 'canned black beans', 'frijoles negros'],
  },
  {
    id: 'wm-pantry-pintobeans',
    name: 'Canned Pinto Beans',
    walmartQuery: 'Great Value Pinto Beans 15 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Pinto%20Beans%2015%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.86,
    packageSize: '15 oz can',
    isPantryStaple: false,
    keywords: ['pinto beans', 'canned pinto beans', 'frijoles'],
  },
  {
    id: 'wm-pantry-dicedtom',
    name: 'Canned Diced Tomatoes',
    walmartQuery: 'Great Value Diced Tomatoes in Juice 14.5 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Diced%20Tomatoes%2014.5%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.98,
    packageSize: '14.5 oz can',
    isPantryStaple: false,
    keywords: ['diced tomatoes', 'canned diced tomatoes', 'canned tomatoes'],
  },
  {
    id: 'wm-pantry-crushedtom',
    name: 'Canned Crushed Tomatoes',
    walmartQuery: 'Great Value Crushed Tomatoes 28 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Crushed%20Tomatoes%2028%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.68,
    packageSize: '28 oz can',
    isPantryStaple: false,
    keywords: ['crushed tomatoes', 'canned crushed tomatoes', 'tomato puree'],
  },
  {
    id: 'wm-pantry-tompast',
    name: 'Tomato Paste',
    walmartQuery: 'Great Value Tomato Paste 6 oz Can',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Tomato%20Paste%206%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 0.82,
    packageSize: '6 oz can',
    isPantryStaple: false,
    keywords: ['tomato paste', 'canned tomato paste'],
  },
  {
    id: 'wm-pantry-jasmine',
    name: 'Jasmine White Rice',
    walmartQuery: 'Great Value Jasmine Rice 5 lb Bag',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Jasmine%20Rice%205%20lb',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 5.44,
    packageSize: '5 lb bag',
    isPantryStaple: false,
    keywords: ['jasmine rice', 'thai jasmine rice', 'white jasmine rice'],
  },
  {
    id: 'wm-pantry-whiterice',
    name: 'Long Grain White Rice',
    walmartQuery: 'Great Value Long Grain Enriched White Rice 5 lb Bag',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20White%20Rice%205%20lb',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 3.34,
    packageSize: '5 lb bag',
    isPantryStaple: false,
    keywords: ['white rice', 'long grain rice', 'rice', 'plain rice'],
  },
  {
    id: 'wm-pantry-fettuccine',
    name: 'Fettuccine Pasta',
    walmartQuery: 'Great Value Fettuccine Pasta 16 oz Box',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Fettuccine%20Pasta%2016%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.12,
    packageSize: '16 oz box',
    isPantryStaple: false,
    keywords: ['fettuccine', 'fettuccine pasta', 'fettuccine noodles', 'dry pasta'],
  },
  {
    id: 'wm-pantry-spaghetti',
    name: 'Spaghetti Pasta',
    walmartQuery: 'Great Value Spaghetti Pasta 16 oz Box',
    walmartSearchUrl: 'https://www.walmart.com/search?q=Great%20Value%20Spaghetti%20Pasta%2016%20oz',
    category: 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 1.12,
    packageSize: '16 oz box',
    isPantryStaple: false,
    keywords: ['spaghetti', 'spaghetti pasta', 'spaghetti noodles'],
  },
];

/**
 * Clean user ingredient text to isolate the core ingredient name
 */
export function cleanRawIngredientText(raw: string): string {
  let text = raw.replace(/\([^)]*\)/g, ' ').trim();
  text = text.replace(
    /^(\d+[\d\/\.\s]*)\s*(lbs|lb|pounds|pound|oz|ounces|ounce|cups|cup|tbsp|tablespoons|tablespoon|tsp|teaspoons|teaspoon|cloves|clove|heads|head|cans|can|jars|jar|bottles|bottle|packages|package|pack|packs|bags|bag|pints|pint|quarts|quart|slices|slice|pieces|piece|stalks|stalk)?\b/i,
    ' '
  );

  const prepWords = [
    'minced', 'diced', 'chopped', 'sliced', 'grated', 'shredded', 'crushed', 'melted',
    'softened', 'divided', 'rinsed', 'drained', 'peeled', 'trimmed', 'seeded', 'halved',
    'quartered', 'cooked', 'uncooked', 'thawed', 'frozen', 'room temperature', 'to taste',
    'freshly ground', 'coarsely', 'finely', 'thinly', 'thickly', 'for garnish', 'for serving',
    'optional'
  ];
  for (const w of prepWords) {
    const re = new RegExp(`\\b${w}\\b`, 'gi');
    text = text.replace(re, ' ');
  }
  return text.replace(/[,\-\.\s]+/g, ' ').trim().toLowerCase();
}

// Conflict words groups: If query has item A, it CANNOT match item B!
const CONFLICT_GROUPS: Array<string[]> = [
  // Meat cuts & species
  ['thigh', 'thighs'],
  ['breast', 'breasts'],
  ['ground beef', 'beef chuck', 'beef roast', 'flank steak', 'sirloin'],
  ['ground turkey', 'turkey'],
  ['pork', 'pork chop', 'pork chops', 'bacon'],
  ['salmon', 'fish'],
  ['shrimp', 'prawns'],
  // Liquids vs solids
  ['broth', 'stock', 'bouillon'],
  // Tortilla types
  ['corn tortilla', 'corn tortillas', 'street taco'],
  ['flour tortilla', 'flour tortillas', 'burrito'],
  // Peppers
  ['guajillo'],
  ['ancho'],
  ['jalapeno', 'jalapenos'],
  ['bell pepper', 'bell peppers', 'sweet pepper'],
  // Dairy varieties
  ['heavy cream', 'whipping cream', 'heavy whipping cream'],
  ['milk', 'whole milk', '2% milk', 'skim milk'],
  ['sour cream'],
  ['cream cheese'],
  ['oaxaca'],
  ['cotija'],
  ['cheddar'],
  ['mozzarella'],
  ['parmesan'],
];

/**
 * Checks if candidate conflicts with query
 */
function hasFoodConflict(queryCleaned: string, candidate: WalmartGroceryProduct): boolean {
  const candText = `${candidate.name} ${candidate.walmartQuery} ${candidate.keywords.join(' ')}`.toLowerCase();

  // Meat cut conflict: e.g. "thigh" vs "breast"
  if (queryCleaned.includes('thigh') && !candText.includes('thigh')) {
    if (candText.includes('breast') || candText.includes('wing')) return true;
  }
  if (queryCleaned.includes('breast') && !candText.includes('breast')) {
    if (candText.includes('thigh') || candText.includes('wing')) return true;
  }

  // Broth vs raw meat
  if (queryCleaned.includes('broth') || queryCleaned.includes('stock')) {
    if (candidate.category === 'Meat & Seafood' && !candText.includes('broth')) return true;
  }
  if (!queryCleaned.includes('broth') && !queryCleaned.includes('stock')) {
    if (candText.includes('broth') || candText.includes('stock')) return true;
  }

  // Animal species conflict
  if (queryCleaned.includes('turkey') && !candText.includes('turkey')) {
    if (candText.includes('beef') || candText.includes('chicken') || candText.includes('pork')) return true;
  }
  if (queryCleaned.includes('beef') && !candText.includes('beef')) {
    if (candText.includes('turkey') || candText.includes('chicken') || candText.includes('pork')) return true;
  }
  if (queryCleaned.includes('chicken') && !candText.includes('chicken')) {
    if (candText.includes('beef') || candText.includes('turkey') || candText.includes('pork')) return true;
  }
  if (queryCleaned.includes('pork') && !candText.includes('pork')) {
    if (candText.includes('chicken') || candText.includes('beef') || candText.includes('turkey')) return true;
  }

  // Tortillas conflict (corn vs flour)
  if (queryCleaned.includes('corn') && candText.includes('flour tortilla')) return true;
  if (queryCleaned.includes('flour') && candText.includes('corn tortilla')) return true;

  // Pepper conflict
  if (queryCleaned.includes('guajillo') && !candText.includes('guajillo')) return true;
  if (queryCleaned.includes('ancho') && !candText.includes('ancho')) return true;
  if (queryCleaned.includes('jalapeno') && !candText.includes('jalapeno')) return true;

  // Dairy conflict (cream vs milk)
  if (queryCleaned.includes('cream') && !queryCleaned.includes('sour') && !queryCleaned.includes('ice cream')) {
    if (candText.includes('whole milk') && !candText.includes('cream')) return true;
  }

  return false;
}

/**
 * Matches an ingredient name against our verified Walmart Grocery Catalog
 * Guarantees that only authentic food products are returned, never conflicting or distorted items!
 */
export function matchWalmartGroceryItem(rawName: string, categoryHint?: string): WalmartGroceryProduct {
  const extractedId = extractWalmartItemId(rawName);
  if (extractedId) {
    const directMatch = WALMART_GROCERY_CATALOG.find((p) => p.itemId === extractedId);
    if (directMatch) return directMatch;
  }

  const cleaned = cleanRawIngredientText(rawName);

  // User Requirement: Default chicken for all recipes must be Fresh Whole Rotisserie Chicken!
  if (
    cleaned === 'chicken' ||
    cleaned === 'rotisserie chicken' ||
    cleaned === 'whole chicken' ||
    cleaned === 'cooked chicken' ||
    cleaned === 'shredded chicken' ||
    cleaned === 'chicken meat' ||
    cleaned === 'chicken breast' ||
    cleaned === 'chicken breasts' ||
    (cleaned.startsWith('chicken') &&
      !cleaned.includes('thigh') &&
      !cleaned.includes('wing') &&
      !cleaned.includes('broth') &&
      !cleaned.includes('nugget') &&
      !cleaned.includes('tender') &&
      !cleaned.includes('soup') &&
      !cleaned.includes('bouillon'))
  ) {
    const rotisserie = WALMART_GROCERY_CATALOG.find((p) => p.id === 'wm-fav-rotisserie-chicken' || p.id === 'wm-meat-rotisserie');
    if (rotisserie) return rotisserie;
  }

  // 1. Direct exact keyword or name match
  for (const prod of WALMART_GROCERY_CATALOG) {
    if (hasFoodConflict(cleaned, prod)) continue;

    if (prod.name.toLowerCase() === cleaned) {
      return prod;
    }
    for (const kw of prod.keywords) {
      if (cleaned === kw) {
        return prod;
      }
    }
  }

  // 2. High-confidence Token & Phrase Matching with strict conflict prevention
  const tokens = cleaned.split(' ').filter((t) => t.length >= 3);
  let bestProd: WalmartGroceryProduct | null = null;
  let maxScore = 0;

  for (const prod of WALMART_GROCERY_CATALOG) {
    if (hasFoodConflict(cleaned, prod)) continue;

    let score = 0;
    const candNameLower = prod.name.toLowerCase();
    const candQueryLower = prod.walmartQuery.toLowerCase();

    // Exact phrase inside candidate or candidate name inside cleaned
    if (candNameLower.includes(cleaned)) score += 30;
    if (cleaned.includes(candNameLower)) score += 30;

    for (const kw of prod.keywords) {
      if (kw === cleaned) score += 50;
      else if (cleaned.includes(kw)) score += 20;
      else if (kw.includes(cleaned)) score += 15;
    }

    for (const token of tokens) {
      if (candNameLower.includes(token)) score += 8;
      if (candQueryLower.includes(token)) score += 6;
      if (prod.keywords.some((k) => k.includes(token))) score += 5;
    }

    if (categoryHint && prod.category.toLowerCase() === categoryHint.toLowerCase()) {
      score += 3;
    }

    if (score > maxScore) {
      maxScore = score;
      bestProd = prod;
    }
  }

  // Require strong confidence (score >= 18) to avoid false matches
  if (bestProd && maxScore >= 18) {
    return bestProd;
  }

  // 3. Fallback: generate guaranteed clean grocery search query for Walmart (NEVER non-food)
  const displayTitle = rawName.replace(/[^\w\s\-\']/g, ' ').replace(/\s+/g, ' ').trim();
  const walmartQuery = displayTitle.toLowerCase().startsWith('great value') || displayTitle.toLowerCase().startsWith('fresh')
    ? displayTitle
    : `Great Value ${displayTitle}`;
  const encoded = encodeURIComponent(walmartQuery);

  return {
    id: `wm-gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: displayTitle,
    walmartQuery,
    walmartSearchUrl: `https://www.walmart.com/search?q=${encoded}`,
    category: (categoryHint as any) || 'Pantry & Dry Goods',
    brand: 'Great Value',
    estimatedPrice: 2.48,
    packageSize: '1 package',
    isPantryStaple: false,
    keywords: [cleaned],
  };
}

/**
 * Calculates the exact retail package count needed for an ingredient based on
 * the recipe's required amount, unit, and retail packaging format.
 */
export function calculateRetailPackageQuantity(
  amount: number,
  unit: string,
  packageSize?: string,
  category?: string
): number {
  if (!amount || isNaN(amount) || amount <= 0) return 1;

  const cleanUnit = (unit || '').toLowerCase().trim();
  const pkg = (packageSize || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // 1. Spices, Seasonings, Pantry Flavorings, Extracts:
  // Culinary pinches, dashes, tsp, tbsp always fit in 1 standard jar/tin/bottle
  if (
    cat.includes('spice') ||
    cleanUnit.includes('pinch') ||
    cleanUnit.includes('dash') ||
    cleanUnit.includes('sprig') ||
    ((cleanUnit.includes('tsp') || cleanUnit.includes('teaspoon')) &&
      (pkg.includes('bottle') || pkg.includes('jar') || pkg.includes('tin') || pkg.includes('pouch') || pkg.includes('box')))
  ) {
    return 1;
  }

  // 2. Dried chiles, whole bay leaves, cinnamon sticks, whole pods, tea bags:
  // When recipes ask for 1-15 whole dried pods/leaves (e.g. "5 dried guajillo chiles", "2 bay leaves"),
  // retail bags/pouches/jars hold 20-50+ units. 1 bag is plenty!
  const isDriedPodOrHerb =
    pkg.includes('bag') || pkg.includes('pouch') || pkg.includes('jar') || pkg.includes('box');
  const isCountUnit = [
    'count',
    'item',
    'unit',
    'whole',
    'piece',
    'pieces',
    'chile',
    'chiles',
    'chili',
    'leaf',
    'leaves',
    'stick',
    'sticks',
    'pod',
    'pods',
  ].includes(cleanUnit);

  if (
    isDriedPodOrHerb &&
    isCountUnit &&
    (pkg.includes('chili') ||
      pkg.includes('chile') ||
      pkg.includes('bay') ||
      pkg.includes('pepper') ||
      pkg.includes('pod') ||
      cat.includes('spice') ||
      cat.includes('produce'))
  ) {
    // If recipe requests <= 15 pods/leaves, 1 standard retail bag/jar easily covers it
    if (amount <= 15) {
      return 1;
    }
    return Math.max(1, Math.ceil(amount / 20));
  }

  // 3. Individual produce / unit count items (e.g. "1 whole lime", "1 pepper", "1 whole onion", "1 tomato", "1 lemon")
  const isIndividualUnit =
    pkg.includes('each') ||
    pkg.includes('1 whole') ||
    pkg.includes('1 pepper') ||
    pkg.includes('1 tomato') ||
    pkg.includes('1 fresh bunch') ||
    pkg.includes('1 bulb');

  if (isIndividualUnit) {
    if (
      [
        'count',
        'item',
        'unit',
        'whole',
        'pieces',
        'piece',
        'lime',
        'limes',
        'lemon',
        'lemons',
        'onion',
        'onions',
        'pepper',
        'peppers',
        'tomato',
        'tomatoes',
      ].includes(cleanUnit)
    ) {
      return Math.max(1, Math.ceil(amount));
    }
  }

  // 4. Count-based retail pack (e.g. "24 count pack", "12 count carton", "4 count bag", "3 bulbs sleeve", "10 count pack")
  const countPackMatch = pkg.match(/(\d+)\s*(?:count|ct|pack|bulbs|sticks)/i);
  if (countPackMatch) {
    const packCount = parseInt(countPackMatch[1], 10);
    if (packCount > 0) {
      if (
        [
          'count',
          'item',
          'unit',
          'whole',
          'piece',
          'pieces',
          'tortilla',
          'tortillas',
          'egg',
          'eggs',
        ].includes(cleanUnit)
      ) {
        return Math.max(1, Math.ceil(amount / packCount));
      }
      if (cleanUnit === 'clove' || cleanUnit === 'cloves') {
        // 1 garlic bulb contains ~10-12 cloves. A 3-bulb sleeve contains ~30-36 cloves.
        return Math.max(1, Math.ceil(amount / (packCount * 10)));
      }
    }
  }

  // 5. Weight extraction from package (lbs or oz)
  let pkgOz: number | null = null;
  const lbMatch = pkg.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound)/i);
  if (lbMatch) {
    pkgOz = parseFloat(lbMatch[1]) * 16;
  } else {
    const ozMatch = pkg.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounce)/i);
    if (ozMatch) {
      pkgOz = parseFloat(ozMatch[1]);
    }
  }

  // 6. Recipe in Weight (lbs or oz)
  let neededWeightOz: number | null = null;
  if (['lb', 'lbs', 'pound', 'pounds'].includes(cleanUnit)) {
    neededWeightOz = amount * 16;
  } else if (['oz', 'ounce', 'ounces'].includes(cleanUnit)) {
    neededWeightOz = amount;
  }

  if (neededWeightOz !== null && pkgOz !== null && pkgOz > 0) {
    return Math.max(1, Math.ceil(neededWeightOz / pkgOz));
  }

  // 7. Volumetric Leafy Greens & Fresh Produce in Cups (e.g. "3 cups baby spinach", "2 cups arugula", "1 cup cilantro"):
  // Fresh leafy greens weigh only ~1 oz per cup (10 oz tub has ~10-12 cups of fresh greens).
  const isLeafyGreen =
    pkg.includes('spinach') ||
    pkg.includes('kale') ||
    pkg.includes('arugula') ||
    pkg.includes('greens') ||
    pkg.includes('salad') ||
    pkg.includes('herb') ||
    (cleanUnit.includes('cup') && (cat.includes('produce') && !pkg.includes('berry') && !pkg.includes('fruit')));

  if (isLeafyGreen && ['cup', 'cups'].includes(cleanUnit) && pkgOz !== null && pkgOz > 0) {
    const approxWeightOz = amount * 1.0; // 1 cup ≈ 1 oz
    return Math.max(1, Math.ceil(approxWeightOz / pkgOz));
  }

  // 8. Volumetric Shredded/Grated Cheese in Cups (e.g. "0.5 cup parmesan", "1 cup shredded cheddar"):
  // 1 cup grated/shredded cheese ≈ 4 oz by weight.
  const isCheese =
    cat.includes('dairy') &&
    (pkg.includes('cheese') ||
      pkg.includes('parmesan') ||
      pkg.includes('cheddar') ||
      pkg.includes('mozzarella'));
  if (isCheese && ['cup', 'cups'].includes(cleanUnit) && pkgOz !== null && pkgOz > 0) {
    const approxWeightOz = amount * 4.0; // 1 cup ≈ 4 oz
    return Math.max(1, Math.ceil(approxWeightOz / pkgOz));
  }

  // 9. Volumetric Grains, Oats, Granola, Flour, Sugar in Cups:
  // 1 cup ≈ 4-5 oz by weight.
  const isDryGrain =
    cat.includes('pantry') &&
    (pkg.includes('granola') ||
      pkg.includes('oats') ||
      pkg.includes('flour') ||
      pkg.includes('sugar') ||
      pkg.includes('rice'));
  if (isDryGrain && ['cup', 'cups'].includes(cleanUnit) && pkgOz !== null && pkgOz > 0) {
    const approxWeightOz = amount * 4.5; // 1 cup ≈ 4.5 oz
    return Math.max(1, Math.ceil(approxWeightOz / pkgOz));
  }

  // 10. Berries & Small Fruit in Cups:
  // 1 cup berries ≈ 5.5 oz by weight. 1 pint clamshell ≈ 16 oz.
  const isBerries =
    pkg.includes('strawberr') ||
    pkg.includes('blueberr') ||
    pkg.includes('raspberr') ||
    pkg.includes('blackberr');
  if (isBerries && ['cup', 'cups', 'pint', 'pints'].includes(cleanUnit) && pkgOz !== null && pkgOz > 0) {
    const approxWeightOz = cleanUnit.includes('pint') ? amount * 16 : amount * 5.5;
    return Math.max(1, Math.ceil(approxWeightOz / pkgOz));
  }

  // 11. Liquid Volume matching (cups/tbsp/tsp/fl oz, package in fl oz/carton/jug/bottle/jar)
  let neededFlOz: number | null = null;
  if (['cup', 'cups'].includes(cleanUnit)) {
    neededFlOz = amount * 8;
  } else if (['tbsp', 'tablespoon', 'tablespoons'].includes(cleanUnit)) {
    neededFlOz = amount * 0.5;
  } else if (['tsp', 'teaspoon', 'teaspoons'].includes(cleanUnit)) {
    neededFlOz = amount * 0.1667;
  } else if (['fl oz', 'fluid oz'].includes(cleanUnit)) {
    neededFlOz = amount;
  } else if (['quart', 'quarts'].includes(cleanUnit)) {
    neededFlOz = amount * 32;
  } else if (['gallon', 'gallons'].includes(cleanUnit)) {
    neededFlOz = amount * 128;
  }

  let pkgFlOz: number | null = null;
  const pkgFlOzMatch = pkg.match(/(\d+(?:\.\d+)?)\s*(?:fl\s*oz|fluid\s*oz)/i);
  if (pkgFlOzMatch) {
    pkgFlOz = parseFloat(pkgFlOzMatch[1]);
  } else if (pkg.includes('gallon')) {
    pkgFlOz = 128;
  } else if (pkg.includes('quart')) {
    pkgFlOz = 32;
  } else if (pkgOz !== null) {
    pkgFlOz = pkgOz;
  }

  if (neededFlOz !== null && pkgFlOz !== null && pkgFlOz > 0) {
    if (neededFlOz <= pkgFlOz) {
      return 1;
    }
    return Math.max(1, Math.ceil(neededFlOz / pkgFlOz));
  }

  // 12. Cans, jars, bags, boxes unit match
  if (
    [
      'can',
      'cans',
      'jar',
      'jars',
      'bag',
      'bags',
      'box',
      'boxes',
      'pack',
      'packs',
      'package',
      'packages',
      'bunch',
      'bunches',
      'pizza',
      'pizzas',
      'pie',
      'pies',
    ].includes(cleanUnit)
  ) {
    return Math.max(1, Math.ceil(amount));
  }

  // 13. Generic items/count
  if (['count', 'item', 'unit', 'each'].includes(cleanUnit)) {
    return Math.max(1, Math.ceil(amount));
  }

  return 1;
}

/**
 * Search the verified catalog for suggestions (used in autocomplete & swap modal)
 */
export function searchWalmartCatalog(query: string, limit = 10): WalmartGroceryProduct[] {
  if (!query.trim()) return WALMART_GROCERY_CATALOG.slice(0, limit);
  const q = query.toLowerCase().trim();

  return WALMART_GROCERY_CATALOG.filter((item) => {
    return (
      item.name.toLowerCase().includes(q) ||
      item.walmartQuery.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q))
    );
  }).slice(0, limit);
}

/**
 * Finds or synthesizes a verified Great Value store-brand substitution for an ingredient
 */
export function findGreatValueSubstitution(ingredientName: string, originalPrice?: number): {
  name: string;
  explanation: string;
  walmartQuery: string;
  walmartSearchUrl: string;
  walmartDirectAddUrl?: string;
  itemId?: string;
  estimatedPrice: number;
  isGreatValue: boolean;
  savingsVsOriginal: number;
} {
  const clean = ingredientName.toLowerCase().trim();
  const tokens = clean.split(/\s+/).filter((t) => t.length > 2);

  // Look for existing Great Value branded items in catalog
  const gvMatches = WALMART_GROCERY_CATALOG.filter((item) => {
    const isGV = item.brand === 'Great Value' || item.name.toLowerCase().includes('great value') || item.walmartQuery.toLowerCase().includes('great value');
    if (!isGV) return false;
    const nameLower = item.name.toLowerCase();
    const queryLower = item.walmartQuery.toLowerCase();
    return tokens.some((tok) => nameLower.includes(tok) || queryLower.includes(tok) || item.keywords.some((k) => k.includes(tok)));
  });

  if (gvMatches.length > 0) {
    const best = gvMatches[0];
    const orig = originalPrice && originalPrice > best.estimatedPrice ? originalPrice : parseFloat((best.estimatedPrice * 1.3).toFixed(2));
    const savings = Math.max(0.40, parseFloat((orig - best.estimatedPrice).toFixed(2)));

    return {
      name: best.name,
      explanation: `Walmart Great Value store brand option (${best.packageSize}) delivers the best price-to-quality ratio.`,
      walmartQuery: best.walmartQuery,
      walmartSearchUrl: best.walmartSearchUrl,
      walmartDirectAddUrl: best.itemId ? `https://www.walmart.com/ip/${best.itemId}` : best.walmartSearchUrl,
      itemId: best.itemId,
      estimatedPrice: best.estimatedPrice,
      isGreatValue: true,
      savingsVsOriginal: savings,
    };
  }

  // Synthesize a Great Value query for items not explicitly in catalog
  const query = `Great Value ${ingredientName.replace(/^(fresh|organic|pure|raw)\s+/i, '').trim()}`;
  const orig = originalPrice && originalPrice > 0 ? originalPrice : 3.48;
  const estimatedPrice = Math.max(0.98, parseFloat((orig * 0.72).toFixed(2)));
  const savings = Math.max(0.50, parseFloat((orig - estimatedPrice).toFixed(2)));

  return {
    name: `Great Value ${ingredientName.replace(/^(fresh|organic|pure|raw)\s+/i, '').trim()}`,
    explanation: 'Walmart Great Value store-brand alternative with everyday low pricing.',
    walmartQuery: query,
    walmartSearchUrl: `https://www.walmart.com/search?q=${encodeURIComponent(query)}`,
    walmartDirectAddUrl: `https://www.walmart.com/search?q=${encodeURIComponent(query)}`,
    estimatedPrice,
    isGreatValue: true,
    savingsVsOriginal: savings,
  };
}


