import { LogParser } from './logParser.js';

// Test the full parseLogFile function with multi-line scenarios
const multiLineLogContent = [
  '2025-07-16T11:33:34.638656+08:00  INFO risingwave_compute::server: Memory outline:',
  '> total_memory: 8.00 GiB',
  '>     storage_memory: 2.13 GiB',
  '>         block_cache_capacity: 688.00 MiB',
  '>         meta_cache_capacity: 802.00 MiB',
  '>         shared_buffer_capacity: 688.00 MiB',
  '>         compactor_memory_limit: Not enabled',
  '>     compute_memory: 3.47 GiB',
  '>     reserved_memory: 2.40 GiB',
  '2025-07-16T11:33:34.639384+08:00  INFO risingwave_compute::server: Assigned worker node id 1',
  '2025-07-16T11:33:34.652312+08:00  INFO risingwave_license::manager: license refreshed license=License { sub: "rw-test-all", iss: Test, tier: All, cpu_core_limit: None, exp: 10000627200 }'
].join('\n');

function testMultiLineParsing() {
  console.log('🧪 Testing LogParser.parseLogFile() with multi-line content');
  console.log('==========================================================\n');

  const entries = LogParser.parseLogFile(multiLineLogContent);
  
  console.log(`📊 Parsed ${entries.length} log entries\n`);
  
  // Expected: 3 separate log entries
  if (entries.length !== 3) {
    console.log(`❌ Expected 3 entries, but got ${entries.length}`);
    return false;
  }
  
  // Check first entry (should include all continuation lines)
  const firstEntry = entries[0];
  console.log('📍 First entry:');
  console.log(`   Span: ${firstEntry.span}`);
  console.log(`   Message: ${firstEntry.message.substring(0, 50)}...`);
  console.log(`   Lines in message: ${firstEntry.message.split('\n').length}`);
  
  if (!firstEntry.message.includes('> total_memory: 8.00 GiB')) {
    console.log('❌ First entry should include continuation lines');
    return false;
  }
  
  // Check second entry (should be separate)
  const secondEntry = entries[1];
  console.log('\n📍 Second entry:');
  console.log(`   Span: ${secondEntry.span}`);
  console.log(`   Message: ${secondEntry.message}`);
  
  if (secondEntry.message !== 'Assigned worker node id 1') {
    console.log(`❌ Second entry message should be "Assigned worker node id 1", got "${secondEntry.message}"`);
    return false;
  }
  
  // Check third entry
  const thirdEntry = entries[2];
  console.log('\n📍 Third entry:');
  console.log(`   Span: ${thirdEntry.span}`);
  console.log(`   Message: ${thirdEntry.message.substring(0, 50)}...`);
  
  if (!thirdEntry.message.startsWith('license refreshed')) {
    console.log(`❌ Third entry should start with "license refreshed", got "${thirdEntry.message.substring(0, 20)}"`);
    return false;
  }
  
  console.log('\n✅ All multi-line parsing tests passed!');
  return true;
}

// Test each parseLogLine call individually to debug
function debugIndividualLines() {
  console.log('\n🔍 Debug: Testing individual lines from the multi-line content');
  console.log('============================================================');
  
  const lines = multiLineLogContent.split('\n');
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    const result = LogParser.parseLogLine(trimmedLine);
    console.log(`Line ${index + 1}: "${trimmedLine}"`);
    console.log(`Result: ${result ? `✅ Parsed as new entry (${result.span})` : '❌ Not recognized as new entry'}`);
    console.log('');
  });
}

// Run tests
const success = testMultiLineParsing();
debugIndividualLines();

if (!success) {
  console.log('💥 Multi-line parsing test failed!');
  // Note: process.exit() is not available in browser environment
  // This test is designed to be run in a Node.js environment
} else {
  console.log('🎉 All tests passed!');
}