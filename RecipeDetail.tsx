import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  Clock,
  Plus,
  ShoppingBag,
  ExternalLink,
  ChefHat,
  Filter,
  CheckCircle2,
  DollarSign,
  Zap,
  Trash2,
  CheckSquare,
  Square,
  RotateCcw,
  Store,
  SlidersHorizontal,
  Pencil,
  Package,
  Check,
} from 'lucide-react';
import { Recipe, Ingredient, DefaultSelectionSettings } from '../types';
import { IngredientRow } from './IngredientRow';
import { SwapWalmartProductModal } from './SwapWalmartProductModal';
import { CartItem } from './WalmartCartDrawer';
import { matchWalmartGroceryItem, calculateRetailPackageQuantity, WalmartGroceryProduct } from '../data/walmartGroceryCatalog';
import { applyDefaultSelectionToRecipe } from '../utils/defaultSelection';
import { isIngredientInPantry } from '../utils/pantry';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onUpdateRecipe: (updated: Recipe) => void;
  onAddAllToCart: (recipe: Recipe, selectedIngredientIds?: Set<string>, servingMultiplier?: number) => void;
  onRequestSubstitute: (ingredient: Ingredient) => void;
  cartItemIds: Set<string>;
  cartItems?: CartItem[];
  onToggleCartItem: (ingredient: Ingredient, servingMultiplier?: number) => void;
  onOpenCart: () => void;
  defaultSelectionSettings?: DefaultSelectionSettings;
  onOpenDefaultSelectionSettings?: () => void;
  globalPantryItems?: Set<string>;
  onOpenPantryManager?: () => void;
  onDeleteRecipe?: (recipeId: string) => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onBack,
  onUpdateRecipe,
  onAddAllToCart,
  onRequestSubstitute,
  cartItemIds,
  cartItems = [],
  onToggleCartItem,
  onOpenCart,
  defaultSelectionSettings,
  onOpenDefaultSelectionSettings,
  globalPantryItems,
  onOpenPantryManager,
  onDeleteRecipe,
}) => {
  const [servings, setServings] = useState(recipe.servings || 4);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [swapIngredient, setSwapIngredient] = useState<Ingredient | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Recipe Title inline editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(recipe.title);

  useEffect(() => {
    setTitleInput(recipe.title);
  }, [recipe.title]);

  const handleSaveTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== recipe.title) {
      onUpdateRecipe({ ...recipe, title: trimmed });
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleInput(recipe.title);
    setIsEditingTitle(false);
  };

  // Selection set of ingredient IDs to include when adding to cart
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<Set<string>>(() => {
    const isPantry = (i: Ingredient) => isIngredientInPantry(i, globalPantryItems);
    const nonPantry = recipe.ingredients.filter((i) => !isPantry(i));
    if (nonPantry.length > 0) {
      if (defaultSelectionSettings) {
        return applyDefaultSelectionToRecipe(nonPantry, defaultSelectionSettings);
      }
      return new Set(nonPantry.map((i) => i.id));
    }
    // If all ingredients were flagged, default to selecting all so 1-item recipes (e.g. DiGiorno Pizza) work immediately!
    return new Set(recipe.ingredients.map((i) => i.id));
  });

  // Keep selection synchronized when recipe, pantry items, or default settings change
  useEffect(() => {
    const isPantry = (i: Ingredient) => isIngredientInPantry(i, globalPantryItems);
    const nonPantry = recipe.ingredients.filter((i) => !isPantry(i));
    const targetBase = nonPantry.length > 0 ? nonPantry : recipe.ingredients;

    if (defaultSelectionSettings && defaultSelectionSettings.autoApplyOnOpen) {
      setSelectedIngredientIds(applyDefaultSelectionToRecipe(targetBase, defaultSelectionSettings));
    } else {
      setSelectedIngredientIds((prev) => {
        const next = new Set<string>();
        recipe.ingredients.forEach((ing) => {
          if ((!isPantry(ing) || !nonPantry.length) && (prev.has(ing.id) || !prev.size)) {
            next.add(ing.id);
          }
        });
        return next.size > 0 ? next : new Set(recipe.ingredients.map((i) => i.id));
      });
    }
  }, [recipe.ingredients, defaultSelectionSettings, globalPantryItems]);

  // Toggle selection for single ingredient
  const handleToggleSelect = (id: string) => {
    setSelectedIngredientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all non-pantry ingredients (or all if all are pantry)
  const handleSelectAll = () => {
    const isPantry = (i: Ingredient) => isIngredientInPantry(i, globalPantryItems);
    const nonPantry = recipe.ingredients.filter((i) => !isPantry(i)).map((i) => i.id);
    setSelectedIngredientIds(new Set(nonPantry.length > 0 ? nonPantry : recipe.ingredients.map((i) => i.id)));
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedIngredientIds(new Set());
  };

  // New ingredient form states
  const [newIngName, setNewIngName] = useState('');
  const [newIngAmount, setNewIngAmount] = useState('1');
  const [newIngUnit, setNewIngUnit] = useState('item');
  const [newIngCategory, setNewIngCategory] = useState('Pantry & Dry Goods');
  const [newIngQuery, setNewIngQuery] = useState('');
  const [newIngPrice, setNewIngPrice] = useState('2.48');

  const servingMultiplier = servings / (recipe.baseServings || 4);

  // Toggle pantry status for an ingredient
  const handleTogglePantry = (id: string) => {
    const updated = recipe.ingredients.map((ing) => {
      if (ing.id === id) {
        const nextInPantry = !ing.inPantry;
        if (nextInPantry) {
          setSelectedIngredientIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        } else {
          setSelectedIngredientIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });
        }
        return { ...ing, inPantry: nextInPantry };
      }
      return ing;
    });
    onUpdateRecipe({ ...recipe, ingredients: updated });
  };

  // Update ingredient details
  const handleUpdateIngredient = (id: string, partial: Partial<Ingredient>) => {
    const updated = recipe.ingredients.map((ing) =>
      ing.id === id ? { ...ing, ...partial } : ing
    );
    onUpdateRecipe({ ...recipe, ingredients: updated });
  };

  // Swap with verified product from catalog
  const handleSelectSwapProduct = (prod: WalmartGroceryProduct) => {
    if (!swapIngredient) return;
    const updatedIngredients = recipe.ingredients.map((ing) => {
      if (ing.id === swapIngredient.id) {
        return {
          ...ing,
          itemId: prod.itemId,
          name: prod.name,
          walmartQuery: prod.walmartQuery,
          walmartSearchUrl: prod.walmartSearchUrl,
          estimatedPrice: prod.estimatedPrice,
          packageSize: prod.packageSize,
          category: prod.category,
        };
      }
      return ing;
    });
    onUpdateRecipe({ ...recipe, ingredients: updatedIngredients });
    setSwapIngredient(null);
  };

  // Delete ingredient completely from recipe
  const handleDeleteIngredient = (id: string) => {
    const updated = recipe.ingredients.filter((ing) => ing.id !== id);
    setSelectedIngredientIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    onUpdateRecipe({ ...recipe, ingredients: updated });
  };

  // Add custom ingredient matched to verified Walmart catalog
  const handleAddCustomIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;

    // Use verified catalog matcher
    const match = matchWalmartGroceryItem(newIngName.trim(), newIngCategory);
    const newId = `custom-ing-${Date.now()}`;
    const newIngredient: Ingredient = {
      id: newId,
      itemId: match.itemId,
      name: newIngName.trim(),
      rawText: `${newIngAmount} ${newIngUnit} ${newIngName.trim()}`,
      amount: parseFloat(newIngAmount) || 1,
      unit: newIngUnit.trim() || 'item',
      category: match.category || newIngCategory,
      walmartQuery: match.walmartQuery,
      walmartSearchUrl: match.walmartSearchUrl,
      brandTier: 'great_value',
      estimatedPrice: match.estimatedPrice || (parseFloat(newIngPrice) || 2.48),
      packageSize: match.packageSize || '1 package',
      isPantryStaple: match.isPantryStaple,
      inPantry: false,
    };

    onUpdateRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, newIngredient],
    });

    setSelectedIngredientIds((prev) => new Set([...prev, newId]));

    setNewIngName('');
    setNewIngAmount('1');
    setNewIngUnit('item');
    setNewIngQuery('');
    setNewIngPrice('2.48');
    setShowAddIngredient(false);
  };

  // Calculate pricing breakdown with scaled retail packaging quantities
  const activeItemsToBuy = recipe.ingredients.filter(
    (i) => selectedIngredientIds.has(i.id)
  );
  const pantryIngredients = recipe.ingredients.filter(
    (i) => isIngredientInPantry(i, globalPantryItems) && !selectedIngredientIds.has(i.id)
  );
  const activeUnitsToBuy = activeItemsToBuy.reduce(
    (sum, i) => sum + calculateRetailPackageQuantity((i.amount || 1) * servingMultiplier, i.unit, i.packageSize, i.category),
    0
  );
  const totalEstimatedCost = activeItemsToBuy.reduce((sum, i) => {
    const scaledAmount = (i.amount || 1) * servingMultiplier;
    const pkgs = calculateRetailPackageQuantity(scaledAmount, i.unit, i.packageSize, i.category);
    return sum + i.estimatedPrice * pkgs;
  }, 0);
  const pantrySavings = pantryIngredients.reduce((sum, i) => sum + i.estimatedPrice, 0);
  const costPerServing = (totalEstimatedCost / servings).toFixed(2);
  const cartTotalUnits = cartItems.length > 0
    ? cartItems.reduce((sum, i) => sum + (i.orderQuantity || 1), 0)
    : cartItemIds.size;

  // Direct authentic Walmart product page for single-item recipes (e.g. DiGiorno Pizza)
  const isSingleItemRecipe = activeItemsToBuy.length === 1;
  const singleItemDirectUrl = (() => {
    if (!isSingleItemRecipe) return null;
    const first = activeItemsToBuy[0];
    if (first.walmartDirectAddUrl && first.walmartDirectAddUrl.includes('walmart.com')) {
      return first.walmartDirectAddUrl;
    }
    if (first.itemId && /^\d+$/.test(first.itemId)) {
      return `https://www.walmart.com/ip/${first.itemId}`;
    }
    return first.walmartSearchUrl || 'https://www.walmart.com/cart';
  })();

  // Items with verified authentic Walmart item IDs for 1-click direct addToCart
  const verifiedActiveItems = activeItemsToBuy.filter(
    (i) => i.itemId && /^\d+$/.test(i.itemId)
  );

  // 1-Click Direct Walmart Add-To-Cart URL
  // Formats items as itemId|qty (e.g. items=5328327386|2)
  const directWalmartAddToCartUrl = (() => {
    if (verifiedActiveItems.length === 0) {
      if (activeItemsToBuy.length === 1 && singleItemDirectUrl) {
        return singleItemDirectUrl;
      }
      return 'https://www.walmart.com/cart';
    }
    const itemsParam = verifiedActiveItems
      .map((i) => {
        const pkgs = calculateRetailPackageQuantity(
          (i.amount || 1) * servingMultiplier,
          i.unit,
          i.packageSize,
          i.category
        );
        return `${i.itemId}|${pkgs}`;
      })
      .join(',');
    return `https://www.walmart.com/sc/cart/addToCart?items=${itemsParam}`;
  })();

  // Filter ingredients by category
  const categories = Array.from(new Set(recipe.ingredients.map((i) => i.category)));
  const filteredIngredients =
    categoryFilter === 'all'
      ? recipe.ingredients
      : recipe.ingredients.filter((i) => i.category === categoryFilter);

  // Trigger adding entire recipe or selected items to internal cart
  const handleAddSelectedToCart = () => {
    onAddAllToCart(recipe, selectedIngredientIds, servingMultiplier);
  };

  const handleDirectWalmartAdd = () => {
    onAddAllToCart(recipe, selectedIngredientIds, servingMultiplier);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top navigation row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Recipes</span>
          </button>

          {onDeleteRecipe && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Delete this recipe from your collection"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Recipe</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Main Action: 1-Click Direct Add to Walmart Cart */}
          <a
            href={directWalmartAddToCartUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDirectWalmartAdd}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-98 ${
              activeItemsToBuy.length > 0
                ? 'bg-[#0071DC] hover:bg-[#005bb5]'
                : 'bg-slate-400 pointer-events-none opacity-60'
            }`}
            title="Automatically adds items directly into your Walmart.com shopping cart!"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>⚡ 1-Click Add to Walmart Cart ({activeUnitsToBuy} {activeUnitsToBuy === 1 ? 'unit' : 'units'} · ${totalEstimatedCost.toFixed(2)})</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>

          {isSingleItemRecipe && singleItemDirectUrl && (
            <a
              href={singleItemDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#0071DC] bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              title="View product specifications and reviews on Walmart.com"
            >
              <span>Product Page</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          )}

          <button
            onClick={onOpenCart}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-600" />
            <span>Open Cart ({cartTotalUnits})</span>
          </button>
        </div>
      </div>

      {/* Main Recipe Header Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8">
          {/* Left: Recipe Details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800">{recipe.cuisine}</span>
              <span aria-hidden="true">·</span>
              <span>{recipe.tags.join(', ')}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                ✓ Pre-Indexed Walmart Food Matches
              </span>
            </div>

            {isEditingTitle ? (
              <form onSubmit={handleSaveTitle} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  autoFocus
                  placeholder="Enter recipe title..."
                  className="text-xl sm:text-2xl font-extrabold text-slate-900 px-3 py-1.5 border border-blue-500 rounded-xl focus:outline-blue-600 bg-white flex-1"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0071DC] hover:bg-[#005bb5] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelTitle}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-2.5 flex-wrap group">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {recipe.title}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setTitleInput(recipe.title);
                    setIsEditingTitle(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                  title="Rename or edit recipe title"
                  aria-label="Rename or edit recipe title"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {recipe.description}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  Prep: <strong>{recipe.prepTime}</strong> · Cook: <strong>{recipe.cookTime}</strong>
                </span>
              </div>

              {/* Servings scaler control */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <Users className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
                <span className="font-medium text-slate-700">Servings:</span>
                <div className="flex items-center gap-1">
                  {[2, 4, 6, 8].map((s) => (
                    <button
                      key={s}
                      onClick={() => setServings(s)}
                      className={`px-2 py-0.5 font-mono text-xs font-semibold rounded cursor-pointer transition-colors ${
                        servings === s
                          ? 'bg-white text-blue-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price & Cart Addition Action Bar */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-blue-900 font-medium">
                  Walmart Order Total ({activeUnitsToBuy} {activeUnitsToBuy === 1 ? 'unit' : 'units'}{activeItemsToBuy.length > 1 ? ` · ${activeItemsToBuy.length} items` : ''})
                </div>
                <div className="text-2xl font-bold font-mono text-blue-950 tabular-nums">
                  ${totalEstimatedCost.toFixed(2)}
                </div>
                <div className="text-[11px] text-blue-700 font-mono tabular-nums">
                  ${costPerServing} per serving · {pantryIngredients.length} pantry items excluded
                </div>
              </div>

              <div className="flex items-center gap-3">
                {pantrySavings > 0 && (
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-emerald-800 font-medium flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pantry Savings</span>
                    </div>
                    <div className="text-base font-bold font-mono text-emerald-700 tabular-nums">
                      -${pantrySavings.toFixed(2)}
                    </div>
                  </div>
                )}

                {/* 1-Click Auto-Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddSelectedToCart}
                  disabled={activeItemsToBuy.length === 0}
                  className={`inline-flex items-center gap-2 px-5 py-3 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-98 ${
                    activeItemsToBuy.length > 0
                      ? 'bg-[#0071DC] hover:bg-[#005bb5]'
                      : 'bg-slate-400 cursor-not-allowed opacity-60'
                  }`}
                  title="Auto-adds all selected ingredients to your Walmart cart without opening new tabs"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>⚡ Auto-Add to Cart ({activeItemsToBuy.reduce((sum, i) => sum + calculateRetailPackageQuantity((i.amount || 1) * servingMultiplier, i.unit, i.packageSize, i.category), 0)} units)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Recipe Image */}
          <div className="lg:col-span-5">
            <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs">
              {recipe.image ? (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-100 text-slate-500">
                  <ChefHat className="w-12 h-12 text-blue-500 mb-2" />
                  <p className="text-sm font-semibold">{recipe.title}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients Section Header and Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Ingredients & Walmart Product Matches ({recipe.ingredients.reduce((sum, i) => sum + calculateRetailPackageQuantity((i.amount || 1) * servingMultiplier, i.unit, i.packageSize, i.category), 0)} units{recipe.ingredients.length > 1 ? ` · ${recipe.ingredients.length} items` : ''})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Every item is pre-matched to real Walmart grocery products. Click the storefront icon on any row to swap products.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Bulk Selection Tools & Default Selection Engine */}
            <div className="flex items-center gap-1.5 mr-2 text-xs flex-wrap">
              <button
                onClick={handleSelectAll}
                className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer font-medium"
                title="Select all non-pantry ingredients"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer font-medium"
                title="Deselect all ingredients"
              >
                Deselect All
              </button>

              {defaultSelectionSettings && (
                <button
                  onClick={() => setSelectedIngredientIds(applyDefaultSelectionToRecipe(recipe.ingredients, defaultSelectionSettings))}
                  className="px-2.5 py-1 text-blue-700 hover:text-blue-900 bg-blue-50/70 border border-blue-200 rounded-lg hover:bg-blue-100/70 cursor-pointer font-medium"
                  title="Reset to your global default ingredient selection rule"
                >
                  Apply Default Rule ({defaultSelectionSettings.mode === 'all' ? 'All' : defaultSelectionSettings.mode === 'exclude_staples' ? 'No Staples' : 'Fresh Only'})
                </button>
              )}

              {onOpenDefaultSelectionSettings && (
                <button
                  onClick={onOpenDefaultSelectionSettings}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg cursor-pointer font-medium transition-colors"
                  title="Configure default ingredient selection for all recipes"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  <span>Configure Defaults</span>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 font-medium rounded cursor-pointer transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 font-medium rounded cursor-pointer transition-colors whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Add Custom Ingredient Button */}
            <button
              onClick={() => setShowAddIngredient(!showAddIngredient)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Ingredient</span>
            </button>
          </div>
        </div>

        {/* Add Custom Ingredient Collapsible Form */}
        {showAddIngredient && (
          <form
            onSubmit={handleAddCustomIngredient}
            className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Add Item / Custom Side / Extra Ingredient
              </h4>
              <button
                type="button"
                onClick={() => setShowAddIngredient(false)}
                className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Item Name * (Auto-matched to Walmart food database)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken breast, Sour cream, Cheddar cheese"
                  value={newIngName}
                  onChange={(e) => {
                    setNewIngName(e.target.value);
                    if (!newIngQuery) {
                      setNewIngQuery(`Great Value ${e.target.value}`);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={newIngAmount}
                  onChange={(e) => setNewIngAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-blue-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  placeholder="e.g. cup, lb, pack"
                  value={newIngUnit}
                  onChange={(e) => setNewIngUnit(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={newIngCategory}
                  onChange={(e) => setNewIngCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-blue-500 text-xs"
                >
                  <option value="Produce">Produce</option>
                  <option value="Meat & Seafood">Meat & Seafood</option>
                  <option value="Dairy & Eggs">Dairy & Eggs</option>
                  <option value="Pantry & Dry Goods">Pantry & Dry Goods</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Spices & Seasonings">Spices & Seasonings</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddIngredient(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0071DC] hover:bg-[#005bb5] rounded-lg cursor-pointer shadow-xs"
              >
                Add Ingredient to Recipe
              </button>
            </div>
          </form>
        )}

        {/* Ingredients Rows */}
        <div className="space-y-2">
          {filteredIngredients.map((ingredient) => {
            const isPantryItem = isIngredientInPantry(ingredient, globalPantryItems);
            const cartItem = cartItems?.find((c) => c.id === ingredient.id);
            return (
              <IngredientRow
                key={ingredient.id}
                ingredient={{ ...ingredient, inPantry: isPantryItem }}
                servingMultiplier={servingMultiplier}
                isSelected={selectedIngredientIds.has(ingredient.id)}
                onToggleSelect={() => handleToggleSelect(ingredient.id)}
                onTogglePantry={handleTogglePantry}
                onUpdateIngredient={handleUpdateIngredient}
                onDeleteIngredient={handleDeleteIngredient}
                onRequestSubstitute={onRequestSubstitute}
                onOpenSwapModal={(ing) => setSwapIngredient(ing)}
                isInCart={cartItemIds.has(ingredient.id)}
                cartItemQuantity={cartItem?.orderQuantity}
                onToggleCartItem={(ing) => onToggleCartItem(ing, servingMultiplier)}
              />
            );
          })}
        </div>

        {/* Bottom Recipe Add-To-Cart Banner */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div>
            <div className="font-bold text-sm sm:text-base">
              Ready to shop this recipe?
            </div>
            <div className="text-xs text-slate-300">
              {activeUnitsToBuy} {activeUnitsToBuy === 1 ? 'unit' : 'units'} selected ({activeItemsToBuy.length} of {recipe.ingredients.length} {recipe.ingredients.length === 1 ? 'food item' : 'food items'}) · ${totalEstimatedCost.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <a
              href={directWalmartAddToCartUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDirectWalmartAdd}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-98 ${
                activeItemsToBuy.length > 0
                  ? 'bg-[#0071DC] hover:bg-[#005bb5]'
                  : 'bg-slate-700 pointer-events-none opacity-60'
              }`}
              title="1-Click: Automatically adds all selected items directly to your Walmart.com cart!"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>⚡ 1-Click Add to Walmart Cart ({activeUnitsToBuy} {activeUnitsToBuy === 1 ? 'unit' : 'units'})</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {isSingleItemRecipe && singleItemDirectUrl && (
              <a
                href={singleItemDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Product Page</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}

            <button
              onClick={onOpenCart}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Review in Drawer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cooking Instructions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Step-by-Step Cooking Instructions</h3>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            {showInstructions ? 'Hide Steps' : 'Show Steps'}
          </button>
        </div>

        {showInstructions && (
          <ol className="space-y-4">
            {recipe.instructions.map((step, idx) => (
              <li key={idx} className="flex gap-4 items-start text-sm text-slate-700">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-[#0071DC] font-bold text-xs flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Swap Product Modal */}
      <SwapWalmartProductModal
        isOpen={Boolean(swapIngredient)}
        ingredient={swapIngredient}
        onClose={() => setSwapIngredient(null)}
        onSelectProduct={handleSelectSwapProduct}
      />

      {/* Delete Recipe Confirmation Dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Recipe?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently remove <strong>"{recipe.title}"</strong> from your saved recipes?
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDeleteRecipe?.(recipe.id);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Yes, Delete Recipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
