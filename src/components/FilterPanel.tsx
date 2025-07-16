import React from 'react';
import { LogFilter, LogStats } from '../types/log';
import { Search, Filter, X, Plus, Minus } from 'lucide-react';
import { saveExcludePatterns } from '../utils/localStorage';

interface FilterPanelProps {
  filter: LogFilter;
  stats: LogStats;
  onFilterChange: (filter: LogFilter) => void;
  onClearFilters: () => void;
  divideByEpoch?: boolean;
  onDivideByEpochChange?: (enabled: boolean) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filter,
  stats,
  onFilterChange,
  onClearFilters,
  divideByEpoch = false,
  onDivideByEpochChange
}) => {
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
    onFilterChange({ ...filter, searchText });
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
    <div className="w-60 bg-white border-r border-gray-200 p-3 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold flex items-center">
          <Filter className="h-4 w-4 mr-1" />
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <input
            type="text"
            value={filter.searchText || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search in messages..."
            className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Exclude Patterns */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-700">
            Exclude Patterns
          </label>
          <button
            onClick={handleExcludePatternAdd}
            className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </button>
        </div>
        <div className="space-y-1">
          {(filter.excludePatterns || []).map((pattern, index) => (
            <div key={index} className="flex items-center space-x-1">
              <input
                type="text"
                value={pattern}
                onChange={(e) => handleExcludePatternChange(index, e.target.value)}
                placeholder="Pattern to exclude..."
                className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleExcludePatternRemove(index)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Minus className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Hide log entries containing these patterns
        </p>
      </div>

      {/* Divide by Epoch */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={divideByEpoch}
            onChange={(e) => onDivideByEpochChange?.(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-xs font-medium text-gray-700">
            Divide by Epoch
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Show dividers when barriers are encountered
        </p>
      </div>

      {/* Log Levels */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Log Levels
        </label>
        <div className="space-y-1">
          {Object.entries(stats.levelCounts).map(([level, count]) => (
            <label key={level} className="flex items-center">
              <input
                type="checkbox"
                checked={filter.levels?.includes(level) || false}
                onChange={(e) => handleLevelChange(level, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-xs text-gray-700">
                {level} ({count})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Actor IDs */}
      {stats.actorIds.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Actors
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {stats.actorIds.slice(0, 20).map((actorId) => (
              <label key={actorId} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filter.actorIds?.includes(actorId) || false}
                  onChange={(e) => handleActorChange(actorId, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-xs text-gray-700">
                  Actor {actorId}
                </span>
              </label>
            ))}
            {stats.actorIds.length > 20 && (
              <p className="text-xs text-gray-500">
                ... and {stats.actorIds.length - 20} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Epochs */}
      {stats.epochs.length > 0 && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Epochs ({stats.epochs.length} unique)
          </label>
          <div className="text-xs text-gray-600">
            <div>First: {stats.epochs[0]?.slice(-8)}</div>
            <div>Last: {stats.epochs[stats.epochs.length - 1]?.slice(-8)}</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 p-2 bg-gray-50 rounded-md">
        <h3 className="text-xs font-medium text-gray-700 mb-1">Statistics</h3>
        <div className="text-xs text-gray-600 space-y-0.5">
          <div>Total entries: {stats.totalEntries.toLocaleString()}</div>
          <div>Spans: {stats.spans.length}</div>
          <div>Time range: {stats.timeRange.start.toLocaleTimeString()} - {stats.timeRange.end.toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
};