import { get, set } from '../src/utils/helpers';

describe('Get', () => {
  it('should return value', async () => {
    const extracted = get({ a: { b: 1 } }, 'a.b');
    expect(extracted).toBe(1);
  });

  it('should return undefined from not existing path', async () => {
    const extracted = get({ a: { b: 1 } }, 'a.b.c.d');
    expect(extracted).toBeUndefined();
  });
});

describe('Set', () => {
  it('should set value in exixting path', async () => {
    const a = { a: { b: 1 } };
    set(a, 'a.b', 2);
    expect(a.a.b).toBe(2);
  });

  it('should set value in not existing path', async () => {
    const a = { a: { b: 1 } } as any;
    set(a, 'a.c.b.d', 2);
    expect(a.a.c.b.d).toBe(2);
  });
});

// todo uuid, isString, isObject, isFunction
