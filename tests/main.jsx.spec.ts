import dedent from "dedent";

import { compileJsx } from "./util";

describe("recma-mdx-interpolate, links 1", () => {
  const source = dedent`
    [{x}]({a} "{t}")

    [{x.y.z}]({a.b} "{t.t}")
  `;

  // ******************************************
  it("handle interpolation", async () => {
    expect(await compileJsx(source, { format: "md" })).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          p: "p",
          ...props.components
        };
        return <><_components.p><_components.a href={a} title={t}>{x}</_components.a></_components.p>{"\\n"}<_components.p><_components.a href={a.b} title={t.t}>{x.y.z}</_components.a></_components.p></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("handle interpolation, format mdx", async () => {
    expect(await compileJsx(source)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          p: "p",
          ...props.components
        };
        return <><_components.p><_components.a href={a} title={t}>{x}</_components.a></_components.p>{"\\n"}<_components.p><_components.a href={a.b} title={t.t}>{x.y.z}</_components.a></_components.p></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
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
    expect(await compileJsx(source, { format: "md" })).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          em: "em",
          p: "p",
          strong: "strong",
          ...props.components
        };
        return <><_components.p><_components.a href={href} title={title}><_components.strong>{"strong"}</_components.strong>{text}<_components.em>{"italic"}</_components.em></_components.a></_components.p>{"\\n"}<_components.p><_components.a href={\`xlmns::\${props.href}\`} title={props.title}><_components.strong>{"strong"}</_components.strong>{props.text}<_components.em>{"italic"}</_components.em></_components.a></_components.p>{"\\n"}<_components.p><_components.a href="https://example.com">{\`\${xxx} of \`}<_components.strong>{aaa}</_components.strong></_components.a></_components.p></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("handle template literals in links, format mdx", async () => {
    expect(await compileJsx(source)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          em: "em",
          p: "p",
          strong: "strong",
          ...props.components
        };
        return <><_components.p><_components.a href={href} title={title}><_components.strong>{"strong"}</_components.strong>{text}<_components.em>{"italic"}</_components.em></_components.a></_components.p>{"\\n"}<_components.p><_components.a href={\`xlmns::\${props.href}\`} title={props.title}><_components.strong>{"strong"}</_components.strong>{props.text}<_components.em>{"italic"}</_components.em></_components.a></_components.p>{"\\n"}<_components.p><_components.a href="https://example.com">{xxx}{" of "}<_components.strong>{aaa}</_components.strong></_components.a></_components.p></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
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
    expect(await compileJsx(source, { format: "md" })).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          em: "em",
          img: "img",
          p: "p",
          strong: "strong",
          ...props.components
        };
        return <_components.p><_components.a href={\`https://\${image.href}\`}>{\`\${text.normal} \`}<_components.strong>{text.strong}</_components.strong>{" of "}<_components.em>{\`\${text.italic} extra\`}</_components.em>{" "}<_components.img src={image.src} alt={\`\${vendor} of \${image.alt}\`} /></_components.a></_components.p>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("handle deeply nested interpolations, format mdx", async () => {
    expect(await compileJsx(source)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          em: "em",
          img: "img",
          p: "p",
          strong: "strong",
          ...props.components
        };
        return <_components.p><_components.a href={\`https://\${image.href}\`}>{text.normal}{" "}<_components.strong>{text.strong}</_components.strong>{" of "}<_components.em>{text.italic}{" extra"}</_components.em>{" "}<_components.img src={image.src} alt={\`\${vendor} of \${image.alt}\`} /></_components.a></_components.p>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
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

    expect(await compileJsx(source, { format: "md" })).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return <><_components.p><_components.img src={a} alt={x} title={t} />{"\\n"}<_components.img src={a} alt={x} title={t} />{"\\n"}<_components.img src={a} alt={x} title={t} /></_components.p>{"\\n"}<_components.p><_components.img src={a.b} alt={x.y.z} title={t.t} />{"\\n"}<_components.img src={a.b} alt={x.y.z} title={t.t} />{"\\n"}<_components.img src={a.b} alt={x.y.z} title={t.t} /></_components.p></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
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

    expect(await compileJsx(source)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return <><_components.p><_components.img src={a} alt="x" title={t} />{"\\n"}<_components.img src={a} alt={x} title={t} /></_components.p>{"\\n"}<_components.p><_components.img src={a.b} alt="x.y.z" title={t.t} />{"\\n"}<_components.img src={a.b} alt={x.y.z} title={t.t} /></_components.p></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
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
    expect(await compileJsx(source, { format: "md" })).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return <_components.p><_components.img src={image.src} alt={image.alt} title={image.title} />{",\\n"}<_components.img src={image.src} alt={image.alt} title={image.title} /></_components.p>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("handle workaround, format mdx", async () => {
    expect(await compileJsx(source)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return <_components.p><_components.img src={image.src} alt="image.alt" title={image.title} />{",\\n"}<_components.img src={image.src} alt={image.alt} title={image.title} /></_components.p>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
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
    expect(await compileJsx(source, { format: "md" })).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return <_components.p><_components.img src={\`https://\${image.src}\`} alt={\`\${image.alt} of site\`} title={\`\${image.title} > directives\`} />{"\\n"}<_components.img src={\`https://\${image.src}\`} alt={\`\${image.alt} of site\`} title={\`\${image.title} > directives\`} /></_components.p>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("handle template literals in images, format mdx", async () => {
    expect(await compileJsx(source)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          img: "img",
          p: "p",
          ...props.components
        };
        return <_components.p><_components.img src={\`https://\${image.src}\`} alt="image.alt of site" title={\`\${image.title} > directives\`} />{"\\n"}<_components.img src={\`https://\${image.src}\`} alt={\`\${image.alt} of site\`} title={\`\${image.title} > directives\`} /></_components.p>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });
});

describe("recma-mdx-interpolate, html", () => {
  const source = dedent`
    <a href={href} title={title}>{text}</a>
    <img src={src} alt={alt} title={title} />
  `;

  // ******************************************
  it("handle html inputs, simple variables", async () => {
    expect(await compileJsx(source, { format: "md" })).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        const _components = {
          a: "a",
          img: "img",
          p: "p",
          ...props.components
        };
        return <_components.p><_components.a href={href} title={title}>{text}</_components.a>{"\\n"}<_components.img src={src} alt={alt} title={title} /></_components.p>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });

  // ******************************************
  it("handle html inputs, simple variables, format mdx", async () => {
    expect(await compileJsx(source)).toMatchInlineSnapshot(`
      "/*@jsxRuntime automatic*/
      /*@jsxImportSource react*/
      function _createMdxContent(props) {
        return <><a href={href} title={title}>{text}</a>{"\\n"}<img src={src} alt={alt} title={title} /></>;
      }
      export default function MDXContent(props = {}) {
        const {wrapper: MDXLayout} = props.components || ({});
        return MDXLayout ? <MDXLayout {...props}><_createMdxContent {...props} /></MDXLayout> : _createMdxContent(props);
      }
      "
    `);
  });
});
