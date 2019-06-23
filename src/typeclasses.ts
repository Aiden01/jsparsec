export interface Functor<A> {
  fmap: <B>(f: (x: A) => B) => Functor<B>;
}

export interface Monad<A> {
  flatMap: <B>(f: (x: A) => Monad<B>) => Monad<B>;
}

export interface Applicative<A> {
  andThenL: <B>(p: Applicative<B>) => Applicative<A>;
  andThenR: <B>(p: Applicative<B>) => Applicative<B>;
}
