import { LogParser } from './logParser.js';

// Test the specific problematic content around line 124
const line124Content = `+---+----+------+
| + | 2  | bob  |
+---+----+------+
 cardinality=1 capacity=1
2025-07-16T11:34:16.224057+08:00  INFO actor{otel.name="Actor 5" actor_id=5 prev_epoch=8873682932793344 curr_epoch=8873682932858880}:executor{otel.name="Source 500002716"}: risingwave_connector::source::batch: finishing batch source split
2025-07-16T11:34:16.224091+08:00 DEBUG actor{otel.name="Actor 4" actor_id=4 prev_epoch=8873682932793344 curr_epoch=8873682932858880}:executor{otel.name="Materialize 400000005"}:executor{otel.name="Union 400000004"}: events::stream::message::chunk: 
+---+----+------+
|   | id | name |
+---+----+------+
| + | 2  | bob  |
+---+----+------+
 cardinality=1 capacity=1
2025-07-16T11:34:16.235546+08:00 DEBUG actor{otel.name="Actor 2" actor_id=2 prev_epoch=8873682932793344 curr_epoch=8873682932858880}:executor{otel.name="Materialize 200000005"}: events::stream::message::chunk:`;

console.log('🔍 Testing line 124 parsing issue');
console.log('================================\n');

// Test individual lines to see which ones are recognized as new entries
const lines = line124Content.split('\n');
console.log('📍 Testing each line with isNewLogEntry:');

lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  
  const isNew = LogParser.isNewLogEntry(trimmed);
  const parseResult = LogParser.parseLogLine(trimmed);
  
  console.log(`Line ${index + 1}: ${isNew ? '✅ NEW' : '❌ CONT'} "${trimmed.substring(0, 80)}..."`);
  if (parseResult) {
    console.log(`  -> Span: ${parseResult.span}`);
    console.log(`  -> Message: ${parseResult.message.substring(0, 50)}...`);
  }
  console.log('');
});

// Test full parsing
console.log('📊 Testing full parseLogFile:');
const entries = LogParser.parseLogFile(line124Content);
console.log(`Total entries: ${entries.length}\n`);

entries.forEach((entry, index) => {
  console.log(`Entry ${index + 1}:`);
  console.log(`  Span: ${entry.span}`);
  console.log(`  Message lines: ${entry.message.split('\\n').length}`);
  console.log(`  Message preview: "${entry.message.substring(0, 100)}..."`);
  console.log('');
});

// Test the specific problematic lines individually
console.log('🎯 Testing the specific problematic lines:');
const problematicLines = [
  '2025-07-16T11:34:16.224057+08:00  INFO actor{otel.name="Actor 5" actor_id=5 prev_epoch=8873682932793344 curr_epoch=8873682932858880}:executor{otel.name="Source 500002716"}: risingwave_connector::source::batch: finishing batch source split',
  '2025-07-16T11:34:16.224091+08:00 DEBUG actor{otel.name="Actor 4" actor_id=4 prev_epoch=8873682932793344 curr_epoch=8873682932858880}:executor{otel.name="Materialize 400000005"}:executor{otel.name="Union 400000004"}: events::stream::message::chunk:',
  '2025-07-16T11:34:16.235546+08:00 DEBUG actor{otel.name="Actor 2" actor_id=2 prev_epoch=8873682932793344 curr_epoch=8873682932858880}:executor{otel.name="Materialize 200000005"}: events::stream::message::chunk:'
];

problematicLines.forEach((line, index) => {
  console.log(`\nProblematic line ${index + 1}:`);
  console.log(`Input: ${line}`);
  console.log(`isNewLogEntry: ${LogParser.isNewLogEntry(line)}`);
  
  const result = LogParser.parseLogLine(line);
  if (result) {
    console.log(`✅ Parsed successfully:`);
    console.log(`  Span: ${result.span}`);
    console.log(`  Message: ${result.message}`);
  } else {
    console.log(`❌ Failed to parse`);
  }
});