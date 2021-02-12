type CommandMap = {
    [name: string]: (...args: string[]) => string
};

function Commands(fileSystem: FileSystem): CommandMap {
    const commands = {
        "cd": changeDir,
        "cls": clearScreen,
        "echo": echo,
        "help": showHelp,
        "ls": printDir
    };

    function clearScreen() {
        document.getElementById('console')!.innerHTML = '';
        return '';
    }

    function echo(...args: string[]) {
        return args.join(' ');
    }
    
    function printDir(path: string) {
        var fullPath = fileSystem.getFullPath(path || '.');
        if (!fullPath) {
            return `Invalid path: ${path}`;
        }
    
        var content = fileSystem.getDirectory(fullPath);
        if (typeof content === 'string') {
            return `Not a directory: ${content}`;
        }
        
        if (content) {
            var output = '';
            for (var prop in content) {
                if (typeof content[prop] === 'string') {
                    output += `<div><a href="${content[prop]}">${prop}</a></div>`;
                }
                else {
                    output += `<div>${prop}/</div>`;
                }
            }
            return output;
        }
        else {
            return `Invalid directory: ${path}`;
        }
    }
    
    function changeDir(path: string) {
        var fullPath = fileSystem.getFullPath(path || '.');
        if (!fullPath) {
            return `Invalid path: ${path}`;
        }
    
        var content = fileSystem.getDirectory(fullPath);
        if (content) {
            if (typeof content === 'string') {
                document.location = content;
            }
            else {
                fileSystem.setCurrentPath(fullPath);
            }
    
            return '';
        }
        else {
            return `Invalid path: ${path}`; 
        }
    }
    
    function showHelp() {
        var commandNames = Object.getOwnPropertyNames(commands).join(', ');
        return `
            Available commands: ${commandNames}.<br>
            If you need more help then create an issue here:
            <a href="https://github.com/lpatalas/lpatalas.github.io/issues">
                https://github.com/lpatalas/lpatalas.github.io/issues
            </a>`;
    }

    return commands; 
}