import { Functor, Monad, Applicative } from './typeclasses';
import { Either } from 'fp-ts/lib/Either';

type ParseResult<A> = Either<string, [string, A]>;

export const Parser = <A>(f: (string: string) => ParseResult<A>) => {
  return new ParserT<A>(f);
};

export const Parsers = <A>([p, ...parsers]: ParserT<A>[]) => {
  return Parser(stream => {
    const trans = (e: any) => e as Either<string, [string, [A]]>;
    const initial = trans(p.parse(stream).map(([s, r]) => [s, [r]]));
    return parsers.reduce(
      (acc, curr) =>
        acc.chain(([s, results]) =>
          trans(curr.parse(s).map(([r]) => [...results, r]))
        ),
      initial
    );
  });
};

export class ParserT<A> implements Functor<A>, Monad<A>, Applicative<A> {
  constructor(private f: (stream: string) => ParseResult<A>) {}
  parse(stream: string) {
    return this.f(stream);
  }

  fmap<B>(f: (x: A) => B): ParserT<B> {
    return Parser(stream => {
      const res = this.parse(stream);
      return res.map(([s, r]) => [s, f(r)]);
    });
  }

  flatMap<B>(f: (x: A) => Monad<B>): Monad<B> {
    return Parser(stream => {
      const res = this.parse(stream);
      return res.chain(([s, r]) => (f(r) as ParserT<B>).parse(s));
    });
  }

  andThenL<B>(x: Applicative<B>): Applicative<A> {
    return Parser(stream => {
      const res = this.parse(stream);
      return res.chain(([s, r]) =>
        ((x as unknown) as ParserT<B>).parse(s).map(([str]) => [str, r])
      );
    });
  }

  andThenR<B>(x: Applicative<B>): Applicative<B> {
    return Parser(stream => {
      const res = this.parse(stream);
      return res.chain(([s]) => ((x as unknown) as ParserT<B>).parse(s));
    });
  }
}
