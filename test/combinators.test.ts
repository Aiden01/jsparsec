import { combinators as parsers } from '../src';

test('parses a char', () => {
  const parser = parsers.char('h');
  const r1 = parser.parse('hello');
  const r2 = parser.parse('bonjour');
  expect(r1.isRight()).toBeTruthy();
  expect(r2.isLeft()).toBeTruthy();
});

test('many1', () => {
  const parser = parsers.many1(parsers.digit());
  const r1 = parser.parse('1234');
  const r2 = parser.parse('a123');
  expect(r1.isRight()).toBeTruthy();
  expect(r2.isLeft()).toBeTruthy();
});

test('many', () => {
  const parser = parsers.many(parsers.digit());
  const r1 = parser.parse('1234');
  const r2 = parser.parse('a123');
  expect(r1.isRight()).toBeTruthy();
  expect(r2.isLeft()).toBeFalsy();
});
