import dedent from "dedent";
import * as prettier from "prettier";

import { processMd, processMdx } from "./util/integration";

describe("recma-mdx-interpolate, code fence integration", () => {
  // ******************************************
  it("handle interpolation in markdown code fences", async () => {
    const source = dedent`
      \`\`\`bash
      pnpm add {{ name }}@{{ node.version }} /* version {{ node.version-name }} */
      \`\`\`
    `;

    const scope = {
      name: "@mdx-js/loader",
      node: {
        version: "1.0.0",
        "version-name": "Nodle",
      },
    };

    const expected = `
      "<pre><code class="language-bash">pnpm add @mdx-js/loader@1.0.0 /* version Nodle */
      </code></pre>"
    `;

    const htmlMd = await processMd(source, { scope });
    const htmlMdx = await processMdx(source, { scope });

    expect(htmlMd).toMatchInlineSnapshot(expected);
    expect(htmlMdx).toMatchInlineSnapshot(expected);
  });

  // ******************************************
  it("handle interpolation in markdown code fences with custom syntax", async () => {
    const source = dedent`
      \`\`\`bash
      pnpm add <<:name:>>@<<:node.version:>> /* version <<:node.version-name:>> */
      \`\`\`
    `;

    const scope = {
      name: "@mdx-js/loader",
      node: {
        version: "1.0.0",
        "version-name": "Nodle",
      },
    };

    const expected = `
      "<pre><code class="language-bash">pnpm add @mdx-js/loader@1.0.0 /* version Nodle */
      </code></pre>"
    `;

    const htmlMd = await processMd(source, { scope, interpolationSyntaxForCodeFence: "<<:" });
    const htmlMdx = await processMdx(source, { scope, interpolationSyntaxForCodeFence: "<<:" });

    expect(htmlMd).toMatchInlineSnapshot(expected);
    expect(htmlMdx).toMatchInlineSnapshot(expected);
  });

  // ******************************************
  it("handle interpolation in markdown code fences with highlighting", async () => {
    const source = dedent`
      \`\`\`js
      import {{ loader }} from {{ package_name }};
      return <div>{loader}</div>;
      \`\`\`
    `;

    const scope = {
      loader: "loader, { type Loader }",
      package_name: '"@mdx-js/package"',
    };

    const expected = `
      "<pre><code class="hljs language-js"><span class="hljs-keyword">import</span> loader, { type Loader } <span class="hljs-keyword">from</span> &quot;@mdx-js/package&quot;;
      <span class="hljs-keyword">return</span> <span class="xml"><span class="hljs-tag">&lt;<span class="hljs-name">div</span>&gt;</span>{loader}<span class="hljs-tag">&lt;/<span class="hljs-name">div</span>&gt;</span></span>;
      </code></pre>
      "
    `;

    const htmlMd = await processMd(source, { scope, highlight: true });
    const htmlMdx = await processMdx(source, { scope, highlight: true });

    expect(await prettier.format(htmlMd, { parser: "html" })).toMatchInlineSnapshot(expected);
    expect(await prettier.format(htmlMdx, { parser: "html" })).toMatchInlineSnapshot(expected);
  });
});

describe("recma-mdx-interpolate, HTML input", () => {
  // ******************************************
  it("handle interpolation in markdown code fences in raw html, format md", async () => {
    // in markdown format, we can use custom syntax for interpolation in code fences in raw html
    const source = dedent`
      <pre><code className="language-bash">
        pnpm add <<:name:>>@<<:node.version:>> /* version <<:node.version-name:>> */
      </code></pre>
    `;

    const scope = {
      name: "@mdx-js/loader",
      node: {
        version: "1.0.0",
        "version-name": "Nodle",
      },
    };

    const htmlMd = await processMd(source, { scope, interpolationSyntaxForCodeFence: "<<:" });

    expect(htmlMd).toMatchInlineSnapshot(`
      "<pre><code class="language-bash">
        pnpm add @mdx-js/loader@1.0.0 /* version Nodle */
      </code></pre>"
    `);
  });

  // ******************************************
  it("handle interpolation in markdown code fences in raw html, format mdx", async () => {
    // in MDX format, no need to use custom syntax for interpolation in code fences in raw html, it works with default {} syntax
    const source = dedent`
      <pre>
        <code className="language-bash">
          pnpm add {name}@{node.version} /* version {node.version-name} */
        </code>
      </pre>
    `;

    const scope = {
      name: "@mdx-js/loader",
      node: {
        version: "1.0.0",
        "version-name": "Nodle", // dashed keys are not supported in MDX expressions
      },
    };

    /**
     * in the compiled source, the children is
     * ["pnpm add ", name, "@", node.version, " /* version ", node.version - name, " *\/"]
     *
     * pay attention to space around dash in "node.version - name" which causes NaN in the output
     * it's not a typo, it's how the mdx parser handles dashed keys
     */

    const htmlMdx = await processMdx(source, { scope });

    expect(htmlMdx).toMatchInlineSnapshot(
      `"<pre><code class="language-bash"><p>pnpm add @mdx-js/loader@1.0.0 /* version NaN */</p></code></pre>"`,
    );
  });
});
