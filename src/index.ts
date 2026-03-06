import type { Plugin } from "unified";
import type { ObjectExpression, Program } from "estree";
import type { JSXOpeningElement } from "estree-jsx";
import { CONTINUE, visit } from "estree-util-visit";

import {
  composeArrayExpression,
  composeTemplateLiteral,
  filterNameAllowOrExlude,
  isStringLiteral,
  normalizeBracedExpressions,
  getInterpolationRegexForCodeFence,
} from "./utils.js";

type TargetTag = "a" | "img" | "video" | "audio" | "source" | "code";

const MapOfTargetTagAttributes: Record<TargetTag, string | string[] | true> = {
  a: ["children", "href", "title"],
  img: ["alt", "src", "title"],
  video: ["src", "title"],
  audio: ["src", "title"],
  source: ["src"],
  code: ["children"],
};

export type InterpolateOptions = {
  /**
   * Exclude specific tag and attributes
   */
  exclude?: Partial<typeof MapOfTargetTagAttributes>;
  /**
   * Disable the plugin (for example when the format is not "mdx")
   */
  disable?: boolean;
  /**
   * The syntax for interpolation in code fences,
   * default is "{{"; the reversed "}}" is implicitly used to close the interpolation.
   * For example, if you set it to "{{", then opening and closing syntax are both "{{" and "}}", then you can write:
   * \`\`\`bash
   * pnpm add @mdx-js/loader@{{props.versions.mdxJsLoader}}
   * \`\`\`
   * You can also set it to other values, such as "[[".
   * \`\`\`bash
   * pnpm add @mdx-js/loader@[[props.versions.mdxJsLoader]]
   * \`\`\`
   * The plugin
   * will look for the opening syntax (e.g., "{{" or "[[" or "<<:") and,
   * will use implicitly the closing syntax (e.g., "}}" or "]]" or ":>>") to identify the interpolation expressions in code fences.
   * This is useful when you want to avoid conflict with language specific syntaxes in code fences.
   * Note: this option only affects code fences, for other tags (a, img, video, audio, source), the syntax is always { and }.
   */
  interpolationSyntaxForCodeFence?: string;
};

const DEFAULT_SETTINGS: InterpolateOptions = {
  exclude: {},
  disable: false,
  interpolationSyntaxForCodeFence: "{{",
};

const targetTags = Object.keys(MapOfTargetTagAttributes);

/**
 * It is a recma plugin which transforms the esAST / esTree.
 *
 * It interpolates identifiers wrapped in curly braces in the alt/src/title of the links/images in MDX
 *
 */
const plugin: Plugin<[InterpolateOptions?], Program> = (options) => {
  const settings = Object.assign({}, DEFAULT_SETTINGS, options) as Required<InterpolateOptions>;

  if (settings.disable) return;

  return (tree: Program) => {
    // handle JSX automatic runtime
    visit(tree, (node) => {
      if (node.type !== "CallExpression") return CONTINUE;

      if (
        "name" in node.callee &&
        node.callee.name !== "_jsx" &&
        node.callee.name !== "_jsxDEV" &&
        node.callee.name !== "_jsxs"
      ) {
        return;
      }

      // A CallExpression has two arguments
      // We are looking for firstArgument is Literal or MemberExpression
      //                    secondArgument is ObjectExpression

      const firstArgument = node.arguments[0];
      const secondArgument = node.arguments[1];

      let objectExpression: ObjectExpression | undefined;
      let currentTag: TargetTag | undefined;

      /**
       * intentionally commented out, for jsx, jsxs, jsxDev automatic runtime output
       *
       * only mdxjsx elements are Identifier in call expressions (not MemberExpression)
       * so, we can skip them, because mdx-parser already makes interpolation happen in that nodes!
       *
       */
      // if (
      //   firstArgument.type === "Literal" &&
      //   typeof firstArgument.value === "string" &&
      //   targetTags.includes(firstArgument.value.toLowerCase()) &&
      //   secondArgument.type === "ObjectExpression"
      // ) {
      //   objectExpression = secondArgument;
      //   currentTag = firstArgument.value as TargetTag;
      // }

      if (
        firstArgument.type === "MemberExpression" &&
        firstArgument.object.type === "Identifier" &&
        firstArgument.object.name === "_components" &&
        firstArgument.property.type === "Identifier" &&
        targetTags.includes(firstArgument.property.name.toLowerCase()) &&
        secondArgument.type === "ObjectExpression"
      ) {
        objectExpression = secondArgument;
        currentTag = firstArgument.property.name as TargetTag;
      }

      if (objectExpression && currentTag) {
        const allowedTag = MapOfTargetTagAttributes[currentTag];
        const excludedTag = settings.exclude[currentTag];

        const properties = objectExpression.properties
          .filter((property) => property.type === "Property")
          .filter((property) => {
            /* istanbul ignore next */
            if (property.key.type !== "Identifier") return false;
            const propertyName = property.key.name.toLowerCase();
            return filterNameAllowOrExlude(propertyName, allowedTag, excludedTag);
          });

        properties.forEach((property) => {
          if (isStringLiteral(property.value)) {
            // special handling for code fences, to allow custom interpolation syntax
            if (currentTag === "code") {
              const interpolationRegexForCodeFence = getInterpolationRegexForCodeFence(
                settings.interpolationSyntaxForCodeFence,
              );

              if (interpolationRegexForCodeFence.test(property.value.value)) {
                const propertyValue = property.value.value.replace(
                  interpolationRegexForCodeFence,
                  "{$1}",
                );

                if (/\{[^{}]+\}/.test(propertyValue)) {
                  property.value = composeArrayExpression(propertyValue);
                }
              }
            } else {
              const propertyValue = normalizeBracedExpressions(decodeURI(property.value.value));

              if (/\{[^{}]+\}/.test(propertyValue)) {
                property.value = composeTemplateLiteral(propertyValue);
              }
            }
          } else if (property.value.type === "ArrayExpression") {
            visit(property.value, (node) => {
              if (isStringLiteral(node)) {
                const propertyValue = normalizeBracedExpressions(decodeURI(node.value));

                if (/\{[^{}]+\}/.test(propertyValue)) {
                  Object.assign(node, composeTemplateLiteral(propertyValue));
                }
              }
            });
          }
        });
      }

      return CONTINUE;
    });

    // handle JSX, when { jsx: true }
    visit(tree, (node) => {
      if (node.type !== "JSXElement") return CONTINUE;

      let openingElement: JSXOpeningElement | undefined;
      let currentTag: TargetTag | undefined;

      if (node.openingElement.name.type === "JSXMemberExpression") {
        const jsxMemberExpression = node.openingElement.name;

        if (
          jsxMemberExpression.object.type === "JSXIdentifier" &&
          jsxMemberExpression.object.name === "_components" &&
          jsxMemberExpression.property.type === "JSXIdentifier" &&
          targetTags.includes(jsxMemberExpression.property.name.toLowerCase())
        ) {
          openingElement = node.openingElement;
          currentTag = jsxMemberExpression.property.name as TargetTag;
        }
      }

      /**
       * intentionally commented out, for JSX output
       *
       * only mdxjsx elements have JSXIdentifier tag name (not JSXMemberExpression)
       * so, we can skip them, because mdx-parser already makes interpolation happen in that nodes!
       *
       */
      // if (node.openingElement.name.type === "JSXIdentifier") {
      //   const jsxIdentifier = node.openingElement.name;

      //   if (targetTags.includes(jsxIdentifier.name.toLowerCase())) {
      //     openingElement = node.openingElement;
      //     currentTag = jsxIdentifier.name as TargetTag;
      //   }
      // }

      if (openingElement && currentTag) {
        const allowedTag = MapOfTargetTagAttributes[currentTag];
        const excludedTag = settings.exclude[currentTag];

        const jsxAttributes = openingElement.attributes
          .filter((attr) => attr.type === "JSXAttribute")
          .filter((attr) => {
            /* istanbul ignore next */
            if (attr.name.type !== "JSXIdentifier") return false;
            const attrName = attr.name.name.toLowerCase();
            return filterNameAllowOrExlude(attrName, allowedTag, excludedTag);
          });

        jsxAttributes.forEach((jsxAttribute) => {
          /* istanbul ignore if */
          if (isStringLiteral(jsxAttribute.value)) {
            const propertyValue = normalizeBracedExpressions(
              decodeURI(jsxAttribute.value.value),
            );

            if (/\{[^{}]+\}/.test(propertyValue)) {
              jsxAttribute.value = {
                type: "JSXExpressionContainer",
                expression: composeTemplateLiteral(propertyValue),
              };
            }
          }
        });

        // visit the children additionally, if the node is an anchor
        if (openingElement && currentTag === "a") {
          visit(node, (node_) => {
            if (
              node_.type === "JSXExpressionContainer" &&
              node_.expression.type === "Literal" &&
              typeof node_.expression.value === "string"
            ) {
              const propertyValue = normalizeBracedExpressions(
                decodeURI(node_.expression.value),
              );

              if (/\{[^{}]+\}/.test(propertyValue)) {
                node_.expression = composeTemplateLiteral(propertyValue);
              }
            }
          });
        }
      }

      return CONTINUE;
    });
  };
};

export default plugin;

/*

The plugin basically turns code children from this: 

{
  type: 'Property',
  key: {
    type: 'Identifier',
    name: 'children'
  },
  value: {
    type: 'Literal',
    value: 'pnpm add @mdx-js/loader@{{props.versions.mdxJsLoader}}\n'
  },
  kind: 'init',
  method: false,
  shorthand: false,
  computed: false
}

to this:

{
  type: 'ObjectExpression',
  properties: [
    {
      type: 'Property',
      key: {
        type: 'Identifier',
        name: 'children'
      },
      value: {
        type: 'ArrayExpression',
        elements: [
          {
            type: 'Literal',
            value: 'pnpm add @mdx-js/loader@'
          },
          {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: {
                type: 'Identifier',
                name: 'props'
              },
              property: {
                type: 'Identifier',
                name: 'versions'
              },
              computed: false,
              optional: false
            },
            property: {
              type: 'Identifier',
              name: 'mdxJsLoader'
            },
            computed: false,
            optional: false
          },
          {
            type: 'Literal',
            value: '\n'
          }
        ]
      },
      kind: 'init',
      method: false,
      shorthand: false,
      computed: false
    }
  ]
}

*/
