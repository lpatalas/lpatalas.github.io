
type DirectoryEntry = { [name: string]: FileSystemEntry };
type FileSystemEntry = string | DirectoryEntry;

interface FileNode {
    type: 'file';
    content: string;
}

interface DirectoryNode {
    type: 'directory';
    children: { [name: string]: FileSystemNode | null };
}

interface ErrorNode {
    type: 'error';
    message: string;
}

type FileSystemNode = FileNode | DirectoryNode | ErrorNode;

function file(content: string): FileNode {
    return { type: 'file', content };
}

function dir(children: { [name: string]: FileSystemNode }): DirectoryNode {
    return { type: 'directory', children };
}

function errorNode(message: string): ErrorNode {
    return { type: 'error', message };
}

function isDirectoryNode(node: FileSystemNode): node is DirectoryNode {
    return node.type === 'directory';
}

function isFileNode(node: FileSystemNode): node is FileNode {
    return node.type === 'file';
}

function isErrorNode(node: FileSystemNode): node is ErrorNode {
    return node.type === 'error';
}

function isDirectory(entry: FileSystemEntry): entry is DirectoryEntry {
    return typeof entry !== 'string';
}

interface FileSystem {
    getCurrentPath(): string;
    setCurrentPath(path: string): void;
    getDirectory(path: string): DirectoryEntry | null;
    getNode(path: string): FileSystemNode | null;
}

interface SessionStorage {
    [key: string]: any;
}

function getPathSegments(path: string): string[] {
    const segments: string[] = [];
    let segmentStartIndex = 0;

    for (let i = 0; i < path.length; i++) {
        if (path[i] === '/') {
            const segment = path.substring(segmentStartIndex, i + 1);
            segments.push(segment);
            segmentStartIndex = i + 1;
        }
    }

    if (segmentStartIndex < path.length) {
        segments.push(path.substring(segmentStartIndex));
    }

    return segments;
}

function getAbsolutePath(absoluteOrRelativePath: string, currentPath: string) {
    if (absoluteOrRelativePath.length === 0 || absoluteOrRelativePath == '.') {
        return currentPath;
    }
    
    const absolutePath = (
        absoluteOrRelativePath[0] === '/'
        ? absoluteOrRelativePath
        : currentPath + absoluteOrRelativePath
    );

    const segments = getPathSegments(absolutePath);
    const normalizedSegments: string[] = [];

    for (const segment of segments) {
        if (segment === '..' || segment === '../') {
            if (normalizedSegments.length <= 1) {
                return null;
            }
            else {
                normalizedSegments.pop();
            }
        }
        else {
            normalizedSegments.push(segment);
        }
    }

    return normalizedSegments.join('');
}

function FileSystem(root: DirectoryNode, sessionStorage: SessionStorage): FileSystem {

    let currentPath = sessionStorage['currentPath'] || '~';

    function getCurrentPath() {
        return currentPath;
    }

    function setCurrentPath(path: string) {
        currentPath = path;
        sessionStorage['currentPath'] = currentPath;
    }

    function getDirectory(path: string) {
        const absolutePath = getAbsolutePath(path, currentPath);
        const segments = getPathSegments(path);

        let currentNode = root;

        for (let i = 1; i < segments.length; i++) {

        }

        return null;
        // const segments = path.split('/');
        // let currentDir: DirectoryNode = root;
        // let matchedSegments = 0;
    
        // while (matchedSegments < segments.length) {
        //     const childDir = currentDir[segments[matchedSegments]];
        //     if (typeof childDir === 'string') {
        //         break;
        //     }
    
        //     currentDir = childDir;
        //     if (!currentDir) {
        //         break;
        //     }

        //     matchedSegments++;
        // }
    
        // if (matchedSegments === segments.length) {
        //     return currentDir;
        // }
        // else {
        //     return null;
        // }
    };

    function getNode(path: string): FileSystemNode {
        const absolutePath = getAbsolutePath(path, currentPath);
        if (absolutePath == null) {
            return errorNode(`Invalid path: ${path}`);
        }
        
        const segments = getPathSegments(absolutePath);

        let currentNode = root;

        for (let i = 1; i < segments.length; i++) {
            const segment = segments[i];
            const nodeName = (
                segment[segment.length - 1] === '/'
                ? segment.substring(0, segment.length - 1)
                : segment
            );

            const childNode = currentNode.children[nodeName];
            if (!childNode) {
                const invalidSubpath = segments.slice(0, i + 1).join('');
                return errorNode(`Path does not exist: ${invalidSubpath}`);
            }

            if (isFileNode(childNode)) {
                if (i < segments.length - 1 || segment[segment.length - 1] === '/') {
                    const invalidSubpath = segments.slice(0, i + 1).join('');
                    return errorNode(`Not a directory: ${invalidSubpath}`);
                }

                return childNode;
            }
            else if (isDirectoryNode(childNode)) {
                currentNode = childNode;
            }
        }

        return currentNode;
    }

    return {
        getCurrentPath,
        setCurrentPath,
        getDirectory,
        getNode
    }
};