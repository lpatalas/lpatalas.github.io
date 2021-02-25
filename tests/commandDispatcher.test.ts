///<reference path="../src/commandDispatcher.ts" />

describe('CommandDispatcher', () => {
    const testCases = [
        { input: [], expected: '' },
        { input: ['bar'], expected: 'Unknown command: bar' },
        { input: ['foo', 'first', 'second'], expected: 'foo first second' }
    ]

    const commands = {
        foo: (first: string, second: string) => `foo ${first} ${second}`,
    };

    testCases.forEach(({input, expected}) => {
        it (`should correctly execute '${input}'`, () => {
            const fakeTokenizer = () => input;
            const interpreter = CommandDispatcher(fakeTokenizer, commands);
            const result = interpreter.execute('<unused>');
            expect(result).toEqual(expected);
        });
    });
});