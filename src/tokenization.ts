function tokenize(input: string): string[] {
    const tokens = [];
    let parseResult = parseNextToken(input);
    while (parseResult != null) {
        tokens.push(parseResult.token);
        parseResult = parseNextToken(parseResult.rest);
    }

    return tokens;

    function parseNextToken(input: string) {
        let i = 0;

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

    function parseQuotedToken(input: string, startIndex: number) {
        const endIndex = skipWhile(isNotQuote, input, startIndex + 1)
        const restIndex = endIndex < input.length ? endIndex + 1 : endIndex;
        const token = input.substring(startIndex + 1, endIndex).replace('\\"', '"');

        return {
            token: token,
            rest: input.substring(restIndex)
        }
    }

    function isNotQuote(c: string, prev: string | null) {
        return c !== '"' || prev === '\\';
    }

    function parseUnquotedToken(input: string, startIndex: number) {
        const endIndex = skipWhile(isNotWhitespace, input, startIndex);

        return {
            token: input.substring(startIndex, endIndex),
            rest: input.substring(endIndex)
        };
    }

    function skipWhile(predicate: (c: string, prev: string | null) => boolean, input: string, startIndex: number) {
        let i = startIndex;

        while (i < input.length && predicate(input[i], i > 0 ? input[i - 1] : null)) {
            i++;
        }

        return i;
    }

    function isWhitespace(c: string) {
        return c === ' ' || c === '\t';
    }

    function isNotWhitespace(c: string) {
        return !isWhitespace(c);
    }
}