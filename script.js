var currentPath = window.sessionStorage['currentPath'] || '~';
var fileSystem = {
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

document.querySelector('span.input').id = 'currentInput';
document.querySelectorAll('span.cwd').forEach(function(el) {
    el.innerText = currentPath;
});

var keyRegex = /^[a-z0-9~`!@#$%^&*()_+={}\[\]|\\:;"'<,>.?\/ -]$/i;

document.addEventListener('keydown', function (e) {
    var input = document.getElementById('currentInput'); 
    if (e.key === 'Backspace' && input.innerText.length > 0) {
        input.innerText = input.innerText.substr(0, input.innerText.length - 1);
    }
    else if (e.key === 'Enter') {
        input.id = '';
        var output = execute(input.innerText);

        document.getElementById('console').innerHTML += `
            <div class="out">
                ${output}
            </div>
            <div class="in">
                <span class="cwd">${currentPath}</span>&gt; <span class="input" id="currentInput"></span>
            </div>
            `;
    }
    else if (keyRegex.test(e.key)) {
        input.innerText += e.key;
    }
});

var commands = {
    "cd": changeDir,
    "cls": clearScreen,
    "help": showHelp,
    "ls": printDir
}

function execute(command) {
    var commandRegex = /^\s*([a-z]+)\s*(.*)/i;
    var match = commandRegex.exec(command);
    if (match) {
        var command = commands[match[1]];
        if (command) {
            return command(match[2]);
        }
        else {
            return `Unknown command: ${match[1]}`;
        }
    }

    return `Invalid input`;
}

function clearScreen() {
    document.getElementById('console').innerHTML = '';
    return '';
}

function printDir(path) {
    var fullPath = getFullPath(path || '.');
    if (!fullPath) {
        return `Invalid path: ${path}`;
    }

    var content = getContent(fullPath);
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

function changeDir(path) {
    var fullPath = getFullPath(path || '.');
    if (!fullPath) {
        return `Invalid path: ${path}`;
    }

    var content = getContent(fullPath);
    if (content) {
        if (typeof content === 'string') {
            document.location = content;
        }
        else {
            currentPath = fullPath;
            sessionStorage['currentPath'] = currentPath;
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

function getFullPath(path) {
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

function getContent(dir) {
    var segments = dir.split('/');
    var currentDir = fileSystem;
    for (var i = 0; i < segments.length; i++) {
        currentDir = currentDir[segments[i]];
        if (!currentDir) {
            break;
        }
    }
    return currentDir;
}