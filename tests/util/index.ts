import { compile as compileOriginal, type CompileOptions } from "@mdx-js/mdx";

import recmaMdxInterpolate, { type InterpolateOptions } from "../../src";

export const compile = async (
  source: string,
  options?: CompileOptions & InterpolateOptions,
) => {
  const { exclude = {}, disable = false, ...rest } = options ?? {};

  return String(
    await compileOriginal(source, {
      ...rest,
      recmaPlugins: [[recmaMdxInterpolate, { exclude, disable }]],
    }),
  );
};

export const compileJsx = async (
  source: string,
  options?: CompileOptions & InterpolateOptions,
) => {
  const { exclude = {}, disable = false, ...rest } = options ?? {};

  return String(
    await compileOriginal(source, {
      ...rest,
      jsx: true,
      recmaPlugins: [[recmaMdxInterpolate, { exclude, disable }]],
    }),
  );
};
