# recma-mdx-interpolate

[![npm version][badge-npm-version]][url-npm-package]
[![npm downloads][badge-npm-download]][url-npm-package]
[![publish to npm][badge-publish-to-npm]][url-publish-github-actions]
[![code-coverage][badge-codecov]][url-codecov]
[![type-coverage][badge-type-coverage]][url-github-package]
[![typescript][badge-typescript]][url-typescript]
[![license][badge-license]][url-license]

This package is a **[unified][unified]** (**[recma][recma]**) plugin **that enables interpolation of identifiers wrapped in curly braces within the `alt`, `src`, `href`, and `title` attributes of markdown link and image syntax in MDX**.

**[unified][unified]** is a project that transforms content with abstract syntax trees (ASTs) using the new parser **[micromark][micromark]**. **[recma][recma]** adds support for producing a javascript code by transforming **[esast][esast]** which stands for Ecma Script Abstract Syntax Tree (AST) that is used in production of compiled source for the **[MDX][MDX]**.

## The facts

Normally, interpolation of an identifier (*identifiers wrapped with curly braces, for example `{name}` or `{props.src}`*) within markdown content doesn't work. **The interpolation of an identifier, in other words MDX expressions, is a matter of MDX.**

MDX expressions in some places is not viable since MDX is not a template language. For example, MDX expressions within markdown **link** and **image** syntax doesn't work in MDX. **`recma-mdx-interpolate`** patches that gaps !

**If your integration supports "md" format,** like (`@mdx-js/mdx`, `next-mdx-remote-client` etc.), then `recma-mdx-interpolate` can be used for "md" format as well.

### Considerations for Markdown Link Syntax
Syntax: `[text part](href part "title part")`

**Href part** of a markdown link is URI encoded, meaningly curly braces are encoded as `%7B` and `%7D`. The interpolation doesn't work by default. So, `recma-mdx-interpolate` handles that part.

**Title part** of a markdown link remains as-is. The interpolation doesn't work by default. So, `recma-mdx-interpolate` handles that part as well.

**Text part** of a markdown link is parsed as inline markdown, which means it can be broken into child nodes like `strong`, `emphasis`, `inlineCode`, or plain text. In MDX, these nodes support interpolation by default, so `recma-mdx-interpolate` doesn’t need to handle them. In plain markdown (`md`), although the text is also parsed into children, those nodes do not support interpolation by default, so `recma-mdx-interpolate` takes care of it.

### Considerations for Markdown Image Syntax
Syntax: `![alt part](src part "title part")`

**Src part** of a markdown image is URI encoded, meaningly curly braces are encoded as `%7B` and `%7D`. The interpolation doesn't work by default. So, `recma-mdx-interpolate` handles that part.

**Title part** of a markdown image remains as-is. The interpolation doesn't work by default. So, `recma-mdx-interpolate` handles that part as well.

**Alt part** of a markdown image behaves differently in MDX compared to standard markdown:
- In **markdown**, the alt text is treated as plain text, and curly braces `{}` are preserved; so `recma-mdx-interpolate` handles the interpolation.
- In **MDX**, however, curly braces are **automatically stripped** from the alt text. This means standard interpolation like `![{alt}](image.png)` doesn't work — there's no way to detect the interpolation syntax after MDX parsing. Since curly braces are stripped, we need to find a workaround for MDX.

#### Workaround for Interpolation in `alt` part of markdown image in MDX

To enable interpolation in the `alt` part of an image in MDX, use the following workaround:

- Use **double curly braces**:
```md
![{{alt}}](image.png)
```
This works if `alt` is a simple identifier (e.g., a variable name like `my_alt` or `altText`). 

For `object paths` (e.g., `image.alt`, `props.image.alt`), double curly braces alone cause the internal MDX parser (`acorn`) to throw an `Unexpected token` error. To work around this:
- Use **prefix before object path with any alphanumeric identifier (or underscore), followed by a colon `:`**
```md
![{{x:image.alt}}](image.png)
![{{_:image.alt}}](image.png)
![{{alt:props.image.alt}}](image.png)
```
This format is recognized and handled by the `recma-mdx-interpolate` plugin.

> **Note:** The colon **`:`** is essential — other separators (like `@`, `-`, or `%`) do not work.

**As a summary,**
- In **markdown**:
  Use standard interpolation like `![{a}](...)` or `![{a.b.c}](...)` 
- In **MDX**:
  Use double curly braces: 
  - `![{{a}}](...)` for simple variables
  - `![{{any:a.b.c}}](...)` for object paths (required workaround)

This is a weird workaround, but nothing to do else due to internal MDX parsing, and the double-curly-braces-and-colon-based workaround is the only known reliable method after extensive testing. The workaround is for MDX, not for markdown in which curly braces are not removed.

## When should I use this?

If you want to interpolate identifiers within **alt**, **src**, **href**, and **title** attributes of an **image** and **link** constructed with **markdown syntax**, such as:

```markdown
[{props.email}](mailto:{props.email} "{props.title}")

![{{alt}}]({src} "{title}")
```

Here are some explanations I should emphasise:
+ `recma-mdx-interpolate` works for only **href**/**title** parts of a markdown **link** and **alt**/**src**/**title** parts of a markdown image in "md" and "mdx" format, additionally **text** part of a **link** in "md" format.

+ The **text** part of a **link** *(the children of an anchor)* is already interpolated in MDX, so **`recma-mdx-interpolate`** does not touch it `[{already.interpolated}](...)` if the format is "mdx".

+ The curly braces in the **alt** of an **image** are removed during remark-mdx parsing in MDX (not in markdown format). So you need to use [aferomentioned workaround](#workaround-for-interpolation-in-alt-part-of-markdown-image-in-mdx) if the format is "mdx".

+ If you are using a plugin (like **[`rehype-image-toolkit`](https://github.com/ipikuka/rehype-image-toolkit)**) to convert image syntax to video/audio, then **`recma-mdx-interpolate`** also supports **src**/**title** of a `<video>`/`<audio>` elements; and **src** of a `<source>` element.

> [!IMPORTANT]
> You should provide the value of identifiers in your integration (usually `props` in `@mdx-js/mdx`; `scope` in `next-mdx-remote-client` and `next-mdx-remote` etc).

### The list of the tags and attributes that `recma-mdx-interpolate` processes

|tags              |with "mdx" format                               |with "md" format                               |
|------------------|------------------------------------------------|-----------------------------------------------|
| **`<a> (link)`** | **`href`**, **`title`**                        |**`text (children)`**, **`href`**, **`title`** |
| **`<img>`**      | **`alt`**<sup>*</sup>, **`src`**, **`title`**  |**`alt`**, **`src`**, **`title`**              |
| **`<video>`**    | **`src`**, **`title`**                         |**`src`**, **`title`**                         |
| **`<audio>`**    | **`src`**, **`title`**                         |**`src`**, **`title`**                         |
| **`<source>`**   | **`src`**                                      |**`src`**                                      |

*Note `*`: works with a workaround only.*

### `recma-mdx-interpolate` supports html in markdown

**It supports html syntax besides** markdown syntax for **link** and **image** in markdown contents. In MDX, the plugin doesn't touch these html syntax (actually MdxJsx elements) due to mdx parser handles interpolations already. 

```markdown
<a href={link.href} title={link.title}>{link.text}</a>
<img src={image.src} alt={image.alt} title={image.title}>
```

As you pay attention, there is no self-closing slash in `<img>` element above. Because there is no need self-closing slash for self-closable html elements in markdown (`md`) format, and of course in HTML5 standard. But, if you want to put a self-closing slash, put a space before it. Otherwise, the plugin infers that the self-closing slash belongs to the last attribute value, and produce unneccesary "/" in the value of the last attribute.

```markdown
<img src={image.src} alt={image.alt} title={image.title}>  it is okey
<img src={image.src} alt={image.alt} title={image.title} /> it is okey
<img src={image.src} alt={image.alt} title={image.title}/> it is okey but the plugin infers "/" belongs the title.
```

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

It could be useful if you want the plugin NOT to work when the format is not "mdx".

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
  – Recma plugin to enable interpolation of identifiers wrapped in curly braces within the `alt`, `src`, `href`, and `title` attributes of markdown link and image syntax in MDX.

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

[badge-codecov]: https://codecov.io/gh/ipikuka/recma-mdx-interpolate/graph/badge.svg?token=f5Vlb1riGO
[url-codecov]: https://codecov.io/gh/ipikuka/recma-mdx-interpolate

[badge-type-coverage]: https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fipikuka%2Frecma-mdx-interpolate%2Fmaster%2Fpackage.json
