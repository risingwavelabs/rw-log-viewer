# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RisingWave Log Analyzer is a React-based web application for analyzing RisingWave database log files. It features advanced filtering, search capabilities, and virtual scrolling for handling large log files (16MB+). All processing happens client-side with no data uploads.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Preview production build
pnpm preview
```

## Testing

The project uses custom test files located in `src/utils/` with the naming pattern `logParser.*.test.ts`. These are not part of a standard testing framework but contain test cases for the log parsing functionality. When making changes to the parser, verify against these test cases manually by importing and running the test functions.

## Architecture Overview

### Core Components Structure

- **App.tsx**: Main application orchestrator handling state management, file loading, and filtering logic
- **LogParser** (`src/utils/logParser.ts`): Custom parser for RisingWave log format with multiline support
- **LogViewer** (`src/components/LogViewer.tsx`): Virtual scrolling implementation using `@tanstack/react-virtual`
- **FilterPanel** (`src/components/FilterPanel.tsx`): Interactive filtering interface for levels, actors, epochs
- **LogEntry** (`src/components/LogEntry.tsx`): Individual log entry rendering component
- **FileUpload** (`src/components/FileUpload.tsx`): Drag-and-drop file upload interface

### Data Flow

1. **File Upload**: User uploads log file via drag-and-drop or file picker
2. **Parsing**: `LogParser.parseLogFile()` processes raw log content into structured `LogEntry[]`
3. **Stats Calculation**: App calculates stats (level counts, actor IDs, epochs) for filter options
4. **Filtering**: Real-time filtering applied to entries based on user selections
5. **Virtual Rendering**: `LogViewer` renders only visible entries using virtual scrolling

### Log Format Parsing

The parser handles RisingWave's specific log format:
```
2025-07-16T11:34:16.15228+08:00 DEBUG actor{otel.name="Actor 6" actor_id=6}:executor{otel.name="Dml 600000002"}: events::stream::message::barrier: prev_epoch=8873682932793344 curr_epoch=8873682932858880 kind=Checkpoint
```

Key parsing features:
- **Multiline support**: Continuation lines (stack traces, configs) append to current entry
- **Actor extraction**: Parses `actor_id` and `otel.name` from actor context
- **Executor hierarchies**: Extracts multiple executor contexts
- **Epoch tracking**: Identifies `prev_epoch` and `curr_epoch` values
- **Span identification**: Extracts Rust module paths as span names

### State Management

State is managed at the App level with React hooks:
- `logEntries`: Parsed log entries array
- `filter`: Current filter settings (levels, actors, search text)
- `stats`: Computed statistics for filter panel options
- `filteredEntries`: Real-time filtered subset of entries

### Performance Considerations

- **Virtual Scrolling**: Only renders visible log entries using `@tanstack/react-virtual`
- **Memoization**: Heavy computations (stats, filtering) use `useMemo`
- **Async Parsing**: File parsing uses `setTimeout` to prevent UI blocking
- **Dynamic Sizing**: Virtual scrolling estimates entry heights based on content length

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Virtual Scrolling**: @tanstack/react-virtual
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Key Files to Understand

- `src/types/log.ts`: Core data structures (`LogEntry`, `LogFilter`, `LogStats`)
- `src/utils/logParser.ts`: Log parsing logic with regex patterns for RisingWave format
- `src/utils/formatters.ts`: Utility functions for display formatting
- `src/App.tsx`: Main application logic and state management
- `src/components/LogViewer.tsx`: Virtual scrolling implementation