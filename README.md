# RisingWave Log Analyzer

A modern web-based tool for analyzing RisingWave log files with advanced filtering, search, and visualization capabilities.

## Features

- 📁 **File Upload**: Drag & drop or browse to upload log files
- 🔍 **Smart Parsing**: Handles multiline log entries and complex log formats
- 🎯 **Advanced Filtering**: Filter by log level, actor ID, component, and time range
- 🔎 **Full-text Search**: Search across log messages and components
- 📊 **Epoch Analysis**: Navigate through checkpoint epochs
- 🚀 **Performance**: Virtual scrolling for handling large log files (16MB+ supported)
- 💾 **Client-side Processing**: All processing happens in your browser - no data uploads

## Log Format Support

Designed specifically for RisingWave log files with support for:
- Structured actor information (`actor_id`, `otel.name`)
- Executor hierarchies (`Dml`, `Source`, `Materialize`, etc.)
- Epoch transitions (`prev_epoch`, `curr_epoch`)
- Multiline log entries (stack traces, configuration dumps)
- Timestamp parsing and time-based filtering

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Usage

1. Open the application in your browser
2. Upload a RisingWave log file (`.log` or `.txt`)
3. Use the filter panel to narrow down entries:
   - **Log Levels**: Filter by DEBUG, INFO, WARN, ERROR
   - **Actors**: Filter by specific actor IDs
   - **Search**: Full-text search in messages
4. Navigate through the parsed log entries with virtual scrolling

## Example Log Format

The tool parses log entries like:

```
2025-07-16T11:34:16.15228+08:00 DEBUG actor{otel.name="Actor 6" actor_id=6}:executor{otel.name="Dml 600000002"}: events::stream::message::barrier: prev_epoch=8873682932793344 curr_epoch=8873682932858880 kind=Checkpoint
```

Extracting:
- **Timestamp**: `2025-07-16T11:34:16.15228+08:00`
- **Level**: `DEBUG`
- **Actor**: `Actor 6` (ID: 6)
- **Executors**: `Dml 600000002`
- **Epochs**: prev=`8873682932793344`, curr=`8873682932858880`
- **Component**: `events::stream::message::barrier`

## Architecture

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Build Tool**: Vite
- **Virtual Scrolling**: @tanstack/react-virtual
- **Icons**: Lucide React
- **Parsing**: Custom TypeScript parser for RisingWave log format

## License

MIT