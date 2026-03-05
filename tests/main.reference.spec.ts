import { compile } from "@mdx-js/mdx";
import { visit } from "unist-util-visit";
import { fromMarkdown } from "mdast-util-from-markdown";
import { removePosition } from "unist-util-remove-position";
import { mdxjs } from "micromark-extension-mdxjs";
import { mdxFromMarkdown } from "mdast-util-mdx";
import dedent from "dedent";

// A utility function to recursively remove estree meta info from a node
function removeEstreeMeta(node: unknown): void {
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;

    if ("loc" in obj) delete obj.loc;
    if ("range" in obj) delete obj.range;
    if ("start" in obj) delete obj.start;
    if ("end" in obj) delete obj.end;

    for (const key in obj) {
      removeEstreeMeta(obj[key]);
    }
  }
}

describe("recma-mdx-interpolate, debug", () => {
  const source = dedent`
    [*{text}*]({href} "*{title}*") ![*{alt}*]({src} "*{title}*")
  `;

  // ******************************************
  it("see mdast, format md", async () => {
    const tree = fromMarkdown(source);
    removePosition(tree, { force: true });

    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "type": "text",
                        "value": "{text}",
                      },
                    ],
                    "type": "emphasis",
                  },
                ],
                "title": "*{title}*",
                "type": "link",
                "url": "{href}",
              },
              {
                "type": "text",
                "value": " ",
              },
              {
                "alt": "{alt}",
                "title": "*{title}*",
                "type": "image",
                "url": "{src}",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `);
  });

  // ******************************************
  it("see mdast, format mdx", async () => {
    const tree = fromMarkdown(source, {
      extensions: [mdxjs()],
      mdastExtensions: [mdxFromMarkdown()],
    });

    removePosition(tree, { force: true });

    // Clean estree meta info ---> "range", "loc", "start", "end"
    visit(tree, (node) => {
      if (node.data && "estree" in node.data) {
        removeEstreeMeta(node.data.estree);
      }
    });

    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": [
              {
                "children": [
                  {
                    "children": [
                      {
                        "data": {
                          "estree": {
                            "body": [
                              {
                                "expression": Node {
                                  "name": "text",
                                  "type": "Identifier",
                                },
                                "type": "ExpressionStatement",
                              },
                            ],
                            "comments": [],
                            "sourceType": "module",
                            "type": "Program",
                          },
                        },
                        "type": "mdxTextExpression",
                        "value": "text",
                      },
                    ],
                    "type": "emphasis",
                  },
                ],
                "title": "*{title}*",
                "type": "link",
                "url": "{href}",
              },
              {
                "type": "text",
                "value": " ",
              },
              {
                "alt": "alt",
                "title": "*{title}*",
                "type": "image",
                "url": "{src}",
              },
            ],
            "type": "paragraph",
          },
        ],
        "type": "root",
      }
    `);
  });
});

describe("recma-mdx-interpolate, basic interpolation", () => {
  // ******************************************
  it("example in the README", async () => {
    const source = dedent`
      [{text}]({src} "{title}")

      ![{alt}]({src} "{title}")

      ![{{double}}]({src} "{title}")
    `;

    // test it with different options
    // { format: "md" }
    // { format: "mdx" }
    // { format: "md", jsx: true }
    // { format: "mdx", jsx: true }

    expect(String(await compile(source, { format: "md" }))).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.a, {
              href: "%7Bsrc%7D",
              title: "{title}",
              children: "{text}"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "%7Bsrc%7D",
              alt: "{alt}",
              title: "{title}"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "%7Bsrc%7D",
              alt: "{{double}}",
              title: "{title}"
            })
          })]
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
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.a, {
              href: "%7Bsrc%7D",
              title: "{title}",
              children: text
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "%7Bsrc%7D",
              alt: "alt",
              title: "{title}"
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.img, {
              src: "%7Bsrc%7D",
              alt: "{double}",
              title: "{title}"
            })
          })]
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
          a: "a",
          img: "img",
          p: "p",
          ...props.components
        };
        return <><_components.p><_components.a href="%7Bsrc%7D" title="{title}">{"{text}"}</_components.a></_components.p>{"\\n"}<_components.p><_components.img src="%7Bsrc%7D" alt="{alt}" title="{title}" /></_components.p>{"\\n"}<_components.p><_components.img src="%7Bsrc%7D" alt="{{double}}" title="{title}" /></_components.p></>;
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
          a: "a",
          img: "img",
          p: "p",
          ...props.components
        };
        return <><_components.p><_components.a href="%7Bsrc%7D" title="{title}">{text}</_components.a></_components.p>{"\\n"}<_components.p><_components.img src="%7Bsrc%7D" alt="alt" title="{title}" /></_components.p>{"\\n"}<_components.p><_components.img src="%7Bsrc%7D" alt="{double}" title="{title}" /></_components.p></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });
});
