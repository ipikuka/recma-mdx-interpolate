import type { Plugin } from "unified";
import type { ObjectExpression, Program } from "estree";
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
  exclude: Partial<typeof MapOfTargetTagAttributes>;
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
    // visit for JSX automatic runtime
    visit(tree, (node) => {
      if (node.type !== "CallExpression") return CONTINUE;

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

      if (
        firstArgument.type === "Literal" &&
        typeof firstArgument.value === "string" &&
        targetTags.includes(firstArgument.value.toLowerCase())
      ) {
        if (secondArgument.type === "ObjectExpression") {
          objectExpression = secondArgument;
          currentTag = firstArgument.value as TargetTag;
        }
      }

      if (firstArgument.type === "MemberExpression") {
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
  };
};

export default plugin;
