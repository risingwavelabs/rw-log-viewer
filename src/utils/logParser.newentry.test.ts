import { LogParser } from './logParser.js';

// Test the new isNewLogEntry function
console.log('🧪 Testing isNewLogEntry function');
console.log('=================================\n');

const testLines = [
  // Valid new log entries
  '2025-07-16T11:33:34.601215+08:00  INFO risingwave_rt::deadlock: parking lot deadlock detection enabled',
  '2025-07-16T11:34:16.10591+08:00 DEBUG risingwave_stream::task::barrier_manager::managed_state: reinitialize',
  '2025-07-16T11:34:16.15228+08:00 DEBUG actor{otel.name="Actor 6" actor_id=6}: events::stream::message::barrier: test',
  
  // Not new log entries (continuation lines)
  '> total_memory: 8.00 GiB',
  '| + | 2 | bob |',
  '+---+----+-------+',
  'cardinality=1 capacity=1',
  'some random continuation text',
  '',
  
  // Edge cases
  '2025-07-16T11:34:16.15228+08:00 UNKNOWN some_span: should not match invalid level',
  'DEBUG risingwave_stream: missing timestamp should not match'
];

console.log('📍 Testing individual lines with isNewLogEntry:');
testLines.forEach((line, index) => {
  const isNew = LogParser.isNewLogEntry(line);
  console.log(`${isNew ? '✅' : '❌'} Line ${index + 1}: "${line.substring(0, 60)}${line.length > 60 ? '...' : ''}"`);
});

// Test with some content that was problematic before
console.log('\n📍 Testing with multi-line content that had parsing issues:');
const problematicContent = [
  '2025-07-16T11:34:16.22409+08:00 DEBUG actor{otel.name="Actor 4" actor_id=4} prev_epoch=8873682932793344',
  'curr_epoch=8873682932858880}:executor{otel.name="Materialize 400000005"}:executor{otel.name="Union 400000004"}: events::stream::message::chunk:',
  '+---+----+-------+',
  '|   | id | name  |',
  '+---+----+-------+',
  '| + | 2  | bob   |',
  '+---+----+-------+',
  'cardinality=1 capacity=1',
  '2025-07-16T11:34:16.235546+08:00 DEBUG actor{otel.name="Actor 2" actor_id=2} prev_epoch=8873682932793344'
].join('\n');

const entries = LogParser.parseLogFile(problematicContent);
console.log(`\n📊 Parsed ${entries.length} entries from problematic content:`);
entries.forEach((entry, index) => {
  console.log(`Entry ${index + 1}: ${entry.span} - Lines in message: ${entry.message.split('\n').length}`);
  console.log(`  Message preview: "${entry.message.substring(0, 50)}..."`);
});

// Test performance improvement
console.log('\n⚡ Performance test:');
const testContent = Array(1000).fill('2025-07-16T11:34:16.22409+08:00 DEBUG test::span: message').join('\n');

console.time('With isNewLogEntry check');
LogParser.parseLogFile(testContent);
console.timeEnd('With isNewLogEntry check');

console.log('\n🎉 Tests completed!');