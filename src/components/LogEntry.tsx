import React from 'react';
import { LogEntry } from '../types/log';
import { formatTimestamp } from '../utils/formatters';
import { getActorColor } from '../utils/actorColors';
import clsx from 'clsx';

interface LogEntryProps {
  entry: LogEntry;
  searchHighlight?: string;
  isCurrentMatch?: boolean;
}

const levelColors = {
  DEBUG: 'text-gray-600 bg-gray-50',
  INFO: 'text-blue-600 bg-blue-50',
  WARN: 'text-orange-600 bg-orange-50',
  ERROR: 'text-red-600 bg-red-50',
};

// Function to highlight search terms in text
const highlightText = (text: string, searchTerm: string, isCurrentMatch: boolean = false) => {
  if (!searchTerm.trim()) return text;
  
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return (
        <span 
          key={index} 
          className={clsx(
            'px-1 rounded font-semibold',
            isCurrentMatch 
              ? 'bg-orange-300 text-black' 
              : 'bg-yellow-200 text-black'
          )}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

export const LogEntryComponent: React.FC<LogEntryProps> = ({ entry, searchHighlight, isCurrentMatch = false }) => {
  return (
    <div className={clsx(
      'p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors',
      'font-mono text-sm'
    )}>
      <div className="flex items-start space-x-3 min-w-0">
        {/* Grouped metadata */}
        <div className="flex flex-col space-y-1 flex-shrink-0 min-w-0">
          {/* Line number */}
          <span className="text-gray-400 text-xs text-center">
            {entry.lineNumber}
          </span>
          
          {/* Timestamp */}
          <span className="text-gray-600 w-20 flex-shrink-0 text-xs">
            {formatTimestamp(entry.timestamp)}
          </span>
          
          {/* Level */}
          <span className={clsx(
            'px-2 py-1 rounded text-xs font-medium text-center whitespace-nowrap',
            levelColors[entry.level]
          )}>
            {entry.level}
          </span>
          
          {/* Span */}
          <div className="text-gray-700 font-medium text-xs text-center break-words w-40 leading-tight">
            {entry.span.replace("risingwave","rw").split('::').map((part, index) => (
              <React.Fragment key={index}>
                {searchHighlight ? highlightText(part, searchHighlight, isCurrentMatch) : part}
                {index < entry.span.split('::').length - 1 ? '::' : ''}
                {index < entry.span.split('::').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        {/* Content container */}
        <div className="flex-1 min-w-0">
          {/* Tags row */}
          <div className="flex flex-wrap gap-1 mb-1">
            {/* Actor ID (if present) */}
            {entry.actorId && (
              <span className={clsx("px-2 py-1 rounded text-xs font-medium", getActorColor(entry.actorId))}>
                Actor {entry.actorId}
              </span>
            )}
            
            {/* Epoch info (if present) */}
            {entry.currEpoch && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                Epoch {entry.currEpoch}
              </span>
            )}
          </div>

          {/* Executors (if present) */}
          {entry.executors && entry.executors.length > 0 && (
            <div className="mt-2">
              <div className="bg-blue-50 rounded px-2 py-1 border-l-2 border-blue-200">
                <div className="text-xs text-blue-800 font-mono">
                  {entry.executors.join(' <- ')}
                </div>
              </div>
            </div>
          )}
          
          {/* Message */}
          <div className="text-gray-800">
            <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed overflow-hidden">
              {searchHighlight ? highlightText(entry.message, searchHighlight, isCurrentMatch) : entry.message}
            </pre>
          </div>
          
          
        </div>
      </div>
    </div>
  );
};