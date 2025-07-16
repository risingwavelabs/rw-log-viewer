import { LogParser } from './logParser.js';

// Test actual lines from the log around line 44
const testLines = [
  '2025-07-16T11:33:35.952261+08:00  INFO risingwave_common_service::metrics_manager: Prometheus listener for Prometheus is set up on http://127.0.0.1:1222',
  '2025-07-16T11:34:16.10591+08:00 DEBUG risingwave_stream::task::barrier_manager::managed_state: reinitialize at Checkpoint barrier epoch=EpochPair { curr: 8873682932858880, prev: 8873682932793344 }',
  '2025-07-16T11:34:16.15228+08:00 DEBUG actor{otel.name="Actor 6" actor_id=6}:executor{otel.name="Dml 600000002"}:executor{otel.name="Source 600002719"}: events::stream::message::barrier: prev_epoch=8873682932793344 curr_epoch=8873682932858880 kind=Checkpoint mutation=Some(Add(AddMutation { adds: {}, added_actors: {2, 3, 4, 7, 6, 8, 1, 5, 9}, splits: {5: [BatchPosixFs(BatchPosixFsSplit { file_path: "/tmp/rw_refresh_test", split_id: "114514", finished: false })]}, pause: false, subscriptions_to_add: [], backfill_nodes_to_pause: {} }))',
  '2025-07-16T11:34:16.15228+08:00 DEBUG actor{otel.name="Actor 7" actor_id=7}:executor{otel.name="Dml 700000002"}:executor{otel.name="Source 700002719"}: events::stream::message::barrier: prev_epoch=8873682932793344 curr_epoch=8873682932858880 kind=Checkpoint mutation=Some(Add(AddMutation { adds: {}, added_actors: {2, 3, 4, 7, 6, 8, 1, 5, 9}, splits: {5: [BatchPosixFs(BatchPosixFsSplit { file_path: "/tmp/rw_refresh_test", split_id: "114514", finished: false })]}, pause: false, subscriptions_to_add: [], backfill_nodes_to_pause: {} }))'
];

console.log('🧪 Testing real-world log lines around line 44');
console.log('==============================================\n');

testLines.forEach((line, index) => {
  console.log(`📍 Line ${index + 1}:`);
  console.log(`Input: ${line.substring(0, 100)}...`);
  
  const result = LogParser.parseLogLine(line);
  
  if (result) {
    console.log(`✅ Parsed successfully`);
    console.log(`   Span: ${result.span}`);
    console.log(`   Message: ${result.message.substring(0, 50)}...`);
  } else {
    console.log(`❌ Failed to parse - will be treated as continuation`);
  }
  console.log('');
});

// Test a full multi-line scenario with these lines
console.log('🔍 Testing full parseLogFile with these lines:');
console.log('============================================');

const fullContent = testLines.join('\n');
const entries = LogParser.parseLogFile(fullContent);

console.log(`📊 Total entries parsed: ${entries.length}`);
entries.forEach((entry, index) => {
  console.log(`Entry ${index + 1}: ${entry.span} - "${entry.message.substring(0, 40)}..."`);
});