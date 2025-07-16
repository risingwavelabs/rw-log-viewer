import React, { useMemo, useEffect } from 'react';
import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import { LogEntry } from '../types/log';
import { LogEntryComponent } from './LogEntry';
import { EpochDivider } from './EpochDivider';

type ViewerItem = 
  | { type: 'entry'; entry: LogEntry }
  | { type: 'divider'; epochNumber: string };

interface LogViewerProps {
  entries: LogEntry[];
  parentRef: React.RefObject<HTMLDivElement | null>;
  divideByEpoch?: boolean;
  searchHighlight?: string;
  currentMatchIndex?: number;
  virtualizerRef?: React.RefObject<Virtualizer<HTMLDivElement, Element> | null>;
}

export const LogViewer: React.FC<LogViewerProps> = ({ entries, parentRef, divideByEpoch = false, searchHighlight, currentMatchIndex = -1, virtualizerRef }) => {
  // Create mixed array of entries and dividers
  const viewerItems: ViewerItem[] = useMemo(() => {
    if (!divideByEpoch) {
      return entries.map(entry => ({ type: 'entry', entry }));
    }

    const items: ViewerItem[] = [];
    let lastEpoch: string | null = null;

    for (const entry of entries) {
      // Check if this entry represents a barrier (has both prev and curr epoch)
      if (entry.currEpoch && entry.prevEpoch && entry.currEpoch !== lastEpoch) {
        // Add divider for new epoch
        items.push({ type: 'divider', epochNumber: entry.currEpoch });
        lastEpoch = entry.currEpoch;
      }
      
      items.push({ type: 'entry', entry });
    }

    return items;
  }, [entries, divideByEpoch]);
  // Calculate estimated size based on item type
  const estimateSize = useMemo(() => {
    return (index: number) => {
      const item = viewerItems[index];
      if (!item) return 80;
      
      if (item.type === 'divider') {
        return 60; // Fixed height for dividers
      }
      
      const entry = item.entry;
      // Base height for metadata (line number, timestamp, level, span)
      let baseHeight = 60;
      
      // Add height for message content (roughly 16px per line)
      const messageLines = Math.ceil(entry.message.length / 80); // Estimate 80 chars per line
      baseHeight += messageLines * 16;
      
      // Add height for tags (actor, epoch)
      if (entry.actorId || entry.currEpoch) {
        baseHeight += 25;
      }
      
      // Add height for executors
      if (entry.executors && entry.executors.length > 0) {
        baseHeight += 30;
      }
      
      return Math.max(baseHeight, 80); // Minimum 80px
    };
  }, [viewerItems]);

  const virtualizer = useVirtualizer({
    count: viewerItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Expose virtualizer to parent component
  useEffect(() => {
    if (virtualizerRef) {
      virtualizerRef.current = virtualizer;
    }
  }, [virtualizer, virtualizerRef]);

  return (
    <div
      style={{
        height: virtualizer.getTotalSize(),
        width: '100%',
        position: 'relative',
      }}
    >
      {virtualItems.map((virtualRow) => {
        const item = viewerItems[virtualRow.index];
        
        // Calculate if this entry is the current match
        let isCurrentMatch = false;
        if (item.type === 'entry' && searchHighlight && currentMatchIndex >= 0) {
          // Count entry items up to this point to find the actual entry index
          let entryIndex = 0;
          for (let i = 0; i < virtualRow.index; i++) {
            if (viewerItems[i].type === 'entry') {
              entryIndex++;
            }
          }
          if (viewerItems[virtualRow.index].type === 'entry') {
            const entry = item.entry;
            const searchLower = searchHighlight.toLowerCase();
            const hasMatch = entry.message.toLowerCase().includes(searchLower) || 
                           entry.span.toLowerCase().includes(searchLower);
            if (hasMatch) {
              // Count matches up to this entry
              let matchIndex = 0;
              for (let i = 0; i < entryIndex; i++) {
                const e = entries[i];
                if (e.message.toLowerCase().includes(searchLower) || 
                    e.span.toLowerCase().includes(searchLower)) {
                  matchIndex++;
                }
              }
              isCurrentMatch = matchIndex === currentMatchIndex;
            }
          }
        }
        
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {item.type === 'divider' ? (
              <EpochDivider epochNumber={item.epochNumber} />
            ) : (
              <LogEntryComponent 
                entry={item.entry} 
                searchHighlight={searchHighlight}
                isCurrentMatch={isCurrentMatch}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};