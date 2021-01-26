"use strict";
function CommandInterpreter(fileSystem) {
    var commands = {
        "cd": changeDir,
        "cls": clearScreen,
        "help": showHelp,
        "ls": printDir
    };
    function clearScreen() {
        document.getElementById('console').innerHTML = '';
        return '';
    }
    function printDir(path) {
        var fullPath = fileSystem.getFullPath(path || '.');
        if (!fullPath) {
            return "Invalid path: " + path;
        }
        var content = fileSystem.getDirectory(fullPath);
        if (typeof content === 'string') {
            return "Not a directory: " + content;
        }
        if (content) {
            var output = '';
            for (var prop in content) {
                if (typeof content[prop] === 'string') {
                    output += "<div><a href=\"" + content[prop] + "\">" + prop + "</a></div>";
                }
                else {
                    output += "<div>" + prop + "/</div>";
                }
            }
            return output;
        }
        else {
            return "Invalid directory: " + path;
        }
    }
    function changeDir(path) {
        var fullPath = fileSystem.getFullPath(path || '.');
        if (!fullPath) {
            return "Invalid path: " + path;
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
            return "Invalid path: " + path;
        }
    }
    function showHelp() {
        var commandNames = Object.getOwnPropertyNames(commands).join(', ');
        return "\n            Available commands: " + commandNames + ".<br>\n            If you need more help then create an issue here:\n            <a href=\"https://github.com/lpatalas/lpatalas.github.io/issues\">\n                https://github.com/lpatalas/lpatalas.github.io/issues\n            </a>";
    }
    function execute(commandText) {
        var commandRegex = /^\s*([a-z]+)\s*(.*)/i;
        var match = commandRegex.exec(commandText);
        if (match) {
            var commandCallback = commands[match[1]];
            if (commandCallback) {
                return commandCallback(match[2]);
            }
            else {
                return "Unknown command: " + match[1];
            }
        }
        return "Invalid input";
    }
    return {
        execute: execute
    };
}
function FileSystem() {
    var currentPath = window.sessionStorage['currentPath'] || '~';
    var root = {
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
    };
    function getCurrentPath() {
        return currentPath;
    }
    function setCurrentPath(path) {
        currentPath = path;
        sessionStorage['currentPath'] = currentPath;
    }
    function getDirectory(path) {
        var segments = path.split('/');
        var currentDir = root;
        var matchedSegments = 0;
        while (matchedSegments < segments.length) {
            matchedSegments++;
            var childDir = currentDir[segments[matchedSegments]];
            if (typeof childDir === 'string') {
                break;
            }
            currentDir = childDir;
            if (!currentDir) {
                break;
            }
        }
        return currentDir;
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
    return {
        getCurrentPath: getCurrentPath,
        setCurrentPath: setCurrentPath,
        getDirectory: getDirectory,
        getFullPath: getFullPath
    };
}
;
main();
function main() {
    var fileSystem = FileSystem();
    var commandInterpreter = CommandInterpreter(fileSystem);
    var terminal = Terminal(commandInterpreter, fileSystem);
    var keyRegex = /^[a-z0-9~`!@#$%^&*()_+={}\[\]|\\:;"'<,>.?\/ -]$/i;
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace') {
            terminal.eraseLastChar();
        }
        else if (e.key === 'Enter') {
            terminal.submitInput();
        }
        else if (keyRegex.test(e.key)) {
            terminal.appendChar(e.key);
        }
    });
}
function Terminal(commandInterpreter, fileSystem) {
    function getCurrentInputElement() {
        return document.getElementById('currentInput');
    }
    function appendChar(c) {
        getCurrentInputElement().innerText += c;
    }
    function eraseLastChar() {
        var input = getInput();
        if (input.length > 0) {
            setInput(input.substr(0, input.length - 1));
        }
    }
    function getInput() {
        return getCurrentInputElement().innerText;
    }
    function setInput(text) {
        getCurrentInputElement().innerText = text;
    }
    function submitInput() {
        var input = getCurrentInputElement();
        input.id = '';
        var output = commandInterpreter.execute(input.innerText);
        document.getElementById('console').innerHTML += "\n            <div class=\"out\">\n                " + output + "\n            </div>\n            <div class=\"in\">\n                <span class=\"cwd\">" + fileSystem.getCurrentPath() + "</span>&gt; <span class=\"input\" id=\"currentInput\"></span>\n            </div>\n            ";
    }
    document.querySelector('span.input').id = 'currentInput';
    document.querySelectorAll('span.cwd').forEach(function (el) {
        el.innerText = fileSystem.getCurrentPath();
    });
    return {
        appendChar: appendChar,
        eraseLastChar: eraseLastChar,
        submitInput: submitInput
    };
}
