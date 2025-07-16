import React, { useMemo } from 'react';
import { LogEntry } from '../types/log';
import { LogEntryComponent } from './LogEntry';
import { EpochDivider } from './EpochDivider';

type ViewerItem = 
  | { type: 'entry'; entry: LogEntry }
  | { type: 'divider'; epochNumber: string };

interface LogViewerProps {
  entries: LogEntry[];
  divideByEpoch?: boolean;
}

export const LogViewer: React.FC<LogViewerProps> = ({ entries, divideByEpoch = false }) => {
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

  return (
    <div className="w-full">
      {viewerItems.map((item, index) => (
        <div key={index}>
          {item.type === 'divider' ? (
            <EpochDivider epochNumber={item.epochNumber} />
          ) : (
            <LogEntryComponent entry={item.entry} />
          )}
        </div>
      ))}
    </div>
  );
};