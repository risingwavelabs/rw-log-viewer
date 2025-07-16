import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { LogEntry, LogFilter, LogStats } from './types/log';
import { LogParser } from './utils/logParser';
import { FileUpload } from './components/FileUpload';
import { FilterPanel } from './components/FilterPanel';
import { LogViewer } from './components/LogViewer';
import { SearchHighlight } from './components/SearchHighlight';
import { formatFileSize } from './utils/formatters';
import { loadExcludePatterns } from './utils/localStorage';

function App() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>({});
  const [isLoading, setIsLoading] = useState(false);
  const [filename, setFilename] = useState<string>('');
  const [originalFileSize, setOriginalFileSize] = useState<number>(0);
  const [divideByEpoch, setDivideByEpoch] = useState(true);
  const [searchHighlight, setSearchHighlight] = useState<string>('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [showSearchHighlight, setShowSearchHighlight] = useState(false);
  
  const logViewerRef = useRef<HTMLDivElement | null>(null);
  const virtualizerRef = useRef<any>(null);

  // Load exclude patterns from localStorage on component mount
  useEffect(() => {
    const savedPatterns = loadExcludePatterns();
    if (savedPatterns.length > 0) {
      setFilter(prev => ({ ...prev, excludePatterns: savedPatterns }));
    }
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearchHighlight(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate stats from log entries
  const stats: LogStats = useMemo(() => {
    const levelCounts: Record<string, number> = {};
    const actorIds = new Set<number>();
    const spans = new Set<string>();
    const epochs = new Set<string>();
    let minTime = new Date();
    let maxTime = new Date(0);

    logEntries.forEach(entry => {
      // Count levels
      levelCounts[entry.level] = (levelCounts[entry.level] || 0) + 1;
      
      // Collect actor IDs
      if (entry.actorId) {
        actorIds.add(entry.actorId);
      }
      
      // Collect spans
      spans.add(entry.span);
      
      // Collect epochs
      if (entry.currEpoch) {
        epochs.add(entry.currEpoch);
      }
      
      // Track time range
      if (entry.timestamp < minTime) minTime = entry.timestamp;
      if (entry.timestamp > maxTime) maxTime = entry.timestamp;
    });

    return {
      totalEntries: logEntries.length,
      levelCounts,
      actorIds: Array.from(actorIds).sort((a, b) => a - b),
      spans: Array.from(spans).sort(),
      epochs: Array.from(epochs).sort(),
      timeRange: {
        start: minTime,
        end: maxTime
      }
    };
  }, [logEntries]);

  // Filter log entries based on current filter
  const filteredEntries = useMemo(() => {
    return logEntries.filter(entry => {
      // Filter by levels
      if (filter.levels && filter.levels.length > 0) {
        if (!filter.levels.includes(entry.level)) {
          return false;
        }
      }

      // Filter by actor IDs
      if (filter.actorIds && filter.actorIds.length > 0) {
        if (!entry.actorId || !filter.actorIds.includes(entry.actorId)) {
          return false;
        }
      }

      // Filter by search text
      if (filter.searchText && filter.searchText.trim()) {
        const searchLower = filter.searchText.toLowerCase();
        if (!entry.message.toLowerCase().includes(searchLower) && 
            !entry.span.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filter by exclude patterns
      if (filter.excludePatterns && filter.excludePatterns.length > 0) {
        const activePatterns = filter.excludePatterns.filter(p => p.trim().length > 0);
        for (const pattern of activePatterns) {
          const patternLower = pattern.toLowerCase();
          if (entry.message.toLowerCase().includes(patternLower) || 
              entry.span.toLowerCase().includes(patternLower)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [logEntries, filter]);

  // Calculate search highlight matches
  const searchMatches = useMemo(() => {
    if (!searchHighlight.trim()) return [];
    
    const searchLower = searchHighlight.toLowerCase();
    const matches: number[] = [];
    
    filteredEntries.forEach((entry, index) => {
      if (entry.message.toLowerCase().includes(searchLower) || 
          entry.span.toLowerCase().includes(searchLower)) {
        matches.push(index);
      }
    });
    
    return matches;
  }, [filteredEntries, searchHighlight]);

  // Helper function to scroll to a specific match
  const scrollToMatch = useCallback((matchIndex: number) => {
    if (matchIndex < 0 || matchIndex >= searchMatches.length) return;
    
    const entryIndex = searchMatches[matchIndex];
    
    // Calculate the viewer item index including dividers
    let viewerItemIndex = 0;
    let processedEntries = 0;
    
    if (divideByEpoch) {
      // Account for dividers when divideByEpoch is true
      let lastEpoch: string | null = null;
      
      for (let i = 0; i < filteredEntries.length; i++) {
        const entry = filteredEntries[i];
        
        // Check if we need to add a divider
        if (entry.currEpoch && entry.prevEpoch && entry.currEpoch !== lastEpoch) {
          viewerItemIndex++; // Add divider
          lastEpoch = entry.currEpoch;
        }
        
        if (processedEntries === entryIndex) {
          break;
        }
        
        viewerItemIndex++; // Add entry
        processedEntries++;
      }
    } else {
      viewerItemIndex = entryIndex;
    }
    
    // Scroll to the item using the virtualizer
    if (virtualizerRef.current) {
      virtualizerRef.current.scrollToIndex(viewerItemIndex, { align: 'center' });
    }
  }, [searchMatches, divideByEpoch, filteredEntries]);

  // Navigation functions for search highlights
  const goToNextMatch = () => {
    if (searchMatches.length === 0) return;
    
    const nextIndex = currentMatchIndex < searchMatches.length - 1 
      ? currentMatchIndex + 1 
      : 0;
    setCurrentMatchIndex(nextIndex);
    scrollToMatch(nextIndex);
  };

  const goToPreviousMatch = () => {
    if (searchMatches.length === 0) return;
    
    const prevIndex = currentMatchIndex > 0 
      ? currentMatchIndex - 1 
      : searchMatches.length - 1;
    setCurrentMatchIndex(prevIndex);
    scrollToMatch(prevIndex);
  };

  // Reset current match index when search changes
  useEffect(() => {
    if (searchMatches.length > 0) {
      setCurrentMatchIndex(0);
      // Scroll to first match
      setTimeout(() => scrollToMatch(0), 100);
    } else {
      setCurrentMatchIndex(-1);
    }
  }, [searchMatches, scrollToMatch]);

  const handleSearchHighlightClose = () => {
    setShowSearchHighlight(false);
    setSearchHighlight('');
    setCurrentMatchIndex(-1);
  };

  const handleFileLoad = async (content: string, filename: string) => {
    setIsLoading(true);
    setFilename(filename);
    setOriginalFileSize(new Blob([content]).size);
    
    try {
      // Parse log file in a timeout to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 100));
      const entries = LogParser.parseLogFile(content);
      setLogEntries(entries);
    } catch (error) {
      console.error('Error parsing log file:', error);
      alert('Error parsing log file. Please check the file format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilter: LogFilter) => {
    setFilter(newFilter);
  };

  const handleClearFilters = () => {
    setFilter({});
  };

  if (logEntries.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl w-full px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              RisingWave Log Analyzer
            </h1>
            <p className="text-gray-600">
              Upload a log file to analyze actor activity, epochs, and debug information
            </p>
          </div>
          <FileUpload onFileLoad={handleFileLoad} isLoading={isLoading} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              RisingWave Log Analyzer
            </h1>
            {filename && (
              <p className="text-sm text-gray-600">
                {filename} ({formatFileSize(originalFileSize)}) - 
                {filteredEntries.length.toLocaleString()} / {stats.totalEntries.toLocaleString()} entries
              </p>
            )}
          </div>
          <button
            onClick={() => {
              setLogEntries([]);
              setFilter({});
              setFilename('');
              setOriginalFileSize(0);
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Load New File
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Filter Panel */}
        <FilterPanel
          filter={filter}
          stats={stats}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          divideByEpoch={divideByEpoch}
          onDivideByEpochChange={setDivideByEpoch}
        />

        {/* Log Viewer */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={logViewerRef}
            className="h-full overflow-auto bg-white"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing log file...</p>
                </div>
              </div>
            ) : (
              <LogViewer
                entries={filteredEntries}
                parentRef={logViewerRef}
                divideByEpoch={divideByEpoch}
                searchHighlight={searchHighlight}
                currentMatchIndex={currentMatchIndex}
                virtualizerRef={virtualizerRef}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Search Highlight Overlay */}
      {showSearchHighlight && (
        <SearchHighlight
          searchTerm={searchHighlight}
          onSearchChange={setSearchHighlight}
          currentMatch={currentMatchIndex}
          totalMatches={searchMatches.length}
          onNextMatch={goToNextMatch}
          onPreviousMatch={goToPreviousMatch}
          onClose={handleSearchHighlightClose}
        />
      )}
    </div>
  );
}

export default App;