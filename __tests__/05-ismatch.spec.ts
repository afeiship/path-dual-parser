import { isMatch } from '../src';

describe('isMatch', () => {
  test('colon style - match true', () => {
    expect(isMatch('/users/:id', '/users/123')).toBe(true);
  });

  test('colon style - match false', () => {
    expect(isMatch('/users/:id', '/posts/123')).toBe(false);
  });

  test('brace style - match true', () => {
    expect(isMatch('/users/{id}', '/users/123')).toBe(true);
  });

  test('brace style - match false', () => {
    expect(isMatch('/users/{id}', '/posts/123')).toBe(false);
  });

  test('no params template', () => {
    expect(isMatch('/users', '/users')).toBe(true);
    expect(isMatch('/users', '/posts')).toBe(false);
  });

  test('mixed syntax', () => {
    expect(isMatch('/users/:userId/posts/{postId}', '/users/1/posts/2')).toBe(true);
    expect(isMatch('/users/:userId/posts/{postId}', '/users/1/posts/2/extra')).toBe(false);
  });
});