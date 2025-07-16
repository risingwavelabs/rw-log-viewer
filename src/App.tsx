import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { type Virtualizer } from '@tanstack/react-virtual';
import { LogEntry, LogFilter } from './types/log';
import { LogParser } from './utils/logParser';
import { FileUpload } from './components/FileUpload';
import { FilterPanel } from './components/FilterPanel';
import { LogViewer } from './components/LogViewer';
import { SearchHighlight } from './components/SearchHighlight';
import { useErrorToast } from './hooks/useErrorToast';
import { useLogStats } from './hooks/useLogStats';
import { formatFileSize } from './utils/formatters';
import { loadExcludePatterns } from './utils/localStorage';
import clsx from 'clsx';

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
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  
  const logViewerRef = useRef<HTMLDivElement | null>(null);
  const virtualizerRef = useRef<Virtualizer<HTMLDivElement, Element> | null>(null);
  const { showError, showWarning, ToastContainer } = useErrorToast();

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

  // Calculate stats from log entries using optimized hook
  const stats = useLogStats(logEntries);

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
    const fileSize = new Blob([content]).size;
    setOriginalFileSize(fileSize);
    
    // File size validation
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    const LARGE_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    
    if (fileSize > MAX_FILE_SIZE) {
      showError(
        'File Too Large',
        `The file size (${formatFileSize(fileSize)}) exceeds the maximum allowed size of ${formatFileSize(MAX_FILE_SIZE)}. Please try a smaller file.`
      );
      setIsLoading(false);
      return;
    }
    
    if (fileSize > LARGE_FILE_SIZE) {
      showWarning(
        'Large File Warning',
        `The file size (${formatFileSize(fileSize)}) is quite large. Processing may take longer and could impact browser performance.`
      );
    }
    
    try {
      // Parse log file in a timeout to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 100));
      const entries = LogParser.parseLogFile(content);
      setLogEntries(entries);
      
      if (entries.length === 0) {
        showWarning('Empty Log File', 'The uploaded file appears to be empty or contains no valid log entries.');
      }
    } catch (error) {
      console.error('Error parsing log file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError(
        'Failed to Parse Log File',
        `Could not parse the log file. Please check the file format and try again.\n\nError: ${errorMessage}`
      );
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="max-w-2xl w-full px-4">
          <div className="text-center mb-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              RisingWave Log Analyzer
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Analyze actor activity, epochs, and debug information
            </p>
            <p className="text-gray-500">
              Upload a log file to get started with advanced filtering and search capabilities
            </p>
          </div>
          <FileUpload onFileLoad={handleFileLoad} isLoading={isLoading} onError={showError} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  RisingWave Log Analyzer
                </h1>
                {filename && (
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{filename}</span> ({formatFileSize(originalFileSize)}) • 
                    <span className="text-blue-600 font-medium">{filteredEntries.length.toLocaleString()}</span> / {stats.totalEntries.toLocaleString()} entries
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Toggle Filter Panel Button (Mobile) */}
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="lg:hidden px-3 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="hidden sm:inline">Filters</span>
              </button>
              
              <button
                onClick={() => {
                  setLogEntries([]);
                  setFilter({});
                  setFilename('');
                  setOriginalFileSize(0);
                }}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">Load New File</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-100px)] relative">
        {/* Filter Panel */}
        <div className={clsx(
          'bg-white/80 backdrop-blur-sm border-r border-gray-200/50 shadow-sm transition-all duration-300',
          'lg:relative lg:translate-x-0',
          showFilterPanel ? 'absolute z-10 translate-x-0' : 'absolute z-10 -translate-x-full lg:translate-x-0',
          'lg:block'
        )}>
          <FilterPanel
            filter={filter}
            stats={stats}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            divideByEpoch={divideByEpoch}
            onDivideByEpochChange={setDivideByEpoch}
            onClose={() => setShowFilterPanel(false)}
          />
        </div>

        {/* Overlay for mobile */}
        {showFilterPanel && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-5"
            onClick={() => setShowFilterPanel(false)}
          />
        )}

        {/* Log Viewer */}
        <div className="flex-1 overflow-hidden">
          <div
            ref={logViewerRef}
            className="h-full overflow-auto bg-white/60 backdrop-blur-sm"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 animate-pulse"></div>
                  </div>
                  <p className="text-lg font-medium text-gray-800 mb-2">Processing log file...</p>
                  <p className="text-sm text-gray-600">Analyzing {formatFileSize(originalFileSize)} of log data</p>
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
      
      {/* Error Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default App;