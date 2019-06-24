const {
    combinators: {
        char,
        integerLiteral,
        digit,
        many1,
        stringLiteral
    }
} = require('../dist/')

const separator = () => char('-').or(char('/'))

const day = () => integerLiteral()
    .ensure(x => x >= 1 && x <= 31, "Invalid day")
    .andThenL(separator())

const month = () => integerLiteral()
    .ensure(x => x >= 1 && x <= 12, "Invalid month")
    .andThenL(separator())

const year = () => integerLiteral()

const parser = day()
    .combine(month())
    .combine(year())
    .fmap(([day, month, year]) => ({
        day,
        month,
        year
    }))
console.log(stringLiteral().parse('"Hello"'))
console.log(parser.parse("01/12/2019"))