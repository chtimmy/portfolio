import { describe, expect, it } from 'vitest';
import { splitText } from './split-text';

describe('splitText', () => {
  it('splits into words, dropping whitespace', () => {
    expect(splitText('the quick  brown', 'word')).toEqual(['the', 'quick', 'brown']);
  });

  it('splits into characters, preserving spaces', () => {
    expect(splitText('a b', 'character')).toEqual(['a', ' ', 'b']);
  });

  it('splits into non-empty lines', () => {
    expect(splitText('one\ntwo\n\nthree', 'line')).toEqual(['one', 'two', 'three']);
  });

  it('handles empty input', () => {
    expect(splitText('', 'word')).toEqual([]);
    expect(splitText('', 'character')).toEqual([]);
  });
});
