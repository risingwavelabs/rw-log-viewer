export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  span: string;
  actorId?: number;
  actorName?: string;
  executors?: string[];
  prevEpoch?: string;
  currEpoch?: string;
  message: string;
  rawLine: string;
  lineNumber: number;
}

export interface LogFilter {
  levels?: string[];
  actorIds?: number[];
  spans?: string[];
  startTime?: Date;
  endTime?: Date;
  searchText?: string;
  startEpoch?: string;
  endEpoch?: string;
  excludePatterns?: string[];
}

export interface LogStats {
  totalEntries: number;
  levelCounts: Record<string, number>;
  actorIds: number[];
  spans: string[];
  epochs: string[];
  timeRange: {
    start: Date;
    end: Date;
  };
}