
type DirectoryEntry = { [name: string]: FileSystemEntry };
type FileSystemEntry = string | DirectoryEntry;

interface FileNode {
    type: 'file';
    content: string;
}

interface DirectoryNode {
    type: 'directory';
    children: { [name: string]: FileSystemNode };
}

type FileSystemNode = FileNode | DirectoryNode;

function MkFile(content: string): FileNode {
    return { type: 'file', content };
}

function MkDir(children: { [name: string]: FileSystemNode }): DirectoryNode {
    return { type: 'directory', children };
}

function isDirectory(entry: FileSystemEntry): entry is DirectoryEntry {
    return typeof entry !== 'string';
}

interface FileSystem {
    getCurrentPath(): string;
    setCurrentPath(path: string): void;
    getDirectory(path: string): DirectoryEntry | null;
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

function FileSystem(root: DirectoryEntry, sessionStorage: SessionStorage): FileSystem {

    let currentPath = sessionStorage['currentPath'] || '~';

    function getCurrentPath() {
        return currentPath;
    }

    function setCurrentPath(path: string) {
        currentPath = path;
        sessionStorage['currentPath'] = currentPath;
    }

    function getDirectory(path: string) {
        const segments = path.split('/');
        let currentDir: DirectoryEntry = root;
        let matchedSegments = 0;
    
        while (matchedSegments < segments.length) {
            const childDir = currentDir[segments[matchedSegments]];
            if (typeof childDir === 'string') {
                break;
            }
    
            currentDir = childDir;
            if (!currentDir) {
                break;
            }

            matchedSegments++;
        }
    
        if (matchedSegments === segments.length) {
            return currentDir;
        }
        else {
            return null;
        }
    }

    return {
        getCurrentPath,
        setCurrentPath,
        getDirectory
    }
};