import { match, compile, parse } from '../src';

describe('match', () => {
  test('colon style - match success', () => {
    const fn = match('/users/:id');
    const result = fn('/users/123');
    expect(result).not.toBe(false);
    if (result) {
      expect(result.params.id).toBe('123');
    }
  });

  test('colon style - match failure', () => {
    const fn = match('/users/:id');
    expect(fn('/posts/123')).toBe(false);
  });

  test('brace style - match success', () => {
    const fn = match('/users/{id}');
    const result = fn('/users/123');
    expect(result).not.toBe(false);
    if (result) {
      expect(result.params.id).toBe('123');
    }
  });

  test('brace style - match failure', () => {
    const fn = match('/users/{id}');
    expect(fn('/posts/123')).toBe(false);
  });

  test('no params template', () => {
    const fn = match('/users');
    const result = fn('/users');
    expect(result).not.toBe(false);
    if (result) {
      expect(result.params).toEqual({});
    }
  });

  test('multi params - colon style', () => {
    const fn = match('/users/:userId/posts/:postId');
    const result = fn('/users/1/posts/2');
    expect(result).not.toBe(false);
    if (result) {
      expect(result.params.userId).toBe('1');
      expect(result.params.postId).toBe('2');
    }
  });

  test('multi params - brace style', () => {
    const fn = match('/users/{userId}/posts/{postId}');
    const result = fn('/users/1/posts/2');
    expect(result).not.toBe(false);
    if (result) {
      expect(result.params.userId).toBe('1');
      expect(result.params.postId).toBe('2');
    }
  });

  test('mixed syntax', () => {
    const fn = match('/users/:userId/posts/{postId}');
    const result = fn('/users/1/posts/2');
    expect(result).not.toBe(false);
    if (result) {
      expect(result.params.userId).toBe('1');
      expect(result.params.postId).toBe('2');
    }
  });

  test('empty template throws', () => {
    expect(() => match('')).toThrow(TypeError);
  });
});

describe('compile', () => {
  test('colon style - generate URL', () => {
    const fn = compile('/users/:id');
    expect(fn({ id: '123' })).toBe('/users/123');
  });

  test('brace style - generate URL', () => {
    const fn = compile('/users/{id}');
    expect(fn({ id: '123' })).toBe('/users/123');
  });

  test('no params template', () => {
    const fn = compile('/users');
    expect(fn({})).toBe('/users');
  });

  test('multi params - colon style', () => {
    const fn = compile('/users/:userId/posts/:postId');
    expect(fn({ userId: '1', postId: '2' })).toBe('/users/1/posts/2');
  });

  test('multi params - brace style', () => {
    const fn = compile('/users/{userId}/posts/{postId}');
    expect(fn({ userId: '1', postId: '2' })).toBe('/users/1/posts/2');
  });

  test('mixed syntax', () => {
    const fn = compile('/users/:userId/posts/{postId}');
    expect(fn({ userId: '1', postId: '2' })).toBe('/users/1/posts/2');
  });
});

describe('parse', () => {
  test('colon style - parse to URL', () => {
    expect(parse('/users/:id', { id: '123' })).toBe('/users/123');
  });

  test('brace style - parse to URL', () => {
    expect(parse('/users/{id}', { id: '123' })).toBe('/users/123');
  });

  test('no params template', () => {
    expect(parse('/users', {})).toBe('/users');
  });

  test('multi params - colon style', () => {
    expect(parse('/users/:userId/posts/:postId', { userId: '1', postId: '2' })).toBe('/users/1/posts/2');
  });

  test('multi params - brace style', () => {
    expect(parse('/users/{userId}/posts/{postId}', { userId: '1', postId: '2' })).toBe('/users/1/posts/2');
  });

  test('mixed syntax', () => {
    expect(parse('/users/:userId/posts/{postId}', { userId: '1', postId: '2' })).toBe('/users/1/posts/2');
  });

  test('memoization - same template multiple calls', () => {
    const template = '/users/:id/posts/:postId';
    const result1 = parse(template, { id: '1', postId: 'a' });
    const result2 = parse(template, { id: '2', postId: 'b' });
    const result3 = parse(template, { id: '3', postId: 'c' });

    expect(result1).toBe('/users/1/posts/a');
    expect(result2).toBe('/users/2/posts/b');
    expect(result3).toBe('/users/3/posts/c');
  });
});
