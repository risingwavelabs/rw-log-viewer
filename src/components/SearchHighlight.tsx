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
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 flex items-center gap-2 min-w-[300px]">
      <Search className="w-4 h-4 text-gray-500" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search in logs..."
        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      
      {searchTerm && (
        <>
          <div className="text-xs text-gray-500 min-w-[40px]">
            {totalMatches > 0 ? `${currentMatch + 1}/${totalMatches}` : 'No matches'}
          </div>
          
          <div className="flex gap-1">
            <button
              onClick={onPreviousMatch}
              disabled={totalMatches === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous (Shift+Enter)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={onNextMatch}
              disabled={totalMatches === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next (Enter)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
      
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-gray-100"
        title="Close (Escape)"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};