import { compile } from "@mdx-js/mdx";
import dedent from "dedent";

import recmaMdxInterpolate from "../src";

const getCompiled = async (source: string, options?: {}) => {
  return String(await compile(source, { recmaPlugins: [recmaMdxInterpolate], ...options }));
};

describe.only("recma-mdx-interpolate, links 1", () => {
  const source = dedent`
    [{x}]({a} "{t}")

    [{x.y.z}]({a.b} "{t.t}")
  `;

  // ******************************************
  it("example in the README", async () => {
    expect(await getCompiled(source, { format: "md" })).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.a, {
              href: a,
              title: t,
              children: x
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.a, {
              href: a.b,
              title: t.t,
              children: x.y.z
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
  });

  // ******************************************
  it("example in the README, format mdx", async () => {
    expect(await getCompiled(source)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsx(_components.a, {
              href: a,
              title: t,
              children: x
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsx(_components.a, {
              href: a.b,
              title: t.t,
              children: x.y.z
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
  });
});

describe.only("recma-mdx-interpolate, links 2", () => {
  const source = dedent`
    [**strong**{text}*italic*]({href} "{title}")

    [**strong**{props.text}*italic*](xlmns::{props.href} "{props.title}")

    [{xxx} of **{aaa}**](https://example.com)
  `;

  // ******************************************
  it("example in the README", async () => {
    expect(await getCompiled(source, { format: "md" })).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          em: "em",
          p: "p",
          strong: "strong",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsxs(_components.a, {
              href: href,
              title: title,
              children: [_jsx(_components.strong, {
                children: "strong"
              }), text, _jsx(_components.em, {
                children: "italic"
              })]
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsxs(_components.a, {
              href: \`xlmns::\${props.href}\`,
              title: props.title,
              children: [_jsx(_components.strong, {
                children: "strong"
              }), props.text, _jsx(_components.em, {
                children: "italic"
              })]
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsxs(_components.a, {
              href: "https://example.com",
              children: [\`\${xxx} of \`, _jsx(_components.strong, {
                children: aaa
              })]
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
  });

  // ******************************************
  it("example in the README, format mdx", async () => {
    expect(await getCompiled(source)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          em: "em",
          p: "p",
          strong: "strong",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsx(_components.p, {
            children: _jsxs(_components.a, {
              href: href,
              title: title,
              children: [_jsx(_components.strong, {
                children: "strong"
              }), text, _jsx(_components.em, {
                children: "italic"
              })]
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsxs(_components.a, {
              href: \`xlmns::\${props.href}\`,
              title: props.title,
              children: [_jsx(_components.strong, {
                children: "strong"
              }), props.text, _jsx(_components.em, {
                children: "italic"
              })]
            })
          }), "\\n", _jsx(_components.p, {
            children: _jsxs(_components.a, {
              href: "https://example.com",
              children: [xxx, " of ", _jsx(_components.strong, {
                children: aaa
              })]
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
  });
});

describe("recma-mdx-interpolate, images 1", () => {
  // ******************************************
  it("example in the README", async () => {
    const source = dedent`
      ![{x}]({a} "{t}")
      ![{{x}}]({a} "{t}")
      ![{{_:x}}]({a} "{t}")

      ![{x.y.z}]({a.b} "{t.t}")
      ![{{x.y.z}}]({a.b} "{t.t}")
      ![{{_:x.y.z}}]({a.b} "{t.t}")
    `;

    expect(await getCompiled(source, { format: "md" })).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsxs(_components.p, {
            children: [_jsx(_components.img, {
              src: a,
              alt: x,
              title: t
            }), "\\n", _jsx(_components.img, {
              src: a,
              alt: x,
              title: t
            }), "\\n", _jsx(_components.img, {
              src: a,
              alt: x,
              title: t
            })]
          }), "\\n", _jsxs(_components.p, {
            children: [_jsx(_components.img, {
              src: a.b,
              alt: x.y.z,
              title: t.t
            }), "\\n", _jsx(_components.img, {
              src: a.b,
              alt: x.y.z,
              title: t.t
            }), "\\n", _jsx(_components.img, {
              src: a.b,
              alt: x.y.z,
              title: t.t
            })]
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
  });

  // ******************************************
  it("example in the README, format mdx", async () => {
    const source = dedent`
      ![{x}]({a} "{t}")
      ![{{x}}]({a} "{t}")

      ![{x.y.z}]({a.b} "{t.t}")
      ![{{_:x.y.z}}]({a.b} "{t.t}")
    `;

    expect(await getCompiled(source)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_Fragment, {
          children: [_jsxs(_components.p, {
            children: [_jsx(_components.img, {
              src: a,
              alt: "x",
              title: t
            }), "\\n", _jsx(_components.img, {
              src: a,
              alt: x,
              title: t
            })]
          }), "\\n", _jsxs(_components.p, {
            children: [_jsx(_components.img, {
              src: a.b,
              alt: "x.y.z",
              title: t.t
            }), "\\n", _jsx(_components.img, {
              src: a.b,
              alt: x.y.z,
              title: t.t
            })]
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
  });
});

describe("recma-mdx-interpolate, images 2", () => {
  const source = dedent`
    ![{image.alt}]({image.src} "{image.title}"),
    ![{{_:image.alt}}]({image.src} "{image.title}")
  `;

  // ******************************************
  it("handles workaround", async () => {
    expect(await getCompiled(source, { format: "md" })).toMatchInlineSnapshot(`
      "import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_components.p, {
          children: [_jsx(_components.img, {
            src: image.src,
            alt: image.alt,
            title: image.title
          }), ",\\n", _jsx(_components.img, {
            src: image.src,
            alt: image.alt,
            title: image.title
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
  });

  // ******************************************
  it("handles workaround, format mdx", async () => {
    expect(await getCompiled(source)).toMatchInlineSnapshot(`
      "import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_components.p, {
          children: [_jsx(_components.img, {
            src: image.src,
            alt: "image.alt",
            title: image.title
          }), ",\\n", _jsx(_components.img, {
            src: image.src,
            alt: image.alt,
            title: image.title
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
  });
});

describe("recma-mdx-interpolate, images 3", () => {
  const source = dedent`
    ![{image.alt} of site](https://{image.src} "{image.title} > directives")
    ![{{_:image.alt}} of site](https://{image.src} "{image.title} > directives")
  `;

  // ******************************************
  it("handle template literals in images", async () => {
    expect(await getCompiled(source, { format: "md" })).toMatchInlineSnapshot(`
      "import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_components.p, {
          children: [_jsx(_components.img, {
            src: \`https://\${image.src}\`,
            alt: \`\${image.alt} of site\`,
            title: \`\${image.title} > directives\`
          }), "\\n", _jsx(_components.img, {
            src: \`https://\${image.src}\`,
            alt: \`\${image.alt} of site\`,
            title: \`\${image.title} > directives\`
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
  });

  // ******************************************
  it("handle template literals in images, format mdx", async () => {
    expect(await getCompiled(source)).toMatchInlineSnapshot(`
      "import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_components.p, {
          children: [_jsx(_components.img, {
            src: \`https://\${image.src}\`,
            alt: "image.alt of site",
            title: \`\${image.title} > directives\`
          }), "\\n", _jsx(_components.img, {
            src: \`https://\${image.src}\`,
            alt: \`\${image.alt} of site\`,
            title: \`\${image.title} > directives\`
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
  });
});

describe("recma-mdx-interpolate, trial", () => {
  const source = dedent`
    
  `;

  // ******************************************
  it.only("example in the README", async () => {
    expect(await getCompiled(source, { format: "md" })).toMatchInlineSnapshot(`
      "import {jsx as _jsx} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          p: "p",
          ...props.components
        };
        return _jsx(_components.p, {
          children: _jsx(_components.a, {
            href: "https://example.com",
            children: xxx
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
