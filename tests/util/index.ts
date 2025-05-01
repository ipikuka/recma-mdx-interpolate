import { compile as compileOriginal, type CompileOptions } from "@mdx-js/mdx";
import rehypeRaw from "rehype-raw";

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
      recmaPlugins: [[recmaMdxInterpolate, { exclude, disable }]],
    }),
  );
};

export const compileJsx = async (
  source: string,
  options?: CompileOptions & InterpolateOptions,
) => {
  const { exclude = {}, disable = false, format = "mdx", ...rest } = options ?? {};

  return String(
    await compileOriginal(source, {
      format,
      ...rest,
      jsx: true,
      rehypePlugins: format === "md" ? [rehypeRaw] : undefined,
      recmaPlugins: [[recmaMdxInterpolate, { exclude, disable }]],
    }),
  );
};
