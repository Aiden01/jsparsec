import { Functor, Monad, Applicative } from './typeclasses';
import { Either, right, left } from 'fp-ts/lib/Either';

type ParseResult<A> = Either<string, [string, A]>;

export const Parser = <A>(f: (string: string) => ParseResult<A>) =>
  new ParserT<A>(f);

export const pure = <A>(x: A) => Parser(stream => right([stream, x]));

const flatten = <A>(arr: A[]): A[] =>
  arr.reduce(
    (acc: A[], curr) =>
      Array.isArray(curr) ? [...acc, ...flatten(curr)] : [...acc, curr],
    []
  );

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

  noConsume() {
    return Parser(stream => this.parse(stream).map(([, r]) => [stream, r]));
  }

  ensure(f: (x: A) => boolean, msg?: string) {
    return Parser(stream =>
      this.parse(stream).chain(([s, r]) => {
        if (f(r)) {
          return right([s, r]);
        }
        return left(msg || 'unknown parse error');
      })
    );
  }

  combine(p: ParserT<A>): ParserT<A[]> {
    return Parser(stream =>
      this.parse(stream).chain(([s, r]) =>
        p.parse(s).map(([ss, r1]) => [ss, flatten([r, r1])])
      )
    );
  }

  or(p: ParserT<A>): ParserT<A> {
    return Parser(stream => {
      const r = this.parse(stream);
      if (r.isRight()) {
        return r;
      }
      return p.parse(stream);
    });
  }

  label(msg: string) {
    return Parser(stream => this.parse(stream).mapLeft(() => msg));
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
