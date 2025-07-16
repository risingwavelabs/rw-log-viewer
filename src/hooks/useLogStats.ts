import { useMemo } from 'react';
import { LogEntry, LogStats } from '../types/log';

/**
 * Optimized hook for calculating log statistics
 * Uses memoization and efficient data structures
 */
export const useLogStats = (logEntries: LogEntry[]): LogStats => {
  return useMemo(() => {
    // Early return for empty entries
    if (logEntries.length === 0) {
      return {
        totalEntries: 0,
        levelCounts: {},
        actorIds: [],
        spans: [],
        epochs: [],
        timeRange: {
          start: new Date(),
          end: new Date(),
        },
      };
    }

    // Use Maps for better performance with large datasets
    const levelCounts: Record<string, number> = {};
    const actorIdsSet = new Set<number>();
    const spansSet = new Set<string>();
    const epochsSet = new Set<string>();
    
    let minTime = logEntries[0].timestamp;
    let maxTime = logEntries[0].timestamp;

    // Single pass through all entries
    for (const entry of logEntries) {
      // Count levels
      levelCounts[entry.level] = (levelCounts[entry.level] || 0) + 1;
      
      // Collect actor IDs
      if (entry.actorId !== undefined) {
        actorIdsSet.add(entry.actorId);
      }
      
      // Collect spans
      spansSet.add(entry.span);
      
      // Collect epochs
      if (entry.currEpoch) {
        epochsSet.add(entry.currEpoch);
      }
      
      // Track time range with faster comparisons
      if (entry.timestamp < minTime) {
        minTime = entry.timestamp;
      }
      if (entry.timestamp > maxTime) {
        maxTime = entry.timestamp;
      }
    }

    // Convert sets to sorted arrays only once
    const actorIds = Array.from(actorIdsSet).sort((a, b) => a - b);
    const spans = Array.from(spansSet).sort();
    const epochs = Array.from(epochsSet).sort();

    return {
      totalEntries: logEntries.length,
      levelCounts,
      actorIds,
      spans,
      epochs,
      timeRange: {
        start: minTime,
        end: maxTime,
      },
    };
  }, [logEntries]);
};