"use strict";
function CommandDispatcher(tokenize, commands) {
    function execute(commandText) {
        var tokens = tokenize(commandText);
        if (tokens.length === 0) {
            return '';
        }
        else {
            var commandName = tokens[0], args = tokens.slice(1);
            var command = commands[commandName];
            if (command) {
                return command.apply({}, args);
            }
            else {
                return "Unknown command: " + commandName;
            }
        }
    }
    return {
        execute: execute
    };
}
function Commands(fileSystem) {
    var commands = {
        "cd": changeDir,
        "cls": clearScreen,
        "echo": echo,
        "help": showHelp,
        "ls": printDir
    };
    function clearScreen() {
        document.getElementById('console').innerHTML = '';
        return '';
    }
    function echo() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return "<pre>" + args.join(' ') + "</pre>";
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
    return commands;
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
            var childDir = currentDir[segments[matchedSegments]];
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
    var commands = Commands(fileSystem);
    var commandDispatcher = CommandDispatcher(tokenize, commands);
    var terminal = Terminal(commandDispatcher, fileSystem);
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
function Terminal(commandDispatcher, fileSystem) {
    function getCurrentInputElement() {
        return document.getElementById('currentInput');
    }
    function findLastElement(selector) {
        var allElements = document.querySelectorAll(selector);
        if (allElements.length > 0) {
            return allElements[allElements.length - 1];
        }
        else {
            return null;
        }
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
        var output = commandDispatcher.execute(input.innerText);
        document.getElementById('console').innerHTML += "\n            <div class=\"out\">\n                <pre>" + output + "</pre>\n            </div>\n            <div class=\"in\">\n                <span class=\"cwd\">" + fileSystem.getCurrentPath() + "</span>&gt; <pre class=\"input\" id=\"currentInput\"></pre>\n            </div>\n            ";
        getCurrentInputElement().scrollIntoView();
    }
    findLastElement('.input').id = 'currentInput';
    document.querySelectorAll('.cwd').forEach(function (el) {
        el.innerText = fileSystem.getCurrentPath();
    });
    return {
        appendChar: appendChar,
        eraseLastChar: eraseLastChar,
        submitInput: submitInput
    };
}
function tokenize(input) {
    var tokens = [];
    var parseResult = parseNextToken(input);
    while (parseResult != null) {
        tokens.push(parseResult.token);
        parseResult = parseNextToken(parseResult.rest);
    }
    return tokens;
    function parseNextToken(input) {
        var i = 0;
        while (isWhitespace(input[i])) {
            i++;
        }
        if (i == input.length) {
            return null;
        }
        if (input[i] == '"') {
            return parseQuotedToken(input, i);
        }
        else {
            return parseUnquotedToken(input, i);
        }
    }
    function parseQuotedToken(input, startIndex) {
        var endIndex = skipWhile(isNotQuote, input, startIndex + 1);
        var restIndex = endIndex < input.length ? endIndex + 1 : endIndex;
        var token = input.substring(startIndex + 1, endIndex).replace('\\"', '"');
        return {
            token: token,
            rest: input.substring(restIndex)
        };
    }
    function isNotQuote(c, prev) {
        return c !== '"' || prev === '\\';
    }
    function parseUnquotedToken(input, startIndex) {
        var endIndex = skipWhile(isNotWhitespace, input, startIndex);
        return {
            token: input.substring(startIndex, endIndex),
            rest: input.substring(endIndex)
        };
    }
    function skipWhile(predicate, input, startIndex) {
        var i = startIndex;
        while (i < input.length && predicate(input[i], i > 0 ? input[i - 1] : null)) {
            i++;
        }
        return i;
    }
    function isWhitespace(c) {
        return c === ' ' || c === '\t';
    }
    function isNotWhitespace(c) {
        return !isWhitespace(c);
    }
}
