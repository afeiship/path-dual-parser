# path-dual-parser Design

## Overview

轻量前端 TS 工具库，路由路径匹配，同时兼容两种参数语法：
- 语法1：`/path/:id`（path-to-regexp 冒号风格）
- 语法2：`/path/{id}`（URI-Template 大括号 OpenAPI 风格）

基于 path-to-regexp v8 封装，对外提供 `match` 和 `compile` 两个核心 API。

## Architecture

**方案：模板预处理 + 透传**

```
用户输入模板（可能是 :param 或 {param} 风格）
        ↓
  normalize(): {param} → :param，记录原始风格
        ↓
  path-to-regexp v8 的 match() / compile()
        ↓
  denormalize(): 如果原始是 {param} 风格，compile 结果中 :param → {param}
        ↓
  返回结果
```

核心就是一层薄薄的语法转换 + 结果还原，完全复用 path-to-regexp 的匹配和编译能力。

## API

### `match(template)`

路径匹配函数。返回一个 matcher 函数，传入实际路径返回匹配结果。

```ts
type MatchResult = { path: string; params: Record<string, string> } | false;

function match(template: string): (path: string) => MatchResult;
```

```ts
import { match } from '@jswork/path-dual-parser';

const m1 = match('/users/:id');
const m2 = match('/users/{id}');

m1('/users/123');  // { path: '/users/123', params: { id: '123' } }
m2('/users/123');  // { path: '/users/123', params: { id: '123' } }
m1('/other');      // false
```

### `compile(template)`

路径编译函数。返回一个 compiler 函数，传入参数对象生成 URL。

```ts
function compile(template: string): (params: Record<string, string>) => string;
```

```ts
import { compile } from '@jswork/path-dual-parser';

const c1 = compile('/users/:id');
const c2 = compile('/users/{id}');

c1({ id: '123' });  // '/users/123'
c2({ id: '123' });  // '/users/123'
```

## Internal

### normalize(template)

将 `{param}` 语法统一转换为 `:param` 语法，同时记录原始风格和参数名列表。

```ts
interface NormalizedTemplate {
  path: string;           // 统一为 :param 风格的路径
  isBraceStyle: boolean;  // 原始是否为 {param} 风格
  paramNames: string[];   // 提取的参数名列表
}
```

- 正则 `/{(\w+)}/g` 替换为 `:$1`
- 检测是否包含 `{` 来判断 isBraceStyle
- 提取参数名列表

### denormalize(url, paramNames, isBraceStyle)

仅 compile 使用。如果原始模板是 `{param}` 风格，将结果 URL 中的参数部分还原为 `{paramName}` 格式。

## Error Handling

- 模板为空字符串 → 抛出 TypeError
- 混用两种语法（如 `/users/:id/{name}`）→ 允许，normalize 统一处理
- compile 缺少参数 → 由 path-to-regexp 原生抛错，不额外包装

## Edge Cases

- 无参数模板（如 `/users`）→ 正常工作，params 为空对象
- 多参数模板（如 `/users/:userId/posts/:postId`）→ 正常工作
- 修饰符（`*`, `+`, `?`）→ path-to-regexp v8 原生支持，`{param*}` 也会被正确转换为 `:param*`

## Testing

测试目录：`__tests__/index.spec.ts`，使用 bun test。

覆盖场景：
1. `:param` 风格 match — 匹配成功/失败
2. `{param}` 风格 match — 匹配成功/失败
3. `:param` 风格 compile — 正确生成 URL
4. `{param}` 风格 compile — 正确生成 URL，输出保持 `{param}` 格式
5. 无参数模板 — match/compile 正常
6. 多参数模板 — match/compile 正常
7. 混用语法 — match/compile 正常

## Build Config Changes

- `tsup.config.ts`：UMD 的 `libraryName` 从 `urlLiteral` 改为 `pathDualParser`
- `package.json`：添加 `path-to-regexp` 为 dependencies
- `tsconfig.json`：target 从 es5 放宽到 es2015（path-to-regexp v8 使用了现代语法）

## Output

- 根目录 `llms.txt`：描述库的用途、API、用法示例，方便 AI 使用此库
