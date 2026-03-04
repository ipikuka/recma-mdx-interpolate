import { compile as compileOriginal, type CompileOptions } from "@mdx-js/mdx";
import rehypeRaw from "rehype-raw";
import logTree from "unist-plugin-log-tree";

import recmaMdxInterpolate, { type InterpolateOptions } from "../../src";

export const compile = async (
  source: string,
  options?: CompileOptions & InterpolateOptions,
) => {
  const { exclude = {}, disable = false, format = "mdx", ...rest } = options ?? {};

  return String(
    await compileOriginal(source, {
      format,
      ...rest,
      rehypePlugins: format === "md" ? [rehypeRaw] : undefined,
      recmaPlugins: [
        [recmaMdxInterpolate, { exclude, disable }],
        logTree({
          excludeKeys: ["position", "range", "loc", "start", "end"],
          enabled: false,
        }),
      ],
    }),
  );
};
