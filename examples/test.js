const {
    combinators: {
        char
    }
} = require('../dist/')

const p1 = char('h')
const p2 = char('e')
const parser = p1.combine(p2)
    .combine(char('l'))
    .fmap(([a, b, c]) => ({
        a,
        b,
        c
    }))
console.log(parser.parse("hello"))