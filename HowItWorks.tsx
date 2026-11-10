import React from 'react';
import { Sparkles, ShoppingCart, ListChecks, ArrowUpRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-12 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
            Seamless Grocery Workflow
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How CartCraft Works with Walmart
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Three simple steps to go from recipe inspiration to Walmart delivery or curbside pickup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0071DC] flex items-center justify-center font-mono font-bold text-base">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">Input Any Recipe</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Paste ingredients from your favorite food blog, handwritten card, or generate a customized meal with our culinary AI.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-mono font-bold text-base">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">Automatic Walmart Product Matching</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every item is matched with accurate Walmart search queries, Great Value budget alternatives, package sizes, and aisle categories.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-mono font-bold text-base">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">Automatic 1-Click Cart Ingestion</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Never go item-by-item. Click &quot;Auto-Add to Walmart Cart&quot; to inject all ingredients directly into your Walmart cart simultaneously.
            </p>
          </div>
        </div>

        {/* Walmart Trust Card */}
        <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Ready to complete your Walmart grocery order?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Powered by Walmart&apos;s direct batch cart service — all items are automatically placed in your shopping cart ready for checkout.
            </p>
          </div>
          <a
            href="https://www.walmart.com/cp/groceries/976759"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0071DC] hover:bg-[#005bb5] text-white text-xs font-bold rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Explore Walmart Grocery</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
