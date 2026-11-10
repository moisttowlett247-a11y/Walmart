import React, { useState } from 'react';
import { Clock, Users, ArrowUpRight, ChefHat, Check, Zap, ShoppingBag, Trash2, X } from 'lucide-react';
import { Recipe, DefaultSelectionSettings } from '../types';
import { calculateRetailPackageQuantity } from '../data/walmartGroceryCatalog';
import { applyDefaultSelectionToRecipe } from '../utils/defaultSelection';

import { isIngredientInPantry } from '../utils/pantry';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onAddAllToCart: (recipe: Recipe) => void;
  isAddedToCart: boolean;
  defaultSelectionSettings?: DefaultSelectionSettings;
  pantryItems?: Set<string>;
  onDeleteRecipe?: (recipeId: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  onAddAllToCart,
  isAddedToCart,
  defaultSelectionSettings,
  pantryItems,
  onDeleteRecipe,
}) => {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Calculate items to add and estimated total based on default selection settings and pantry
  const effectiveSelection = defaultSelectionSettings
    ? applyDefaultSelectionToRecipe(recipe.ingredients, defaultSelectionSettings)
    : new Set(recipe.ingredients.filter((i) => !isIngredientInPantry(i, pantryItems)).map((i) => i.id));

  const rawItemsToAdd = recipe.ingredients.filter((i) => !isIngredientInPantry(i, pantryItems) && effectiveSelection.has(i.id));
  const itemsToAdd = rawItemsToAdd.length > 0 ? rawItemsToAdd : recipe.ingredients;

  const estimatedTotal = itemsToAdd.reduce((acc, curr) => {
    const pkgs = calculateRetailPackageQuantity(curr.amount || 1, curr.unit, curr.packageSize, curr.category);
    return acc + curr.estimatedPrice * pkgs;
  }, 0);
  const costPerServing = recipe.servings > 0 ? (estimatedTotal / recipe.servings).toFixed(2) : '0.00';

  const handleAddRecipeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddAllToCart(recipe);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Card Image Area */}
        <div
          onClick={() => onSelect(recipe)}
          className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden cursor-pointer"
        >
          {!imgError && recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-500">
              <ChefHat className="w-10 h-10 text-blue-500 mb-1" />
              <span className="text-xs font-medium text-slate-600">{recipe.cuisine || 'Recipe'}</span>
            </div>
          )}

          {/* Cuisine Tag & Budget Badge on card image */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap max-w-[80%]">
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
              {recipe.cuisine}
            </span>
            {parseFloat(costPerServing) <= 1.85 && (
              <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                {parseFloat(costPerServing) <= 1.05 ? '⚡ Under $1/serving' : '🏷️ Budget Friendly'}
              </span>
            )}
          </div>

          {/* Top Right Actions: Delete button & In Cart Badge */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            {isAddedToCart && (
              <div className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>In Cart</span>
              </div>
            )}
            {onDeleteRecipe && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirmDelete(true);
                }}
                className="p-1 rounded-md bg-slate-900/70 hover:bg-rose-600 text-white/80 hover:text-white backdrop-blur-xs transition-colors cursor-pointer"
                title="Delete this recipe"
                aria-label="Delete this recipe"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Delete Confirmation Overlay */}
          {showConfirmDelete && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-4 text-center text-white animate-in fade-in duration-150"
            >
              <Trash2 className="w-6 h-6 text-rose-400 mb-2" />
              <p className="text-xs font-bold leading-tight mb-1">Delete "{recipe.title}"?</p>
              <p className="text-[11px] text-slate-300 mb-3">This action cannot be undone.</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmDelete(false);
                    onDeleteRecipe?.(recipe.id);
                  }}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4">
          {/* Metadata line */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{recipe.prepTime} prep</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span className="font-mono tabular-nums">{recipe.servings} servings</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{recipe.ingredients.length} items</span>
          </div>

          <h3
            onClick={() => onSelect(recipe)}
            className="text-base font-semibold text-slate-900 leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer"
          >
            {recipe.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
            {recipe.description}
          </p>

          {/* Walmart estimated cost indicator */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Walmart Est:</span>{' '}
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                ${estimatedTotal.toFixed(2)}
              </span>
            </div>
            <div className="text-slate-500 font-mono text-[11px] tabular-nums">
              ${costPerServing}/serving
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-4 pb-4 pt-1 flex items-center gap-2">
        <button
          onClick={() => onSelect(recipe)}
          className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          title="Customize ingredients, servings, or remove items"
        >
          <span>View Ingredients</span>
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </button>

        {/* 1-Click Auto-Add Entire Recipe to Cart - ZERO TABS */}
        <button
          type="button"
          onClick={handleAddRecipeClick}
          className={`inline-flex items-center justify-center gap-1.5 py-2 px-3.5 text-xs font-bold rounded-lg shadow-2xs transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-98 ${
            justAdded || isAddedToCart
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-[#0071DC] hover:bg-[#005bb5] text-white'
          }`}
          title="Auto-adds all items in this recipe directly into your cart without opening tabs"
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added!</span>
            </>
          ) : isAddedToCart ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>In Cart (+More)</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>⚡ Auto-Add ({itemsToAdd.reduce((acc, curr) => acc + calculateRetailPackageQuantity(curr.amount || 1, curr.unit, curr.packageSize, curr.category), 0)} units)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
