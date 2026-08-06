import { match as ptrMatch, compile as ptrCompile } from 'path-to-regexp';

/**
 * Represents the result of matching a path against a template.
 *
 * When a path matches the template, returns an object with the matched path
 * and extracted parameters. Returns `false` if the path doesn't match.
 *
 * @example
 * ```ts
 * import { match } from '@jswork/path-dual-parser';
 *
 * const matcher = match('/users/{id}');
 * const result = matcher('/users/123');
 *
 * if (result) {
 *   console.log(result.params.id); // '123'
 * }
 * ```
 */
export type MatchResult = { path: string; params: Record<string, string> } | false;

/**
 * Internal representation of a normalized path template.
 *
 * Contains the converted path, detected style, and extracted parameter names.
 */
interface NormalizedTemplate {
  /**
   * The normalized path with all syntax converted to colon style.
   */
  path: string;

  /**
   * Whether the original template used brace style `{param}`.
   */
  isBraceStyle: boolean;

  /**
   * List of parameter names extracted from the template.
   */
  paramNames: string[];
}

const BRACE_RE = /\{(\w+)\}/g;

// Memo cache for parse function
const parseCache = new Map<string, (params: Record<string, string>) => string>();

/**
 * Normalizes a path template to a consistent format.
 *
 * Converts brace-style templates `{param}` to colon-style `:param` and extracts
 * all parameter names. Handles mixed syntax scenarios where both styles are present.
 *
 * @param template - The path template to normalize
 * @returns An object containing the normalized path, style detection, and parameter names
 *
 * @throws {TypeError} When the template is empty
 *
 * @example
 * ```ts
 * // Internal function - converts template to normalized form
 * const result = normalize('/users/{id}');
 * console.log(result.path);      // '/users/:id'
 * console.log(result.paramNames); // ['id']
 * ```
 */
function normalize(template: string): NormalizedTemplate {
  if (!template) {
    throw new TypeError('Template must not be empty');
  }
  const isBraceStyle = BRACE_RE.test(template);
  BRACE_RE.lastIndex = 0;
  const paramNames: string[] = [];

  // 先转换大括号语法，同时提取参数名
  const path = template.replace(BRACE_RE, (_match, name: string) => {
    paramNames.push(name);
    return ':' + name;
  });

  // 提取所有冒号参数（包括混用场景和纯冒号场景）
  const colonRe = /:(\w+)/g;
  let m: RegExpExecArray | null;
  while ((m = colonRe.exec(path)) !== null) {
    // 避免重复添加（大括号已转换的参数已在 paramNames 中）
    if (!paramNames.includes(m[1])) {
      paramNames.push(m[1]);
    }
  }

  return { path, isBraceStyle, paramNames };
}

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
 * // Using colon syntax
 * const matcher1 = match('/users/:id');
 * console.log(matcher1('/users/123')); // { path: '/users/123', params: { id: '123' } }
 *
 * // Using brace syntax (URI Template style)
 * const matcher2 = match('/users/{id}');
 * console.log(matcher2('/users/456')); // { path: '/users/456', params: { id: '456' } }
 *
 * // No match
 * console.log(matcher1('/posts/123')); // false
 * ```
 *
 * @see {@link compile} For generating paths from parameters
 * @see {@link parse} For one-shot path generation
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
 * // Using colon syntax
 * const compiler1 = compile('/users/:id');
 * console.log(compiler1({ id: '123' })); // '/users/123'
 *
 * // Using brace syntax (URI Template style)
 * const compiler2 = compile('/users/{id}');
 * console.log(compiler2({ id: '456' })); // '/users/456'
 *
 * // Multiple parameters
 * const compiler3 = compile('/posts/:postId/comments/:commentId');
 * console.log(compiler3({ postId: '1', commentId: '42' })); // '/posts/1/comments/42'
 * ```
 *
 * @see {@link match} For matching paths against templates
 * @see {@link parse} For one-shot path generation with memoization
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
 * // Using colon syntax
 * console.log(parse('/users/:id', { id: '123' })); // '/users/123'
 *
 * // Using brace syntax (URI Template style)
 * console.log(parse('/users/{id}', { id: '456' })); // '/users/456'
 *
 * // Multiple parameters
 * console.log(parse('/posts/:postId/comments/:commentId', {
 *   postId: '1',
 *   commentId: '42'
 * })); // '/posts/1/comments/42'
 * ```
 *
 * @remarks
 * This function caches the compiled template internally, making it efficient
 * for repeated calls with the same template but different parameters.
 *
 * @see {@link compile} For creating reusable compiler functions
 * @see {@link match} For matching paths against templates
 */
export function parse(template: string, data: Record<string, string>): string {
  let compiler = parseCache.get(template);
  if (!compiler) {
    compiler = compile(template);
    parseCache.set(template, compiler);
  }
  return compiler(data);
}
