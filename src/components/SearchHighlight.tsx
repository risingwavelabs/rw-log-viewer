import React from 'react';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';

interface SearchHighlightProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentMatch: number;
  totalMatches: number;
  onNextMatch: () => void;
  onPreviousMatch: () => void;
  onClose: () => void;
}

export const SearchHighlight: React.FC<SearchHighlightProps> = ({
  searchTerm,
  onSearchChange,
  currentMatch,
  totalMatches,
  onNextMatch,
  onPreviousMatch,
  onClose
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        onPreviousMatch();
      } else {
        onNextMatch();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed top-6 right-6 bg-white/95 backdrop-blur-sm border border-gray-300/50 rounded-2xl shadow-xl p-4 z-50 flex items-center gap-3 min-w-[350px]">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <Search className="w-4 h-4 text-white" />
      </div>
      
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search in logs..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
        autoFocus
      />
      
      {searchTerm && (
        <>
          <div className="text-sm text-gray-600 min-w-[60px] font-medium">
            {totalMatches > 0 ? (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {currentMatch + 1}/{totalMatches}
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                No matches
              </span>
            )}
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={onPreviousMatch}
              disabled={totalMatches === 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous (Shift+Enter)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={onNextMatch}
              disabled={totalMatches === 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Next (Enter)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
      
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Close (Escape)"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};