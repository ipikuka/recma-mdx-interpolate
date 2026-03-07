import type { VFileCompatible } from "vfile";
import { evaluate, type EvaluateOptions } from "next-mdx-remote-client/rsc";
import ReactDOMServer from "react-dom/server";
import rehypeRaw from "rehype-raw";

import plugin, { type InterpolateOptions } from "../../src";
import rehypeHighlight from "rehype-highlight";

export const processMd = async (
  input: VFileCompatible,
  options?: InterpolateOptions & { scope?: EvaluateOptions["scope"]; highlight?: boolean },
) => {
  const { scope, highlight, ...rest } = options ?? {};
  const format = "md";

  const { content, error } = await evaluate({
    source: input,
    options: {
      scope,
      mdxOptions: {
        format,
        rehypePlugins: [rehypeRaw, ...(highlight ? [rehypeHighlight] : [])],
        recmaPlugins: [[plugin, rest]],
      },
    },
  });

  if (error) throw error;

  return ReactDOMServer.renderToStaticMarkup(content);
};

export const processMdx = async (
  input: VFileCompatible,
  options?: InterpolateOptions & { scope?: EvaluateOptions["scope"]; highlight?: boolean },
) => {
  const { scope, highlight, ...rest } = options ?? {};
  const format = "mdx";

  const { content, error } = await evaluate({
    source: input,
    options: {
      scope,
      mdxOptions: {
        format,
        rehypePlugins: highlight ? [rehypeHighlight] : undefined,
        recmaPlugins: [[plugin, rest]],
      },
    },
  });

  if (error) throw error;

  return ReactDOMServer.renderToStaticMarkup(content);
};
