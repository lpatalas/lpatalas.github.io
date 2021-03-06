interface CommandDispatcher {
    execute(input: string): string;
}

function CommandDispatcher(tokenize: (input: string) => string[], commands: CommandMap): CommandDispatcher {
    function execute(commandText: string) {
        const tokens = tokenize(commandText);
        if (tokens.length === 0) {
            return '';
        }
        else {
            const [commandName, ...args] = tokens;
            const command = commands[commandName];
            if (command) {
                try {
                    return command.apply({}, args);
                }
                catch (e) {
                    if (e instanceof Error) {
                        return `ERROR '${commandName}': ${e.message}`;
                    }

                    return `ERROR: ${e}`;
                }
            }
            else {
                return `Unknown command: ${commandName}`;
            }
        }
    }

    return {
        execute
    };
}