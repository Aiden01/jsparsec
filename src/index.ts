import * as combinators from './combinators';
import * as parser from './Parser';
import * as typeclasses from './typeclasses';
module.exports = { ...combinators, ...parser, ...typeclasses };
