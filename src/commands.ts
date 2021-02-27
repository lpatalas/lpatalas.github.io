type CommandMap = {
    [name: string]: (...args: string[]) => string
};

function Commands(fileSystem: FileSystem) {
    const commands = {
        cd,
        cls,
        echo,
        exit,
        help,
        ls
    };
    
    function cd(path: string) {
        const node = fileSystem.getNode(path).node;
        
        if (isFileNode(node) && node.url) {
            window.location.href = node.url;
        }
        else {
            fileSystem.setCurrentPath(path);
        }

        return '';
    }

    function cls() {
        document.getElementById('console')!.innerHTML = '';
        return '';
    }

    function echo(...args: string[]) {
        return `<pre>${args.join(' ')}</pre>`;
    }

    function exit() {
        window.close();
        return '';
    }
    
    function help() {
        var commandNames = Object.getOwnPropertyNames(commands).join(', ');
        return `
            Available commands: ${commandNames}.<br>
            If you need more help then create an issue here:
            <a href="https://github.com/lpatalas/lpatalas.github.io/issues">
                https://github.com/lpatalas/lpatalas.github.io/issues
            </a>`;
    }
    
    function ls(path?: string) {
        path = path || fileSystem.getCurrentPath();
        const node = fileSystem.getDirectoryNode(path).node;

        const outputLines = [];

        for (var name in node.children) {
            const childNode = node.children[name];
            if (isDirectoryNode(childNode)) {
                outputLines.push(`<div>${name}/</div>`);
            }
            else if (isFileNode(childNode)) {
                if (childNode.url) {
                    outputLines.push(`<div><a href="${childNode.url}">${name}</a></div>`);
                }
                else {
                    outputLines.push(`<div>${name}</div>`)
                }
            }
        }

        return outputLines.join('');
    }

    return commands; 
}