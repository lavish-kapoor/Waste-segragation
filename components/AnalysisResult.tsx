import React, { useState } from 'react';
import { WasteItem, WasteCategory, ScanResult } from '../types';
import { Recycle, Trash2, Leaf, AlertTriangle, Zap, Info, ChevronDown, ChevronUp, Package } from 'lucide-react';

interface AnalysisResultProps {
  result: Omit<ScanResult, 'id' | 'timestamp'>;
  onReset: () => void;
}

const getCategoryColor = (category: WasteCategory) => {
  switch (category) {
    case WasteCategory.BIODEGRADABLE: return 'bg-green-100 text-green-800 border-green-300';
    case WasteCategory.RECYCLABLE: return 'bg-blue-100 text-blue-800 border-blue-300';
    case WasteCategory.NON_RECYCLABLE: return 'bg-gray-100 text-gray-800 border-gray-300';
    case WasteCategory.HAZARDOUS: return 'bg-red-100 text-red-800 border-red-300';
    case WasteCategory.E_WASTE: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default: return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

const getCategoryIcon = (category: WasteCategory) => {
  switch (category) {
    case WasteCategory.BIODEGRADABLE: return <Leaf className="w-5 h-5" />;
    case WasteCategory.RECYCLABLE: return <Recycle className="w-5 h-5" />;
    case WasteCategory.NON_RECYCLABLE: return <Trash2 className="w-5 h-5" />;
    case WasteCategory.HAZARDOUS: return <AlertTriangle className="w-5 h-5" />;
    case WasteCategory.E_WASTE: return <Zap className="w-5 h-5" />;
    default: return <Info className="w-5 h-5" />;
  }
};

const ItemCard: React.FC<{ item: WasteItem; defaultOpen?: boolean }> = ({ item, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const colorClass = getCategoryColor(item.category);

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden transition-all duration-300 mb-4 ${isOpen ? 'ring-2 ring-emerald-100' : ''}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 flex items-center justify-between cursor-pointer ${colorClass} bg-opacity-50`}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/60 rounded-full shadow-sm">
            {getCategoryIcon(item.category)}
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">{item.itemName}</h3>
            <p className="text-xs font-medium opacity-80">{item.material} • {item.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
            <span className="text-xs font-bold bg-white/50 px-2 py-1 rounded-full hidden sm:inline-block">
                {Math.round(item.confidence * 100)}%
            </span>
            {isOpen ? <ChevronUp className="w-5 h-5 opacity-60" /> : <ChevronDown className="w-5 h-5 opacity-60" />}
        </div>
      </div>

      {isOpen && (
        <div className="bg-white p-5 animate-fade-in border-t border-gray-100">
           <p className="text-gray-700 font-medium mb-4 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
             <span className="block text-xs uppercase text-gray-400 font-bold mb-1">Instruction</span>
            {item.disposalInstruction}
          </p>

          <div className="mb-4">
            <h4 className="text-emerald-800 text-sm font-bold mb-2 flex items-center uppercase tracking-wide">
              <Recycle className="w-3 h-3 mr-1" /> Recycling Tips
            </h4>
            <ul className="space-y-2">
              {item.recyclingTips.map((tip, index) => (
                <li key={index} className="text-gray-600 text-sm flex items-start">
                  <span className="mr-2 text-emerald-500 font-bold">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {item.funFact && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <h4 className="text-amber-800 text-xs font-bold mb-1 uppercase">Did you know?</h4>
              <p className="text-amber-900 text-sm italic">
                "{item.funFact}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, onReset }) => {
  return (
    <div className="w-full max-w-md mx-auto p-4 animate-fade-in pb-24">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Package className="mr-2 text-emerald-600" />
              Identified Items
          </h2>
          <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
              {result.items.length} Found
          </span>
      </div>

      <div className="space-y-2">
        {result.items.map((item, index) => (
          <ItemCard key={index} item={item} defaultOpen={result.items.length === 1 || index === 0} />
        ))}
      </div>

      <button
        onClick={onReset}
        className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center space-x-2"
      >
        <Recycle className="w-5 h-5" />
        <span>Scan Another Item</span>
      </button>
    </div>
  );
};

export default AnalysisResult;
