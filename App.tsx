import React, { useState, useCallback, useEffect } from 'react';
import { History, Home, Settings, Trash2, Lightbulb, X } from 'lucide-react';
import CameraCapture from './components/CameraCapture';
import AnalysisResult from './components/AnalysisResult';
import HistoryChart from './components/HistoryChart';
import TipsSection from './components/TipsSection';
import { analyzeWasteImage } from './services/geminiService';
import { ScanResult } from './types';

enum View {
  HOME = 'HOME',
  HISTORY = 'HISTORY',
  TIPS = 'TIPS',
  SETTINGS = 'SETTINGS'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<Omit<ScanResult, 'id' | 'timestamp'> | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ecoSortHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('ecoSortHistory', JSON.stringify(history));
  }, [history]);

  const handleCapture = useCallback(async (base64Image: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeWasteImage(base64Image);
      setCurrentAnalysis(result);
      
      // Add to history
      const newScan: ScanResult = {
        ...result,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      
      setHistory(prev => [newScan, ...prev].slice(0, 20)); // Keep last 20 scans
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleReset = () => {
    setCurrentAnalysis(null);
    setError(null);
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire scan history?")) {
      setHistory([]);
    }
  };

  const deleteScan = (id: string) => {
    if (window.confirm("Delete this scan record?")) {
      setHistory(prev => prev.filter(scan => scan.id !== id));
    }
  };

  const renderContent = () => {
    if (currentView === View.TIPS) {
      return <TipsSection />;
    }

    if (currentView === View.HISTORY) {
      return (
        <div className="space-y-6 animate-fade-in pb-20">
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">Your Recycling Journey</h2>
          <HistoryChart history={history} />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-700">Recent Scans</h3>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory} 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-full text-xs font-medium flex items-center transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Clear All
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No history available</div>
              ) : (
                history.map((scan) => (
                  <div key={scan.id} className="p-4 hover:bg-gray-50 transition-colors relative group">
                    <div className="flex justify-between items-start mb-2 pr-6">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400">{new Date(scan.timestamp).toLocaleString()}</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 w-fit">
                          {scan.items.length} item{scan.items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <button 
                        onClick={() => deleteScan(scan.id)}
                        className="absolute top-3 right-3 p-2 text-gray-300 hover:text-red-500 transition-colors"
                        aria-label="Delete scan"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1 mt-2">
                        {scan.items.map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700 truncate max-w-[60%]">{item.itemName}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border whitespace-nowrap ${
                                item.category.includes('Bio') ? 'bg-green-50 text-green-700 border-green-200' :
                                item.category.includes('Recycle') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                              }`}>
                                {item.category}
                              </span>
                           </div>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (currentView === View.SETTINGS) {
       return (
         <div className="animate-fade-in pb-20">
           <h2 className="text-2xl font-bold text-emerald-900 mb-6">About Waste Segregation Helper</h2>
           <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
             <p className="text-gray-600 leading-relaxed">
               Waste Segregation Helper uses advanced AI (Google Gemini) to identify waste items and provide instant segregation advice.
             </p>
             <p className="text-gray-600 leading-relaxed">
               Proper waste segregation reduces landfill mass, prevents pollution, and conserves resources.
             </p>
             <div className="pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-emerald-800 mb-2">Credits</h4>
                
                <p className="text-sm text-gray-500">Lavish Kapoor</p>
                <p className="text-sm text-gray-500">Saksham Bansal</p>
                <p className="text-sm text-gray-500">Ananya Vig</p>
             </div>
           </div>
         </div>
       )
    }

    // HOME VIEW
    return (
      <div className="animate-fade-in pb-20">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Waste Segregation Helper</h1>
          <p className="text-emerald-600">Scan waste to segregate smart.</p>
        </header>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border border-red-200 flex items-center">
            <span className="mr-2">⚠️</span> {error}
          </div>
        )}

        {currentAnalysis ? (
          <AnalysisResult result={currentAnalysis} onReset={handleReset} />
        ) : (
          <CameraCapture onCapture={handleCapture} isAnalyzing={isAnalyzing} />
        )}
      </div>
    );
  };

  return (
    <div className="h-[100dvh] bg-gradient-to-br from-green-50 to-emerald-100 text-gray-800 font-sans overflow-hidden">
      <div className="max-w-md mx-auto h-full flex flex-col relative bg-white/30 sm:border-x sm:border-white/50 shadow-2xl">
        
        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto scroll-smooth">
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <nav className="sticky bottom-0 left-0 right-0 bg-white border-t border-emerald-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] px-6 py-2 flex justify-between items-center z-50 rounded-t-2xl pb-safe">
          <button 
            onClick={() => setCurrentView(View.HOME)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-16 ${currentView === View.HOME ? 'text-emerald-600 bg-emerald-50 scale-105' : 'text-gray-400 hover:text-emerald-500'}`}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Scan</span>
          </button>
          
          <button 
            onClick={() => setCurrentView(View.TIPS)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-16 ${currentView === View.TIPS ? 'text-emerald-600 bg-emerald-50 scale-105' : 'text-gray-400 hover:text-emerald-500'}`}
          >
            <Lightbulb className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">Tips</span>
          </button>

          <button 
            onClick={() => setCurrentView(View.HISTORY)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-16 ${currentView === View.HISTORY ? 'text-emerald-600 bg-emerald-50 scale-105' : 'text-gray-400 hover:text-emerald-500'}`}
          >
            <History className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">History</span>
          </button>
          
          <button 
            onClick={() => setCurrentView(View.SETTINGS)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 w-16 ${currentView === View.SETTINGS ? 'text-emerald-600 bg-emerald-50 scale-105' : 'text-gray-400 hover:text-emerald-500'}`}
          >
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">About</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default App;