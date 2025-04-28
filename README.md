# recma-mdx-interpolate

[![npm version][badge-npm-version]][url-npm-package]
[![npm downloads][badge-npm-download]][url-npm-package]
[![publish to npm][badge-publish-to-npm]][url-publish-github-actions]
[![code-coverage][badge-codecov]][url-codecov]
[![type-coverage][badge-type-coverage]][url-github-package]
[![typescript][badge-typescript]][url-typescript]
[![license][badge-license]][url-license]

This package is a **[unified][unified]** (**[recma][recma]**) plugin **that enables interpolation of identifiers wrapped in curly braces within the `alt`, `src`, and `title` attributes of markdown link and image syntax in MDX**.

**[unified][unified]** is a project that transforms content with abstract syntax trees (ASTs) using the new parser **[micromark][micromark]**. **[recma][recma]** adds support for producing a javascript code by transforming **[esast][esast]** which stands for Ecma Script Abstract Syntax Tree (AST) that is used in production of compiled source for the **[MDX][MDX]**.

## The facts

Normally, interpolation of an identifier (*identifiers wrapped with curly braces, for example `{name}` or `{props.src}`*) within markdown content doesn't work at all. **The interpolation of an identifier, in other words MDX expressions, is a matter of MDX.**

MDX expressions in some places in MDX is not viable since MDX is not a template language. For example, MDX expressions within markdown **link** and **image** syntax doesn't work in MDX. **`recma-mdx-interpolate`** patches that gaps !

### Considerations on the parts of markdown links `[text part](href part "title part")` regarding with MDX

**Text part** of a link is parsed as markdown, and the interpolation happens already by default in MDX. Hence, `recma-mdx-interpolate` doesn't need to handle that part.

**Href part** of a link is URI encoded, meaningly curly braces are encoded as `%7B` and `%7D`in MDX. The interpolation doesn't work in that part. So, `recma-mdx-interpolate` handles that part.

**Title part** of a link remains as-is in MDX. The interpolation doesn't work in that part. So, `recma-mdx-interpolate` handles that part as well.

### Considerations on the parts of markdown images `![alt part](src part "title part")` regarding with MDX

**Alt part** of an image is parsed as plain text and curly braces are removed in MDX (not in markdown). The interpolation doesn't work in that part. Since curly braces are removed, in order `recma-mdx-interpolate` to handle that part, we need to use **double curly braces** `![{{alt}}](image.png)` as a workaround in that part, in MDX.

**Src part** of an image is URI encoded, meaningly curly braces are encoded as `%7B` and `%7D` in MDX. The interpolation doesn't work in that part. So, `recma-mdx-interpolate` handles that part.

**Title part** of an image remains as-is in MDX. The interpolation doesn't work in that part. So, `recma-mdx-interpolate` handles that part as well.

## When should I use this?

If you're working with MDX and want to interpolate identifiers within **alt**, **src**, and **title** attributes of an **image** and **link** constructed with **markdown syntax**, such as:

```markdown
[{props.email}](mailto:{props.email} "{props.title}")

![{alt}]({src} "{title}")
```
As you know, you should provide the identifiers in `props` or `scope` based on your integration.

Here are some explanations I should emphasise:
+ It ensures javascript interpolation, like `{variable_name}`, for only **href**/**title** parts of a **link** and **src**/**title** parts of an image in "mdx" format, additionally **text** of a **link** and **alt** part of an image in "md" format.

+ The **text** of a **link** *(the children of an anchor)* is already interpolated in MDX, but not in markdown format, so **`recma-mdx-interpolate`** does not touch it `[{already.interpolated}](...)` if the format is "mdx".

+ The curly braces in the **alt** of an **image** are removed during remark-mdx parsing in MDX (not in markdown format). So you need to use **double curly braces** `![{{double.curly}}](image.png)` as a workaround in that part if the format is "mdx".

+ If you are using a plugin (like **[`rehype-image-toolkit`](https://github.com/ipikuka/rehype-image-toolkit)**) to convert image syntax to video/audio, then **`recma-mdx-interpolate`** also supports **src**/**title** of a `<video>`/`<audio>` elements; and **src** of a `<source>` element.

### The list of the tags and attributes that `recma-mdx-interpolate` processes

|tags            |with "mdx" format        |with "md" format                               |
|----------------|-------------------------|-----------------------------------------------|
| **`a (link)`** | **`href`**, **`title`**`|**`text (children)`**, **`href`**, **`title`**`|
| **`img`**      | **`src`**, **`title`**  |**`alt`**, **`src`**, **`title`**              |
| **`video`**    | **`src`**, **`title`**  |**`src`**, **`title`**                         |
| **`audio`**    | **`src`**, **`title`**  |**`src`**, **`title`**                         |
| **`source`**   | **`src`**               |**`src`**                                      |

## Installation

This package is suitable for ESM only. In Node.js (version 18+), install with npm:

```bash
npm install recma-mdx-interpolate
```

or

```bash
yarn add recma-mdx-interpolate
```

## Usage

Say we have the following file, `example.mdx`,

```mdx
[{props.email}](mailto:{props.email} "{props.title}")

![{{alt}}]({src} "{title}")
```

And our module, `example.js`, looks as follows:

```javascript
import { read } from "to-vfile";
import { compile } from "@mdx-js/mdx";
import recmaMdxInterpolate from "recma-mdx-interpolate";

main();

async function main() {
  const source = await read("example.mdx");

  const compiledSource = await compile(source, {
    recmaPlugins: [recmaMdxInterpolate],
  });

  return String(compiledSource);
}
```

Now, running `node example.js` produces the `compiled source` like below:

```diff
// ...
function _createMdxContent(props) {
  // ...
  return _jsxs(_Fragment, {
    children: [_jsx(_components.p, {
      children: _jsx(_components.a, {
-        href: "mailto:%7Bprops.email%7D",
+        href: `mailto:${props.email}`,
-        title: "{props.title}",
+        title: props.title,
        children: props.email
      })
    }), "\n", _jsx(_components.p, {
      children: _jsx(_components.img, {
-        src: "%7Bsrc%7D",
+        src: src,
-        alt: "{alt}",
+        alt: alt,
-        title: "{title}"
+        title: title,
      })
    })]
  });
}
// ...
```
This is roughly equivalent JSX with:
```js
export default function MDXContent() {
  return (
    <p>
      <a href={`mailto:${props.email}`} title={props.title}>{props.email}</a>
    </p>
    <p>
      <img alt={alt} src={src} title={title} />
    </p>
  )
}
```

## Options

All options are optional and have default values.

```typescript
export type InterpolateOptions = {
  exclude?: Partial<Record<"a" | "img" | "video" | "audio" | "source", string | string[] | true>>
  disable?: boolean;
};
```

### exclude

It is an **object** option to exlude some tags and attributes. 

Default is empty object `{}` meaningly there is no excluded tags and attributes, all targets is going to be processed.

```javascript
use(recmaMdxInterpolate, { exclude: {a: true} } as InterpolateOptions);
```
Now, the links *(anchor `<a>`)* will be excluded from processing.

```javascript
use(recmaMdxInterpolate, { exclude: {img: ["src"]} } as InterpolateOptions);
```
Now, the `src` attribute of images will be excluded from processing.

### disable

It is a **boolean** option to disable the plugin completely.

It is `false` by default.

It could be useful if you want the plugin doesn't work when the format is not "mdx".

```javascript
use(recmaMdxInterpolate, { disable: format !== "mdx" } as InterpolateOptions);
```

## Syntax tree

This plugin only modifies the ESAST (Ecma Script Abstract Syntax Tree) as explained.

## Types

This package is fully typed with [TypeScript][url-typescript]. The plugin options is exported as `InterpolateOptions`.

## Compatibility

This plugin works with `unified` version 6+. It is compatible with `mdx` version 3+.

## Security

Use of `recma-mdx-interpolate` does not involve user content so there are no openings for cross-site scripting (XSS) attacks.

## My Plugins

I like to contribute the Unified / Remark / MDX ecosystem, so I recommend you to have a look my plugins.

### My Remark Plugins

- [`remark-flexible-code-titles`](https://www.npmjs.com/package/remark-flexible-code-titles)
  – Remark plugin to add titles or/and containers for the code blocks with customizable properties
- [`remark-flexible-containers`](https://www.npmjs.com/package/remark-flexible-containers)
  – Remark plugin to add custom containers with customizable properties in markdown
- [`remark-ins`](https://www.npmjs.com/package/remark-ins)
  – Remark plugin to add `ins` element in markdown
- [`remark-flexible-paragraphs`](https://www.npmjs.com/package/remark-flexible-paragraphs)
  – Remark plugin to add custom paragraphs with customizable properties in markdown
- [`remark-flexible-markers`](https://www.npmjs.com/package/remark-flexible-markers)
  – Remark plugin to add custom `mark` element with customizable properties in markdown
- [`remark-flexible-toc`](https://www.npmjs.com/package/remark-flexible-toc)
  – Remark plugin to expose the table of contents via `vfile.data` or via an option reference
- [`remark-mdx-remove-esm`](https://www.npmjs.com/package/remark-mdx-remove-esm)
  – Remark plugin to remove import and/or export statements (mdxjsEsm)

### My Rehype Plugins

- [`rehype-pre-language`](https://www.npmjs.com/package/rehype-pre-language)
  – Rehype plugin to add language information as a property to `pre` element
- [`rehype-highlight-code-lines`](https://www.npmjs.com/package/rehype-highlight-code-lines)
  – Rehype plugin to add line numbers to code blocks and allow highlighting of desired code lines
- [`rehype-code-meta`](https://www.npmjs.com/package/rehype-code-meta)
  – Rehype plugin to copy `code.data.meta` to `code.properties.metastring`
- [`rehype-image-toolkit`](https://www.npmjs.com/package/rehype-image-toolkit)
  – Rehype plugin to enhance Markdown image syntax `![]()` and Markdown/MDX media elements (`<img>`, `<audio>`, `<video>`) by auto-linking bracketed or parenthesized image URLs, wrapping them in `<figure>` with optional captions, unwrapping images/videos/audio from paragraph, parsing directives in title for styling and adding attributes, and dynamically converting images into `<video>` or `<audio>` elements based on file extension.

### My Recma Plugins

- [`recma-mdx-escape-missing-components`](https://www.npmjs.com/package/recma-mdx-escape-missing-components)
  – Recma plugin to set the default value `() => null` for the Components in MDX in case of missing or not provided so as not to throw an error
- [`recma-mdx-change-props`](https://www.npmjs.com/package/recma-mdx-change-props)
  – Recma plugin to change the `props` parameter into the `_props` in the `function _createMdxContent(props) {/* */}` in the compiled source in order to be able to use `{props.foo}` like expressions. It is useful for the `next-mdx-remote` or `next-mdx-remote-client` users in `nextjs` applications.
- [`recma-mdx-change-imports`](https://www.npmjs.com/package/recma-mdx-change-imports)
  – Recma plugin to convert import declarations for assets and media with relative links into variable declarations with string URLs, enabling direct asset URL resolution in compiled MDX.
- [`recma-mdx-import-media`](https://www.npmjs.com/package/recma-mdx-import-media)
  – Recma plugin to turn media relative paths into import declarations for both markdown and html syntax in MDX.
- [`recma-mdx-import-react`](https://www.npmjs.com/package/recma-mdx-import-react)
  – Recma plugin to ensure getting `React` instance from the arguments and to make the runtime props `{React, jsx, jsxs, jsxDev, Fragment}` is available in the dynamically imported components in the compiled source of MDX.
- [`recma-mdx-html-override`](https://www.npmjs.com/package/recma-mdx-html-override)
  – Recma plugin to allow selected raw HTML elements to be overridden via MDX components.
- [`recma-mdx-interpolate`](https://www.npmjs.com/package/recma-mdx-interpolate)
  – Recma plugin to enable interpolation of identifiers wrapped in curly braces within the `alt`, `src`, and `title` attributes of markdown link and image syntax in MDX.

## License

[MIT License](./LICENSE) © ipikuka

[unified]: https://github.com/unifiedjs/unified
[micromark]: https://github.com/micromark/micromark
[recma]: https://mdxjs.com/docs/extending-mdx/#list-of-plugins
[esast]: https://github.com/syntax-tree/esast
[estree]: https://github.com/estree/estree
[MDX]: https://mdxjs.com/

[badge-npm-version]: https://img.shields.io/npm/v/recma-mdx-interpolate
[badge-npm-download]:https://img.shields.io/npm/dt/recma-mdx-interpolate
[url-npm-package]: https://www.npmjs.com/package/recma-mdx-interpolate
[url-github-package]: https://github.com/ipikuka/recma-mdx-interpolate

[badge-license]: https://img.shields.io/github/license/ipikuka/recma-mdx-interpolate
[url-license]: https://github.com/ipikuka/recma-mdx-interpolate/blob/main/LICENSE

[badge-publish-to-npm]: https://github.com/ipikuka/recma-mdx-interpolate/actions/workflows/publish.yml/badge.svg
[url-publish-github-actions]: https://github.com/ipikuka/recma-mdx-interpolate/actions/workflows/publish.yml

[badge-typescript]: https://img.shields.io/npm/types/recma-mdx-interpolate
[url-typescript]: https://www.typescriptlang.org/

[badge-codecov]: https://codecov.io/gh/ipikuka/recma-mdx-interpolate/graph/badge.svg?token=TODO
[url-codecov]: https://codecov.io/gh/ipikuka/recma-mdx-interpolate

[badge-type-coverage]: https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fipikuka%2Frecma-mdx-interpolate%2Fmaster%2Fpackage.json
