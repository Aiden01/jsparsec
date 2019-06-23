const {
    combinators: {
        char
    }
} = require('../dist/')

const parser = char('c')
console.log(parser.parse("chello"))