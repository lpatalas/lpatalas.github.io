
type DirectoryEntry = { [name: string]: FileSystemEntry };
type FileSystemEntry = string | DirectoryEntry;

interface FileSystem {
    getCurrentPath(): string;
    setCurrentPath(path: string): void;
    getDirectory(path: string): DirectoryEntry | null;
    getFullPath(path: string): string;
}

function FileSystem(): FileSystem {

    let currentPath = window.sessionStorage['currentPath'] || '~';

    const root: DirectoryEntry = {
        "~": {
            "projects": {
                "linespace": "https://linespace.lpatalas.com",
                "fblocks": "https://fblocks.lpatalas.com",
                "mandelbrot": "https://mandelbrot.lpatalas.com"
            },
            "links": {
                "github": "https://github.com/lpatalas"
            }
        }
    }

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

    function getFullPath(path: string) {
        if (path === '.') {
            return currentPath;
        }
        else if (path === '..') {
            var segments = currentPath.split('/');
            if (segments.length > 1) {
                return segments.slice(0, segments.length - 1).join('/');
            }
            else {
                return null;
            }
        }
        else {
            return currentPath + '/' + path;
        }
    }

    return {
        getCurrentPath,
        setCurrentPath,
        getDirectory,
        getFullPath
    }
};