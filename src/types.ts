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
export interface NormalizedTemplate {
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