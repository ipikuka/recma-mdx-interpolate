import dedent from "dedent";

import { compile } from "./util";

describe("recma-mdx-interpolate, code fences with default syntax", () => {
  const source = dedent`
    \`\`\`bash
    pnpm add {{loader}}@{{props.version}}
    \`\`\`
  `;

  // ******************************************
  it("handle interpolation, format md", async () => {
    expect(await compile(source, { format: "md", jsx: true })).toContain(
      "pnpm add ${loader}@${props.version}",
    );
  });

  // ******************************************
  it("handle interpolation, format mdx", async () => {
    expect(await compile(source, { format: "mdx", jsx: true })).toContain(
      "pnpm add ${loader}@${props.version}",
    );
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
        jsx: true,
      }),
    ).toContain("pnpm add ${loader}@${props.version}");
  });

  // ******************************************
  it("handle interpolation, format mdx", async () => {
    expect(
      await compile(source, {
        format: "mdx",
        interpolationSyntaxForCodeFence: "<<:",
        jsx: true,
      }),
    ).toContain("pnpm add ${loader}@${props.version}");
  });
});

describe("recma-mdx-interpolate, supports interpolation with dashes", () => {
  const source = dedent`
    \`\`\`bash
    pnpm add {{ _my-loader }}@{{ props.version-name }}
    \`\`\`
  `;

  // ******************************************
  it("handle interpolation, format md", async () => {
    expect(await compile(source, { format: "md", jsx: true })).toContain(
      'pnpm add ${_my-loader}@${props["version-name"]}',
    );
  });

  // ******************************************
  it("handle interpolation, format mdx", async () => {
    expect(await compile(source, { format: "mdx", jsx: true })).toContain(
      'pnpm add ${_my-loader}@${props["version-name"]}',
    );
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
    expect(
      await compile(source, { format: "md", exclude: { code: true }, jsx: true }),
    ).toContain("pnpm add {{loader}}@{{props.version}}");
  });

  // ******************************************
  it("handle interpolation, format mdx", async () => {
    expect(
      await compile(source, { format: "mdx", exclude: { code: true }, jsx: true }),
    ).toContain("pnpm add {{loader}}@{{props.version}}");
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
    expect(await compile(source, { format: "md", jsx: true })).toContain(
      "pnpm add {& loader &}@{& props.version &}\\n\\nconst { name } = props;",
    );
  });

  // ******************************************
  it("handle interpolation, format mdx", async () => {
    expect(await compile(source, { format: "mdx", jsx: true })).toContain(
      "pnpm add {& loader &}@{& props.version &}\\n\\nconst { name } = props;",
    );
  });
});
