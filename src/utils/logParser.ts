import { LogEntry } from '../types/log';

export class LogParser {
  static isNewLogEntry(line: string): boolean {
    // Fast check: does the line start with a timestamp?
    // Format: 2025-07-16T11:33:34.601215+08:00
    return /^\d{4}-\d{2}-\d{2}T[\d:.+-]+\s+(DEBUG|INFO|WARN|ERROR)\s+/.test(line);
  }

  static parseLogLine(line: string) {
    // Single regex to parse: timestamp + level + span + message
    // Format: 2025-07-16T11:33:34.601215+08:00  INFO risingwave_rt::deadlock: parking lot deadlock detection enabled
    const logMatch = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:.+-]+)\s+(DEBUG|INFO|WARN|ERROR)\s+(?:(?:actor|executor)\{[^}]*\}:)*\s*([a-zA-Z_][a-zA-Z0-9_]*(?:::[a-zA-Z_][a-zA-Z0-9_]*)*):\s*(.*)$/);
    
    if (!logMatch) {
      return null;
    }

    return {
      timestamp: new Date(logMatch[1]),
      level: logMatch[2] as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR',
      span: logMatch[3].trim(),
      message: logMatch[4]
    };
  }

  private static extractActorInfo(line: string) {
    // Extract actor information from patterns like: actor{otel.name="Actor 6" actor_id=6}
    const actorMatch = line.match(/actor\{[^}]*otel\.name="([^"]*)"[^}]*actor_id=(\d+)[^}]*\}/);
    if (actorMatch) {
      return {
        actorName: actorMatch[1],
        actorId: parseInt(actorMatch[2], 10)
      };
    }
    return {};
  }

  private static extractExecutors(line: string): string[] {
    // Extract executor names from patterns like: executor{otel.name="Dml 600000002"}
    const executorMatches = line.matchAll(/executor\{[^}]*otel\.name="([^"]*)"[^}]*\}/g);
    return Array.from(executorMatches, match => match[1]);
  }

  static extractEpochs(line: string) {
    // Extract epoch information from two patterns:
    // 1. prev_epoch=8873682932793344 curr_epoch=8873682932858880
    // 2. epoch=EpochPair { curr: 8873682932858880, prev: 8873682932793344 }
    
    // First try the separate fields format
    const prevEpochMatch = line.match(/prev_epoch=(\d+)/);
    const currEpochMatch = line.match(/curr_epoch=(\d+)/);
    
    // If not found, try the EpochPair format
    if (!prevEpochMatch && !currEpochMatch) {
      const epochPairMatch = line.match(/epoch=EpochPair\s*\{\s*curr:\s*(\d+),\s*prev:\s*(\d+)\s*\}/);
      if (epochPairMatch) {
        return {
          prevEpoch: epochPairMatch[2], // prev is second capture group
          currEpoch: epochPairMatch[1]  // curr is first capture group
        };
      }
    }
    
    return {
      prevEpoch: prevEpochMatch?.[1],
      currEpoch: currEpochMatch?.[1]
    };
  }


  static parseLogFile(content: string): LogEntry[] {
    const lines = content.split('\n');
    const entries: LogEntry[] = [];
    let currentEntry: Partial<LogEntry> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // First check if this is a new log entry (fast check)
      if (this.isNewLogEntry(line)) {
        // Try to parse this line as a new log entry
        const parsedLine = this.parseLogLine(line);
        
        if (parsedLine) {
          // Save previous entry if exists
          if (currentEntry && currentEntry.timestamp) {
            entries.push({
              id: `${currentEntry.lineNumber}-${currentEntry.timestamp.getTime()}`,
              timestamp: currentEntry.timestamp,
              level: currentEntry.level || 'INFO',
              span: currentEntry.span || 'unknown',
              actorId: currentEntry.actorId,
              actorName: currentEntry.actorName,
              executors: currentEntry.executors,
              prevEpoch: currentEntry.prevEpoch,
              currEpoch: currentEntry.currEpoch,
              message: currentEntry.message || '',
              rawLine: currentEntry.rawLine || '',
              lineNumber: currentEntry.lineNumber || 0
            });
          }

          // Start new entry
          const actorInfo = this.extractActorInfo(line);
          const executors = this.extractExecutors(line);
          const epochs = this.extractEpochs(line);

          currentEntry = {
            timestamp: parsedLine.timestamp,
            level: parsedLine.level,
            span: parsedLine.span,
            message: parsedLine.message,
            ...actorInfo,
            executors: executors.length > 0 ? executors : undefined,
            ...epochs,
            rawLine: line,
            lineNumber: i + 1
          };
        }
      } else if (currentEntry) {
        // This is a continuation line, append to current message
        currentEntry.message = (currentEntry.message || '') + '\n' + line;
        currentEntry.rawLine = (currentEntry.rawLine || '') + '\n' + line;
      }
    }

    // Don't forget the last entry
    if (currentEntry && currentEntry.timestamp) {
      entries.push({
        id: `${currentEntry.lineNumber}-${currentEntry.timestamp.getTime()}`,
        timestamp: currentEntry.timestamp,
        level: currentEntry.level || 'INFO',
        span: currentEntry.span || 'unknown',
        actorId: currentEntry.actorId,
        actorName: currentEntry.actorName,
        executors: currentEntry.executors,
        prevEpoch: currentEntry.prevEpoch,
        currEpoch: currentEntry.currEpoch,
        message: currentEntry.message || '',
        rawLine: currentEntry.rawLine || '',
        lineNumber: currentEntry.lineNumber || 0
      });
    }

    return entries;
  }
}