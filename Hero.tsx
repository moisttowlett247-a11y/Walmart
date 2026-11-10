import React, { useState } from 'react';
import { Sparkles, Plus, ChefHat, ArrowRight, Package } from 'lucide-react';
import { heroImg } from '../assets/images';

interface HeroProps {
  onOpenRecipeInput: (tab?: 'url' | 'paste' | 'manual' | 'ai') => void;
  onExploreRecipes: () => void;
  totalRecipesCount: number;
  onOpenPantryManager?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenRecipeInput,
  onExploreRecipes,
  totalRecipesCount,
  onOpenPantryManager,
}) => {
  const [imgLoaded, setImgLoaded] = useState(true);

  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Headline and Call to Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Quiet metadata line without pills */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3 tracking-wide">
              <span>Walmart Grocery Integration</span>
              <span aria-hidden="true">·</span>
              <span>AI Recipe Ingestion</span>
              <span aria-hidden="true">·</span>
              <span>Great Value Savings</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] text-balance mb-4">
              Turn Any Recipe Into a <span className="text-[#0071DC]">Walmart Order</span> in Seconds
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mb-8">
              Paste ingredients from blogs, grandma&apos;s kitchen notes, or ask our culinary AI.
              CartCraft parses every ingredient, matches real Walmart products, and lets you add them
              directly to your Walmart order.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenRecipeInput('paste')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0071DC] hover:bg-[#005bb5] active:scale-98 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Input / Paste Recipe</span>
              </button>

              {onOpenPantryManager && (
                <button
                  onClick={onOpenPantryManager}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Pantry Inventory</span>
                </button>
              )}

              <button
                onClick={() => onOpenRecipeInput('ai')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>AI Recipe Creator</span>
              </button>

              <button
                onClick={onExploreRecipes}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Browse {totalRecipesCount} Recipes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Proof metrics row adjacent to action */}
            <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-slate-100">
              <div>
                <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">~35%</div>
                <div className="text-xs text-slate-500">Average savings with Great Value matches</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">1-Click</div>
                <div className="text-xs text-slate-500">Auto-add all ingredients into Walmart cart</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">1-Tap</div>
                <div className="text-xs text-slate-500">Add custom ingredients or extras anytime</div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Photography Banner */}
          <div className="lg:col-span-5 relative flex items-center">
            <div className="relative w-full aspect-4/3 lg:aspect-auto lg:h-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              {imgLoaded ? (
                <img
                  src={heroImg}
                  alt="Fresh culinary grocery ingredients ready for Walmart shopping"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setImgLoaded(false)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600">
                  <ChefHat className="w-12 h-12 text-[#0071DC] mb-2" />
                  <p className="text-sm font-semibold">Walmart Grocery Recipe Cart</p>
                </div>
              )}

              {/* Floating trust overlay strip */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200/80 shadow-md flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900">Walmart Supercenter Ready</span>
                  <p className="text-slate-500 text-[11px]">Produce · Meat · Dairy · Spices · Bakery</p>
                </div>
                <span className="font-mono font-bold text-[#0071DC]">Live Links</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
