import { Parser, ParserT, pure } from './Parser';
import { right, left } from 'fp-ts/lib/Either';

const toArray = (s: string) => Array.from(s);
export const satisfy = (f: (c: string) => boolean) =>
  Parser(stream => {
    const [x, ...xs] = toArray(stream);
    if (f(x)) {
      return right([xs.join(''), x]);
    }
    return left('unknown parse error');
  });

export const oneOf = (items: string) =>
  satisfy(c => items.includes(c)).label(`Expected one of ${items}`);

export const noneOf = (items: string) =>
  satisfy(c => !items.includes(c)).label(`Expected none of ${items}`);

export const choice = <A>(parsers: ParserT<A>[]) =>
  parsers.reduce((prev, curr) => prev.or(curr));

export const letter = () => satisfy(x => /[a-zA-Z]/g.test(x));

export const char = (c: string) =>
  satisfy(x => x === c).label(`Expected char ${c}`);

export const string = (str: string) =>
  Parser(stream => {
    if (!stream.startsWith(str)) {
      return left(`Expected string ${str}`);
    }
    const s = stream.slice(str.length, stream.length - 1);
    return right([s, str]);
  });

const escape = () =>
  char('\\')
    .combine(oneOf('\\"0nrvtbf'))
    .fmap(xs => xs.join(''));

const nonEscape = () => noneOf('\\"\0\n\r\v\t\b\f');
const characters = () => many(escape().or(nonEscape())).fmap(x => x.join(''));
export const stringLiteral = () =>
  char('"')
    .andThenR(characters())
    .andThenL(char('"')) as ParserT<string>;

const _many = <A>(
  stream: string,
  p: ParserT<A>,
  results: A[]
): [string, A[]] => {
  const r = p.parse(stream);
  if (r.isLeft()) {
    return [stream, results];
  }
  const [newStream, result] = r.value;
  return _many(newStream, p, [...results, result]);
};

export const many = <A>(p: ParserT<A>) =>
  Parser(stream => right(_many(stream, p, [])));

export const many1 = <A>(p: ParserT<A>) =>
  p.noConsume().andThenR(many(p)) as ParserT<A[]>;

export const digit = () =>
  satisfy(c => !Number.isNaN(Number(c))).label('Expected digit');

export const between = <A, B>(p1: ParserT<A>, p2: ParserT<B>, p3: ParserT<A>) =>
  p1.andThenR(p2).andThenL(p3);

export const parens = <A>(p: ParserT<A>) => between(char('('), p, char(')'));
export const brackets = <A>(p: ParserT<A>) => between(char('['), p, char(']'));
export const braces = <A>(p: ParserT<A>) => between(char('{'), p, char('}'));
export const angles = <A>(p: ParserT<A>) => between(char('<'), p, char('>'));

export const colon = () => char(':');
export const semi = () => char(';');
export const space = () => oneOf(' \n');
export const comma = () => char(',');
export const spaces = () => many(space());

export const sepBy1 = <A, B>(sep: ParserT<A>, p: ParserT<B>) =>
  p.flatMap(x =>
    many(sep.andThenR(p) as ParserT<B>).fmap(xs => [x, ...xs])
  ) as ParserT<B[]>;

export const sepBy = <A, B>(sep: ParserT<A>, p: ParserT<B>) =>
  sepBy1(sep, p).or(pure([]));

export const commaSep = <A>(p: ParserT<A>) => sepBy(comma(), p);

export const integerLiteral = () =>
  many1(digit()).fmap(x => Number(x.join('')));
