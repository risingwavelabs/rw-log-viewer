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
  DEBUG: 'text-gray-700 bg-gray-100/80 border-gray-200',
  INFO: 'text-blue-700 bg-blue-100/80 border-blue-200',
  WARN: 'text-orange-700 bg-orange-100/80 border-orange-200',
  ERROR: 'text-red-700 bg-red-100/80 border-red-200',
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
      'p-4 border-b border-gray-200/50 hover:bg-white/80 transition-all duration-200',
      'font-mono text-sm backdrop-blur-sm',
      isCurrentMatch && 'bg-orange-50/80 border-orange-200 ring-2 ring-orange-200/50'
    )}>
      <div className="flex items-start space-x-3 lg:space-x-4 min-w-0">
        {/* Grouped metadata */}
        <div className="flex flex-col space-y-2 flex-shrink-0 min-w-0">
          {/* Line number */}
          <div className="bg-gray-100/80 px-2 py-1 rounded-md text-center">
            <span className="text-gray-500 text-xs font-medium">
              #{entry.lineNumber}
            </span>
          </div>
          
          {/* Timestamp */}
          <div className="bg-blue-50/80 px-2 py-1 rounded-md text-center">
            <span className="text-blue-700 text-xs font-medium">
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>
          
          {/* Level */}
          <span className={clsx(
            'px-3 py-1.5 rounded-lg text-xs font-bold text-center whitespace-nowrap border shadow-sm',
            levelColors[entry.level]
          )}>
            {entry.level}
          </span>
          
          {/* Span */}
          <div className="bg-gray-50/80 p-2 rounded-lg border border-gray-200 w-32 sm:w-36 lg:w-44">
            <div className="text-gray-700 font-medium text-xs text-center break-words leading-tight">
              {entry.span.replace("risingwave","rw").split('::').map((part, index) => (
                <React.Fragment key={index}>
                  {searchHighlight ? highlightText(part, searchHighlight, isCurrentMatch) : part}
                  {index < entry.span.split('::').length - 1 ? '::' : ''}
                  {index < entry.span.split('::').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content container */}
        <div className="flex-1 min-w-0">
          {/* Tags row */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
            {/* Actor ID (if present) */}
            {entry.actorId && (
              <span className={clsx("px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold shadow-sm border", getActorColor(entry.actorId))}>
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">Actor </span>{entry.actorId}
              </span>
            )}
            
            {/* Epoch info (if present) */}
            {entry.currEpoch && (
              <span className="bg-green-100/80 text-green-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold border border-green-200 shadow-sm">
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Epoch </span>{entry.currEpoch}
              </span>
            )}
          </div>

          {/* Executors (if present) */}
          {entry.executors && entry.executors.length > 0 && (
            <div className="mb-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 sm:p-3 border border-blue-200/50 shadow-sm">
                <div className="flex items-center mb-1">
                  <svg className="w-3 h-3 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-xs font-semibold text-blue-800">Executors</span>
                </div>
                <div className="text-xs text-blue-700 font-mono bg-white/50 p-2 rounded border overflow-x-auto">
                  {entry.executors.join(' ← ')}
                </div>
              </div>
            </div>
          )}
          
          {/* Message */}
          <div className="bg-white/80 rounded-lg p-2 sm:p-3 border border-gray-200/50 shadow-sm">
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed overflow-hidden text-gray-800">
              {searchHighlight ? highlightText(entry.message, searchHighlight, isCurrentMatch) : entry.message}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};