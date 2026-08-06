import { parse } from '../src';

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