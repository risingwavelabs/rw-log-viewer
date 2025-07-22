import React, { useState, useEffect } from 'react';
import { LogFilter, LogStats } from '../types/log';
import { Search, Filter, X, Plus, Minus } from 'lucide-react';
import { saveExcludePatterns } from '../utils/localStorage';
import { useDebounce } from '../hooks/useDebounce';

interface FilterPanelProps {
  filter: LogFilter;
  stats: LogStats;
  onFilterChange: (filter: LogFilter) => void;
  onClearFilters: () => void;
  divideByEpoch?: boolean;
  onDivideByEpochChange?: (enabled: boolean) => void;
  onClose?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filter,
  stats,
  onFilterChange,
  onClearFilters,
  divideByEpoch = false,
  onDivideByEpochChange,
  onClose
}) => {
  const [searchInput, setSearchInput] = useState(filter.searchText || '');
  const debouncedSearchText = useDebounce(searchInput, 300);

  // Update filter when debounced search text changes
  useEffect(() => {
    if (debouncedSearchText !== filter.searchText) {
      onFilterChange({ ...filter, searchText: debouncedSearchText });
    }
  }, [debouncedSearchText, filter, onFilterChange]);

  // Sync search input with external changes
  useEffect(() => {
    if (filter.searchText !== searchInput) {
      setSearchInput(filter.searchText || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.searchText]); // Intentionally exclude searchInput to avoid infinite updates
  const handleLevelChange = (level: string, checked: boolean) => {
    const levels = filter.levels || [];
    const newLevels = checked
      ? [...levels, level]
      : levels.filter(l => l !== level);
    onFilterChange({ ...filter, levels: newLevels });
  };

  const handleActorChange = (actorId: number, checked: boolean) => {
    const actorIds = filter.actorIds || [];
    const newActorIds = checked
      ? [...actorIds, actorId]
      : actorIds.filter(id => id !== actorId);
    onFilterChange({ ...filter, actorIds: newActorIds });
  };

  const handleSearchChange = (searchText: string) => {
    setSearchInput(searchText);
  };

  const handleExcludePatternAdd = () => {
    const excludePatterns = filter.excludePatterns || [];
    onFilterChange({ ...filter, excludePatterns: [...excludePatterns, ''] });
  };

  const handleExcludePatternChange = (index: number, value: string) => {
    const excludePatterns = filter.excludePatterns || [];
    const newPatterns = [...excludePatterns];
    newPatterns[index] = value;
    onFilterChange({ ...filter, excludePatterns: newPatterns });
    saveExcludePatterns(newPatterns);
  };

  const handleExcludePatternRemove = (index: number) => {
    const excludePatterns = filter.excludePatterns || [];
    const newPatterns = excludePatterns.filter((_, i) => i !== index);
    onFilterChange({ ...filter, excludePatterns: newPatterns });
    saveExcludePatterns(newPatterns);
  };

  const hasActiveFilters = 
    (filter.levels && filter.levels.length > 0) ||
    (filter.actorIds && filter.actorIds.length > 0) ||
    (filter.searchText && filter.searchText.length > 0) ||
    (filter.excludePatterns && filter.excludePatterns.some(p => p.trim().length > 0));

  return (
    <div className="w-72 bg-white/90 backdrop-blur-sm border-r border-gray-200/50 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center text-gray-900">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <Filter className="h-4 w-4 text-white" />
          </div>
          Filters
        </h2>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-gray-500 hover:text-red-600 flex items-center px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </button>
          )}
          
          {/* Close button for mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Search
          </label>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search in messages..."
            className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm"
          />
        </div>
      </div>

      {/* Exclude Patterns */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-semibold text-gray-700">
            Exclude Patterns
          </label>
          <button
            onClick={handleExcludePatternAdd}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {(filter.excludePatterns || []).map((pattern, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={pattern}
                onChange={(e) => handleExcludePatternChange(index, e.target.value)}
                placeholder="Pattern to exclude..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm"
              />
              <button
                onClick={() => handleExcludePatternRemove(index)}
                className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2 pl-1">
          Hide log entries containing these patterns
        </p>
      </div>

      {/* Divide by Epoch */}
      <div className="mb-6">
        <label className="flex items-center p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100/80 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={divideByEpoch}
            onChange={(e) => onDivideByEpochChange?.(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
          />
          <div className="ml-3">
            <span className="text-sm font-medium text-gray-700">
              Divide by Epoch
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Show dividers when barriers are encountered
            </p>
          </div>
        </label>
      </div>

      {/* Log Levels */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Log Levels
        </label>
        <div className="space-y-2">
          {Object.entries(stats.levelCounts).map(([level, count]) => (
            <label key={level} className="flex items-center p-2 rounded-lg hover:bg-gray-50/80 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={filter.levels?.includes(level) || false}
                onChange={(e) => handleLevelChange(level, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="ml-3 text-sm text-gray-700 flex-1">
                {level}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {count.toLocaleString()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Actor IDs */}
      {stats.actorIds.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Actors
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {stats.actorIds.slice(0, 20).map((actorId) => (
              <label key={actorId} className="flex items-center p-2 rounded-lg hover:bg-gray-50/80 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={filter.actorIds?.includes(actorId) || false}
                  onChange={(e) => handleActorChange(actorId, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="ml-3 text-sm text-gray-700">
                  Actor {actorId}
                </span>
              </label>
            ))}
            {stats.actorIds.length > 20 && (
              <p className="text-xs text-gray-500 pl-2 py-1">
                ... and {stats.actorIds.length - 20} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Epochs */}
      {stats.epochs.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Epochs ({stats.epochs.length} unique)
          </label>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">First:</span>
                <span className="font-mono text-blue-600">{stats.epochs[0]?.slice(-8)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last:</span>
                <span className="font-mono text-indigo-600">{stats.epochs[stats.epochs.length - 1]?.slice(-8)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Statistics
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total entries:</span>
            <span className="text-sm font-semibold text-gray-800">{stats.totalEntries.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Spans:</span>
            <span className="text-sm font-semibold text-gray-800">{stats.spans.length}</span>
          </div>
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-1">Time range:</div>
            <div className="bg-white/60 p-2 rounded-md font-mono text-xs">
              {stats.timeRange.start.toLocaleTimeString()} - {stats.timeRange.end.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};