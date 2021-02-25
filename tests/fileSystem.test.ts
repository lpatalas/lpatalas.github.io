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

    describe('getNode', () => {
        const aTxt = file('a.txt content');
        const cTxt = file('c.txt content');
        const bDir = dir({
            'c.txt': cTxt
        });

        const fsRoot = dir({
            'a.txt': aTxt,
            'b': bDir
        });

        const testCases = [
            { input: '', expected: { absolutePath: '/', node: fsRoot } },
            { input: '/', expected: { absolutePath: '/', node: fsRoot } },
            { input: '/a.txt', expected: { absolutePath: '/a.txt', node: aTxt } },
            { input: '/b', expected: { absolutePath: '/b/', node: bDir } },
            { input: '/b/', expected: { absolutePath: '/b/', node: bDir } },
            { input: '/b/c.txt', expected: { absolutePath: '/b/c.txt', node: cTxt } },
        ];

        testCases.forEach(({ input, expected }) => {
            it(`should return correct file system node for path ${input}`, () => {
                const fileSystem = FileSystem(fsRoot, {});
                const result = fileSystem.getNode(input);
                expect(result).toEqual(expected);
            });
        });

        const errorTestCases = [
            { input: '/a.txt/', expectedError: 'Not a directory: /a.txt/' },
            { input: '/c/c.txt', expectedError: 'Path does not exist: /c/' },
            { input: '/../..', expectedError: 'Invalid path: /../..' }
        ];

        errorTestCases.forEach(({ input, expectedError }) => {
            it(`should return correct file system node for path ${input}`, () => {
                const fileSystem = FileSystem(fsRoot, {});
                const act = () => fileSystem.getNode(input);
                expect(act).toThrowError(expectedError);
            });
        });
    })
});