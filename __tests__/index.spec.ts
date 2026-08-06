import { match, compile } from '../src';

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
