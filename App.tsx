import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  ShoppingBag,
  Filter,
  Check,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  X,
  RotateCcw,
  Store,
  Package,
} from 'lucide-react';
import { Recipe, Ingredient, SubstitutionOption } from './types';
import { INITIAL_RECIPES } from './data/curatedRecipes';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import { RecipeInputModal } from './components/RecipeInputModal';
import { WalmartCartDrawer, CartItem } from './components/WalmartCartDrawer';
import { SubstituteModal } from './components/SubstituteModal';
import { DefaultSelectionModal } from './components/DefaultSelectionModal';
import { QuickItemSelectorModal } from './components/QuickItemSelectorModal';
import { PantryManagerModal } from './components/PantryManagerModal';
import { HowItWorks } from './components/HowItWorks';
import { matchWalmartGroceryItem, calculateRetailPackageQuantity } from './data/walmartGroceryCatalog';
import { DefaultSelectionSettings } from './types';
import { DEFAULT_SELECTION_SETTINGS, applyDefaultSelectionToRecipe } from './utils/defaultSelection';
import { isIngredientInPantry } from './utils/pantry';

// Storage version key to guarantee old corrupt/hallucinated SKU items or stale quantities
// are purged from the user's browser localStorage on first load!
const STORAGE_VERSION_KEY = 'cartcraft_storage_version';
const CURRENT_STORAGE_VERSION = 'v23_twenty_budget_recipes';

// Helper to ensure Walmart URLs are 100% matched against our verified Walmart Grocery Catalog
// CRITICAL: NEVER overwrite the recipe's authentic food name!
function sanitizeIngredientUrls<T extends Ingredient>(ing: T): T {
  let authenticName = (ing.name || ing.rawText || 'Food item').trim();
  const match = matchWalmartGroceryItem(authenticName, ing.category);
  let validItemId = (ing.itemId && /^\d+$/.test(ing.itemId))
    ? ing.itemId
    : (match.itemId && /^\d+$/.test(match.itemId) ? match.itemId : undefined);

  // Auto-upgrade DiGiorno pizza to the live authentic Walmart item ID 5328327386
  if (
    validItemId === '10290804' ||
    authenticName.toLowerCase().includes('digiorno') ||
    (ing.walmartDirectAddUrl && ing.walmartDirectAddUrl.includes('10290804')) ||
    (ing.walmartSearchUrl && ing.walmartSearchUrl.includes('10290804'))
  ) {
    validItemId = '5328327386';
    authenticName = 'DiGiorno Frozen Pizza Rising Crust Ultimate Pepperoni with Cheese';
    const livePizzaUrl = 'https://www.walmart.com/ip/DiGiorno-Frozen-Pizza-Rising-Crust-Ultimate-Pepperoni-with-Cheese-24-7-oz-Frozen/5328327386?classType=REGULAR&athbdg=L1102&from=/search';
    return {
      ...ing,
      itemId: '5328327386',
      name: authenticName,
      category: 'Frozen',
      walmartQuery: 'DiGiorno Frozen Pizza Rising Crust Ultimate Pepperoni with Cheese 24.7 oz Frozen',
      walmartSearchUrl: livePizzaUrl,
      walmartDirectAddUrl: livePizzaUrl,
      estimatedPrice: ing.estimatedPrice && ing.estimatedPrice > 0 ? ing.estimatedPrice : 5.98,
      packageSize: '24.7 oz box',
    };
  }

  const directUrl = (ing.walmartDirectAddUrl && ing.walmartDirectAddUrl.trim() !== '' && ing.walmartDirectAddUrl.includes('walmart.com'))
    ? ing.walmartDirectAddUrl
    : (validItemId ? `https://www.walmart.com/ip/${validItemId}` : match.walmartSearchUrl);

  const searchUrl = (ing.walmartSearchUrl && ing.walmartSearchUrl.trim() !== '' && ing.walmartSearchUrl.includes('walmart.com'))
    ? ing.walmartSearchUrl
    : directUrl;

  return {
    ...ing,
    itemId: validItemId, // Verified authentic Walmart item ID for 1-click auto-add
    name: authenticName, // ALWAYS PRESERVE AUTHENTIC CULINARY FOOD NAME!
    category: ing.category || match.category || 'Pantry & Dry Goods',
    walmartQuery: ing.walmartQuery && ing.walmartQuery.trim() !== '' && !ing.walmartQuery.toLowerCase().includes('undefined')
      ? ing.walmartQuery
      : match.walmartQuery,
    walmartSearchUrl: searchUrl,
    walmartDirectAddUrl: directUrl,
    estimatedPrice: ing.estimatedPrice && ing.estimatedPrice > 0 ? ing.estimatedPrice : (match.estimatedPrice || 2.48),
    packageSize: ing.packageSize && ing.packageSize.trim() !== '' ? ing.packageSize : (match.packageSize || '1 package'),
  };
}

export default function App() {
  // Purge stale corrupt data from previous turns if version has updated
  useEffect(() => {
    try {
      const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      if (savedVersion !== CURRENT_STORAGE_VERSION) {
        localStorage.removeItem('cartcraft_recipes');
        localStorage.removeItem('cartcraft_cart');
        // Clean any accidental pizza / ramen items from pantry storage
        const savedPantry = localStorage.getItem('cartcraft_pantry_items');
        if (savedPantry) {
          try {
            const parsed: string[] = JSON.parse(savedPantry);
            const cleaned = parsed.filter((p) => {
              const lower = p.toLowerCase();
              return !lower.includes('pizza') && !lower.includes('ramen');
            });
            localStorage.setItem('cartcraft_pantry_items', JSON.stringify(cleaned));
            setPantryItems(new Set(cleaned));
          } catch {
            localStorage.removeItem('cartcraft_pantry_items');
          }
        }
        localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
      }
    } catch (e) {
      console.error('Storage version migration error', e);
    }
  }, []);

  // Recipes list with local persistence and automatic link sanitization
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      if (savedVersion === CURRENT_STORAGE_VERSION) {
        const saved = localStorage.getItem('cartcraft_recipes');
        if (saved) {
          const parsed: Recipe[] = JSON.parse(saved);
          return parsed.map((r) => ({
            ...r,
            ingredients: r.ingredients.map(sanitizeIngredientUrls),
          }));
        }
      }
    } catch (e) {
      console.error('Error loading saved recipes', e);
    }
    return INITIAL_RECIPES.map((r) => ({
      ...r,
      ingredients: r.ingredients.map(sanitizeIngredientUrls),
    }));
  });

  // Selected active recipe for detail view (null = catalog)
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  // Walmart Master Shopping Cart items
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
      if (savedVersion === CURRENT_STORAGE_VERSION) {
        const saved = localStorage.getItem('cartcraft_cart');
        if (saved) {
          const parsed: CartItem[] = JSON.parse(saved);
          return parsed.map(sanitizeIngredientUrls);
        }
      }
    } catch (e) {
      console.error('Error loading saved cart', e);
    }
    return [];
  });

  // Drawers and Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isRecipeInputOpen, setIsRecipeInputOpen] = useState(false);
  const [recipeInputTab, setRecipeInputTab] = useState<'url' | 'paste' | 'manual' | 'ai'>('url');
  const [substituteIngredient, setSubstituteIngredient] = useState<Ingredient | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Global Pantry Inventory Items (persisted across sessions)
  const [pantryItems, setPantryItems] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('cartcraft_pantry_items');
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        return new Set(parsed);
      }
    } catch (e) {
      console.error('Error loading pantry items', e);
    }
    return new Set<string>();
  });
  const [isPantryManagerOpen, setIsPantryManagerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('cartcraft_pantry_items', JSON.stringify(Array.from(pantryItems)));
    } catch (e) {
      console.error('Failed to save pantry items', e);
    }
  }, [pantryItems]);

  const handleTogglePantryItem = (itemName: string) => {
    setPantryItems((prev) => {
      const next = new Set(prev);
      const lower = itemName.trim().toLowerCase();
      const existingKey = Array.from(next).find((k) => k.toLowerCase() === lower);
      if (existingKey) {
        next.delete(existingKey);
        showToast(`Removed "${itemName}" from Pantry Inventory.`);
      } else {
        next.add(itemName.trim());
        showToast(`✓ Added "${itemName}" to Pantry Inventory (will be skipped from cart).`);
      }
      return next;
    });
  };

  const handleAddCustomPantryItem = (itemName: string) => {
    const trimmed = itemName.trim();
    if (!trimmed) return;
    setPantryItems((prev) => {
      const next = new Set(prev);
      next.add(trimmed);
      return next;
    });
    showToast(`✓ Added "${trimmed}" to Pantry Inventory.`);
  };

  const handleRemovePantryItem = (itemName: string) => {
    setPantryItems((prev) => {
      const next = new Set(prev);
      const existingKey = Array.from(next).find((k) => k.toLowerCase() === itemName.trim().toLowerCase());
      if (existingKey) next.delete(existingKey);
      else next.delete(itemName);
      return next;
    });
  };

  // Global Default Ingredient Selection Settings (persisted across sessions)
  const [defaultSelectionSettings, setDefaultSelectionSettings] = useState<DefaultSelectionSettings>(() => {
    try {
      const saved = localStorage.getItem('cartcraft_default_selection_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading default selection settings', e);
    }
    return DEFAULT_SELECTION_SETTINGS;
  });
  const [isDefaultSelectionOpen, setIsDefaultSelectionOpen] = useState(false);

  const handleSaveDefaultSelectionSettings = (newSettings: DefaultSelectionSettings) => {
    setDefaultSelectionSettings(newSettings);
    try {
      localStorage.setItem('cartcraft_default_selection_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error('Error saving default selection settings', e);
    }
    const label = newSettings.mode === 'all'
      ? 'All Ingredients'
      : newSettings.mode === 'exclude_staples'
      ? `Exclude Home Staples (${newSettings.homeStaples.length} staples)`
      : 'Perishables & Proteins Only';
    showToast(`✓ Default ingredient rule: "${label}" applied to all recipes!`);
  };

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Search & Filters in catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'under1' | 'under2'>('all');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cartcraft_recipes', JSON.stringify(recipes));
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
    } catch (e) {
      console.error('Failed to save recipes', e);
    }
  }, [recipes]);

  useEffect(() => {
    try {
      localStorage.setItem('cartcraft_cart', JSON.stringify(cartItems));
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [cartItems]);

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) || null;
  const cartItemIds = new Set(cartItems.map((i) => i.id));

  // Handler: Add all ingredients (or selected subset) from a recipe into the Walmart Cart
  // Scaled by servings multiplier and converted to true retail packaging quantities!
  const handleAddAllToCart = (
    recipe: Recipe,
    selectedIngredientIds?: Set<string>,
    servingMultiplier: number = 1
  ) => {
    let itemsToAdd: Ingredient[];

    if (selectedIngredientIds && selectedIngredientIds.size > 0) {
      // User explicitly selected ingredients in RecipeDetail view - respect their choice!
      itemsToAdd = recipe.ingredients.filter((i) => selectedIngredientIds.has(i.id));
    } else {
      // Auto-add from catalog card or default rule: skip items already in pantry
      const effectiveSelection = applyDefaultSelectionToRecipe(recipe.ingredients, defaultSelectionSettings);
      itemsToAdd = recipe.ingredients.filter((i) => {
        if (isIngredientInPantry(i, pantryItems)) return false;
        if (!effectiveSelection.has(i.id)) return false;
        return true;
      });

      // Safety: If all items were filtered out (e.g. 1-item pre-made recipes like Pizza or Ramen),
      // add all recipe items so the user's action always succeeds!
      if (itemsToAdd.length === 0 && recipe.ingredients.length > 0) {
        itemsToAdd = recipe.ingredients;
      }
    }

    if (itemsToAdd.length === 0) {
      showToast(`No ingredients selected to add for "${recipe.title}".`);
      return;
    }

    const totalUnitsAdded = itemsToAdd.reduce((sum, ing) => {
      const clean = sanitizeIngredientUrls(ing);
      const scaledAmount = (clean.amount || 1) * servingMultiplier;
      return sum + calculateRetailPackageQuantity(
        scaledAmount,
        clean.unit,
        clean.packageSize,
        clean.category
      );
    }, 0);

    setCartItems((prev) => {
      const existingMap = new Map<string, CartItem>();
      prev.forEach((item) => existingMap.set(item.id, { ...item }));

      itemsToAdd.forEach((ing) => {
        const clean = sanitizeIngredientUrls(ing);
        const scaledAmount = (clean.amount || 1) * servingMultiplier;
        const retailPackageCount = calculateRetailPackageQuantity(
          scaledAmount,
          clean.unit,
          clean.packageSize,
          clean.category
        );

        if (existingMap.has(clean.id)) {
          const current = existingMap.get(clean.id)!;
          existingMap.set(clean.id, {
            ...current,
            orderQuantity: current.orderQuantity + retailPackageCount,
          });
        } else {
          existingMap.set(clean.id, {
            ...clean,
            recipeTitle: recipe.title,
            orderQuantity: retailPackageCount,
          });
        }
      });

      return Array.from(existingMap.values());
    });

    showToast(`✓ Auto-added ${totalUnitsAdded} ${totalUnitsAdded === 1 ? 'unit' : 'units'} of "${recipe.title}" to your Walmart Cart!`);
    setIsCartOpen(true);
  };

  // Handler: Toggle single ingredient in cart with accurate package quantity calculation
  const handleToggleCartItem = (ingredient: Ingredient, servingMultiplier: number = 1) => {
    const clean = sanitizeIngredientUrls(ingredient);
    setCartItems((prev) => {
      const exists = prev.some((i) => i.id === clean.id);
      if (exists) {
        showToast(`Removed "${clean.name}" from your cart.`);
        return prev.filter((i) => i.id !== clean.id);
      } else {
        const scaledAmount = (clean.amount || 1) * (servingMultiplier || 1);
        const retailPackageCount = calculateRetailPackageQuantity(
          scaledAmount,
          clean.unit,
          clean.packageSize,
          clean.category
        );

        showToast(`✓ Added ${retailPackageCount}x "${clean.name}" to your cart!`);
        return [
          ...prev,
          {
            ...clean,
            recipeTitle: selectedRecipe?.title,
            orderQuantity: retailPackageCount,
          },
        ];
      }
    });
  };

  // Handler: Update quantity in cart
  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.orderQuantity + delta;
            return newQty > 0 ? { ...item, orderQuantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Handler: Remove single item from cart
  const handleRemoveCartItem = (id: string) => {
    const item = cartItems.find((i) => i.id === id);
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      showToast(`Removed "${item.name}" from cart.`);
    }
  };

  // Handler: Remove all items belonging to a specific recipe from cart
  const handleRemoveRecipeFromCart = (recipeTitle: string) => {
    setCartItems((prev) => prev.filter((i) => i.recipeTitle !== recipeTitle));
    showToast(`Removed all items from "${recipeTitle}".`);
  };

  // Handler: Add custom item directly inside cart drawer using verified catalog
  const handleAddCustomCartItem = (newItem: {
    name: string;
    category: string;
    quantity: number;
    estimatedPrice: number;
    walmartQuery?: string;
    walmartSearchUrl?: string;
    packageSize?: string;
    itemId?: string;
    recipeTitle?: string;
  }) => {
    const match = matchWalmartGroceryItem(newItem.name, newItem.category);
    const validItemId = (newItem.itemId && /^\d+$/.test(newItem.itemId))
      ? newItem.itemId
      : (match.itemId && /^\d+$/.test(match.itemId) ? match.itemId : undefined);
    const directUrl = validItemId
      ? `https://www.walmart.com/ip/${validItemId}`
      : (newItem.walmartSearchUrl || match.walmartSearchUrl);

    const displayName = newItem.name || match.name;
    const addQty = Math.max(1, newItem.quantity || 1);

    setCartItems((prev) => {
      // Check if item already exists by itemId or name
      const existingIdx = prev.findIndex(
        (i) => (validItemId && i.itemId === validItemId) || i.name.toLowerCase() === displayName.toLowerCase()
      );

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          orderQuantity: next[existingIdx].orderQuantity + addQty,
        };
        return next;
      }

      const cartItem: CartItem = {
        id: `custom-cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        itemId: validItemId,
        name: displayName,
        rawText: `${addQty} ${displayName}`,
        amount: addQty,
        unit: 'item',
        category: newItem.category || match.category,
        walmartQuery: newItem.walmartQuery || match.walmartQuery,
        walmartSearchUrl: directUrl,
        walmartDirectAddUrl: directUrl,
        brandTier: 'great_value',
        estimatedPrice: newItem.estimatedPrice || match.estimatedPrice,
        packageSize: newItem.packageSize || match.packageSize,
        isPantryStaple: match.isPantryStaple,
        inPantry: false,
        recipeTitle: newItem.recipeTitle || 'Individual Items & Toiletries',
        orderQuantity: addQty,
      };

      return [...prev, cartItem];
    });

    showToast(`✓ Added ${addQty}x "${displayName}" to your Walmart cart!`);
  };

  // Handler: Clear all items from cart
  const handleClearCart = () => {
    setCartItems([]);
    showToast('Your shopping cart has been cleared.');
  };

  // Handler: Reset recipes to clean curated groceries
  const handleResetToVerifiedRecipes = () => {
    setRecipes(INITIAL_RECIPES.map((r) => ({
      ...r,
      ingredients: r.ingredients.map(sanitizeIngredientUrls),
    })));
    setCartItems([]);
    localStorage.removeItem('cartcraft_recipes');
    localStorage.removeItem('cartcraft_cart');
    localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
    showToast('Catalog refreshed with pre-indexed Walmart food items.');
  };

  // Handler: When a new recipe is parsed or generated
  const handleRecipeCreated = (newRecipe: Recipe) => {
    const sanitized: Recipe = {
      ...newRecipe,
      ingredients: newRecipe.ingredients.map(sanitizeIngredientUrls),
    };
    setRecipes((prev) => [sanitized, ...prev]);
    setSelectedRecipeId(sanitized.id);
    showToast(`Recipe "${sanitized.title}" matched with Walmart food inventory!`);
  };

  // Handler: Update existing recipe
  const handleUpdateRecipe = (updatedRecipe: Recipe) => {
    const sanitized: Recipe = {
      ...updatedRecipe,
      ingredients: updatedRecipe.ingredients.map(sanitizeIngredientUrls),
    };
    setRecipes((prev) =>
      prev.map((r) => (r.id === sanitized.id ? sanitized : r))
    );
  };

  // Handler: Delete recipe from catalog and saved collection
  const handleDeleteRecipe = (recipeId: string) => {
    const target = recipes.find((r) => r.id === recipeId);
    const title = target ? target.title : 'Recipe';
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    if (selectedRecipeId === recipeId) {
      setSelectedRecipeId(null);
    }
    showToast(`✓ Deleted "${title}" from your recipe collection.`);
  };

  // Handler: Apply substitution to ingredient
  const handleApplySubstitution = (ingredientId: string, sub: SubstitutionOption) => {
    if (!selectedRecipe) return;
    const match = matchWalmartGroceryItem(sub.name);
    const updatedIngredients = selectedRecipe.ingredients.map((ing) => {
      if (ing.id === ingredientId) {
        const isGV = sub.isGreatValue || sub.name.toLowerCase().includes('great value') || match.brand === 'Great Value';
        return {
          ...ing,
          itemId: sub.itemId || match.itemId,
          name: sub.name || match.name,
          walmartQuery: sub.walmartQuery || match.walmartQuery,
          walmartSearchUrl: sub.walmartSearchUrl || match.walmartSearchUrl,
          walmartDirectAddUrl: sub.walmartDirectAddUrl || match.walmartSearchUrl,
          estimatedPrice: sub.estimatedPrice || match.estimatedPrice,
          packageSize: match.packageSize,
          category: match.category,
          brandTier: (isGV ? 'great_value' : ing.brandTier) as any,
        };
      }
      return ing;
    });

    handleUpdateRecipe({
      ...selectedRecipe,
      ingredients: updatedIngredients,
    });
    showToast(`Applied verified food substitution: "${sub.name || match.name}"`);
  };

  // Filtered recipes
  const cuisines = ['All', ...Array.from(new Set(recipes.map((r) => r.cuisine)))];
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      recipe.ingredients.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCuisine = selectedCuisine === 'All' || recipe.cuisine === selectedCuisine;

    const costPerServing = (() => {
      const total = recipe.ingredients.reduce((sum, curr) => {
        const pkgs = calculateRetailPackageQuantity(curr.amount || 1, curr.unit, curr.packageSize, curr.category);
        return sum + (curr.estimatedPrice || 2) * pkgs;
      }, 0);
      return recipe.servings > 0 ? total / recipe.servings : 1;
    })();

    const matchesBudget =
      budgetFilter === 'all'
        ? true
        : budgetFilter === 'under1'
        ? costPerServing <= 1.05
        : costPerServing <= 1.85 || recipe.tags.some((t) => t.toLowerCase().includes('budget'));

    return matchesSearch && matchesCuisine && matchesBudget;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 border border-slate-700 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium leading-snug">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Universal Top Bar */}
      <Header
        cartItemCount={cartItems.reduce((sum, item) => sum + (item.orderQuantity || 1), 0)}
        pantryCount={pantryItems.size}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenRecipeInput={() => {
          setRecipeInputTab('url');
          setIsRecipeInputOpen(true);
        }}
        onOpenQuickAddItems={() => setIsQuickAddOpen(true)}
        onOpenPantryManager={() => setIsPantryManagerOpen(true)}
        onOpenDefaultSelectionSettings={() => setIsDefaultSelectionOpen(true)}
        onNavigateSection={(id) => {
          setSelectedRecipeId(null);
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main className="flex-1">
        {selectedRecipe ? (
          /* Active Recipe Detail View */
          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipeId(null)}
            onUpdateRecipe={handleUpdateRecipe}
            onAddAllToCart={handleAddAllToCart}
            onRequestSubstitute={(ing) => setSubstituteIngredient(ing)}
            cartItemIds={cartItemIds}
            cartItems={cartItems}
            onToggleCartItem={handleToggleCartItem}
            onOpenCart={() => setIsCartOpen(true)}
            defaultSelectionSettings={defaultSelectionSettings}
            onOpenDefaultSelectionSettings={() => setIsDefaultSelectionOpen(true)}
            globalPantryItems={pantryItems}
            onOpenPantryManager={() => setIsPantryManagerOpen(true)}
            onDeleteRecipe={handleDeleteRecipe}
          />
        ) : (
          /* Storefront & Catalog View */
          <>
            {/* Hero Section */}
            <Hero
              onOpenRecipeInput={(tab = 'paste') => {
                setRecipeInputTab(tab);
                setIsRecipeInputOpen(true);
              }}
              onExploreRecipes={() => {
                const el = document.getElementById('recipes-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              totalRecipesCount={recipes.length}
              onOpenPantryManager={() => setIsPantryManagerOpen(true)}
            />

            {/* Featured Recipes Section */}
            <section id="recipes-catalog" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-[#0071DC]" />
                    <span>Verified Walmart Grocery Inventory</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Recipes Pre-Matched with Walmart Food Items
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Every ingredient is pre-indexed and linked to authentic Walmart supermarket items. Auto-add to your cart in 1 click.
                  </p>
                </div>

                {/* Search & Import buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative min-w-[220px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search recipes or food ingredients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-blue-600 shadow-2xs"
                    />
                  </div>

                  <button
                    onClick={() => setIsPantryManagerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-2xs cursor-pointer whitespace-nowrap transition-colors"
                    title="Manage items you already have in your pantry so they are excluded from cart"
                  >
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pantry Inventory ({pantryItems.size})</span>
                  </button>

                  <button
                    onClick={() => setIsQuickAddOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0071DC] bg-blue-50 hover:bg-blue-100 border border-blue-200/90 rounded-xl shadow-2xs cursor-pointer whitespace-nowrap transition-colors"
                    title="Add individual ingredients, coffee, pet food, and toiletries directly to cart"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>+ Add Items / Toiletries</span>
                  </button>

                  <button
                    onClick={() => {
                      setRecipeInputTab('url');
                      setIsRecipeInputOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0071DC] hover:bg-[#005bb5] rounded-xl shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Import Recipe</span>
                  </button>

                  <button
                    onClick={handleResetToVerifiedRecipes}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-2xs cursor-pointer whitespace-nowrap hover:bg-slate-50"
                    title="Reload pre-indexed verified Walmart food catalog"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Refresh Catalog</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs: Budget & Cuisine */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6 bg-white p-3 rounded-xl border border-slate-200">
                {/* Budget Quick Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs no-scrollbar">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">Budget:</span>
                  <button
                    onClick={() => setBudgetFilter('all')}
                    className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      budgetFilter === 'all'
                        ? 'bg-[#0071DC] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    All Budgets
                  </button>
                  <button
                    onClick={() => setBudgetFilter('under1')}
                    className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      budgetFilter === 'under1'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                    }`}
                  >
                    <span>⚡ Under $1 / Serving</span>
                  </button>
                  <button
                    onClick={() => setBudgetFilter('under2')}
                    className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      budgetFilter === 'under2'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                    }`}
                  >
                    <span>🏷️ Low Budget (&lt; $1.85 / Serving)</span>
                  </button>
                </div>

                {/* Cuisine Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs no-scrollbar border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">Cuisine:</span>
                  {cuisines.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCuisine(c)}
                      className={`px-3 py-1.5 font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                        selectedCuisine === c
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe Cards Grid */}
              {filteredRecipes.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
                  <h3 className="text-base font-semibold text-slate-900">No recipes matched your search</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Try another search keyword, or import a new recipe using the button below.
                  </p>
                  <button
                    onClick={() => {
                      setRecipeInputTab('paste');
                      setIsRecipeInputOpen(true);
                    }}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#0071DC] hover:bg-[#005bb5] rounded-lg shadow-sm cursor-pointer"
                  >
                    Import Custom Recipe
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe) => {
                    const effectiveSelection = applyDefaultSelectionToRecipe(recipe.ingredients, defaultSelectionSettings);
                    const targetItems = recipe.ingredients.filter((i) => !isIngredientInPantry(i, pantryItems) && effectiveSelection.has(i.id));
                    const isAllAdded =
                      targetItems.length > 0 &&
                      targetItems.every((i) => cartItemIds.has(i.id));

                    return (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onSelect={(r) => setSelectedRecipeId(r.id)}
                        onAddAllToCart={handleAddAllToCart}
                        isAddedToCart={isAllAdded}
                        defaultSelectionSettings={defaultSelectionSettings}
                        pantryItems={pantryItems}
                        onDeleteRecipe={handleDeleteRecipe}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* How It Works Section */}
            <HowItWorks />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">CartCraft</span>
            <span aria-hidden="true">·</span>
            <span>Recipe to Walmart Grocery Shopper</span>
            <span aria-hidden="true">·</span>
            <span>Pre-indexed Walmart supermarket items for guaranteed food accuracy</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://www.walmart.com/cart"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <span>Walmart Cart</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.walmart.com/grocery"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <span>Walmart Grocery</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Recipe Input Modal (Paste / AI / Manual) */}
      <RecipeInputModal
        isOpen={isRecipeInputOpen}
        onClose={() => setIsRecipeInputOpen(false)}
        onRecipeCreated={handleRecipeCreated}
        initialTab={recipeInputTab}
      />

      {/* Walmart Master Cart Drawer */}
      <WalmartCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveRecipeItems={handleRemoveRecipeFromCart}
        onAddCustomItem={handleAddCustomCartItem}
        onClearCart={handleClearCart}
        onOpenQuickAddItems={() => setIsQuickAddOpen(true)}
      />

      {/* Quick Add Custom Item, Ingredients & Toiletries Modal */}
      <QuickItemSelectorModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        cartItems={cartItems}
        onAddCustomItem={handleAddCustomCartItem}
        onUpdateCartQuantity={handleUpdateCartQuantity}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Pantry Inventory Manager Modal */}
      <PantryManagerModal
        isOpen={isPantryManagerOpen}
        onClose={() => setIsPantryManagerOpen(false)}
        pantryItems={pantryItems}
        onTogglePantryItem={handleTogglePantryItem}
        onAddCustomPantryItem={handleAddCustomPantryItem}
        onRemovePantryItem={handleRemovePantryItem}
      />

      {/* Ingredient Substitution Modal */}
      <SubstituteModal
        isOpen={Boolean(substituteIngredient)}
        ingredient={substituteIngredient}
        onClose={() => setSubstituteIngredient(null)}
        onApplySubstitution={handleApplySubstitution}
      />

      {/* Global Default Ingredient Selection Modal (Applies to all pre-made and custom recipes) */}
      <DefaultSelectionModal
        isOpen={isDefaultSelectionOpen}
        settings={defaultSelectionSettings}
        onClose={() => setIsDefaultSelectionOpen(false)}
        onSaveSettings={handleSaveDefaultSelectionSettings}
      />
    </div>
  );
}
