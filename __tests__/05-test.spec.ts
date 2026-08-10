import { test } from '../src';

describe('test', () => {
  test('colon style - match true', () => {
    expect(test('/users/:id', '/users/123')).toBe(true);
  });

  test('colon style - match false', () => {
    expect(test('/users/:id', '/posts/123')).toBe(false);
  });

  test('brace style - match true', () => {
    expect(test('/users/{id}', '/users/123')).toBe(true);
  });

  test('brace style - match false', () => {
    expect(test('/users/{id}', '/posts/123')).toBe(false);
  });

  test('no params template', () => {
    expect(test('/users', '/users')).toBe(true);
    expect(test('/users', '/posts')).toBe(false);
  });

  test('mixed syntax', () => {
    expect(test('/users/:userId/posts/{postId}', '/users/1/posts/2')).toBe(true);
    expect(test('/users/:userId/posts/{postId}', '/users/1/posts/2/extra')).toBe(false);
  });
});