# RisingWave Log Viewer

A log viewer to make local debugging easier.
Currently designed for local log format, but not production log.

![](/doc/image.png)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Usage

1. Open the application in your browser
2. Upload a RisingWave log file (`.log` or `.txt`)
3. Use the filter panel to narrow down entries:
   - **Log Levels**: Filter by DEBUG, INFO, WARN, ERROR
   - **Actors**: Filter by specific actor IDs
   - **Search**: Full-text search in messages
4. Navigate through the parsed log entries with virtual scrolling
