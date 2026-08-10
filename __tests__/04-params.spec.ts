import { params } from '../src';

describe('params', () => {
  test('colon style - extract params', () => {
    expect(params('/users/:id')).toEqual(['id']);
  });

  test('brace style - extract params', () => {
    expect(params('/users/{id}')).toEqual(['id']);
  });

  test('no params template', () => {
    expect(params('/users')).toEqual([]);
  });

  test('multi params - colon style', () => {
    expect(params('/users/:userId/posts/:postId')).toEqual(['userId', 'postId']);
  });

  test('multi params - brace style', () => {
    expect(params('/users/{userId}/posts/{postId}')).toEqual(['userId', 'postId']);
  });

  test('mixed syntax', () => {
    // 大括号参数先收集，冒号参数后收集（与 normalize 内部逻辑一致）
    expect(params('/users/:userId/posts/{postId}')).toEqual(['postId', 'userId']);
  });
});