export interface Ingredient {
  id: string;
  itemId?: string;
  name: string;
  rawText: string;
  amount: number;
  unit: string;
  category: string;
  walmartQuery: string;
  walmartSearchUrl: string;
  walmartDirectAddUrl?: string;
  brandTier: 'great_value' | 'name_brand' | 'organic';
  estimatedPrice: number;
  packageSize: string;
  isPantryStaple: boolean;
  inPantry: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  baseServings: number;
  cuisine: string;
  tags: string[];
  image: string;
  instructions: string[];
  ingredients: Ingredient[];
  isCustom?: boolean;
  createdAt?: number;
  sourceUrl?: string;
}

export interface SubstitutionOption {
  name: string;
  explanation: string;
  walmartQuery: string;
  walmartSearchUrl: string;
  walmartDirectAddUrl?: string;
  itemId?: string;
  estimatedPrice: number;
  isGreatValue?: boolean;
  savingsVsOriginal?: number;
}

export interface CartItem extends Ingredient {
  recipeTitle?: string;
  orderQuantity: number;
}

export type DefaultSelectionMode = 'all' | 'exclude_staples' | 'perishables_only';

export interface DefaultSelectionSettings {
  mode: DefaultSelectionMode;
  homeStaples: string[];
  autoApplyOnOpen: boolean;
}


