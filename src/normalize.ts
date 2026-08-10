import { NormalizedTemplate } from './types';

const BRACE_RE = /\{(\w+)\}/g;

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
export function normalize(template: string): NormalizedTemplate {
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