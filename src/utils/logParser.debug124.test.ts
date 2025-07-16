// Debug why lines 2 and 3 fail to parse
// This file is for debugging purposes only and doesn't use LogParser directly

// Debug why lines 2 and 3 fail to parse
const failingLines = [
  '2025-07-16T11:34:16.224091+08:00 DEBUG actor{otel.name="Actor 4" actor_id=4 prev_epoch=8873682932793344 curr_epoch=8873682932858880}:executor{otel.name="Materialize 400000005"}:executor{otel.name="Union 400000004"}: events::stream::message::chunk:',
  '2025-07-16T11:34:16.235546+08:00 DEBUG actor{otel.name="Actor 2" actor_id=2 prev_epoch=8873682932793344 curr_epoch=8873682932858880}:executor{otel.name="Materialize 200000005"}: events::stream::message::chunk:'
];

console.log('🔍 Debugging why specific lines fail to parse');
console.log('=============================================\n');

// Current regex
const currentRegex = /^(\d{4}-\d{2}-\d{2}T[\d:.+-]+)\s+(DEBUG|INFO|WARN|ERROR)\s+(?:.*?:\s+)?([^:\s]+(?:::[^:\s]+)*?):\s(.*)$/;

failingLines.forEach((line, index) => {
  console.log(`\n📍 Line ${index + 1}:`);
  console.log(`Input: ${line}`);
  console.log(`Length: ${line.length}`);
  
  // Test the current regex
  const match = line.match(currentRegex);
  console.log(`Current regex match: ${match ? 'SUCCESS' : 'FAILED'}`);
  
  if (match) {
    console.log(`  Groups: [${match.slice(1).join(', ')}]`);
  } else {
    console.log('  No match found');
    
    // Try breaking down the regex to see where it fails
    console.log('\n  🔧 Debug breakdown:');
    
    // Test timestamp part
    const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:.+-]+)/);
    console.log(`  Timestamp: ${timestampMatch ? timestampMatch[1] : 'FAILED'}`);
    
    // Test level part
    const levelMatch = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:.+-]+)\s+(DEBUG|INFO|WARN|ERROR)/);
    console.log(`  Level: ${levelMatch ? levelMatch[2] : 'FAILED'}`);
    
    // Test the part after level
    const afterLevel = line.match(/^(\d{4}-\d{2}-\d{2}T[\d:.+-]+)\s+(DEBUG|INFO|WARN|ERROR)\s+(.+)$/);
    console.log(`  After level: ${afterLevel ? afterLevel[3].substring(0, 50) + '...' : 'FAILED'}`);
    
    // Test different span extraction patterns
    console.log('\n  🎯 Testing span extraction patterns:');
    
    const patterns = [
      { name: 'Current pattern', regex: /(?:.*?:\s+)?([^:\s]+(?:::[^:\s]+)*?):\s(.*)$/ },
      { name: 'Simpler pattern', regex: /.*?([^:\s]+(?:::[^:\s]+)*?):\s*(.*)$/ },
      { name: 'Last colon pattern', regex: /.*:([^:\s]+(?:::[^:\s]+)*?):\s*(.*)$/ }
    ];
    
    if (afterLevel) {
      const content = afterLevel[3];
      patterns.forEach(pattern => {
        const patternMatch = content.match(pattern.regex);
        console.log(`    ${pattern.name}: ${patternMatch ? 'MATCH' : 'FAILED'}`);
        if (patternMatch) {
          console.log(`      Span: ${patternMatch[1]}`);
          console.log(`      Message: ${patternMatch[2] || '(empty)'}`);
        }
      });
    }
  }
});

// Test what the actual issue is
console.log('\n\n🎯 The real issue analysis:');
console.log('Looking at the failing lines, I notice they end with ": " (colon space) but no message content after that.');
console.log('This suggests the message part is empty, which might be causing the regex to fail.');

failingLines.forEach((line, index) => {
  console.log(`\nLine ${index + 1} analysis:`);
  console.log(`Ends with ': '? ${line.endsWith(': ')}`);
  console.log(`Ends with ':'? ${line.endsWith(':')}`);
  console.log(`Last 10 chars: "${line.slice(-10)}"`);
});