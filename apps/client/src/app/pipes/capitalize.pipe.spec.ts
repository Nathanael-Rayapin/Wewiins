import { CapitalizePipe } from "./capitalize.pipe";

describe('CapitalizePipe', () => {
  const pipe = new CapitalizePipe();

  it.concurrent('transforms "abc" to "Abc"', () => {
    expect(pipe.transform('abc')).toBe('Abc');
  });

  it.concurrent('transforms "abc def" to "Abc Def"', () => {
    expect(pipe.transform('abc def')).toBe('Abc Def');
  });

  it.concurrent('keeps already capitalized words intact', () => {
    expect(pipe.transform('Abc Def')).toBe('Abc Def');
  });

  it.concurrent('handles mixed casing correctly', () => {
    expect(pipe.transform('aBc dEf')).toBe('Abc Def');
  });

  it.concurrent('handles a single character', () => {
    expect(pipe.transform('a')).toBe('A');
  });

  it.concurrent('handles multiple spaces between words', () => {
    expect(pipe.transform('abc   def')).toBe('Abc   Def');
  });

  it.concurrent('handles leading and trailing spaces', () => {
    expect(pipe.transform('  abc def  ')).toBe('  Abc Def  ');
  });

  it.concurrent('returns empty string when input is empty', () => {
    expect(pipe.transform('')).toBe('');
  });

  it.concurrent('returns input unchanged if it contains no letters', () => {
    expect(pipe.transform('123 !?')).toBe('123 !?');
  });
});
