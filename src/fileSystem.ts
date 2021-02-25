
type DirectoryEntry = { [name: string]: FileSystemEntry };
type FileSystemEntry = string | DirectoryEntry;

interface FileNode {
    type: 'file';
    content: string;
    url?: string;
}

interface DirectoryNode {
    type: 'directory';
    children: { [name: string]: FileSystemNode | null };
}

type FileSystemNode = FileNode | DirectoryNode;

function file(content: string, url?: string): FileNode {
    return { type: 'file', content, url };
}

function fileUrl(url: string): FileNode {
    return file(url, url);
}

function dir(children: { [name: string]: FileSystemNode }): DirectoryNode {
    return { type: 'directory', children };
}

function isDirectoryNode(node: FileSystemNode | null): node is DirectoryNode {
    return node !== null && node.type === 'directory';
}

function isFileNode(node: FileSystemNode | null): node is FileNode {
    return node !== null && node.type === 'file';
}

function isDirectory(entry: FileSystemEntry): entry is DirectoryEntry {
    return typeof entry !== 'string';
}

interface NodeResult<TNode extends FileSystemNode> {
    absolutePath: string;
    node: TNode;
}

interface FileSystem {
    getCurrentPath(): string;
    setCurrentPath(path: string): void;
    getNode(path: string): NodeResult<FileSystemNode>;
    getDirectoryNode(path: string): NodeResult<DirectoryNode>;
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

    let currentPath = sessionStorage['currentPath'] || '/';

    function getCurrentPath() {
        return currentPath;
    }

    function setCurrentPath(path: string) {
        const node = getDirectoryNode(path);

        currentPath = node.absolutePath;
        sessionStorage['currentPath'] = currentPath;
    }

    function getNode(path: string): NodeResult<FileSystemNode> {
        const absolutePath = getAbsolutePath(path, currentPath);
        if (absolutePath == null) {
            throw new Error(`Invalid path: ${path}`);
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
                throw new Error(`Path does not exist: ${invalidSubpath}`);
            }

            if (isFileNode(childNode)) {
                if (i < segments.length - 1 || segment[segment.length - 1] === '/') {
                    const invalidSubpath = segments.slice(0, i + 1).join('');
                    throw new Error(`Not a directory: ${invalidSubpath}`);
                }

                return { absolutePath, node: childNode };
            }
            else if (isDirectoryNode(childNode)) {
                currentNode = childNode;
            }
        }

        const resultPath = (
            absolutePath[absolutePath.length - 1] !== '/'
            ? absolutePath + '/'
            : absolutePath
        )

        return { absolutePath: resultPath, node: currentNode };
    }

    function getDirectoryNode(path: string): NodeResult<DirectoryNode> {
        const result = getNode(path);
        if (!isDirectoryNode(result.node)) {
            throw new Error(`Not a directory: ${result.absolutePath}`);
        }

        return (result as NodeResult<DirectoryNode>);
    }

    return {
        getCurrentPath,
        setCurrentPath,
        getNode,
        getDirectoryNode
    }
};