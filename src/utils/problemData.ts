import { TestCase } from './testRunner';

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  examples: Example[];
  constraints?: string[];
  starterCode: string;
  testCases?: TestCase[];
}

export const problems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your code here
}

// Example usage:
// const nums = [2, 7, 11, 15];
// const target = 9;
// console.log(twoSum(nums, target)); // Should output [0, 1]`,
    testCases: [
      {
        input: [[2, 7, 11, 15], 9],
        expected: [0, 1],
        name: 'Example 1: Basic case'
      },
      {
        input: [[3, 2, 4], 6],
        expected: [1, 2],
        name: 'Example 2: No first elements'
      },
      {
        input: [[3, 3], 6],
        expected: [0, 1],
        name: 'Example 3: Duplicate elements'
      },
      {
        input: [[1, 2, 3, 4, 5], 9],
        expected: [3, 4],
        name: 'Additional case: Larger array'
      }
    ]
  },
  {
    id: 'palindrome',
    title: 'Valid Palindrome',
    description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers. Given a string s, return true if it is a palindrome, or false otherwise.',
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.'
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.'
      },
      {
        input: 's = " "',
        output: 'true',
        explanation: 's is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.'
      }
    ],
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.'
    ],
    starterCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
    // Your code here
}

// Example usage:
// const s = "A man, a plan, a canal: Panama";
// console.log(isPalindrome(s)); // Should output true`,
    testCases: [
      {
        input: ["A man, a plan, a canal: Panama"],
        expected: true,
        name: 'Example 1: Sentence palindrome'
      },
      {
        input: ["race a car"],
        expected: false,
        name: 'Example 2: Not a palindrome'
      },
      {
        input: [" "],
        expected: true,
        name: 'Example 3: Empty string'
      },
      {
        input: ["Madam, I'm Adam."],
        expected: true,
        name: 'Additional case: With punctuation'
      },
      {
        input: ["12321"],
        expected: true,
        name: 'Numeric palindrome'
      }
    ]
  }
];

export const getProblemById = (id: string): Problem | undefined => {
  return problems.find(problem => problem.id === id);
};
