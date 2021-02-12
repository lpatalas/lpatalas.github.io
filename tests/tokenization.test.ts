///<reference path="../src/tokenization.ts" />

describe('tokenize', () => {
    const testCases = [
        { input: '', expected: [] },
        { input: 'a', expected: ['a'] },
        { input: 'a b', expected: ['a', 'b'] },
        { input: 'a  b', expected: ['a', 'b'] },
        { input: '"a b"', expected: ['a b'] },
        { input: '"a" "b c" def  " "', expected: ['a', 'b c', 'def', ' '] },
        { input: '"abc', expected: ['abc'] },
        { input: '"a ', expected: ['a '] },
        { input: '"', expected: [''] },
        { input: '""', expected: [''] },
        { input: '"a""b"', expected: ['a', 'b'] },
        { input: '"\\""', expected: ['"'] },
        { input: '"\\\\""', expected: ['\\"'] },
        { input: '\\"', expected: ['\\"'] },
        { input: 'abc"def"', expected: ['abc"def"'] }
    ]

    testCases.forEach(({ input, expected }) => {
        it(`should correctly tokenize '${input}'`, () => {
            const result = tokenize(input);
            expect(result).toEqual(expected);
        });
    });
});