import React, { useState } from 'react';
import { ShoppingBag, SlidersHorizontal, Plus, Package, Menu, X } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  pantryCount?: number;
  onOpenCart: () => void;
  onOpenRecipeInput: () => void;
  onOpenQuickAddItems?: () => void;
  onOpenPantryManager?: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenDefaultSelectionSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  pantryCount = 0,
  onOpenCart,
  onOpenRecipeInput,
  onOpenQuickAddItems,
  onOpenPantryManager,
  onNavigateSection,
  onOpenDefaultSelectionSettings,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            setIsMobileMenuOpen(false);
            onNavigateSection('recipes-catalog');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-blue-600 transition-colors cursor-pointer text-left"
        >
          CartCraft <span className="text-blue-600">Walmart</span>
        </button>

        {/* Zone 2: Desktop Navigation bar */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigateSection('recipes-catalog')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Recipes
          </button>
          <button
            onClick={onOpenRecipeInput}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Import Recipe
          </button>
          {onOpenQuickAddItems && (
            <button
              onClick={onOpenQuickAddItems}
              className="text-[#0071DC] hover:text-[#005bb5] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 bg-blue-50/80 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg border border-blue-200/60"
              title="Add individual ingredients, coffee, pet food, and toiletries directly to cart"
            >
              <Plus className="w-3.5 h-3.5 text-[#0071DC]" />
              <span>+ Quick Add Items & Toiletries</span>
            </button>
          )}
          {onOpenPantryManager && (
            <button
              onClick={onOpenPantryManager}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50/80 hover:bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200/60"
              title="Manage pantry items you already own so they are excluded from cart"
            >
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pantry Inventory</span>
              {pantryCount > 0 && (
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                  {pantryCount}
                </span>
              )}
            </button>
          )}
          {onOpenDefaultSelectionSettings && (
            <button
              onClick={onOpenDefaultSelectionSettings}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
              title="Configure default ingredient selection for all recipes"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0071DC]" />
              <span>Ingredient Defaults</span>
            </button>
          )}
          <button
            onClick={() => onNavigateSection('how-it-works')}
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            How It Works
          </button>
        </nav>

        {/* Zone 3: Actions - ALWAYS VISIBLE */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Always Visible Pantry Button */}
          {onOpenPantryManager && (
            <button
              onClick={onOpenPantryManager}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              title="Manage Pantry Inventory"
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span>Pantry</span>
              {pantryCount > 0 && (
                <span className="text-[11px] font-mono font-extrabold bg-emerald-200/90 text-emerald-900 px-1.5 py-0.2 rounded-full">
                  {pantryCount}
                </span>
              )}
            </button>
          )}

          {onOpenQuickAddItems && (
            <button
              onClick={onOpenQuickAddItems}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0071DC] bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-all cursor-pointer whitespace-nowrap"
              title="Add individual ingredients, toiletries, and custom items"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Items</span>
            </button>
          )}

          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#0071DC] hover:bg-[#005bb5] active:scale-98 transition-all rounded-lg shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Cart ({cartItemCount})</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 shadow-lg animate-fadeIn">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onNavigateSection('recipes-catalog');
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            📖 Recipes Catalog
          </button>

          {onOpenPantryManager && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenPantryManager();
              }}
              className="w-full text-left px-3 py-2 text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Pantry Inventory Manager</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                {pantryCount} items
              </span>
            </button>
          )}

          {onOpenQuickAddItems && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenQuickAddItems();
              }}
              className="w-full text-left px-3 py-2 text-sm font-bold text-[#0071DC] bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#0071DC]" />
              <span>+ Quick Add Items & Toiletries</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenRecipeInput();
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            📥 Import Recipe
          </button>

          {onOpenDefaultSelectionSettings && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenDefaultSelectionSettings();
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Ingredient Default Rules</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onNavigateSection('how-it-works');
            }}
            className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            ❓ How It Works
          </button>
        </div>
      )}
    </header>
  );
};
