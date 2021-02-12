main();

function main() {
    const fileSystem = FileSystem();
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