import { Parser } from './Parser';
import { right, left } from 'fp-ts/lib/Either';

export const char = (c: string) =>
  Parser(stream => {
    const [x, ...xs] = Array.from(stream);
    if (x === c) {
      return right([x, xs.join('')]);
    }
    return left(`Expected char ${c}`);
  });
