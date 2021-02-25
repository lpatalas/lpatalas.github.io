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
            { input: '', expected: fsRoot },
            { input: '/', expected: fsRoot },
            { input: '/a.txt', expected: aTxt },
            { input: '/b', expected: bDir },
            { input: '/b/', expected: bDir },
            { input: '/b/c.txt', expected: cTxt },
            { input: '/a.txt/', expected: errorNode('Not a directory: /a.txt/'), },
            { input: '/c/c.txt', expected: errorNode('Path does not exist: /c/') },
            { input: '/../..', expected: errorNode('Invalid path: /../..') }
        ]

        testCases.forEach(({ input, expected }) => {
            it(`should return correct file system node for path ${input}`, () => {
                const fileSystem = FileSystem(fsRoot, {});
                const result = fileSystem.getNode(input);
                expect(result).toEqual(expected);
            });
        })
    })
});