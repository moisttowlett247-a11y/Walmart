import React, { useState } from 'react';
import { X, Check, SlidersHorizontal, CheckCircle2, ShieldCheck, Leaf, Plus, Trash2, RotateCcw } from 'lucide-react';
import { DefaultSelectionSettings, DefaultSelectionMode } from '../types';
import { COMMON_HOME_STAPLES_PRESETS, DEFAULT_HOME_STAPLES } from '../utils/defaultSelection';

interface DefaultSelectionModalProps {
  isOpen: boolean;
  settings: DefaultSelectionSettings;
  onClose: () => void;
  onSaveSettings: (newSettings: DefaultSelectionSettings) => void;
}

export const DefaultSelectionModal: React.FC<DefaultSelectionModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSaveSettings,
}) => {
  const [mode, setMode] = useState<DefaultSelectionMode>(settings.mode);
  const [homeStaples, setHomeStaples] = useState<string[]>([...settings.homeStaples]);
  const [autoApply, setAutoApply] = useState<boolean>(settings.autoApplyOnOpen);
  const [newStapleInput, setNewStapleInput] = useState('');

  if (!isOpen) return null;

  const handleAddCustomStaple = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newStapleInput.trim().toLowerCase();
    if (clean && !homeStaples.includes(clean)) {
      setHomeStaples((prev) => [...prev, clean]);
      setNewStapleInput('');
    }
  };

  const handleRemoveStaple = (staple: string) => {
    setHomeStaples((prev) => prev.filter((s) => s !== staple));
  };

  const handleTogglePreset = (keywords: string[]) => {
    const allPresent = keywords.every((k) => homeStaples.includes(k));
    if (allPresent) {
      setHomeStaples((prev) => prev.filter((s) => !keywords.includes(s)));
    } else {
      setHomeStaples((prev) => Array.from(new Set([...prev, ...keywords])));
    }
  };

  const handleResetToDefaults = () => {
    setMode('all');
    setHomeStaples([...DEFAULT_HOME_STAPLES]);
    setAutoApply(true);
  };

  const handleSave = () => {
    onSaveSettings({
      mode,
      homeStaples,
      autoApplyOnOpen: autoApply,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-[#0071DC]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Default Ingredient Selection
              </h3>
              <p className="text-xs text-slate-500">
                Applies across all pre-made and custom recipes
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
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Rule Selection Cards */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Default Selection Rule
            </label>

            <div className="space-y-2.5">
              {/* Option 1: Select All */}
              <div
                onClick={() => setMode('all')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  mode === 'all'
                    ? 'bg-blue-50/70 border-[#0071DC] ring-1 ring-[#0071DC]'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        mode === 'all'
                          ? 'border-[#0071DC] bg-[#0071DC] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {mode === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Select All Ingredients (Recommended)
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                        Full Cart
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Every recipe ingredient (including oils, spices, and seasonings) is checked by default so nothing is accidentally forgotten.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 2: Exclude Home Staples */}
              <div
                onClick={() => setMode('exclude_staples')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  mode === 'exclude_staples'
                    ? 'bg-blue-50/70 border-[#0071DC] ring-1 ring-[#0071DC]'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        mode === 'exclude_staples'
                          ? 'border-[#0071DC] bg-[#0071DC] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {mode === 'exclude_staples' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Exclude My Home Pantry Staples
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-blue-100 text-[#0071DC] px-1.5 py-0.2 rounded">
                        Smart Savings
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Auto-deselects common basics you already have in your kitchen (like salt, pepper, oil, and butter) so you don&apos;t buy duplicate pantry items.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 3: Perishables Only */}
              <div
                onClick={() => setMode('perishables_only')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  mode === 'perishables_only'
                    ? 'bg-blue-50/70 border-[#0071DC] ring-1 ring-[#0071DC]'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        mode === 'perishables_only'
                          ? 'border-[#0071DC] bg-[#0071DC] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {mode === 'perishables_only' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        Only Fresh Perishables & Proteins
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                        Fresh Only
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Selects Meat & Seafood, Fresh Produce, Dairy & Eggs, and Bakery. Leaves dry pantry and spices unselected by default.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Home Staples Configuration (Shown if Exclude Staples is selected) */}
          {mode === 'exclude_staples' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Kitchen Staples to Auto-Deselect ({homeStaples.length} items):
                </span>
                <span className="text-[11px] text-slate-500">
                  Toggle items you keep at home
                </span>
              </div>

              {/* Presets quick tags */}
              <div className="flex flex-wrap gap-1.5">
                {COMMON_HOME_STAPLES_PRESETS.map((preset) => {
                  const isActive = preset.keywords.some((k) => homeStaples.includes(k));
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleTogglePreset(preset.keywords)}
                      className={`px-2 py-1 text-xs font-medium rounded-lg border cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-blue-100 border-blue-300 text-blue-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isActive ? '✓ ' : '+ '}
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Active Staples Pills */}
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                {homeStaples.map((staple) => (
                  <span
                    key={staple}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 shadow-2xs"
                  >
                    <span>{staple}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStaple(staple)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer ml-0.5"
                      title="Remove staple"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add custom staple form */}
              <form onSubmit={handleAddCustomStaple} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add custom staple (e.g. honey, cumin)..."
                  value={newStapleInput}
                  onChange={(e) => setNewStapleInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newStapleInput.trim()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  Add
                </button>
              </form>
            </div>
          )}

          {/* Auto Apply Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-800">
                Auto-apply default selection on recipe open
              </div>
              <div className="text-[11px] text-slate-500">
                When you click into any recipe, it will immediately adopt this selection.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoApply(!autoApply)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoApply ? 'bg-[#0071DC]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  autoApply ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0071DC] hover:bg-[#005bb5] rounded-lg shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Apply to Recipes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
