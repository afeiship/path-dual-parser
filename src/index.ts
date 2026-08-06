import { match as ptrMatch, compile as ptrCompile } from 'path-to-regexp';

export type MatchResult = { path: string; params: Record<string, string> } | false;

interface NormalizedTemplate {
  path: string;
  isBraceStyle: boolean;
  paramNames: string[];
}

const BRACE_RE = /\{(\w+)\}/g;

// Memo cache for parse function
const parseCache = new Map<string, (params: Record<string, string>) => string>();

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

export function match(template: string): (path: string) => MatchResult {
  const { path: normalizedPath } = normalize(template);
  const fn = ptrMatch<Record<string, string>>(normalizedPath);
  return (path: string): MatchResult => fn(path) as MatchResult;
}

export function compile(template: string): (params: Record<string, string>) => string {
  const { path: normalizedPath } = normalize(template);
  return ptrCompile<Record<string, string>>(normalizedPath);
}

export function parse(template: string, data: Record<string, string>): string {
  let compiler = parseCache.get(template);
  if (!compiler) {
    compiler = compile(template);
    parseCache.set(template, compiler);
  }
  return compiler(data);
}
