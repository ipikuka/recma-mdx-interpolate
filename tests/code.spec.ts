import dedent from "dedent";

import { compile } from "./util";

describe("recma-mdx-interpolate, works with inline code", () => {
  const source = "`{{loader}}@{{props.version}}`";

  // ******************************************
  it("handle interpolation in inline codes, format md", async () => {
    expect(await compile(source, { format: "md" })).toContain(`
      children: [loader, "@", props.version]
    `);
  });

  // ******************************************
  it("handle interpolation in inline codes, format mdx", async () => {
    expect(await compile(source, { format: "mdx" })).toContain(`
      children: [loader, "@", props.version]
    `);
  });
});

describe("recma-mdx-interpolate, code fences with default syntax", () => {
  const source = dedent`
    \`\`\`bash
    pnpm add {{loader}}@{{props.version}}
    \`\`\`
  `;

  // ******************************************
  it("handle interpolation, format md", async () => {
    expect(await compile(source, { format: "md" })).toContain(`
      children: ["pnpm add ", loader, "@", props.version, "\\n"]
    `);
  });

  // ******************************************
  it("handle interpolation, format mdx", async () => {
    expect(await compile(source, { format: "mdx" })).toContain(`
      children: ["pnpm add ", loader, "@", props.version, "\\n"]
    `);
  });
});

describe("recma-mdx-interpolate, code fences with custom syntax", () => {
  const source = dedent`
    \`\`\`bash
    pnpm add <<:loader:>>@<<:props.version:>>
    \`\`\`
  `;

  // ******************************************
  it("handle interpolation, format md", async () => {
    expect(
      await compile(source, {
        format: "md",
        interpolationSyntaxForCodeFence: "<<:",
      }),
    ).toContain(`
      children: ["pnpm add ", loader, "@", props.version, "\\n"]
    `);
  });

  // ******************************************
  it("handle interpolation, format mdx", async () => {
    expect(
      await compile(source, {
        format: "mdx",
        interpolationSyntaxForCodeFence: "<<:",
      }),
    ).toContain(`
      children: ["pnpm add ", loader, "@", props.version, "\\n"]
    `);
  });
});

describe("recma-mdx-interpolate, code fences with strict syntax", () => {
  // I expect to capture the first one and not capture the second one (spaces between delimiters)
  const source = dedent`
    \`\`\`bash
    pnpm add {{loader}}@{{ props.version }}
    \`\`\`
  `;

  // ******************************************
  it("handle interpolation, format md", async () => {
    expect(await compile(source, { format: "md", strict: true })).toContain(`
      children: ["pnpm add ", loader, "@{{ props.version }}\\n"]
    `);
  });

  // ******************************************
  it("handle interpolation, format mdx", async () => {
    expect(await compile(source, { format: "mdx", strict: true })).toContain(`
      children: ["pnpm add ", loader, "@{{ props.version }}\\n"]
    `);
  });
});

describe("recma-mdx-interpolate, supports dashes in interpolation (only leading parts in object notation)", () => {
  const source = dedent`
    \`\`\`bash
    pnpm add {{ my-loader }}@{{ props.version-name }}
    \`\`\`
  `;

  // ******************************************
  it("handle interpolation, format md", async () => {
    expect(await compile(source, { format: "md" })).toContain(`
      children: ["pnpm add {{ my-loader }}@", props["version-name"], "\\n"]
    `);
  });

  // ******************************************
  it("handle interpolation, format mdx", async () => {
    expect(await compile(source, { format: "mdx" })).toContain(`
      children: ["pnpm add {{ my-loader }}@", props["version-name"], "\\n"]
    `);
  });
});

describe("recma-mdx-interpolate, disable interpolation in code fences", () => {
  const source = dedent`
    \`\`\`bash
    pnpm add {{loader}}@{{props.version}}
    \`\`\`
  `;

  // ******************************************
  it("handle interpolation, format md", async () => {
    expect(await compile(source, { format: "md", exclude: { code: true } })).toContain(`
      children: "pnpm add {{loader}}@{{props.version}}\\n"
    `);
  });

  // ******************************************
  it("handle interpolation, format mdx", async () => {
    expect(await compile(source, { format: "mdx", exclude: { code: true } })).toContain(`
      children: "pnpm add {{loader}}@{{props.version}}\\n"
    `);
  });
});

describe("recma-mdx-interpolate, code fences with default syntax but using conflicting syntax", () => {
  const source = dedent`
    \`\`\`bash
    pnpm add {& loader &}@{& props.version &}

    const { name } = props;
    \`\`\`
  `;

  // ******************************************
  it("handle interpolation, format md", async () => {
    expect(await compile(source, { format: "md" })).toContain(`
      children: "pnpm add {& loader &}@{& props.version &}\\n\\nconst { name } = props;\\n"
    `);
  });

  // ******************************************
  it("handle interpolation, format mdx", async () => {
    expect(await compile(source, { format: "mdx" })).toContain(`
      children: "pnpm add {& loader &}@{& props.version &}\\n\\nconst { name } = props;\\n"
    `);
  });
});

describe("recma-mdx-interpolate, code fences with default syntax in code highlighting", () => {
  const source = dedent`
    \`\`\`js
    import {{ loader }} from {{ package_name }};

    return <div>{ {{loader}} }</div>;
    \`\`\`
  `;

  // ******************************************
  it("handle interpolation, with code highlighting, format md", async () => {
    expect(await compile(source, { format: "md", highlight: true })).toMatchInlineSnapshot(`
      "import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          code: "code",
          pre: "pre",
          span: "span",
          ...props.components
        };
        return _jsx(_components.pre, {
          children: _jsxs(_components.code, {
            className: "hljs language-js",
            children: [_jsx(_components.span, {
              className: "hljs-keyword",
              children: "import"
            }), [" ", loader, " "], _jsx(_components.span, {
              className: "hljs-keyword",
              children: "from"
            }), [" ", package_name, ";\\n\\n"], _jsx(_components.span, {
              className: "hljs-keyword",
              children: "return"
            }), " ", _jsxs(_components.span, {
              className: "xml",
              children: [_jsxs(_components.span, {
                className: "hljs-tag",
                children: ["<", _jsx(_components.span, {
                  className: "hljs-name",
                  children: "div"
                }), ">"]
              }), ["{ ", loader, " }"], _jsxs(_components.span, {
                className: "hljs-tag",
                children: ["</", _jsx(_components.span, {
                  className: "hljs-name",
                  children: "div"
                }), ">"]
              })]
            }), ";\\n"]
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
  });

  // ******************************************
  it("handle interpolation, with code highlighting, format mdx", async () => {
    expect(await compile(source, { format: "mdx", highlight: true })).toMatchInlineSnapshot(`
      "import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          code: "code",
          pre: "pre",
          span: "span",
          ...props.components
        };
        return _jsx(_components.pre, {
          children: _jsxs(_components.code, {
            className: "hljs language-js",
            children: [_jsx(_components.span, {
              className: "hljs-keyword",
              children: "import"
            }), [" ", loader, " "], _jsx(_components.span, {
              className: "hljs-keyword",
              children: "from"
            }), [" ", package_name, ";\\n\\n"], _jsx(_components.span, {
              className: "hljs-keyword",
              children: "return"
            }), " ", _jsxs(_components.span, {
              className: "xml",
              children: [_jsxs(_components.span, {
                className: "hljs-tag",
                children: ["<", _jsx(_components.span, {
                  className: "hljs-name",
                  children: "div"
                }), ">"]
              }), ["{ ", loader, " }"], _jsxs(_components.span, {
                className: "hljs-tag",
                children: ["</", _jsx(_components.span, {
                  className: "hljs-name",
                  children: "div"
                }), ">"]
              })]
            }), ";\\n"]
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
  });
});
