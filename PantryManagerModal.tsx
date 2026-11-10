import React, { useState } from 'react';
import { Package, Check, Plus, Trash2, X, Search, Sparkles } from 'lucide-react';
import { WALMART_GROCERY_CATALOG } from '../data/walmartGroceryCatalog';

interface PantryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pantryItems: Set<string>; // normalized names or IDs
  onTogglePantryItem: (itemName: string) => void;
  onAddCustomPantryItem: (itemName: string) => void;
  onRemovePantryItem: (itemName: string) => void;
}

const COMMON_PANTRY_SUGGESTIONS = [
  'Salt',
  'Black Pepper',
  'Extra Virgin Olive Oil',
  'Unsalted Butter',
  'Garlic Powder',
  'Oregano Leaves',
  'Thyme Leaves',
  'Ground Cumin',
  'Granulated Sugar',
  'Long Grain White Rice',
  'All-Purpose Flour',
  'Vegetable Oil',
  'Soy Sauce',
  'Tomato Ketchup',
  'Real Mayonnaise',
  'Chicken Broth',
  'Grated Parmesan Cheese',
];

export const PantryManagerModal: React.FC<PantryManagerModalProps> = ({
  isOpen,
  onClose,
  pantryItems,
  onTogglePantryItem,
  onAddCustomPantryItem,
  onRemovePantryItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customInput, setCustomInput] = useState('');

  if (!isOpen) return null;

  const normalizedPantry = new Set(Array.from(pantryItems).map((i) => i.toLowerCase().trim()));

  const filteredCatalog = WALMART_GROCERY_CATALOG.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 30);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onAddCustomPantryItem(customInput.trim());
    setCustomInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Pantry Inventory Manager</h2>
              <p className="text-xs text-slate-300">
                Ingredients you already have will be automatically excluded when adding recipes to your Walmart cart.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Add Custom Pantry Item */}
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Add custom item to pantry (e.g. Kosher Salt, Honey)..."
                className="w-full px-4 py-2.5 pl-10 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Plus className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              Add to Pantry
            </button>
          </form>

          {/* Common Staples Quick Toggles */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Common Pantry Staples (Click to Toggle)</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {COMMON_PANTRY_SUGGESTIONS.map((staple) => {
                const isOwned = normalizedPantry.has(staple.toLowerCase());
                return (
                  <button
                    key={staple}
                    onClick={() => onTogglePantryItem(staple)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isOwned
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isOwned && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{staple}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catalog Search / Add */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Search Walmart Catalog to Add to Pantry
            </h3>
            <div className="relative mb-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search catalog items (e.g., butter, olive oil, spices)..."
                className="w-full px-4 py-2 pl-9 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {searchTerm.trim() !== '' && (
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {filteredCatalog.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No matching items found.</div>
                ) : (
                  filteredCatalog.map((prod) => {
                    const isOwned = normalizedPantry.has(prod.name.toLowerCase());
                    return (
                      <div
                        key={prod.id}
                        className="px-3 py-2 flex items-center justify-between hover:bg-slate-50 text-xs"
                      >
                        <div>
                          <div className="font-medium text-slate-800">{prod.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {prod.category} · ${prod.estimatedPrice.toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => onTogglePantryItem(prod.name)}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                            isOwned
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          {isOwned ? 'In Pantry ✓' : '+ Add to Pantry'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Current Pantry Inventory List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Pantry Inventory ({pantryItems.size} items)
              </h3>
              {pantryItems.size > 0 && (
                <button
                  onClick={() => {
                    pantryItems.forEach((item) => onRemovePantryItem(item));
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-medium cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {pantryItems.size === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                Your pantry is currently empty. Items added here will be automatically skipped when adding recipes to cart.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                {Array.from(pantryItems).map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium shadow-2xs"
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => onRemovePantryItem(item)}
                      className="text-emerald-600 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
