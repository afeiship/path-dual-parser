# path-dual-parser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个轻量 TS 路由路径匹配工具，同时兼容 `:param` 和 `{param}` 两种参数语法，基于 path-to-regexp v8 封装。

**Architecture:** 模板预处理方案——将 `{param}` 统一转换为 `:param`，透传给 path-to-regexp v8 的 `match`/`compile`，compile 输出已是最终 URL 无需还原。

**Tech Stack:** TypeScript, path-to-regexp v8, tsup, bun test

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/index.ts` | 核心实现：normalize、match、compile 导出 |
| `__tests__/index.spec.ts` | 单元测试 |
| `package.json` | 添加 path-to-regexp 依赖，更新 keywords |
| `tsconfig.json` | target 放宽到 es2015 |
| `tsup.config.ts` | UMD libraryName 修正 |
| `llms.txt` | AI 友好文档 |

---

### Task 1: 项目配置更新

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `tsup.config.ts`

- [ ] **Step 1: 更新 package.json keywords**

将 keywords 从模板占位内容改为有意义的值：

```json
"keywords": [
  "path",
  "route",
  "matcher",
  "path-to-regexp",
  "uri-template",
  "dual-syntax"
]
```

- [ ] **Step 2: 更新 tsconfig.json target**

将 `"target": "es5"` 改为 `"target": "es2015"`，因为 path-to-regexp v8 使用了现代语法。

- [ ] **Step 3: 修正 tsup.config.ts UMD libraryName**

将 `libraryName: 'urlLiteral'` 改为 `libraryName: 'pathDualParser'`。

- [ ] **Step 4: 提交**

```bash
git add package.json tsconfig.json tsup.config.ts
git commit -m "chore: update project config for path-dual-parser"
```

---

### Task 2: 实现 normalize 函数

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: 写 normalize 函数**

替换 `src/index.ts` 全部内容：

```ts
import { match as ptrMatch, compile as ptrCompile } from 'path-to-regexp';

export type MatchResult = { path: string; params: Record<string, string> } | false;

interface NormalizedTemplate {
  path: string;
  isBraceStyle: boolean;
  paramNames: string[];
}

const BRACE_RE = /\{(\w+)\}/g;

function normalize(template: string): NormalizedTemplate {
  if (!template) {
    throw new TypeError('Template must not be empty');
  }
  const isBraceStyle = BRACE_RE.test(template);
  BRACE_RE.lastIndex = 0;
  const paramNames: string[] = [];
  const path = template.replace(BRACE_RE, (_match, name: string) => {
    paramNames.push(name);
    return ':' + name;
  });
  // 如果是冒号风格，也提取参数名
  if (!isBraceStyle) {
    const colonRe = /:(\w+)/g;
    let m: RegExpExecArray | null;
    while ((m = colonRe.exec(path)) !== null) {
      paramNames.push(m[1]);
    }
  }
  return { path, isBraceStyle, paramNames };
}
```

- [ ] **Step 2: 提交**

```bash
git add src/index.ts
git commit -m "feat: add normalize function for dual syntax conversion"
```

---

### Task 3: 实现 match 函数 + 测试

**Files:**
- Modify: `src/index.ts`
- Modify: `__tests__/index.spec.ts`

- [ ] **Step 1: 写 match 的失败测试**

替换 `__tests__/index.spec.ts` 全部内容：

```ts
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
```

- [ ] **Step 2: 运行测试确认失败**

```bash
pnpm test
```

Expected: FAIL — `match` 未导出

- [ ] **Step 3: 实现 match 函数**

在 `src/index.ts` 的 normalize 函数后面添加：

```ts
export function match(template: string): (path: string) => MatchResult {
  const { path: normalizedPath } = normalize(template);
  const fn = ptrMatch<Record<string, string>>(normalizedPath);
  return (path: string): MatchResult => fn(path) as MatchResult;
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
pnpm test
```

Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/index.ts __tests__/index.spec.ts
git commit -m "feat: implement match function with dual syntax support"
```

---

### Task 4: 实现 compile 函数 + 测试

**Files:**
- Modify: `src/index.ts`
- Modify: `__tests__/index.spec.ts`

- [ ] **Step 1: 添加 compile 的失败测试**

在 `__tests__/index.spec.ts` 的 `describe('match', ...)` 后面追加：

```ts
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
```

- [ ] **Step 2: 运行测试确认失败**

```bash
pnpm test
```

Expected: FAIL — `compile` 未导出

- [ ] **Step 3: 实现 compile 函数**

在 `src/index.ts` 的 match 函数后面添加：

```ts
export function compile(template: string): (params: Record<string, string>) => string {
  const { path: normalizedPath } = normalize(template);
  return ptrCompile<Record<string, string>>(normalizedPath);
}
```

- [ ] **Step 4: 运行测试确认通过**

```bash
pnpm test
```

Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/index.ts __tests__/index.spec.ts
git commit -m "feat: implement compile function with dual syntax support"
```

---

### Task 5: 构建验证

**Files:**
- No new files

- [ ] **Step 1: 运行构建**

```bash
pnpm build
```

Expected: 成功输出 `dist/index.cjs.js`, `dist/index.esm.js`, `dist/index.umd.js`, `dist/index.d.ts`

- [ ] **Step 2: 验证类型声明**

```bash
cat dist/index.d.ts
```

Expected: 包含 `match` 和 `compile` 的导出声明

- [ ] **Step 3: 提交构建产物（如已在 .gitignore 中则跳过）**

检查 `.gitignore` 是否包含 `dist`，如果包含则跳过此步。

---

### Task 6: 更新 README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 重写 README.md**

```md
# path-dual-parser
> Path matcher supporting both colon and brace URI template syntax.

[![version][version-image]][version-url]
[![license][license-image]][license-url]
[![download][download-image]][download-url]

## installation
```shell
pnpm add @jswork/path-dual-parser
```

## usage

### match

Match a path against a template, supports both `:param` and `{param}` syntax:

```ts
import { match } from '@jswork/path-dual-parser';

const m1 = match('/users/:id');
const m2 = match('/users/{id}');

m1('/users/123');  // { path: '/users/123', params: { id: '123' } }
m2('/users/123');  // { path: '/users/123', params: { id: '123' } }
m1('/other');      // false
```

### compile

Compile a template into a URL generator:

```ts
import { compile } from '@jswork/path-dual-parser';

const c1 = compile('/users/:id');
const c2 = compile('/users/{id}');

c1({ id: '123' });  // '/users/123'
c2({ id: '123' });  // '/users/123'
```

## license
Code released under [the MIT license](https://github.com/afeiship/path-dual-parser/blob/main/LICENSE.txt).

[version-image]: https://img.shields.io/npm/v/@jswork/path-dual-parser
[version-url]: https://npmjs.org/package/@jswork/path-dual-parser

[license-image]: https://img.shields.io/npm/l/@jswork/path-dual-parser
[license-url]: https://github.com/afeiship/path-dual-parser/blob/main/LICENSE.txt

[download-image]: https://img.shields.io/npm/dm/@jswork/path-dual-parser
[download-url]: https://www.npmjs.com/package/@jswork/path-dual-parser
```

- [ ] **Step 2: 提交**

```bash
git add README.md
git commit -m "docs: update README with match/compile API usage"
```

---

### Task 7: 输出 llms.txt

**Files:**
- Create: `llms.txt`

- [ ] **Step 1: 创建 llms.txt**

```txt
# path-dual-parser

Lightweight TypeScript route path matcher supporting both `:param` (path-to-regexp) and `{param}` (URI-Template / OpenAPI) syntax.

## Installation

pnpm add @jswork/path-dual-parser

## API

### match(template: string): (path: string) => MatchResult | false

Match a path against a template. Returns a function that takes a path string and returns either `{ path, params }` or `false`.

- `:param` style: `match('/users/:id')('/users/123')` → `{ path: '/users/123', params: { id: '123' } }`
- `{param}` style: `match('/users/{id}')('/users/123')` → `{ path: '/users/123', params: { id: '123' } }`
- No match: `match('/users/:id')('/other')` → `false`

### compile(template: string): (params: Record<string, string>) => string

Compile a template into a URL generator function.

- `:param` style: `compile('/users/:id')({ id: '123' })` → `'/users/123'`
- `{param}` style: `compile('/users/{id}')({ id: '123' })` → `'/users/123'`

## Types

```ts
type MatchResult = { path: string; params: Record<string, string> } | false;

function match(template: string): (path: string) => MatchResult;
function compile(template: string): (params: Record<string, string>) => string;
```

## Notes

- Based on path-to-regexp v8
- Mixed syntax (`:id/{name}`) is supported
- ESM + CJS + UMD output
- Browser and Node.js compatible
```

- [ ] **Step 2: 提交**

```bash
git add llms.txt
git commit -m "docs: add llms.txt for AI consumption"
```
