import React, { useState } from 'react';
import { Lightbulb, Recycle, Scissors, Globe, ChevronRight, BookOpen, Leaf } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  icon: React.ReactNode;
  content: string;
}

const articles: Article[] = [
  {
    id: '1',
    title: 'Effective Recycling Strategies',
    category: 'Recycling 101',
    summary: 'Learn the golden rules of recycling to avoid contamination.',
    icon: <Recycle className="w-5 h-5 text-blue-500" />,
    content: "Rinse before you bin! Food residue is the #1 contaminant. Separate caps from bottles if required by your local facility. Flatten cardboard boxes to save space."
  },
  {
    id: '2',
    title: 'Upcycling Household Jars',
    category: 'DIY & Upcycling',
    summary: 'Turn old glass jars into beautiful storage or decor.',
    icon: <Scissors className="w-5 h-5 text-purple-500" />,
    content: "Glass jars are infinitely recyclable, but they are also great for storage. Clean them out, paint the lids, and use them for spices, screws, or as rustic flower vases."
  },
  {
    id: '3',
    title: 'The Truth About Plastics',
    category: 'Impact',
    summary: 'Understanding the numbers on plastic containers.',
    icon: <Globe className="w-5 h-5 text-green-500" />,
    content: "Not all plastics are created equal. #1 (PET) and #2 (HDPE) are widely recyclable. #3 through #7 are often harder to process. Always check your local guidelines."
  },
  {
    id: '4',
    title: 'Composting Basics',
    category: 'Organic',
    summary: 'How to start a compost bin in your apartment.',
    icon: <Leaf className="w-5 h-5 text-emerald-500" />,
    content: "You don't need a garden to compost! Vermicomposting (worm bins) or Bokashi buckets work great in small spaces to turn scraps into nutrient-rich soil."
  }
];

const TipsSection: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  return (
    <div className="animate-fade-in pb-24">
      <div className="bg-emerald-600 p-6 rounded-b-3xl shadow-lg mb-6 -mx-6 -mt-6">
        <h2 className="text-2xl font-bold text-white mb-2">Tips & Tricks</h2>
        <p className="text-emerald-100 text-sm">Master the art of sustainable living.</p>
      </div>

      <div className="space-y-4 px-1">
        {articles.map((article) => (
          <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div 
                className="p-4 flex items-start space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedArticle(selectedArticle === article.id ? null : article.id)}
             >
               <div className="p-3 bg-gray-50 rounded-lg">
                 {article.icon}
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{article.category}</span>
                 </div>
                 <h3 className="font-bold text-gray-800 mb-1">{article.title}</h3>
                 <p className="text-sm text-gray-500 leading-snug">{article.summary}</p>
               </div>
               <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform ${selectedArticle === article.id ? 'rotate-90' : ''}`} />
             </div>
             
             {selectedArticle === article.id && (
               <div className="px-4 pb-4 pt-0">
                  <div className="mt-2 p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-sm text-emerald-900 leading-relaxed">
                    <BookOpen className="w-4 h-4 mb-2 opacity-50" />
                    {article.content}
                  </div>
               </div>
             )}
          </div>
        ))}
        
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg relative overflow-hidden">
           <div className="relative z-10">
             <h3 className="font-bold text-lg mb-2">Did you know?</h3>
             <p className="text-sm opacity-90 mb-4">Recycling one aluminum can saves enough energy to run a TV for 3 hours!</p>
             <button className="bg-white/20 hover:bg-white/30 text-white text-xs py-2 px-4 rounded-lg font-medium transition-colors">
               Share Fact
             </button>
           </div>
           <Lightbulb className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10" />
        </div>
      </div>
    </div>
  );
};

export default TipsSection;