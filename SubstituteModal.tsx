import React, { useState, useEffect } from 'react';
import { X, Sparkles, ExternalLink, Loader2, Check, Tag, TrendingDown } from 'lucide-react';
import { Ingredient, SubstitutionOption } from '../types';
import { getIngredientSubstitutions } from '../services/api';
import { findGreatValueSubstitution } from '../data/walmartGroceryCatalog';

interface SubstituteModalProps {
  isOpen: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
  onApplySubstitution: (ingredientId: string, sub: SubstitutionOption) => void;
}

export const SubstituteModal: React.FC<SubstituteModalProps> = ({
  isOpen,
  ingredient,
  onClose,
  onApplySubstitution,
}) => {
  const [reason, setReason] = useState<'budget' | 'dairy_free' | 'healthy' | 'out_of_stock'>('budget');
  const [substitutions, setSubstitutions] = useState<SubstitutionOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && ingredient) {
      loadSubstitutions();
    }
  }, [isOpen, ingredient, reason]);

  const loadSubstitutions = async () => {
    if (!ingredient) return;
    setIsLoading(true);
    try {
      const results = await getIngredientSubstitutions(ingredient.name, reason, ingredient.estimatedPrice);
      setSubstitutions(results);
    } catch (err) {
      console.error(err);
      // High quality fallback with guaranteed Great Value option
      const gvFallback = findGreatValueSubstitution(ingredient.name, ingredient.estimatedPrice);
      setSubstitutions([gvFallback]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !ingredient) return null;

  // Identify top Great Value substitution
  const gvOption = substitutions.find(
    (s) => s.isGreatValue || s.name.toLowerCase().includes('great value') || s.walmartQuery.toLowerCase().includes('great value')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Walmart Substitutions for &quot;{ingredient.name}&quot;
              </h3>
              <p className="text-xs text-slate-500">
                Current estimate: ${ingredient.estimatedPrice.toFixed(2)} ({ingredient.packageSize})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Great Value Featured Callout (if available) */}
          {gvOption && !isLoading && (
            <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#0071DC] text-white">
                    <Tag className="w-2.5 h-2.5" /> Great Value™ Store Brand
                  </span>
                  {ingredient.estimatedPrice > gvOption.estimatedPrice && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <TrendingDown className="w-2.5 h-2.5" />
                      Save ${(ingredient.estimatedPrice - gvOption.estimatedPrice).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  {gvOption.name}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {gvOption.explanation}
                </div>
                <div className="text-xs font-mono font-semibold text-[#0071DC] mt-1">
                  ${gvOption.estimatedPrice.toFixed(2)} • {gvOption.walmartQuery}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    onApplySubstitution(ingredient.id, gvOption);
                    onClose();
                  }}
                  className="px-3.5 py-2 bg-[#0071DC] hover:bg-[#005bb5] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Swap to Great Value</span>
                </button>
              </div>
            </div>
          )}

          {/* Reason Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Filter substitutions by goal:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'budget', label: 'Great Value ($)' },
                { id: 'healthy', label: 'Healthier / Lean' },
                { id: 'dairy_free', label: 'Dairy / Plant Free' },
                { id: 'out_of_stock', label: 'Out of Stock' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setReason(item.id as any)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer text-center ${
                    reason === item.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-3 pt-1">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              All Available Walmart Options
            </div>

            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#0071DC]" />
                <span className="text-xs font-medium">Finding Walmart substitutions...</span>
              </div>
            ) : substitutions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No substitutions found.
              </p>
            ) : (
              substitutions.map((sub, idx) => {
                const isGV = sub.isGreatValue || sub.name.toLowerCase().includes('great value') || sub.walmartQuery.toLowerCase().includes('great value');
                const savings = ingredient.estimatedPrice > sub.estimatedPrice
                  ? ingredient.estimatedPrice - sub.estimatedPrice
                  : 0;

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isGV
                        ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-900">{sub.name}</span>
                        {isGV && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0071DC] text-white">
                            Great Value
                          </span>
                        )}
                        <span className="font-mono font-bold text-xs text-slate-900 tabular-nums">
                          ${sub.estimatedPrice.toFixed(2)}
                        </span>
                        {savings > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Save ${savings.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {sub.explanation}
                      </p>
                      <div className="text-[11px] text-blue-600 font-mono truncate mt-1">
                        Walmart Match: {sub.walmartQuery}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={sub.walmartSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Preview on Walmart.com"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => {
                          onApplySubstitution(ingredient.id, sub);
                          onClose();
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors ${
                          isGV
                            ? 'bg-[#0071DC] hover:bg-[#005bb5] text-white'
                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Swap in Recipe</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
