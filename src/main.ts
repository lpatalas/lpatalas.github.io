main();

function main() {
    const rootDirectory = dir({
        "projects": dir({
            "linespace": fileUrl("https://linespace.lpatalas.com"),
            "fblocks": fileUrl("https://fblocks.lpatalas.com"),
            "mandelbrot": fileUrl("https://mandelbrot.lpatalas.com")
        }),
        "links": dir({
            "github": fileUrl("https://github.com/lpatalas")
        })
    });

    const fileSystem = FileSystem(rootDirectory, window.sessionStorage);
    const commands = Commands(fileSystem);
    const commandDispatcher = CommandDispatcher(tokenize, commands);
    const terminal = Terminal(commandDispatcher, fileSystem);
    
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