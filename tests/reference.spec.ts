import { compile, type CompileOptions } from "@mdx-js/mdx";
import { visit } from "unist-util-visit";
import dedent from "dedent";
import { fromMarkdown } from "mdast-util-from-markdown";
import { removePosition } from "unist-util-remove-position";
import { mdxjs } from "micromark-extension-mdxjs";
import { mdxFromMarkdown } from "mdast-util-mdx";

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

const getCompiled = async (source: string, options: CompileOptions) => {
  return String(await compile(source, options));
};

describe("recma-mdx-interpolate, debug", () => {
  // it("log esast via custom plugin", async () => {
  //   const source = dedent`
  //     [{props.email}]({props.email} "{props.title}")
  //   `;

  //   await compile(source, {
  //     format: "mdx",
  //     recmaPlugins: [
  //       function recmaLogTree() {
  //         return function (tree) {
  //           console.dir(tree, { depth: null });
  //         };
  //       },
  //     ],
  //   });
  // });

  it("see the mdast via mdast-util-from-markdown", async () => {
    const source = dedent`
      [*{text}*]({href} "*{title}*") ![*{alt}*]({src} "*{title}*")
    `;

    const tree1 = fromMarkdown(source);
    removePosition(tree1, { force: true });

    expect(tree1).toMatchInlineSnapshot(`
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

    const tree2 = fromMarkdown(source, {
      extensions: [mdxjs()],
      mdastExtensions: [mdxFromMarkdown()],
    });

    removePosition(tree2, { force: true });

    // Clean estree recursively
    visit(tree2, (node) => {
      if (node.type === "mdxTextExpression" && node.data?.estree) {
        removeEstreeMeta(node.data.estree);
      }
    });

    expect(tree2).toMatchInlineSnapshot(`
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

    expect(await getCompiled(source, { format: "md" })).toMatchInlineSnapshot(`
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

    expect(await getCompiled(source, { format: "mdx" })).toMatchInlineSnapshot(`
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

    expect(await getCompiled(source, { format: "md", jsx: true })).toMatchInlineSnapshot(`
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

    expect(await getCompiled(source, { format: "mdx", jsx: true })).toMatchInlineSnapshot(`
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
