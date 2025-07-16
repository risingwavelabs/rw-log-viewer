import { LogParser } from './logParser.js';

// Test cases for parseLogLine function
const testCases = [
  {
    name: 'Simple span with message',
    input: '2025-07-16T11:33:34.601215+08:00  INFO risingwave_rt::deadlock: parking lot deadlock detection enabled',
    expected: {
      timestamp: new Date('2025-07-16T11:33:34.601215+08:00'),
      level: 'INFO',
      span: 'risingwave_rt::deadlock',
      message: 'parking lot deadlock detection enabled'
    }
  },
  {
    name: 'Complex span with colons',
    input: '2025-07-16T11:33:34.608123+08:00  INFO risingwave_common_metrics::monitor::connection: monitoring connector hyper_util::client::legacy::connect::http::HttpConnector',
    expected: {
      timestamp: new Date('2025-07-16T11:33:34.608123+08:00'),
      level: 'INFO',
      span: 'risingwave_common_metrics::monitor::connection',
      message: 'monitoring connector hyper_util::client::legacy::connect::http::HttpConnector'
    }
  },
  {
    name: 'Single word span',
    input: '2025-07-16T11:33:34.602516+08:00  INFO risingwave_compute: advertise addr is 127.0.0.1:5688',
    expected: {
      timestamp: new Date('2025-07-16T11:33:34.602516+08:00'),
      level: 'INFO',
      span: 'risingwave_compute',
      message: 'advertise addr is 127.0.0.1:5688'
    }
  },
  {
    name: 'DEBUG level',
    input: '2025-07-16T12:05:18.123456+08:00  DEBUG risingwave_stream::executor: actor processing message',
    expected: {
      timestamp: new Date('2025-07-16T12:05:18.123456+08:00'),
      level: 'DEBUG',
      span: 'risingwave_stream::executor',
      message: 'actor processing message'
    }
  },
  {
    name: 'ERROR level with complex message',
    input: '2025-07-16T12:05:18.123456+08:00  ERROR risingwave_meta::hummock: failed to compact: error="invalid argument"',
    expected: {
      timestamp: new Date('2025-07-16T12:05:18.123456+08:00'),
      level: 'ERROR',
      span: 'risingwave_meta::hummock',
      message: 'failed to compact: error="invalid argument"'
    }
  },
  {
    name: 'WARN level',
    input: '2025-07-16T11:33:34.638244+08:00  WARN risingwave_compute::memory::config: config should be set altogether',
    expected: {
      timestamp: new Date('2025-07-16T11:33:34.638244+08:00'),
      level: 'WARN',
      span: 'risingwave_compute::memory::config',
      message: 'config should be set altogether'
    }
  },
  {
    name: 'Empty message',
    input: '2025-07-16T11:33:34.601215+08:00  INFO risingwave_compute::server: ',
    expected: {
      timestamp: new Date('2025-07-16T11:33:34.601215+08:00'),
      level: 'INFO',
      span: 'risingwave_compute::server',
      message: ''
    }
  },
  {
    name: 'Message with colons',
    input: '2025-07-16T11:33:34.607102+08:00  INFO risingwave_rpc_client::meta_client: register meta client using strategy: http://127.0.0.1:5690/',
    expected: {
      timestamp: new Date('2025-07-16T11:33:34.607102+08:00'),
      level: 'INFO',
      span: 'risingwave_rpc_client::meta_client',
      message: 'register meta client using strategy: http://127.0.0.1:5690/'
    }
  },
  {
    name: 'Line that should be recognized as new log entry',
    input: '2025-07-16T11:33:34.639384+08:00  INFO risingwave_compute::server: Assigned worker node id 1',
    expected: {
      timestamp: new Date('2025-07-16T11:33:34.639384+08:00'),
      level: 'INFO',
      span: 'risingwave_compute::server',
      message: 'Assigned worker node id 1'
    }
  },
  {
    name: 'Line with OpenTelemetry context',
    input: '2025-07-16T11:34:16.15228+08:00 DEBUG actor{otel.name="Actor 6" actor_id=6}:executor{otel.name="Dml 600000002"}:executor{otel.name="Source 600002719"}: events::stream::message::barrier: prev_epoch=8873682932793344 curr_epoch=8873682932858880',
    expected: {
      timestamp: new Date('2025-07-16T11:34:16.15228+08:00'),
      level: 'DEBUG',
      span: 'events::stream::message::barrier',
      message: 'prev_epoch=8873682932793344 curr_epoch=8873682932858880'
    }
  }
];

// Invalid cases that should return null
const invalidCases = [
  {
    name: 'Missing timestamp',
    input: 'INFO risingwave_compute: test message'
  },
  {
    name: 'Invalid log level',
    input: '2025-07-16T11:33:34.601215+08:00  TRACE risingwave_compute: test message'
  },
  {
    name: 'Missing colon separator',
    input: '2025-07-16T11:33:34.601215+08:00  INFO risingwave_compute test message'
  },
  {
    name: 'Empty line',
    input: ''
  },
  {
    name: 'Random text',
    input: 'this is not a log line'
  }
];

// Test runner
function runTests() {
  console.log('🧪 Testing LogParser.parseLogLine()');
  console.log('==========================================\n');

  let passed = 0;
  let failed = 0;

  // Test valid cases
  console.log('📍 Testing valid log lines:');
  testCases.forEach((testCase, index) => {
    try {
      const result = LogParser.parseLogLine(testCase.input);
      
      if (!result) {
        console.log(`❌ Test ${index + 1} "${testCase.name}": Expected result but got null`);
        failed++;
        return;
      }

      // Check each field
      const errors = [];
      if (result.timestamp.getTime() !== testCase.expected.timestamp.getTime()) {
        errors.push(`timestamp: expected ${testCase.expected.timestamp.toISOString()}, got ${result.timestamp.toISOString()}`);
      }
      if (result.level !== testCase.expected.level) {
        errors.push(`level: expected "${testCase.expected.level}", got "${result.level}"`);
      }
      if (result.span !== testCase.expected.span) {
        errors.push(`span: expected "${testCase.expected.span}", got "${result.span}"`);
      }
      if (result.message !== testCase.expected.message) {
        errors.push(`message: expected "${testCase.expected.message}", got "${result.message}"`);
      }

      if (errors.length > 0) {
        console.log(`❌ Test ${index + 1} "${testCase.name}":`);
        errors.forEach(error => console.log(`   ${error}`));
        failed++;
      } else {
        console.log(`✅ Test ${index + 1} "${testCase.name}": PASSED`);
        passed++;
      }
    } catch (error) {
      console.log(`❌ Test ${index + 1} "${testCase.name}": ERROR - ${error}`);
      failed++;
    }
  });

  console.log('\n📍 Testing invalid log lines (should return null):');
  invalidCases.forEach((testCase, index) => {
    try {
      const result = LogParser.parseLogLine(testCase.input);
      
      if (result === null) {
        console.log(`✅ Invalid test ${index + 1} "${testCase.name}": PASSED (correctly returned null)`);
        passed++;
      } else {
        console.log(`❌ Invalid test ${index + 1} "${testCase.name}": Expected null but got result`);
        console.log(`   Result: ${JSON.stringify(result)}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ Invalid test ${index + 1} "${testCase.name}": ERROR - ${error}`);
      failed++;
    }
  });

  // Summary
  console.log('\n==========================================');
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('💥 Some tests failed. Please check the implementation.');
  }
  
  return failed === 0;
}

// Test isNewLogEntry function
function testIsNewLogEntry() {
  console.log('\n🧪 Testing isNewLogEntry function');
  console.log('==================================');
  
  const newEntryTests = [
    { input: '2025-07-16T11:33:34.601215+08:00  INFO risingwave_rt::deadlock: test', expected: true },
    { input: '2025-07-16T11:34:16.10591+08:00 DEBUG risingwave_stream::test: test', expected: true },
    { input: '2025-07-16T11:34:16.15228+08:00 WARN actor{}: events::test: test', expected: true },
    { input: '2025-07-16T11:34:16.15228+08:00 ERROR test: message', expected: true },
    
    // Should return false
    { input: '> total_memory: 8.00 GiB', expected: false },
    { input: '| + | 2 | bob |', expected: false },
    { input: '+---+----+-------+', expected: false },
    { input: 'cardinality=1 capacity=1', expected: false },
    { input: '', expected: false },
    { input: '2025-07-16T11:34:16.15228+08:00 UNKNOWN test: invalid level', expected: false },
    { input: 'DEBUG test: missing timestamp', expected: false }
  ];

  let passed = 0;
  let failed = 0;

  newEntryTests.forEach((test, index) => {
    const result = LogParser.isNewLogEntry(test.input);
    if (result === test.expected) {
      console.log(`✅ Test ${index + 1}: "${test.input.substring(0, 50)}..." - ${test.expected ? 'New entry' : 'Continuation'}`);
      passed++;
    } else {
      console.log(`❌ Test ${index + 1}: "${test.input.substring(0, 50)}..." - Expected ${test.expected}, got ${result}`);
      failed++;
    }
  });

  console.log(`\n📊 isNewLogEntry Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Run tests immediately
const parseTests = runTests();
const entryTests = testIsNewLogEntry();

if (parseTests && entryTests) {
  console.log('\n🎉 All tests passed!');
} else {
  console.log('\n💥 Some tests failed!');
}

export { runTests, testCases, invalidCases, testIsNewLogEntry };