import { LogParser } from './logParser.js';

// Test the problematic line
const problematicLine = '2025-07-16T11:34:16.10591+08:00 DEBUG risingwave_stream::task::barrier_manager::managed_state: reinitialize at Checkpoint barrier epoch=EpochPair { curr: 8873682932858880, prev: 8873682932793344 }';

console.log('🔍 Testing problematic line:');
console.log(`Input: ${problematicLine}`);

const result = LogParser.parseLogLine(problematicLine);
console.log(`Result: ${result ? '✅ Parsed successfully' : '❌ Failed to parse'}`);

if (result) {
  console.log(`Timestamp: ${result.timestamp}`);
  console.log(`Level: ${result.level}`);
  console.log(`Span: ${result.span}`);
  console.log(`Message: ${result.message}`);
} else {
  console.log('❌ This line is not being recognized as a new log entry!');
  console.log('It will be treated as a continuation of the previous entry.');
}

// Test what our current regex expects
console.log('\n🔍 Testing our current regex:');
const regex = /^(\d{4}-\d{2}-\d{2}T[\d:.+-]+)\s+(DEBUG|INFO|WARN|ERROR)\s+([^:\s]+(?:::[^:\s]+)*?):\s(.*)$/;
const match = problematicLine.match(regex);
console.log(`Regex match: ${match ? '✅ Matches' : '❌ No match'}`);

if (match) {
  console.log(`Groups: [${match.slice(1).join(', ')}]`);
}

// Test epoch extraction specifically
console.log('\n🔍 Testing epoch extraction from EpochPair format:');
const epochs = LogParser.extractEpochs?.(problematicLine);
console.log(`Extracted epochs: curr=${epochs?.currEpoch || 'none'}, prev=${epochs?.prevEpoch || 'none'}`);

// Compare with prev_epoch/curr_epoch format
const regularEpochLine = '2025-07-16T11:34:16.15228+08:00 DEBUG actor{otel.name="Actor 6" actor_id=6}: events::stream::message::barrier: prev_epoch=8873682932793344 curr_epoch=8873682932858880';
console.log('\n🔍 Testing epoch extraction from regular format:');
const epochsRegular = LogParser.extractEpochs?.(regularEpochLine);
console.log(`Extracted epochs: curr=${epochsRegular?.currEpoch || 'none'}, prev=${epochsRegular?.prevEpoch || 'none'}`);

console.log('\n📋 Both formats should extract the same epoch values: curr=8873682932858880, prev=8873682932793344');