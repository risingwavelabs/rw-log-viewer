const STORAGE_KEYS = {
  EXCLUDE_PATTERNS: 'rw-log-analyzer-exclude-patterns',
} as const;

export const saveExcludePatterns = (patterns: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXCLUDE_PATTERNS, JSON.stringify(patterns));
  } catch (error) {
    console.error('Failed to save exclude patterns:', error);
  }
};

export const loadExcludePatterns = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EXCLUDE_PATTERNS);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load exclude patterns:', error);
    return [];
  }
};