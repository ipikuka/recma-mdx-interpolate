import dedent from "dedent";

import { compile } from "./util";

describe("recma-mdx-interpolate, links 1", () => {
  const source = dedent`
    [{x}]({a} "{t}")

    [{x.y.z}]({a.b} "{t.t}")
  `;

  // ******************************************
  it("handle interpolation", async () => {
    expect(await compile(source, { format: "md" })).toMatchInlineSnapshot(`
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
  it("handle interpolation, format mdx", async () => {
    expect(await compile(source)).toMatchInlineSnapshot(`
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

describe("recma-mdx-interpolate, links 2", () => {
  const source = dedent`
    [**strong**{text}*italic*]({href} "{title}")

    [**strong**{props.text}*italic*](xlmns::{props.href} "{props.title}")

    [{xxx} of **{aaa}**](https://example.com)
  `;

  // ******************************************
  it("handle template literals in links", async () => {
    expect(await compile(source, { format: "md" })).toMatchInlineSnapshot(`
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
  it("handle template literals in links, format mdx", async () => {
    expect(await compile(source)).toMatchInlineSnapshot(`
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

describe("recma-mdx-interpolate, links 3", () => {
  const source =
    "[{text.normal} **{text.strong}** of *{text.italic} extra* ![{{vendor}} of {{x:image.alt}}]({image.src})](https://{image.href})";

  it("handle deeply nested interpolations", async () => {
    // ******************************************
    expect(await compile(source, { format: "md" })).toMatchInlineSnapshot(`
      "import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          em: "em",
          img: "img",
          p: "p",
          strong: "strong",
          ...props.components
        };
        return _jsx(_components.p, {
          children: _jsxs(_components.a, {
            href: \`https://\${image.href}\`,
            children: [\`\${text.normal} \`, _jsx(_components.strong, {
              children: text.strong
            }), " of ", _jsx(_components.em, {
              children: \`\${text.italic} extra\`
            }), " ", _jsx(_components.img, {
              src: image.src,
              alt: \`\${vendor} of \${image.alt}\`
            })]
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
  it("handle deeply nested interpolations, format mdx", async () => {
    expect(await compile(source)).toMatchInlineSnapshot(`
      "import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          em: "em",
          img: "img",
          p: "p",
          strong: "strong",
          ...props.components
        };
        return _jsx(_components.p, {
          children: _jsxs(_components.a, {
            href: \`https://\${image.href}\`,
            children: [text.normal, " ", _jsx(_components.strong, {
              children: text.strong
            }), " of ", _jsxs(_components.em, {
              children: [text.italic, " extra"]
            }), " ", _jsx(_components.img, {
              src: image.src,
              alt: \`\${vendor} of \${image.alt}\`
            })]
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

describe("recma-mdx-interpolate, images 1", () => {
  // ******************************************
  it("handle interpolation", async () => {
    const source = dedent`
      ![{x}]({a} "{t}")
      ![{{x}}]({a} "{t}")
      ![{{_:x}}]({a} "{t}")

      ![{x.y.z}]({a.b} "{t.t}")
      ![{{x.y.z}}]({a.b} "{t.t}")
      ![{{_:x.y.z}}]({a.b} "{t.t}")
    `;

    expect(await compile(source, { format: "md" })).toMatchInlineSnapshot(`
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
  it("handle interpolation, format mdx", async () => {
    const source = dedent`
      ![{x}]({a} "{t}")
      ![{{x}}]({a} "{t}")

      ![{x.y.z}]({a.b} "{t.t}")
      ![{{_:x.y.z}}]({a.b} "{t.t}")
    `;

    expect(await compile(source)).toMatchInlineSnapshot(`
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
  it("handle workaround", async () => {
    expect(await compile(source, { format: "md" })).toMatchInlineSnapshot(`
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
  it("handle workaround, format mdx", async () => {
    expect(await compile(source)).toMatchInlineSnapshot(`
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
    expect(await compile(source, { format: "md" })).toMatchInlineSnapshot(`
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
    expect(await compile(source)).toMatchInlineSnapshot(`
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

// TODO: mention in the README about html as well
describe("recma-mdx-interpolate, html", () => {
  const source = dedent`
    <a href={href} title={title}>{text}</a>
    <img src={src} alt={alt} title={title} />
  `;

  // ******************************************
  it("handle html inputs, simple variables", async () => {
    expect(await compile(source, { format: "md" })).toMatchInlineSnapshot(`
      "import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_components.p, {
          children: [_jsx(_components.a, {
            href: href,
            title: title,
            children: text
          }), "\\n", _jsx(_components.img, {
            src: src,
            alt: alt,
            title: title
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
  it("handle html inputs, simple variables, format mdx", async () => {
    expect(await compile(source)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        return _jsxs(_Fragment, {
          children: [_jsx("a", {
            href: href,
            title: title,
            children: text
          }), "\\n", _jsx("img", {
            src: src,
            alt: alt,
            title: title
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

describe("recma-mdx-interpolate, html 2", () => {
  const source = dedent`
    <a href={link.href} title={link.title}>{link.text}</a>
    <img src={image.src} alt={image.alt} title={image.title} />
  `;

  // ******************************************
  it("handle html inputs, object path", async () => {
    expect(await compile(source, { format: "md" })).toMatchInlineSnapshot(`
      "import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          img: "img",
          p: "p",
          ...props.components
        };
        return _jsxs(_components.p, {
          children: [_jsx(_components.a, {
            href: link.href,
            title: link.title,
            children: link.text
          }), "\\n", _jsx(_components.img, {
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
  it("handle html inputs, object path, format mdx", async () => {
    expect(await compile(source)).toMatchInlineSnapshot(`
      "import {Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
      function _createMdxContent(props) {
        return _jsxs(_Fragment, {
          children: [_jsx("a", {
            href: link.href,
            title: link.title,
            children: link.text
          }), "\\n", _jsx("img", {
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
