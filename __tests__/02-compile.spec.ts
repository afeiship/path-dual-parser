import { compile } from '../src';

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