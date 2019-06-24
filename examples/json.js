const {
    combinators: {
        char,
        integerLiteral,
        digit,
        many1,
        many,
        colon: _colon,
        spaces,
        braces,
        brackets,
        sepBy,
        letter,
        stringLiteral,
    },
} = require('../dist/');
const R = require('ramda');

const lexeme = p => p.andThenL(spaces());
const identifier = () => lexeme(many1(letter()));
const colon = () => lexeme(_colon());
const commaSep = (p) => sepBy(lexeme(char(',')), p)
const parseJSONValue = integerLiteral().or(stringLiteral()).or(parseArray)

const parsePair = () =>
    identifier().andThenL(colon()).combine(
        parseJSONValue).fmap(([key, value]) => ({
        [key]: value,
    }));

const parseObject = () => braces(commaSep(parsePair()))
const parseArray = brackets(commaSep(parseJSONValue))


console.log(parseObject().parse('{x: 2, y: 3}').value);