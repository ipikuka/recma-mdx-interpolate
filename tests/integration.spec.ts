import dedent from "dedent";
import * as prettier from "prettier";

import { processMd, processMdx } from "./util/integration";

describe("recma-mdx-interpolate, markdown input", () => {
  // ******************************************
  it("handle simple variables", async () => {
    const source = dedent`
      [{text}]({href} "{title}")
      ![{{alt}}]({src} "{title}")
    `;

    const scope = {
      text: "Click here",
      href: "https://example.com",
      alt: "image alt",
      src: "image.png",
      title: "title",
    };

    const expected = `
      "<p><a href="https://example.com" title="title">Click here</a>
      <img src="image.png" alt="image alt" title="title"/></p>"
    `;

    expect(await processMd(source, { scope })).toMatchInlineSnapshot(expected);
    expect(await processMdx(source, { scope })).toMatchInlineSnapshot(expected);
  });

  // ******************************************
  it("handle object paths (required workaround)", async () => {
    const source = dedent`
      [{link.text}]({link.href} "{link.title}")
      ![{{_:image.alt}}]({image.src} "{image.title}")
    `;

    const scope = {
      link: { text: "Click here", href: "https://example.com", title: "link title" },
      image: { alt: "image alt", src: "image.png", title: "image title" },
    };

    const expected = `
      "<p><a href="https://example.com" title="link title">Click here</a>
      <img src="image.png" alt="image alt" title="image title"/></p>"
    `;

    expect(await processMd(source, { scope })).toMatchInlineSnapshot(expected);
    expect(await processMdx(source, { scope })).toMatchInlineSnapshot(expected);
  });

  // ******************************************
  it("handle deeply nested interpolations and template literals", async () => {
    const source = dedent`
      [{env.text.normal} text **{env.text.strong} text** of *{env.text.italic} text* ![{{vendor}} of {{x:env.image.alt}}]({env.image.path}{env.image.src} "{env.image.title} > directives")](https://{link.href} "{link.title} of site")
    `;

    const scope = {
      vendor: "ipikuka",
      env: {
        text: { normal: "normal", strong: "strong", italic: "italic" },
        image: {
          alt: "image alt",
          path: "https/ipikuka.com/",
          src: "image.png",
          title: "image title",
        },
      },
      link: { href: "https://example.com", title: "link title" },
    };

    const expected = `
      "<p>
        <a href="https://https://example.com" title="link title of site"
          >normal text <strong>strong text</strong> of <em>italic text</em>
          <img
            src="https/ipikuka.com/image.png"
            alt="ipikuka of image alt"
            title="image title &gt; directives"
        /></a>
      </p>
      "
    `;

    const htmlMd = await processMd(source, { scope });
    const htmlMdx = await processMdx(source, { scope });

    expect(await prettier.format(htmlMd, { parser: "html" })).toMatchInlineSnapshot(expected);
    expect(await prettier.format(htmlMdx, { parser: "html" })).toMatchInlineSnapshot(expected);
  });
});

describe("recma-mdx-interpolate, HTML input", () => {
  const source = dedent`
    <a href={href} title={title}>{text}</a>
    <img src={src} alt={alt} title={title}/>
  `;

  const scope = {
    text: "Click here",
    href: "https://example.com",
    alt: "image alt",
    src: "image.png",
    title: "title",
  };

  /**
   * TODO: mention in the README
   * the trailing slash in the title of images in the results come from self-closing slash in <img>
   * I've kept the tests as-is to see this behavior
   * actually, no need self-closing slash in markdown, or put a space before the self-closing slash
   */
  // ******************************************
  it("handle raw html in markdown", async () => {
    const expectedResult = await processMd(source, { scope });
    const excludedResult = await processMd(source, { scope, exclude: { img: true, a: true } });
    const disabledResult = await processMd(source, { scope, disable: true });

    expect(expectedResult).toMatchInlineSnapshot(`
      "<p><a href="https://example.com" title="title">Click here</a>
      <img src="image.png" alt="image alt" title="title/"/></p>"
    `);

    expect(excludedResult).toMatchInlineSnapshot(`
      "<p><a href="{href}" title="{title}">{text}</a>
      <img src="{src}" alt="{alt}" title="{title}/"/></p>"
    `);

    expect(disabledResult).toMatchInlineSnapshot(`
      "<p><a href="{href}" title="{title}">{text}</a>
      <img src="{src}" alt="{alt}" title="{title}/"/></p>"
    `);
  });

  /**
   * TODO: how to prevent from visiting mdxjsx elements already interpolated
   * when the format is mdx, the plugin visits the nodes, but does nothing,
   * since it couldn't find any interpolation, why? mdx parser already handles interpolations
   * see the proofs ---> "ecxlude" and "disable" options
   */
  it("no need handling MdxJsx elements in MDX", async () => {
    const expectedResult = await processMdx(source, { scope });
    const excludedResult = await processMdx(source, { scope, exclude: { img: true, a: true } });
    const disabledResult = await processMdx(source, { scope, disable: true });

    const output = `
      "<a href="https://example.com" title="title">Click here</a>
      <img src="image.png" alt="image alt" title="title"/>"
    `;

    expect(expectedResult).toMatchInlineSnapshot(output);
    expect(excludedResult).toMatchInlineSnapshot(output);
    expect(disabledResult).toMatchInlineSnapshot(output);
  });
});
