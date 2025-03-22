type TestCase = {
  input: any[];
  expected: any;
  name: string;
};

type TestResult = {
  passed: boolean;
  name: string;
  expected?: string;
  actual?: string;
};

const runTests = (code: string, testCases: TestCase[]): { results: TestResult[], logs: string[] } => {
  const logs: string[] = [];
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Override console methods to capture logs
  console.log = (...args) => {
    logs.push(args.map(arg => 
      typeof arg === 'object' 
        ? JSON.stringify(arg, null, 2) 
        : String(arg)
    ).join(' '));
  };
  
  console.error = (...args) => {
    logs.push(`[Error] ${args.map(arg => String(arg)).join(' ')}`);
  };
  
  console.warn = (...args) => {
    logs.push(`[Warning] ${args.map(arg => String(arg)).join(' ')}`);
  };
  
  // Execute the code and get a function
  let userFunction:any; 
  try {
    userFunction = new Function(`
      ${code};
      return this;
    `)();
    
    // Extract the function from the last expression if it's a function definition
    const lastFunctionName = findLastFunctionName(code);
    if (lastFunctionName && typeof userFunction[lastFunctionName] === 'function') {
      userFunction = userFunction[lastFunctionName];
    } else if (code.includes('var ') || code.includes('let ') || code.includes('const ')) {
      // Try to extract function by searching for exports or returns
      const possibleFunctions = Object.keys(userFunction).filter(
        key => typeof userFunction[key] === 'function' && key !== 'console' && !key.startsWith('_')
      );
      if (possibleFunctions.length === 1) {
        userFunction = userFunction[possibleFunctions[0]];
      }
    }
  } catch (error: any) {
    // Restore console
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    
    return { 
      results: [{ 
        passed: false, 
        name: 'Code Execution',
        expected: 'Valid JavaScript function',
        actual: `Error: ${error.message}`
      }],
      logs: [`[Error] ${error.message}`] 
    };
  }
  
  // If we couldn't extract a function
  if (typeof userFunction !== 'function') {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    
    return {
      results: [{
        passed: false,
        name: 'Code Structure',
        expected: 'A valid JavaScript function',
        actual: 'No function found in your code'
      }],
      logs: ['[Error] Could not extract a function from your code. Make sure you define a function.']
    };
  }
  
  // Run test cases
  const results: TestResult[] = [];
  
  for (const test of testCases) {
    try {
      const result = userFunction(...test.input);
      const passed = compareResults(result, test.expected);
      
      results.push({
        passed,
        name: test.name,
        expected: JSON.stringify(test.expected),
        actual: JSON.stringify(result)
      });
      
      logs.push(
        passed 
          ? `✅ Test Passed: ${test.name}`
          : `❌ Test Failed: ${test.name}
             Expected: ${JSON.stringify(test.expected)}
             Actual: ${JSON.stringify(result)}`
      );
    } catch (error: any) {
      results.push({
        passed: false,
        name: test.name,
        expected: JSON.stringify(test.expected),
        actual: `Error: ${error.message}`
      });
      
      logs.push(`❌ Test Error: ${test.name} - ${error.message}`);
    }
  }
  
  // Restore console
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  
  return { results, logs };
};

const findLastFunctionName = (code: string): string | null => {
  const functionDefinitions = [
    /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,  // function declaration
    /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function/g,  // function expression with const
    /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function/g,  // function expression with let
    /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function/g,  // function expression with var
    /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,  // arrow function with const
    /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,  // arrow function with let
    /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,  // arrow function with var
  ];
  
  let lastMatch: string | null = null;
  let lastIndex = -1;
  
  for (const regex of functionDefinitions) {
    let match;
    while ((match = regex.exec(code)) !== null) {
      if (match.index > lastIndex) {
        lastIndex = match.index;
        lastMatch = match[1];
      }
    }
  }
  
  return lastMatch;
};

const compareResults = (actual: any, expected: any): boolean => {
  // For arrays and objects, compare stringified versions to handle deep equality
  if (typeof actual === 'object' && actual !== null || 
      typeof expected === 'object' && expected !== null) {
    return JSON.stringify(actual) === JSON.stringify(expected);
  }
  
  // For primitive types, use strict equality
  return actual === expected;
};

export { runTests };
export type { TestCase, TestResult };