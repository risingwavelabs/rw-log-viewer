// Let's carefully analyze the structure and write a better regex

const problematicLine = '2025-07-16T11:34:16.224091+08:00 DEBUG actor{otel.name="Actor 4" actor_id=4 prev_epoch=8873682932793344 curr_epoch=8873682932858880}:executor{otel.name="Materialize 400000005"}:executor{otel.name="Union 400000004"}: events::stream::message::chunk:';

console.log('🔍 Analyzing the problematic line structure:');
console.log('==========================================\n');

console.log('Full line:');
console.log(problematicLine);
console.log('\nLength:', problematicLine.length);

// Break it down part by part
console.log('\n📍 Structure breakdown:');
console.log('1. Timestamp: 2025-07-16T11:34:16.224091+08:00');
console.log('2. Level: DEBUG');
console.log('3. OTel context: actor{...}:executor{...}:executor{...}:');
console.log('4. Span: events::stream::message::chunk');
console.log('5. Message: (empty, just ends with :)');

// The key insight: we need to find the LAST colon-space pattern that's followed by the actual span
// The pattern should be: everything up to the last }: then span_name:

console.log('\n🎯 New regex strategy:');
console.log('Match everything up to the last }:, then capture the span name after it');

// Test new regex patterns
const testPatterns = [
  {
    name: 'Pattern 1: Find last }: then span',
    regex: /^(\d{4}-\d{2}-\d{2}T[\d:.+-]+)\s+(DEBUG|INFO|WARN|ERROR)\s+.*\}:\s*([^:\s]+(?:::[^:\s]+)*?):\s*(.*)$/
  },
  {
    name: 'Pattern 2: Match OTel blocks then span',
    regex: /^(\d{4}-\d{2}-\d{2}T[\d:.+-]+)\s+(DEBUG|INFO|WARN|ERROR)\s+(?:(?:actor|executor)\{[^}]*\}:)*\s*([^:\s]+(?:::[^:\s]+)*?):\s*(.*)$/
  },
  {
    name: 'Pattern 3: Greedy until span pattern',
    regex: /^(\d{4}-\d{2}-\d{2}T[\d:.+-]+)\s+(DEBUG|INFO|WARN|ERROR)\s+.*?:\s+([a-z_]+(?:::[a-z_]+)*(?:::[a-z_]+)*?):\s*(.*)$/
  }
];

testPatterns.forEach(pattern => {
  console.log(`\n${pattern.name}:`);
  const match = problematicLine.match(pattern.regex);
  if (match) {
    console.log('✅ MATCH');
    console.log(`  Timestamp: ${match[1]}`);
    console.log(`  Level: ${match[2]}`);
    console.log(`  Span: ${match[3]}`);
    console.log(`  Message: "${match[4] || '(empty)'}"`);
  } else {
    console.log('❌ NO MATCH');
  }
});

// Test with other lines too
const testLines = [
  '2025-07-16T11:33:34.601215+08:00  INFO risingwave_rt::deadlock: parking lot deadlock detection enabled',
  '2025-07-16T11:34:16.224057+08:00  INFO actor{otel.name="Actor 5" actor_id=5 prev_epoch=8873682932793344 curr_epoch=8873682932858880}:executor{otel.name="Source 500002716"}: risingwave_connector::source::batch: finishing batch source split'
];

console.log('\n🧪 Testing with other lines:');
testLines.forEach((line, index) => {
  console.log(`\nTest line ${index + 1}: ${line.substring(0, 60)}...`);
  
  testPatterns.forEach(pattern => {
    const match = line.match(pattern.regex);
    console.log(`  ${pattern.name}: ${match ? `✅ Span: ${match[3]}` : '❌'}`);
  });
});