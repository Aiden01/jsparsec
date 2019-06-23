import { Parser, ParserT } from './Parser';
import { right, left } from 'fp-ts/lib/Either';

export const satisfy = (f: (c: string) => boolean) =>
  Parser(stream => {
    const [x, ...xs] = Array.from(stream);
    if (f(x)) {
      return right([x, xs.join('')]);
    }
    return left('unknown parse error');
  });

export const choice = <A>(parsers: ParserT<A>[]) =>
  parsers.reduce((prev, curr) => prev.or(curr));

export const char = (c: string) =>
  satisfy(x => x === c).label(`Expected char ${c}`);

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

export const many1 = <A>(p: ParserT<A>) => p.andThenR(many(p));

export const digit = () =>
  satisfy(c => !Number.isNaN(Number(c))).label('Expected digit');

export const integerLiteral = () => many1(digit());
