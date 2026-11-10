import React, { useState } from 'react';
import { X, Search, Check, ExternalLink, Sparkles, Store } from 'lucide-react';
import { Ingredient } from '../types';
import {
  WALMART_GROCERY_CATALOG,
  searchWalmartCatalog,
  cleanRawIngredientText,
  WalmartGroceryProduct,
} from '../data/walmartGroceryCatalog';

interface SwapWalmartProductModalProps {
  isOpen: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
  onSelectProduct: (product: WalmartGroceryProduct) => void;
}

export const SwapWalmartProductModal: React.FC<SwapWalmartProductModalProps> = ({
  isOpen,
  ingredient,
  onClose,
  onSelectProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  React.useEffect(() => {
    if (ingredient && isOpen) {
      setSearchQuery(cleanRawIngredientText(ingredient.name));
    }
  }, [ingredient, isOpen]);

  if (!isOpen || !ingredient) return null;

  const categories = ['All', 'Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Pantry & Dry Goods', 'Bakery', 'Spices & Seasonings'];

  // Filter catalog
  const filteredProducts = WALMART_GROCERY_CATALOG.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.walmartQuery.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords.some((k) => k.includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0071DC] flex items-center justify-center text-white">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Select Verified Walmart Food Item
              </h3>
              <p className="text-xs text-slate-500">
                Matching recipe ingredient: <span className="font-semibold text-slate-800">{ingredient.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search verified Walmart grocery catalog (e.g. chicken, cheese, spinach, oil)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-blue-600 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No verified Walmart grocery products matched your search.
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const isCurrent = ingredient.walmartQuery === prod.walmartQuery;

              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-400'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {prod.name}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {prod.category}
                      </span>
                      <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                        {prod.brand}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 truncate mt-0.5 font-mono">
                      {prod.walmartQuery} · {prod.packageSize}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                        ${prod.estimatedPrice.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">Walmart price</div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#0071DC] hover:bg-[#005bb5] text-white shadow-xs'
                      }`}
                    >
                      {isCurrent ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{isCurrent ? 'Selected' : 'Use Item'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{WALMART_GROCERY_CATALOG.length} pre-indexed verified Walmart food items</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
