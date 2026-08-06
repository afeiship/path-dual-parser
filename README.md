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

### parse

One-step parse template with data to URL (simpler API):

```ts
import { parse } from '@jswork/path-dual-parser';

parse('/users/:id', { id: '123' });      // '/users/123'
parse('/users/{id}', { id: '123' });     // '/users/123'
parse('/users/:userId/posts/{postId}', { userId: '1', postId: '2' });  // '/users/1/posts/2'
```

## license
Code released under [the MIT license](https://github.com/afeiship/path-dual-parser/blob/main/LICENSE.txt).

[version-image]: https://img.shields.io/npm/v/@jswork/path-dual-parser
[version-url]: https://npmjs.org/package/@jswork/path-dual-parser

[license-image]: https://img.shields.io/npm/l/@jswork/path-dual-parser
[license-url]: https://github.com/afeiship/path-dual-parser/blob/main/LICENSE.txt

[download-image]: https://img.shields.io/npm/dm/@jswork/path-dual-parser
[download-url]: https://www.npmjs.com/package/@jswork/path-dual-parser