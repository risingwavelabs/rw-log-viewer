export function formatTimestamp(date: Date): string {
  return date.toTimeString().slice(0, 8); // HH:MM:SS
}

export function formatEpoch(epoch: string): string {
  // Take last 6 digits for display
  return epoch.slice(-6);
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}