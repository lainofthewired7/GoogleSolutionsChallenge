import { useState, useEffect } from 'react';
import { generateMarketInsights } from '../utils/gemini';

interface GenerateInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextData?: string;
  title?: string;
}

/**
 * Simple helper to parse generic bold text in a line.
 */
function parseMarkdownInLine(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-on-surface font-black">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function GenerateInsightsModal({ isOpen, onClose, contextData = "General market data", title = "AI Market Insights" }: GenerateInsightsModalProps) {
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setInsight(null);
      generateMarketInsights(contextData).then(res => {
        setInsight(res);
        setLoading(false);
      });
    }
  }, [isOpen, contextData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface-container w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-outline-variant/20 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
            </div>
            <h2 className="text-lg font-headline font-bold text-on-surface">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <div className="flex flex-col">
                  <span className="text-primary font-bold text-sm tracking-widest uppercase animate-pulse">Running Gemini</span>
                  <span className="text-on-surface-variant text-xs">Synthesizing live data pipelines...</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-6 w-1/3 bg-surface-variant/50 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-surface-variant/30 rounded animate-pulse"></div>
                <div className="h-4 w-5/6 bg-surface-variant/30 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2 pt-4">
                <div className="h-6 w-1/4 bg-surface-variant/50 rounded animate-pulse"></div>
                <div className="h-4 w-full bg-surface-variant/30 rounded animate-pulse"></div>
                <div className="h-4 w-4/5 bg-surface-variant/30 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div className="prose prose-invert prose-p:text-on-surface-variant prose-headings:text-on-surface prose-strong:text-on-surface max-w-none text-sm leading-relaxed">
              {insight?.split('\n').map((line, i) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-6 mb-2">{trimmedLine.replace('### ', '')}</h3>;
                if (trimmedLine.startsWith('## ')) return <h2 key={i} className="text-xl font-headline font-black mb-4 pb-2 border-b border-outline-variant/10 text-primary">{trimmedLine.replace('## ', '')}</h2>;
                if (trimmedLine.startsWith('# ')) return <h1 key={i} className="text-2xl font-headline font-black mb-4 pb-2 text-primary">{trimmedLine.replace('# ', '')}</h1>;
                
                // Bullet points
                if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                  const content = trimmedLine.substring(2);
                  return (
                    <li key={i} className="ml-4 list-disc mb-1">
                      {parseMarkdownInLine(content)}
                    </li>
                  );
                }

                if (trimmedLine === '') return <div key={i} className="h-4" />;

                return <p key={i} className="mb-2">{parseMarkdownInLine(line)}</p>;
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/10 bg-surface-container-high flex justify-between items-center">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-tertiary">lock</span>
                Secure Insights
            </span>
            <div className="flex gap-2">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Dismiss
                </button>
                <button 
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded shadow hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Save PDF
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
 