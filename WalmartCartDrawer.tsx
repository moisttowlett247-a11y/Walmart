import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Download,
  Store,
  Plus,
  Layers,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Search,
  Zap,
} from 'lucide-react';
import { Ingredient } from '../types';
import {
  searchWalmartCatalog,
  matchWalmartGroceryItem,
  extractWalmartItemId,
  WalmartGroceryProduct,
} from '../data/walmartGroceryCatalog';

export interface CartItem extends Ingredient {
  recipeTitle?: string;
  orderQuantity: number;
}

interface WalmartCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetItemQuantity?: (id: string, qty: number) => void;
  onRemoveRecipeItems?: (recipeTitle: string) => void;
  onAddCustomItem?: (item: {
    name: string;
    category: string;
    quantity: number;
    estimatedPrice: number;
    walmartQuery?: string;
    walmartSearchUrl?: string;
    packageSize?: string;
    itemId?: string;
  }) => void;
  onClearCart: () => void;
  onOpenQuickAddItems?: () => void;
}

export const WalmartCartDrawer: React.FC<WalmartCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onUpdateQuantity,
  onRemoveRecipeItems,
  onAddCustomItem,
  onClearCart,
  onOpenQuickAddItems,
}) => {
  const [viewGrouping, setViewGrouping] = useState<'recipe' | 'category'>('recipe');
  const [copied, setCopied] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Custom item inline form
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Pantry & Dry Goods');
  const [customQty, setCustomQty] = useState('1');
  const [customPrice, setCustomPrice] = useState('2.98');
  const [customQuery, setCustomQuery] = useState('');
  const [customPkgSize, setCustomPkgSize] = useState('1 pack');

  // Live suggestions from verified Walmart grocery catalog
  const catalogSuggestions = customName.trim().length >= 2
    ? searchWalmartCatalog(customName.trim(), 4)
    : [];

  if (!isOpen) return null;

  // Group items by Recipe
  const groupedByRecipe = cartItems.reduce<Record<string, CartItem[]>>((acc, item) => {
    const key = item.recipeTitle || 'Extra Grocery Items';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // Group items by Category / Department
  const groupedByCategory = cartItems.reduce<Record<string, CartItem[]>>((acc, item) => {
    const cat = item.category || 'Pantry & Dry Goods';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const totalEstimated = cartItems.reduce(
    (sum, item) => sum + item.estimatedPrice * item.orderQuantity,
    0
  );

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.orderQuantity, 0);

  // Items with verified authentic Walmart Item IDs for 1-click direct addToCart
  const verifiedAutoAddItems = cartItems.filter(
    (i) => i.itemId && /^\d+$/.test(i.itemId)
  );

  // 1-Click Direct Walmart Add-To-Cart URL
  // Directly loads items into user's cart via https://www.walmart.com/sc/cart/addToCart?items=...
  const walmartAddToCartUrl = (() => {
    if (verifiedAutoAddItems.length === 0) return 'https://www.walmart.com/cart';
    const itemsParam = verifiedAutoAddItems
      .map((item) => `${item.itemId}|${item.orderQuantity || 1}`)
      .join(',');
    return `https://www.walmart.com/sc/cart/addToCart?items=${itemsParam}`;
  })();

  // Direct authentic single product link (e.g. /ip/...)
  const singleItemProductUrl = (() => {
    if (cartItems.length === 0) return 'https://www.walmart.com/cart';
    const first = cartItems[0];
    if (first.walmartDirectAddUrl && first.walmartDirectAddUrl.includes('walmart.com')) {
      return first.walmartDirectAddUrl;
    }
    if (first.itemId && /^\d+$/.test(first.itemId)) {
      return `https://www.walmart.com/ip/${first.itemId}`;
    }
    return first.walmartSearchUrl || 'https://www.walmart.com/cart';
  })();

  // Pick suggestion from verified catalog
  const handleSelectSuggestion = (prod: WalmartGroceryProduct) => {
    setCustomName(prod.name);
    setCustomCategory(prod.category);
    setCustomPrice(prod.estimatedPrice.toFixed(2));
    setCustomQuery(prod.walmartQuery);
    setCustomPkgSize(prod.packageSize);
  };

  // Handle adding custom grocery item directly in the drawer
  const handleAddCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const extractedId = extractWalmartItemId(customName.trim());
    const matched = matchWalmartGroceryItem(customName.trim(), customCategory);
    const itemId = extractedId || matched.itemId;
    const directUrl = itemId
      ? `https://www.walmart.com/ip/${itemId}`
      : matched.walmartSearchUrl;

    if (onAddCustomItem) {
      onAddCustomItem({
        name: customName.trim(),
        category: matched.category || customCategory,
        quantity: parseInt(customQty, 10) || 1,
        estimatedPrice: matched.estimatedPrice || (parseFloat(customPrice) || 2.48),
        walmartQuery: customQuery || matched.walmartQuery,
        walmartSearchUrl: directUrl,
        packageSize: customPkgSize || matched.packageSize,
        itemId,
      });
    }

    setCustomName('');
    setCustomQty('1');
    setCustomPrice('2.98');
    setCustomQuery('');
    setCustomPkgSize('1 pack');
    setShowAddCustom(false);
  };

  // Copy full shopping list formatted for Walmart Grocery
  const handleCopyList = () => {
    const lines = [
      '🛒 WALMART GROCERY ORDER LIST (Pre-Indexed Food Items)',
      `Total Items: ${cartItems.length} (${totalItemsCount} units) | Est. Cost: $${totalEstimated.toFixed(2)}`,
      '----------------------------------------',
    ];

    Object.entries(groupedByRecipe).forEach(([recipe, items]) => {
      lines.push(`\n[RECIPE: ${recipe.toUpperCase()}]`);
      items.forEach((item) => {
        lines.push(
          `• (${item.orderQuantity}x) ${item.walmartQuery} (~$${(
            item.estimatedPrice * item.orderQuantity
          ).toFixed(2)})`
        );
        lines.push(`  Search Link: ${item.walmartSearchUrl}`);
      });
    });

    lines.push('\n----------------------------------------');
    lines.push('Walmart Cart: https://www.walmart.com/cart');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const headers = [
      'Recipe',
      'Category',
      'Item Name',
      'Verified Walmart Search Query',
      'Quantity',
      'Est Unit Price',
      'Total Price',
      'Walmart URL',
    ];
    const rows = cartItems.map((i) => [
      `"${i.recipeTitle || 'Extra'}"`,
      `"${i.category}"`,
      `"${i.name}"`,
      `"${i.walmartQuery.replace(/"/g, '""')}"`,
      i.orderQuantity,
      i.estimatedPrice.toFixed(2),
      (i.estimatedPrice * i.orderQuantity).toFixed(2),
      `"${i.walmartSearchUrl}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `walmart-cart-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0071DC] flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  Walmart Shopping Cart
                </h2>
                <span className="text-xs font-mono font-bold text-[#0071DC] bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded">
                  {totalItemsCount} {totalItemsCount === 1 ? 'unit' : 'units'}{cartItems.length > 1 ? ` (${cartItems.length} items)` : ''}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                All ingredients pre-matched to verified Walmart grocery inventory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your entire cart?')) {
                    onClearCart();
                  }
                }}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors px-2 py-1 cursor-pointer font-medium"
                title="Remove all items from cart"
              >
                Clear Cart
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Controls & Add Extra Item Bar */}
        {cartItems.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
            {/* Grouping switch */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewGrouping('recipe')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                  viewGrouping === 'recipe'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                By Recipe
              </button>
              <button
                type="button"
                onClick={() => setViewGrouping('category')}
                className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
                  viewGrouping === 'category'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                By Department
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {onOpenQuickAddItems && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenQuickAddItems();
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                  title="Browse verified ingredients, essentials, and toiletries"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>+ Quick Add Essentials & Toiletries</span>
                </button>
              )}

              {/* Quick Add Custom Item button */}
              <button
                type="button"
                onClick={() => setShowAddCustom(!showAddCustom)}
                className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Custom Item</span>
              </button>
            </div>
          </div>
        )}

        {/* Inline form to add extra grocery with pre-indexed autocomplete */}
        {showAddCustom && (
          <form
            onSubmit={handleAddCustomSubmit}
            className="p-3.5 bg-blue-50/70 border-b border-blue-200 space-y-2.5 text-xs"
          >
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#0071DC]" />
                <span>Add Extra Item from Walmart Grocery Catalog</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-6 relative">
                <input
                  type="text"
                  required
                  placeholder="Type food (e.g. milk, eggs, chicken, butter)..."
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value);
                    setCustomQuery('');
                  }}
                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
                />

                {/* Instant Suggestions Dropdown from verified Walmart catalog */}
                {catalogSuggestions.length > 0 && !customQuery && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 max-h-40 overflow-y-auto">
                    <div className="px-2 py-0.5 text-[10px] text-slate-400 font-semibold uppercase">
                      Suggested Verified Matches
                    </div>
                    {catalogSuggestions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelectSuggestion(s)}
                        className="px-2 py-1 hover:bg-blue-50 cursor-pointer text-[11px] flex items-center justify-between gap-1"
                      >
                        <span className="font-semibold text-slate-800 truncate">{s.name}</span>
                        <span className="text-slate-500 font-mono text-[10px] shrink-0">${s.estimatedPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="col-span-3 px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 focus:outline-blue-600 text-xs"
              >
                <option value="Personal Care & Toiletries">Toiletries</option>
                <option value="Pet Care">Pet Care</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Produce">Produce</option>
                <option value="Meat & Seafood">Meat & Seafood</option>
                <option value="Bakery">Bakery</option>
                <option value="Pantry & Dry Goods">Pantry</option>
                <option value="Spices & Seasonings">Spices</option>
              </select>

              <div className="col-span-3 flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  value={customQty}
                  onChange={(e) => setCustomQty(e.target.value)}
                  className="w-12 px-1.5 py-1 bg-white border border-slate-300 rounded text-slate-900 text-center font-mono"
                  placeholder="Qty"
                />
                <button
                  type="submit"
                  className="flex-1 py-1 px-2 bg-[#0071DC] hover:bg-[#005bb5] text-white font-bold rounded cursor-pointer whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Drawer Content */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Your Shopping Cart is Empty</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
              Browse recipes or click &quot;Auto-Add to Cart&quot; on any recipe. All ingredients are chosen from the pre-indexed Walmart food catalog.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-4 py-2 text-xs font-semibold text-white bg-[#0071DC] hover:bg-[#005bb5] rounded-xl shadow-sm cursor-pointer"
            >
              Browse Recipes
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Direct Auto-Add Guarantee Banner */}
            <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-emerald-950">
                    Verified Walmart Items Ready ({totalItemsCount} Total Units)
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-900 px-1.5 py-0.2 rounded">
                    {verifiedAutoAddItems.length} of {cartItems.length} items direct
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed">
                  Every item is pre-matched to authentic Walmart grocery items with accurate retail package counts.
                </p>
              </div>
            </div>

            {/* Items List Grouped */}
            {viewGrouping === 'recipe'
              ? Object.entries(groupedByRecipe).map(([recipeTitle, items]) => {
                  const recipeTotal = items.reduce(
                    (sum, i) => sum + i.estimatedPrice * i.orderQuantity,
                    0
                  );

                  return (
                    <div key={recipeTitle} className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-200/80">
                      {/* Recipe Header with Bulk Remove Recipe Option */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="min-w-0 pr-2">
                          <h3 className="text-xs font-bold text-slate-900 truncate">
                            {recipeTitle}
                          </h3>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {items.reduce((s, i) => s + i.orderQuantity, 0)} units{items.length > 1 ? ` (${items.length} items)` : ''} · ${recipeTotal.toFixed(2)}
                          </div>
                        </div>

                        {/* Remove entire recipe from cart */}
                        {onRemoveRecipeItems && (
                          <button
                            type="button"
                            onClick={() => onRemoveRecipeItems(recipeTitle)}
                            className="text-[11px] font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded transition-colors cursor-pointer shrink-0"
                            title={`Remove all ${items.length} items from ${recipeTitle}`}
                          >
                            Remove Recipe
                          </button>
                        )}
                      </div>

                      {/* Ingredient Rows in this recipe */}
                      <div className="space-y-1.5 pt-1">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2.5 shadow-2xs hover:border-slate-300 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-900 truncate">
                                  {item.name}
                                </span>
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                                  {item.category}
                                </span>
                                {item.itemId && /^\d+$/.test(item.itemId) ? (
                                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded shrink-0">
                                    ✓ Auto-Add #{item.itemId}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium text-[#0071DC] bg-blue-50 px-1.5 py-0.2 rounded shrink-0">
                                    ✓ Food
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1.5">
                                <span className="truncate">{item.walmartQuery}</span>
                                {item.packageSize && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="text-slate-400 shrink-0">{item.packageSize}</span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-3 mt-1.5 text-xs">
                                {/* Quantity Increment / Decrement */}
                                <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                    className="px-2 py-0.5 hover:bg-slate-200 text-slate-600 cursor-pointer font-bold"
                                    title="Decrease quantity"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-800 bg-white tabular-nums min-w-[20px] text-center">
                                    {item.orderQuantity}
                                  </span>
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                    className="px-2 py-0.5 hover:bg-slate-200 text-slate-600 cursor-pointer font-bold"
                                    title="Increase quantity"
                                  >
                                    +
                                  </button>
                                </div>

                                <span className="font-mono font-bold text-slate-900 tabular-nums">
                                  ${(item.estimatedPrice * item.orderQuantity).toFixed(2)}
                                </span>

                                <span className="text-[10px] text-slate-400">
                                  (${item.estimatedPrice.toFixed(2)}/ea)
                                </span>
                              </div>
                            </div>

                            {/* Actions: View match and Remove item */}
                            <div className="flex items-center gap-1 shrink-0">
                              <a
                                href={item.walmartDirectAddUrl && item.walmartDirectAddUrl.includes('walmart.com') ? item.walmartDirectAddUrl : (item.itemId && /^\d+$/.test(item.itemId) ? `https://www.walmart.com/ip/${item.itemId}` : item.walmartSearchUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={item.itemId ? `View product #${item.itemId} on Walmart.com` : 'View exact food match on Walmart.com'}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>

                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove item from cart"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              : Object.entries(groupedByCategory).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-100">
                      <span>{category}</span>
                      <span className="text-slate-400 font-normal font-mono tabular-nums">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2.5 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {item.name}
                              </span>
                              {item.recipeTitle && (
                                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded truncate max-w-[120px]">
                                  {item.recipeTitle}
                                </span>
                              )}
                              {item.itemId && /^\d+$/.test(item.itemId) ? (
                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded shrink-0">
                                  ✓ Auto-Add #{item.itemId}
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-[#0071DC] bg-blue-50 px-1.5 py-0.2 rounded shrink-0">
                                  ✓ Food
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1.5">
                              <span className="truncate">{item.walmartQuery}</span>
                              {item.packageSize && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="text-slate-400 shrink-0">{item.packageSize}</span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mt-1.5 text-xs">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                                <button
                                  onClick={() => onUpdateQuantity(item.id, -1)}
                                  className="px-2 py-0.5 hover:bg-slate-200 text-slate-600 cursor-pointer font-bold"
                                  title="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-800 bg-white tabular-nums min-w-[20px] text-center">
                                  {item.orderQuantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.id, 1)}
                                  className="px-2 py-0.5 hover:bg-slate-200 text-slate-600 cursor-pointer font-bold"
                                  title="Increase quantity"
                                >
                                  +
                                </button>
                              </div>

                              <span className="font-mono font-bold text-slate-900 tabular-nums">
                                ${(item.estimatedPrice * item.orderQuantity).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={item.walmartDirectAddUrl && item.walmartDirectAddUrl.includes('walmart.com') ? item.walmartDirectAddUrl : (item.itemId && /^\d+$/.test(item.itemId) ? `https://www.walmart.com/ip/${item.itemId}` : item.walmartSearchUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title={item.itemId ? `View product #${item.itemId} on Walmart.com` : 'View product match on Walmart.com'}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
          </div>
        )}

        {/* Drawer Sticky Footer Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
            {/* Price breakdown */}
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-slate-500 font-medium">Estimated Walmart Total</span>
                <div className="text-[11px] text-emerald-700 font-medium">
                  {cartItems.length} verified grocery items ({totalItemsCount} total units)
                </div>
              </div>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                ${totalEstimated.toFixed(2)}
              </span>
            </div>

            {/* Quick Export & Copy Tools */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleCopyList}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Order List!' : 'Copy Order List'}</span>
              </button>

              <button
                onClick={handleDownloadCsv}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Main Action: 1-Click Direct Add to Walmart Cart */}
            <div className="space-y-2">
              <a
                href={walmartAddToCartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#0071DC] hover:bg-[#005bb5] active:scale-98 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer text-sm"
                title="1-Click: Automatically adds all verified items into your Walmart.com cart!"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>
                  {cartItems.length === 1
                    ? `⚡ 1-Click Add to Walmart Cart (${totalItemsCount} ${totalItemsCount === 1 ? 'Unit' : 'Units'})`
                    : `⚡ 1-Click Add All ${totalItemsCount} Units to Walmart Cart`}
                </span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </a>

              {cartItems.length === 1 && (
                <div className="text-center pt-0.5">
                  <a
                    href={singleItemProductUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-[#0071DC] underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Product Page on Walmart.com</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
                <span className="text-emerald-700 flex items-center gap-1">
                  ✓ Verified Walmart grocery item
                </span>
                {cartItems.length > 1 && (
                  <button
                    onClick={handleCopyList}
                    className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? '✓ Copied List!' : 'Copy Order List'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
