import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Sparkles,
  Link as LinkIcon,
  ShoppingBag,
  ExternalLink,
  Plus,
  Minus,
  Check,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkle,
  Zap,
} from 'lucide-react';
import {
  USER_FAVORITE_ESSENTIALS,
  WALMART_GROCERY_CATALOG,
  WalmartGroceryProduct,
  searchWalmartCatalog,
  extractWalmartItemId,
  parseWalmartProductLink,
  matchWalmartGroceryItem,
} from '../data/walmartGroceryCatalog';
import { CartItem } from '../types';

interface QuickItemSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onAddCustomItem: (item: {
    name: string;
    category: string;
    quantity: number;
    estimatedPrice: number;
    walmartQuery?: string;
    walmartSearchUrl?: string;
    packageSize?: string;
    itemId?: string;
    recipeTitle?: string;
  }) => void;
  onUpdateCartQuantity: (id: string, delta: number) => void;
  onOpenCart: () => void;
}

export const QuickItemSelectorModal: React.FC<QuickItemSelectorModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onAddCustomItem,
  onUpdateCartQuantity,
  onOpenCart,
}) => {
  const [activeTab, setActiveTab] = useState<'essentials' | 'search' | 'link'>('essentials');

  // Tab 1 (Essentials) category filter
  const [essentialsCategory, setEssentialsCategory] = useState<string>('all');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Tab 2 (Search) state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');

  // Tab 3 (Walmart Link / Item ID) state
  const [pastedLinkOrId, setPastedLinkOrId] = useState('');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState('Personal Care & Toiletries');
  const [customItemQty, setCustomItemQty] = useState(1);
  const [customItemPrice, setCustomItemPrice] = useState('4.98');
  const [customItemPkgSize, setCustomItemPkgSize] = useState('1 count');
  const [linkInputSuccessMessage, setLinkInputSuccessMessage] = useState<string | null>(null);

  // Extract Item ID in real time for Tab 3
  const detectedItemId = extractWalmartItemId(pastedLinkOrId);

  // Auto-fill when link or ID is entered
  const handleLinkInputChange = (value: string) => {
    setPastedLinkOrId(value);
    setLinkInputSuccessMessage(null);

    const extracted = extractWalmartItemId(value);
    if (extracted) {
      // Check if known in our catalog
      const known = WALMART_GROCERY_CATALOG.find((p) => p.itemId === extracted);
      if (known) {
        setCustomItemName(known.name);
        setCustomItemCategory(known.category);
        setCustomItemPrice(known.estimatedPrice.toFixed(2));
        setCustomItemPkgSize(known.packageSize);
        setLinkInputSuccessMessage(`✓ Recognized: ${known.name} (Item ID: ${extracted})`);
        return;
      }

      // Check if slug contains product name
      const parsed = parseWalmartProductLink(value);
      if (parsed.inferredTitle && !customItemName) {
        setCustomItemName(
          parsed.inferredTitle
            .split(' ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
        );
      }
    }
  };

  // Filter essentials by category
  const filteredEssentials = useMemo(() => {
    if (essentialsCategory === 'all') return USER_FAVORITE_ESSENTIALS;
    return USER_FAVORITE_ESSENTIALS.filter((item) => item.category === essentialsCategory);
  }, [essentialsCategory]);

  // Categories list for essentials filter
  const categoriesInEssentials = [
    'all',
    ...Array.from(new Set(USER_FAVORITE_ESSENTIALS.map((i) => i.category))),
  ];

  // Search catalog results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && searchCategory === 'all') {
      return USER_FAVORITE_ESSENTIALS;
    }
    const results = searchWalmartCatalog(searchQuery, 30);
    if (searchCategory === 'all') return results;
    return results.filter((i) => i.category === searchCategory);
  }, [searchQuery, searchCategory]);

  // Helper to get quantity selected for an item
  const getSelectedQty = (itemIdOrKey: string) => itemQuantities[itemIdOrKey] || 1;

  const setQty = (itemIdOrKey: string, delta: number) => {
    setItemQuantities((prev) => {
      const current = prev[itemIdOrKey] || 1;
      const next = Math.max(1, Math.min(99, current + delta));
      return { ...prev, [itemIdOrKey]: next };
    });
  };

  // Check if an item is already in the cart
  const findCartItem = (product: WalmartGroceryProduct) => {
    return cartItems.find(
      (c) =>
        (product.itemId && c.itemId === product.itemId) ||
        c.name.toLowerCase() === product.name.toLowerCase()
    );
  };

  // Add catalog product to cart
  const handleAddProductToCart = (product: WalmartGroceryProduct) => {
    const qty = getSelectedQty(product.id || product.itemId || product.name);
    onAddCustomItem({
      name: product.name,
      category: product.category,
      quantity: qty,
      estimatedPrice: product.estimatedPrice,
      walmartQuery: product.walmartQuery,
      walmartSearchUrl: product.walmartSearchUrl,
      packageSize: product.packageSize,
      itemId: product.itemId,
      recipeTitle: 'Essentials & Toiletries',
    });
  };

  // Submit custom link / ID form
  const handleAddFromLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim()) return;

    const itemId = extractWalmartItemId(pastedLinkOrId) || undefined;
    const directUrl = itemId
      ? `https://www.walmart.com/ip/${itemId}`
      : (pastedLinkOrId.startsWith('http')
          ? pastedLinkOrId
          : `https://www.walmart.com/search?q=${encodeURIComponent(customItemName.trim())}`);

    onAddCustomItem({
      name: customItemName.trim(),
      category: customItemCategory,
      quantity: Math.max(1, customItemQty),
      estimatedPrice: parseFloat(customItemPrice) || 3.48,
      walmartQuery: customItemName.trim(),
      walmartSearchUrl: directUrl,
      packageSize: customItemPkgSize.trim() || '1 item',
      itemId,
      recipeTitle: 'Individual Items & Toiletries',
    });

    // Reset form
    setPastedLinkOrId('');
    setCustomItemName('');
    setCustomItemQty(1);
    setCustomItemPrice('4.98');
    setCustomItemPkgSize('1 count');
    setLinkInputSuccessMessage('Item successfully added to your cart!');
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.orderQuantity, 0);
  const totalCartCost = cartItems.reduce((acc, i) => acc + i.estimatedPrice * i.orderQuantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Custom Items, Ingredients & Toiletries
              </h2>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Direct Walmart Links & IDs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Add individual groceries, coffee, pet food, and personal care toiletries directly to your order.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('essentials')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'essentials'
                ? 'border-[#0071DC] text-[#0071DC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Curated Essentials & Toiletries ({USER_FAVORITE_ESSENTIALS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'border-[#0071DC] text-[#0071DC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Full Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'link'
                ? 'border-[#0071DC] text-[#0071DC]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-emerald-600" />
            <span>Add by Walmart Link or Item ID</span>
          </button>
        </div>

        {/* Tab 1: Curated Essentials */}
        {activeTab === 'essentials' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              {categoriesInEssentials.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEssentialsCategory(cat)}
                  className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    essentialsCategory === cat
                      ? 'bg-[#0071DC] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Essentials' : cat}
                </button>
              ))}
            </div>

            {/* Grid of Verified Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredEssentials.map((product) => {
                const inCartItem = findCartItem(product);
                const qtyKey = product.id || product.itemId || product.name;
                const selectedQty = getSelectedQty(qtyKey);

                return (
                  <div
                    key={product.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      inCartItem
                        ? 'border-blue-300 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            {product.category} · {product.brand}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate" title={product.name}>
                            {product.name}
                          </h4>
                        </div>

                        {product.itemId && (
                          <a
                            href={`https://www.walmart.com/ip/${product.itemId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200/80 shrink-0"
                            title={`Walmart Item ID: ${product.itemId} (Opens in Walmart)`}
                          >
                            <span>ID: {product.itemId}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                        <span className="font-mono font-bold text-slate-900">${product.estimatedPrice.toFixed(2)}</span>
                        <span>·</span>
                        <span className="text-slate-500 text-[11px]">{product.packageSize}</span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (inCartItem) {
                              onUpdateCartQuantity(inCartItem.id, -1);
                            } else {
                              setQty(qtyKey, -1);
                            }
                          }}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-mono font-bold text-xs text-slate-800">
                          {inCartItem ? inCartItem.orderQuantity : selectedQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (inCartItem) {
                              onUpdateCartQuantity(inCartItem.id, 1);
                            } else {
                              setQty(qtyKey, 1);
                            }
                          }}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={() => handleAddProductToCart(product)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-2xs ${
                          inCartItem
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-[#0071DC] hover:bg-[#005bb5] text-white'
                        }`}
                      >
                        {inCartItem ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>In Cart ({inCartItem.orderQuantity}) +Add</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Full Catalog Search */}
        {activeTab === 'search' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search coffee, toothpaste, cheese, chicken, pasta, spices..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-blue-600"
                />
              </div>

              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-blue-600"
              >
                <option value="all">All Departments</option>
                <option value="Produce">Produce</option>
                <option value="Meat & Seafood">Meat & Seafood</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Pantry & Dry Goods">Pantry & Dry Goods</option>
                <option value="Bakery">Bakery</option>
                <option value="Spices & Seasonings">Spices & Seasonings</option>
                <option value="Personal Care & Toiletries">Toiletries & Personal Care</option>
                <option value="Pet Care">Pet Care</option>
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Showing {searchResults.length} verified items
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((product) => {
                const inCartItem = findCartItem(product);
                const qtyKey = product.id || product.itemId || product.name;
                const selectedQty = getSelectedQty(qtyKey);

                return (
                  <div
                    key={product.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            {product.category} · {product.brand}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate" title={product.name}>
                            {product.name}
                          </h4>
                        </div>

                        {product.itemId && (
                          <a
                            href={`https://www.walmart.com/ip/${product.itemId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200/80 shrink-0"
                            title={`Walmart Item ID: ${product.itemId}`}
                          >
                            <span>ID: {product.itemId}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                        <span className="font-mono font-bold text-slate-900">${product.estimatedPrice.toFixed(2)}</span>
                        <span>·</span>
                        <span className="text-slate-500 text-[11px]">{product.packageSize}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
                      <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => setQty(qtyKey, -1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-mono font-bold text-xs text-slate-800">
                          {selectedQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(qtyKey, 1)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-white rounded cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddProductToCart(product)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0071DC] hover:bg-[#005bb5] cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add {selectedQty > 1 ? `(${selectedQty})` : ''}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Paste Walmart Link or Item ID */}
        {activeTab === 'link' && (
          <form onSubmit={handleAddFromLinkSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Instant Walmart Item ID Extraction</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Paste any Walmart link (e.g. <code>https://www.walmart.com/ip/.../2396711494</code>) or a direct item ID (e.g. <code>2396711494</code>). We will automatically extract the ID and link it directly to your cart.
              </p>
            </div>

            {linkInputSuccessMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
                {linkInputSuccessMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Walmart Product URL or Item ID *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={pastedLinkOrId}
                  onChange={(e) => handleLinkInputChange(e.target.value)}
                  placeholder="Paste URL (e.g. https://www.walmart.com/ip/.../16004720) or bare Item ID"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-blue-600 font-mono"
                />
              </div>

              {detectedItemId && (
                <div className="mt-1.5 flex items-center gap-2 text-xs">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Detected Item ID: {detectedItemId}
                  </span>
                  <a
                    href={`https://www.walmart.com/ip/${detectedItemId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Verify on Walmart</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-900 mb-1">
                  Product / Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  placeholder="e.g. Sensodyne Clinical White Toothpaste, Granulated Sugar, etc."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Department / Category
                </label>
                <select
                  value={customItemCategory}
                  onChange={(e) => setCustomItemCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                >
                  <option value="Personal Care & Toiletries">Toiletries & Personal Care</option>
                  <option value="Pet Care">Pet Care</option>
                  <option value="Pantry & Dry Goods">Pantry & Dry Goods</option>
                  <option value="Produce">Produce</option>
                  <option value="Meat & Seafood">Meat & Seafood</option>
                  <option value="Dairy & Eggs">Dairy & Eggs</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Spices & Seasonings">Spices & Seasonings</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Other">Other Household</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Package Size / Unit
                </label>
                <input
                  type="text"
                  value={customItemPkgSize}
                  onChange={(e) => setCustomItemPkgSize(e.target.value)}
                  placeholder="e.g. 3.4 oz tube, 12-pack, 1 gallon"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Quantity to Order
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={customItemQty}
                  onChange={(e) => setCustomItemQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Estimated Unit Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0071DC] hover:bg-[#005bb5] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item to Cart ({customItemQty}x)</span>
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer with Cart Summary */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            Current Cart:{' '}
            <strong className="text-slate-900">
              {totalCartCount} items (${totalCartCost.toFixed(2)})
            </strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Done Adding
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#0071DC] hover:bg-[#005bb5] rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Open Walmart Cart ({totalCartCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
