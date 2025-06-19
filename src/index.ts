import type { Plugin } from "unified";
import type { ObjectExpression, Program } from "estree";
import type { JSXOpeningElement } from "estree-jsx";
import { CONTINUE, visit } from "estree-util-visit";

import {
  composeTemplateLiteral,
  filterNameAllowOrExlude,
  isStringLiteral,
  normalizeBracedExpressions,
} from "./utils.js";

type TargetTag = "a" | "img" | "video" | "audio" | "source";

const MapOfTargetTagAttributes: Record<TargetTag, string | string[] | true> = {
  a: ["children", "href", "title"],
  img: ["alt", "src", "title"],
  video: ["src", "title"],
  audio: ["src", "title"],
  source: ["src"],
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
};

const DEFAULT_SETTINGS: InterpolateOptions = {
  exclude: {},
  disable: false,
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

      /* istanbul ignore if */
      if ("name" in node.callee) {
        if (
          node.callee.name !== "_jsx" &&
          node.callee.name !== "_jsxDEV" &&
          node.callee.name !== "_jsxs"
        ) {
          return;
        }
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
      //   targetTags.includes(firstArgument.value.toLowerCase())
      // ) {
      //   if (secondArgument.type === "ObjectExpression") {
      //     objectExpression = secondArgument;
      //     currentTag = firstArgument.value as TargetTag;
      //   }
      // }

      if (firstArgument.type === "MemberExpression") {
        /* istanbul ignore if */
        if (
          firstArgument.object.type === "Identifier" &&
          firstArgument.object.name === "_components"
        ) {
          if (
            firstArgument.property.type === "Identifier" &&
            targetTags.includes(firstArgument.property.name.toLowerCase())
          ) {
            if (secondArgument.type === "ObjectExpression") {
              objectExpression = secondArgument;
              currentTag = firstArgument.property.name as TargetTag;
            }
          }
        }
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
            const propertyValue = normalizeBracedExpressions(decodeURI(property.value.value));

            if (/\{[^{}]+\}/.test(propertyValue)) {
              property.value = composeTemplateLiteral(propertyValue);
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
