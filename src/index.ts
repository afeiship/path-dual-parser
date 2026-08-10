import { match as ptrMatch, compile as ptrCompile } from 'path-to-regexp';
import { MatchResult } from './types';
import { normalize } from './normalize';

// Memo cache for parse function
const parseCache = new Map<string, (params: Record<string, string>) => string>();

export type { MatchResult } from './types';

/**
 * Creates a path matcher function for the given template.
 *
 * The returned function tests paths against the template and extracts parameters.
 * Supports both colon syntax (`:param`) and brace syntax (`{param}`).
 *
 * @param template - The path template (e.g., `/users/:id` or `/users/{id}`)
 * @returns A matcher function that takes a path and returns the match result
 *
 * @example
 * ```ts
 * import { match } from '@jswork/path-dual-parser';
 *
 * const matcher1 = match('/users/:id');
 * console.log(matcher1('/users/123')); // { path: '/users/123', params: { id: '123' } }
 *
 * const matcher2 = match('/users/{id}');
 * console.log(matcher2('/users/456')); // { path: '/users/456', params: { id: '456' } }
 *
 * console.log(matcher1('/posts/123')); // false
 * ```
 */
export function match(template: string): (path: string) => MatchResult {
  const { path: normalizedPath } = normalize(template);
  const fn = ptrMatch<Record<string, string>>(normalizedPath);
  return (path: string): MatchResult => fn(path) as MatchResult;
}

/**
 * Creates a path compiler function for the given template.
 *
 * The returned function generates paths by filling parameters into the template.
 * Supports both colon syntax (`:param`) and brace syntax (`{param}`).
 *
 * @param template - The path template (e.g., `/users/:id` or `/users/{id}`)
 * @returns A compiler function that takes parameters and returns the generated path
 *
 * @example
 * ```ts
 * import { compile } from '@jswork/path-dual-parser';
 *
 * const compiler1 = compile('/users/:id');
 * console.log(compiler1({ id: '123' })); // '/users/123'
 *
 * const compiler2 = compile('/users/{id}');
 * console.log(compiler2({ id: '456' })); // '/users/456'
 *
 * const compiler3 = compile('/posts/:postId/comments/:commentId');
 * console.log(compiler3({ postId: '1', commentId: '42' })); // '/posts/1/comments/42'
 * ```
 */
export function compile(template: string): (params: Record<string, string>) => string {
  const { path: normalizedPath } = normalize(template);
  return ptrCompile<Record<string, string>>(normalizedPath);
}

/**
 * Generates a path from a template and parameters in a single step.
 *
 * This is a convenience function that compiles the template and generates the path
 * with built-in memoization for better performance when called repeatedly with the
 * same template.
 *
 * @param template - The path template (e.g., `/users/:id` or `/users/{id}`)
 * @param data - The parameters to fill into the template
 * @returns The generated path with parameters substituted
 *
 * @example
 * ```ts
 * import { parse } from '@jswork/path-dual-parser';
 *
 * parse('/users/:id', { id: '123' });      // '/users/123'
 * parse('/users/{id}', { id: '456' });     // '/users/456'
 * parse('/posts/:postId/comments/:commentId', { postId: '1', commentId: '42' }); // '/posts/1/comments/42'
 * ```
 */
export function parse(template: string, data: Record<string, string>): string {
  let compiler = parseCache.get(template);
  if (!compiler) {
    compiler = compile(template);
    parseCache.set(template, compiler);
  }
  return compiler(data);
}

/**
 * Extracts parameter names from a path template.
 *
 * Supports both colon syntax (`:param`) and brace syntax (`{param}`).
 *
 * @param template - The path template to extract parameters from
 * @returns An array of parameter names in the order they appear
 *
 * @example
 * ```ts
 * import { params } from '@jswork/path-dual-parser';
 *
 * params('/users/:id/posts/{postId}')  // ['id', 'postId']
 * params('/users')                     // []
 * ```
 */
export function params(template: string): string[] {
  return normalize(template).paramNames;
}

/**
 * Checks whether a path matches a template.
 *
 * Returns a boolean result without extracting parameters.
 * Useful for quick route matching checks.
 *
 * @param template - The path template (e.g., `/users/:id` or `/users/{id}`)
 * @param path - The actual path to test
 * @returns `true` if the path matches the template, `false` otherwise
 *
 * @example
 * ```ts
 * import { isMatch } from '@jswork/path-dual-parser';
 *
 * isMatch('/users/:id', '/users/123')  // true
 * isMatch('/users/:id', '/posts/1')    // false
 * ```
 */
export function isMatch(template: string, path: string): boolean {
  return match(template)(path) !== false;
}