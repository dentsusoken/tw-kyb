import { describe, it, expect } from 'vitest';

import { convertBytesToString } from './cryptoUtils';

describe('cryptoUtils', () => {
  it('convertBytesToString', () => {
    expect(convertBytesToString(new Uint8Array([1, 2, 3, 4]))).toEqual('BCDE');
  });
});
