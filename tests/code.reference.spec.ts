import { compile } from "@mdx-js/mdx";
import { fromMarkdown } from "mdast-util-from-markdown";
import { removePosition } from "unist-util-remove-position";
import dedent from "dedent";

describe("recma-mdx-interpolate, debug", () => {
  // ******************************************
  it("see mdast", async () => {
    const source = dedent`
      \`\`\`bash
      pnpm add @mdx-js/loader@{props.versions.mdxJsLoader}
      \`\`\`
    `;

    // doesn't matter format md or mdx, the mdast tree is the same for code fences

    const tree = fromMarkdown(source);
    removePosition(tree, { force: true });

    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "lang": "bash",
            "meta": null,
            "type": "code",
            "value": "pnpm add @mdx-js/loader@{props.versions.mdxJsLoader}",
          },
        ],
        "type": "root",
      }
    `);
  });
});

describe("recma-mdx-interpolate, basic interpolation", () => {
  // ******************************************
  it("code fence", async () => {
    const source = dedent`
      \`\`\`bash
      pnpm add @mdx-js/loader@{props.versions.mdxJsLoader}
      \`\`\`
    `;

    // test it with different options
    // { format: "md" }
    // { format: "mdx" }
    // { format: "md", jsx: true }
    // { format: "mdx", jsx: true }

    expect(String(await compile(source, { format: "md" }))).toMatchInlineSnapshot(`
      "import {jsx as _jsx} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          code: "code",
          pre: "pre",
          ...props.components
        };
        return _jsx(_components.pre, {
          children: _jsx(_components.code, {
            className: "language-bash",
            children: "pnpm add @mdx-js/loader@{props.versions.mdxJsLoader}\\n"
          })
        });
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      "
    `);

    expect(String(await compile(source, { format: "mdx" }))).toMatchInlineSnapshot(`
      "import {jsx as _jsx} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          code: "code",
          pre: "pre",
          ...props.components
        };
        return _jsx(_components.pre, {
          children: _jsx(_components.code, {
            className: "language-bash",
            children: "pnpm add @mdx-js/loader@{props.versions.mdxJsLoader}\\n"
          })
        });
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? _jsx(MDXLayout, {
          ...props,
          children: _jsx(_createMdxContent, {
            ...props
          })
        }) : _createMdxContent(props);
      }
      "
    `);

    expect(String(await compile(source, { format: "md", jsx: true }))).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          code: "code",
          pre: "pre",
          ...props.components
        };
        return <_components.pre><_components.code className="language-bash">{"pnpm add @mdx-js/loader@{props.versions.mdxJsLoader}\\n"}</_components.code></_components.pre>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);

    expect(String(await compile(source, { format: "mdx", jsx: true }))).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          code: "code",
          pre: "pre",
          ...props.components
        };
        return <_components.pre><_components.code className="language-bash">{"pnpm add @mdx-js/loader@{props.versions.mdxJsLoader}\\n"}</_components.code></_components.pre>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });
});
