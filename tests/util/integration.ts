import type { VFileCompatible } from "vfile";
import { evaluate, type EvaluateOptions } from "next-mdx-remote-client/rsc";
import ReactDOMServer from "react-dom/server";
import rehypeRaw from "rehype-raw";

import plugin, { type InterpolateOptions } from "../../src";

export const processMd = async (
  input: VFileCompatible,
  options?: InterpolateOptions & { scope?: EvaluateOptions["scope"] },
) => {
  const { scope, ...rest } = options ?? {};
  const format = "md";

  const { content } = await evaluate({
    source: input,
    options: {
      scope,
      mdxOptions: {
        format,
        rehypePlugins: [rehypeRaw],
        recmaPlugins: [[plugin, rest]],
      },
    },
  });

  return ReactDOMServer.renderToStaticMarkup(content);
};

export const processMdx = async (
  input: VFileCompatible,
  options?: InterpolateOptions & { scope?: EvaluateOptions["scope"] },
) => {
  const { scope, ...rest } = options ?? {};
  const format = "mdx";

  const { content, error } = await evaluate({
    source: input,
    options: {
      scope,
      mdxOptions: {
        format,
        recmaPlugins: [[plugin, rest]],
      },
    },
  });

  if (error) console.log(error);

  return ReactDOMServer.renderToStaticMarkup(content);
};
