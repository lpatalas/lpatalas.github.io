///<reference path="../src/fileSystem.ts" />

describe('FileSystem', () => {
    describe('getPathSegments', () => {
        const testCases = [
            { input: '', expected: [] },
            { input: '/', expected: ['/'] },
            { input: '/a', expected: ['/', 'a'] },
            { input: '/a/', expected: ['/', 'a/'] },
            { input: '/a/b/c', expected: ['/', 'a/','b/','c'] },
            { input: '/a/b/c/', expected: ['/', 'a/','b/','c/'] },
        ];

        testCases.forEach(({ input, expected }) => {
            it(`should correctly split '${input}' into segments`, () => {
                const result = getPathSegments(input);
                expect(result).toEqual(expected);
            });
        });
    });

    describe('getAbsolutePath', () => {
        const currentDir = '/a/b/'

        const testCases = [
            { input: '', expected: currentDir },
            { input: '/', expected: '/' },
            { input: '.', expected: currentDir },
            { input: '/a/b/c/', expected: '/a/b/c/' },
            { input: 'c/d/e/', expected: `${currentDir}c/d/e/` },
            { input: '..', expected: '/a/' },
            { input: '/a/..', expected: '/' },
            { input: '../b/../b/', expected: '/a/b/' },
            { input: '/a/b/c/d/../../../', expected: '/a/' },
            { input: '/..', expected: null },
            { input: '/a/b/../../..', expected: null }
        ];

        testCases.forEach(({ input, expected }) => {
            it(`should get correct absolute path for '${input}'`, () => {
                const result = getAbsolutePath(input, currentDir);
                if (expected === null) {
                    expect(result).toBeNull();
                }
                else {
                    expect(result).toEqual(expected);
                }
            });
        });
    });
});