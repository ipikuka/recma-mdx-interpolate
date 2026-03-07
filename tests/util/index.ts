import { compile as compileOriginal, type CompileOptions } from "@mdx-js/mdx";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import logTree from "unist-plugin-log-tree";

import recmaMdxInterpolate, { type InterpolateOptions } from "../../src";

export const compile = async (
  source: string,
  options?: CompileOptions & InterpolateOptions & { highlight?: boolean },
) => {
  const {
    exclude = {},
    disable = false,
    interpolationSyntaxForCodeFence = "{{",
    strict = false,
    highlight = false,
    format = "mdx",
    ...rest
  } = options ?? {};

  return String(
    await compileOriginal(source, {
      format,
      ...rest,
      rehypePlugins:
        format === "md"
          ? [rehypeRaw, ...(highlight ? [rehypeHighlight] : [])]
          : [...(highlight ? [rehypeHighlight] : [])],
      recmaPlugins: [
        [recmaMdxInterpolate, { exclude, disable, interpolationSyntaxForCodeFence, strict }],
        logTree({
          excludeKeys: ["position", "range", "loc", "start", "end"],
          enabled: false,
          // preserveSubtree: true,
          // test: (node) => {
          //   // only log code elements
          //   return "arguments" in node && node.arguments[0].property?.name === "code";
          // },
        }),
      ],
    }),
  );
};
