interface Terminal {
    appendChar(c: string): void;
    eraseLastChar(): void;
    submitInput(): void;
}

function Terminal(commandInterpreter: CommandInterpreter, fileSystem: FileSystem): Terminal {
    function getCurrentInputElement() {
        return document.getElementById('currentInput') as HTMLElement;
    }

    function appendChar(c: string) {
        getCurrentInputElement().innerText += c;
    }

    function eraseLastChar() {
        const input = getInput();
        if (input.length > 0) {
            setInput(input.substr(0, input.length - 1))
        }
    }

    function getInput() {
        return getCurrentInputElement().innerText;
    }

    function setInput(text: string) {
        getCurrentInputElement().innerText = text;
    }

    function submitInput() {
        const input = getCurrentInputElement();   
        input.id = '';
        var output = commandInterpreter.execute(input.innerText);

        document.getElementById('console')!.innerHTML += `
            <div class="out">
                ${output}
            </div>
            <div class="in">
                <span class="cwd">${fileSystem.getCurrentPath()}</span>&gt; <span class="input" id="currentInput"></span>
            </div>
            `;
    }

    document.querySelector('span.input')!.id = 'currentInput';
    document.querySelectorAll('span.cwd').forEach(function(el) {
        (el as HTMLElement).innerText = fileSystem.getCurrentPath();
    });

    return {
        appendChar,
        eraseLastChar,
        submitInput
    };
}