import dedent from "dedent";

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
