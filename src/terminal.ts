interface Terminal {
    appendChar(c: string): void;
    eraseLastChar(): void;
    submitInput(): void;
}

function Terminal(commandDispatcher: CommandDispatcher, fileSystem: FileSystem): Terminal {
    function getCurrentInputElement() {
        return document.getElementById('currentInput') as HTMLElement;
    }

    function findLastElement(selector: string) {
        const allElements = document.querySelectorAll(selector);
        if (allElements.length > 0) {
            return allElements[allElements.length - 1];
        }
        else {
            return null;
        }
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
        var output = commandDispatcher.execute(input.innerText);

        document.getElementById('console')!.innerHTML += `
            <div class="out">
                <pre>${output}</pre>
            </div>
            <div class="in">
                <span class="cwd">${fileSystem.getCurrentPath()}</span>&gt; <pre class="input" id="currentInput"></pre>
            </div>
            `;
    }

    findLastElement('.input')!.id = 'currentInput';
    document.querySelectorAll('.cwd').forEach(el => {
        (el as HTMLElement).innerText = fileSystem.getCurrentPath();
    });

    return {
        appendChar,
        eraseLastChar,
        submitInput
    };
}