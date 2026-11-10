import React, { useState } from 'react';
import { ExternalLink, Sparkles, Edit2, Trash2, Check, ShoppingBag, CheckSquare, Square, Store, Zap } from 'lucide-react';
import { Ingredient } from '../types';
import { calculateRetailPackageQuantity } from '../data/walmartGroceryCatalog';

interface IngredientRowProps {
  ingredient: Ingredient;
  servingMultiplier: number;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onTogglePantry: (id: string) => void;
  onUpdateIngredient: (id: string, updated: Partial<Ingredient>) => void;
  onDeleteIngredient: (id: string) => void;
  onRequestSubstitute: (ingredient: Ingredient) => void;
  onOpenSwapModal?: (ingredient: Ingredient) => void;
  isInCart: boolean;
  cartItemQuantity?: number;
  onToggleCartItem: (ingredient: Ingredient) => void;
}

export const IngredientRow: React.FC<IngredientRowProps> = ({
  ingredient,
  servingMultiplier,
  isSelected = true,
  onToggleSelect,
  onTogglePantry,
  onUpdateIngredient,
  onDeleteIngredient,
  onRequestSubstitute,
  onOpenSwapModal,
  isInCart,
  cartItemQuantity,
  onToggleCartItem,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(ingredient.name);
  const [editAmount, setEditAmount] = useState(ingredient.amount);
  const [editUnit, setEditUnit] = useState(ingredient.unit);
  const [editQuery, setEditQuery] = useState(ingredient.walmartQuery);
  const [editPrice, setEditPrice] = useState(ingredient.estimatedPrice);
  const [editCategory, setEditCategory] = useState(ingredient.category);

  // Scaled amount
  const displayAmount = ingredient.amount * servingMultiplier;
  const roundedAmount = Number.isInteger(displayAmount)
    ? displayAmount
    : Number(displayAmount.toFixed(2));

  // Calculated retail packaging units needed
  const neededRetailUnits = calculateRetailPackageQuantity(
    displayAmount,
    ingredient.unit,
    ingredient.packageSize,
    ingredient.category
  );

  const handleSave = () => {
    onUpdateIngredient(ingredient.id, {
      name: editName,
      amount: editAmount,
      unit: editUnit,
      walmartQuery: editQuery,
      walmartSearchUrl: `https://www.walmart.com/search?q=${encodeURIComponent(editQuery.trim())}`,
      estimatedPrice: editPrice,
      category: editCategory,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(ingredient.name);
    setEditAmount(ingredient.amount);
    setEditUnit(ingredient.unit);
    setEditQuery(ingredient.walmartQuery);
    setEditPrice(ingredient.estimatedPrice);
    setEditCategory(ingredient.category);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs space-y-2">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-6 sm:col-span-5">
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Ingredient Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 focus:outline-blue-500"
            />
          </div>
          <div className="col-span-3 sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Amount</label>
            <input
              type="number"
              step="0.1"
              value={editAmount}
              onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 focus:outline-blue-500 font-mono"
            />
          </div>
          <div className="col-span-3 sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Unit</label>
            <input
              type="text"
              value={editUnit}
              onChange={(e) => setEditUnit(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 focus:outline-blue-500"
            />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Category</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 focus:outline-blue-500 text-xs"
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

        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-8">
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Walmart Search Query</label>
            <input
              type="text"
              value={editQuery}
              onChange={(e) => setEditQuery(e.target.value)}
              placeholder="e.g. Great Value Boneless Chicken Breasts"
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 focus:outline-blue-500"
            />
          </div>
          <div className="col-span-4">
            <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Est. Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={editPrice}
              onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 focus:outline-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={handleCancel}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-3 py-1 bg-[#0071DC] hover:bg-[#005bb5] text-white rounded text-xs font-semibold cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Item</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        ingredient.inPantry
          ? 'bg-slate-50/70 border-slate-200 opacity-60'
          : isSelected
          ? 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
          : 'bg-slate-50 border-dashed border-slate-300 opacity-75'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left side: Selection checkbox & ingredient details */}
        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
          {/* Include in order checkbox */}
          {onToggleSelect && !ingredient.inPantry && (
            <button
              type="button"
              onClick={onToggleSelect}
              className="text-slate-500 hover:text-[#0071DC] transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0 p-0.5"
              title={isSelected ? 'Included for Cart Addition. Click to exclude.' : 'Excluded. Click to include in cart.'}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-[#0071DC]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}

          {/* Pantry Checkbox */}
          <label
            className="flex items-center gap-1.5 cursor-pointer select-none shrink-0 text-[11px] text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/70 px-2 py-0.5 rounded transition-colors"
            title="Check if already in your kitchen pantry (saves money by omitting from cart)"
          >
            <input
              type="checkbox"
              checked={ingredient.inPantry}
              onChange={() => onTogglePantry(ingredient.id)}
              className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <span>Pantry</span>
          </label>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-semibold text-slate-900 ${
                  ingredient.inPantry ? 'line-through text-slate-500' : !isSelected ? 'text-slate-500 line-through' : ''
                }`}
              >
                {roundedAmount} {ingredient.unit !== 'item' && ingredient.unit !== 'count' ? ingredient.unit : ''} {ingredient.name}
              </span>

              {/* Category indicator */}
              <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                {ingredient.category}
              </span>

              {/* Verified food match badge */}
              <span className="text-[10px] font-semibold text-[#0071DC] bg-blue-50 border border-blue-200/60 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                <span>✓ Walmart Food</span>
              </span>

              {ingredient.inPantry ? (
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                  In Pantry (Saved)
                </span>
              ) : !isSelected ? (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                  Skipped from Order
                </span>
              ) : null}
            </div>

            {/* Walmart Query preview & computed retail order units */}
            <div className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-slate-700">Walmart Match:</span>
              <span className="text-slate-600 truncate">{ingredient.walmartQuery}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500">{ingredient.packageSize}</span>
              <span className="text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60 inline-flex items-center gap-1">
                <span>Order: {neededRetailUnits}x</span>
                <span className="text-slate-500 font-normal">
                  ({ingredient.packageSize})
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Price & Action buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-right mr-1">
            <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
              ${(ingredient.estimatedPrice * neededRetailUnits).toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500">
              {neededRetailUnits > 1 ? `${neededRetailUnits}x @ $${ingredient.estimatedPrice.toFixed(2)}` : 'Walmart est.'}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Primary Action: Direct In-App Cart Addition */}
            <button
              type="button"
              onClick={() => onToggleCartItem(ingredient)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                isInCart
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : ingredient.inPantry
                  ? 'bg-slate-700 hover:bg-slate-800 text-white'
                  : 'bg-[#0071DC] hover:bg-[#005bb5] active:scale-98 text-white'
              }`}
              title={isInCart ? 'Item is in cart. Click to remove.' : ingredient.inPantry ? 'In pantry. Click to add to cart anyway.' : 'Add this ingredient to your cart'}
            >
              {isInCart ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>In Cart ({cartItemQuantity || neededRetailUnits})</span>
                </>
              ) : ingredient.inPantry ? (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ Add {neededRetailUnits > 1 ? `${neededRetailUnits} Anyway` : 'Anyway'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>+ Add {neededRetailUnits > 1 ? `${neededRetailUnits} to Cart` : 'to Cart'}</span>
                </>
              )}
            </button>

            {/* Swap with verified item from Walmart catalog */}
            {onOpenSwapModal && (
              <button
                type="button"
                onClick={() => onOpenSwapModal(ingredient)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Choose different item from pre-indexed Walmart food catalog"
              >
                <Store className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Subtle Walmart.com listing link for preview */}
            <a
              href={ingredient.walmartDirectAddUrl && ingredient.walmartDirectAddUrl.includes('walmart.com') ? ingredient.walmartDirectAddUrl : ingredient.walmartSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-[#0071DC] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="View product match on Walmart.com"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* AI Substitutions */}
            <button
              onClick={() => onRequestSubstitute(ingredient)}
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
              title="Find Walmart ingredient substitutions"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>

            {/* Edit Item */}
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Edit ingredient or custom Walmart search query"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Delete / Remove from Recipe */}
            <button
              onClick={() => onDeleteIngredient(ingredient.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Remove this ingredient from recipe entirely"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
