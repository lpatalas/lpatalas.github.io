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
                try {
                    return command.apply({}, args);
                }
                catch (e) {
                    if (e instanceof Error) {
                        return "ERROR '" + commandName + "': " + e.message;
                    }
                    return "ERROR: " + e;
                }
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
        cd: cd,
        cls: cls,
        echo: echo,
        help: help,
        ls: ls
    };
    function cd(path) {
        fileSystem.setCurrentPath(path);
        return '';
    }
    function cls() {
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
    function help() {
        var commandNames = Object.getOwnPropertyNames(commands).join(', ');
        return "\n            Available commands: " + commandNames + ".<br>\n            If you need more help then create an issue here:\n            <a href=\"https://github.com/lpatalas/lpatalas.github.io/issues\">\n                https://github.com/lpatalas/lpatalas.github.io/issues\n            </a>";
    }
    function ls(path) {
        path = path || fileSystem.getCurrentPath();
        var node = fileSystem.getDirectoryNode(path).node;
        var outputLines = [];
        for (var name in node.children) {
            var childNode = node.children[name];
            if (isDirectoryNode(childNode)) {
                outputLines.push("<div>" + name + "/</div>");
            }
            else if (isFileNode(childNode)) {
                if (childNode.url) {
                    outputLines.push("<div><a href=\"" + childNode.url + "\">" + name + "</a></div>");
                }
                else {
                    outputLines.push("<div>" + name + "</div>");
                }
            }
        }
        return outputLines.join('');
    }
    return commands;
}
function file(content, url) {
    return { type: 'file', content: content, url: url };
}
function fileUrl(url) {
    return file(url, url);
}
function dir(children) {
    return { type: 'directory', children: children };
}
function isDirectoryNode(node) {
    return node !== null && node.type === 'directory';
}
function isFileNode(node) {
    return node !== null && node.type === 'file';
}
function isDirectory(entry) {
    return typeof entry !== 'string';
}
function getPathSegments(path) {
    var segments = [];
    var segmentStartIndex = 0;
    for (var i = 0; i < path.length; i++) {
        if (path[i] === '/') {
            var segment = path.substring(segmentStartIndex, i + 1);
            segments.push(segment);
            segmentStartIndex = i + 1;
        }
    }
    if (segmentStartIndex < path.length) {
        segments.push(path.substring(segmentStartIndex));
    }
    return segments;
}
function getAbsolutePath(absoluteOrRelativePath, currentPath) {
    if (absoluteOrRelativePath.length === 0 || absoluteOrRelativePath == '.') {
        return currentPath;
    }
    var absolutePath = (absoluteOrRelativePath[0] === '/'
        ? absoluteOrRelativePath
        : currentPath + absoluteOrRelativePath);
    var segments = getPathSegments(absolutePath);
    var normalizedSegments = [];
    for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
        var segment = segments_1[_i];
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
function FileSystem(root, sessionStorage) {
    var currentPath = sessionStorage['currentPath'] || '/';
    function getCurrentPath() {
        return currentPath;
    }
    function setCurrentPath(path) {
        var node = getDirectoryNode(path);
        currentPath = node.absolutePath;
        sessionStorage['currentPath'] = currentPath;
    }
    function getNode(path) {
        var absolutePath = getAbsolutePath(path, currentPath);
        if (absolutePath == null) {
            throw new Error("Invalid path: " + path);
        }
        var segments = getPathSegments(absolutePath);
        var currentNode = root;
        for (var i = 1; i < segments.length; i++) {
            var segment = segments[i];
            var nodeName = (segment[segment.length - 1] === '/'
                ? segment.substring(0, segment.length - 1)
                : segment);
            var childNode = currentNode.children[nodeName];
            if (!childNode) {
                var invalidSubpath = segments.slice(0, i + 1).join('');
                throw new Error("Path does not exist: " + invalidSubpath);
            }
            if (isFileNode(childNode)) {
                if (i < segments.length - 1 || segment[segment.length - 1] === '/') {
                    var invalidSubpath = segments.slice(0, i + 1).join('');
                    throw new Error("Not a directory: " + invalidSubpath);
                }
                return { absolutePath: absolutePath, node: childNode };
            }
            else if (isDirectoryNode(childNode)) {
                currentNode = childNode;
            }
        }
        var resultPath = (absolutePath[absolutePath.length - 1] !== '/'
            ? absolutePath + '/'
            : absolutePath);
        return { absolutePath: resultPath, node: currentNode };
    }
    function getDirectoryNode(path) {
        var result = getNode(path);
        if (!isDirectoryNode(result.node)) {
            throw new Error("Not a directory: " + result.absolutePath);
        }
        return result;
    }
    return {
        getCurrentPath: getCurrentPath,
        setCurrentPath: setCurrentPath,
        getNode: getNode,
        getDirectoryNode: getDirectoryNode
    };
}
;
main();
function main() {
    var rootDirectory = dir({
        "projects": dir({
            "linespace": fileUrl("https://linespace.lpatalas.com"),
            "fblocks": fileUrl("https://fblocks.lpatalas.com"),
            "mandelbrot": fileUrl("https://mandelbrot.lpatalas.com")
        }),
        "links": dir({
            "github": fileUrl("https://github.com/lpatalas")
        })
    });
    var fileSystem = FileSystem(rootDirectory, window.sessionStorage);
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
        document.getElementById('console').innerHTML += "\n            <div class=\"out\">\n                " + output + "\n            </div>\n            <div class=\"in\">\n                <span class=\"cwd\">" + fileSystem.getCurrentPath() + "</span>&gt; <pre class=\"input\" id=\"currentInput\"></pre>\n            </div>\n            ";
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
