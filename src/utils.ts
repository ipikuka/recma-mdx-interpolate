import type {
  Literal,
  Identifier,
  MemberExpression,
  TemplateElement,
  TemplateLiteral,
  Expression,
  ArrayExpression,
} from "estree";

const regexc = /\{([^{}]+)\}/g; // with capture group, matches {expression}
const regexc_codefence = /\{!%&([^{}]+)&%!}/g; // with capture group, matches {!%&expression&%!}

const regex_if_entire = /^\{[^{}]+\}$/; // matches if the entire string is exactly one expression like {expression}
const regex_codefence_if_entire = /^\{!%&[^{}]+&%!}$/; // matches if the entire string is exactly one expression like {!%&expression&%!}

// a utility for type predicate (estree node type guards)
function isNodeType<T extends { type: string }>(node: unknown, type: T["type"]): node is T {
  return typeof node === "object" && node !== null && "type" in node && node.type === type;
}

export const isArrayExpression = (node: unknown): node is ArrayExpression =>
  isNodeType<ArrayExpression>(node, "ArrayExpression");

export const isStringLiteral = (node: unknown): node is Literal & { value: string } =>
  isNodeType<Literal & { value: string }>(node, "Literal") && typeof node.value === "string";

function replaceDoubleBraces(input: string): string {
  return input.replace(/\{\{([^{}]*)\}\}/g, "{$1}");
}
function removePrefixBeforeColon(input: string): string {
  return input.replace(/\{([^{}:]*:)?([^{}]+)\}/g, "{$2}");
}

export function normalizeBracedExpressions(input: string): string {
  // First replace double braces with single braces
  const afterDoubleBraces = replaceDoubleBraces(input);

  // Then remove prefixes before the colon
  return removePrefixBeforeColon(afterDoubleBraces);
}

/**
 * Composes a MemberExpression or Identifier from a dot-notated string.
 */
function composeMemberExpressionOrIdentifier(value: string): MemberExpression | Identifier {
  const parts = value.split(".");

  // Base case: single identifier (e.g., "a")
  if (parts.length === 1) {
    return {
      type: "Identifier",
      name: parts[0],
    };
  }

  // Recursive case: "a.b.c" → Member(Member(a, b), c)

  const lastPart = parts[parts.length - 1];
  const remainingPath = parts.slice(0, -1).join(".");

  const isComputed = lastPart.includes("-");

  return {
    type: "MemberExpression",
    object: composeMemberExpressionOrIdentifier(remainingPath),
    property: isComputed
      ? { type: "Literal", value: lastPart }
      : { type: "Identifier", name: lastPart },
    computed: isComputed,
    optional: false,
  };
}

/**
 * Parses a string with {!%&brackets&%!} and returns an ArrayExpression AST node.
 */
export function composeArrayExpressionForCodeFence(value: string): ArrayExpression {
  const elements: Expression[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // If the entire value is just a single expression like "{!%&props.x&%!}"
  if (regex_codefence_if_entire.test(value)) {
    return {
      type: "ArrayExpression",
      elements: [composeMemberExpressionOrIdentifier(value.slice(4, -4))],
    };
  }

  while ((match = regexc_codefence.exec(value)) !== null) {
    const [whole, expr] = match;
    const index = match.index;

    // 1. Push preceding static text as a Literal (if not empty)
    const precedingText = value.slice(lastIndex, index);
    if (precedingText) {
      elements.push({ type: "Literal", value: precedingText });
    }

    // 2. Push the dynamic expression (MemberExpression or Identifier)
    elements.push(composeMemberExpressionOrIdentifier(expr.trim()));

    lastIndex = index + whole.length;
  }

  // 3. Push any remaining static text as a Literal
  const remainingText = value.slice(lastIndex);
  if (remainingText) {
    elements.push({ type: "Literal", value: remainingText });
  }

  return {
    type: "ArrayExpression",
    elements,
  };
}

/**
 * Parses a string with {!%&brackets&%!} and returns if,
 * MemberExpression or Identifier if the entire value is just a single expression
 * TemplateLiteral if it contains static text mixed with expressions.
 */
export function composeTemplateLiteralForCodeFence(
  value: string,
): TemplateLiteral | MemberExpression | Identifier {
  const quasis: TemplateElement[] = [];
  const expressions: Expression[] = [];

  const regex = regexc_codefence; // Matches {!%&expression&%!}
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // If the entire value is just a single expression like "{props.x}"
  if (regex_codefence_if_entire.test(value)) {
    return composeMemberExpressionOrIdentifier(value.slice(4, -4));
  }

  while ((match = regex.exec(value)) !== null) {
    const [whole, expr] = match;
    const index = match.index;

    // Always push the in-between or leading text (even if empty)
    const raw = value.slice(lastIndex, index);
    quasis.push(makeTemplateElement(raw));

    // Push the expression as MemberExpression or Identifier
    expressions.push(composeMemberExpressionOrIdentifier(expr.trim()));

    lastIndex = index + whole.length;
  }

  // Always push final quasi (even if "")
  const tailRaw = value.slice(lastIndex);
  quasis.push(makeTemplateElement(tailRaw));

  // Validate shape
  if (quasis.length !== expressions.length + 1) {
    throw new Error(
      `TemplateLiteral malformed: quasis.length=${quasis.length}, expressions.length=${expressions.length}`,
    );
  }

  // Fix tail flag
  for (let i = 0; i < quasis.length; i++) {
    quasis[i].tail = i === quasis.length - 1;
  }

  return {
    type: "TemplateLiteral",
    quasis,
    expressions,
  };
}

/**
 * Parses a string with {brackets} and returns if,
 * MemberExpression or Identifier if the entire value is just a single expression
 * TemplateLiteral if it contains static text mixed with expressions.
 */
export function composeTemplateLiteral(
  value: string,
): TemplateLiteral | MemberExpression | Identifier {
  const quasis: TemplateElement[] = [];
  const expressions: Expression[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // If the entire value is just a single expression like "{props.x}"
  if (regex_if_entire.test(value)) {
    return composeMemberExpressionOrIdentifier(value.slice(1, -1));
  }

  while ((match = regexc.exec(value)) !== null) {
    const [whole, expr] = match;
    const index = match.index;

    // Always push the in-between or leading text (even if empty)
    const raw = value.slice(lastIndex, index);
    quasis.push(makeTemplateElement(raw));

    // Push the expression as MemberExpression or Identifier
    expressions.push(composeMemberExpressionOrIdentifier(expr.trim()));

    lastIndex = index + whole.length;
  }

  // Always push final quasi (even if "")
  const tailRaw = value.slice(lastIndex);
  quasis.push(makeTemplateElement(tailRaw));

  // Validate shape
  if (quasis.length !== expressions.length + 1) {
    throw new Error(
      `TemplateLiteral malformed: quasis.length=${quasis.length}, expressions.length=${expressions.length}`,
    );
  }

  // Fix tail flag
  for (let i = 0; i < quasis.length; i++) {
    quasis[i].tail = i === quasis.length - 1;
  }

  return {
    type: "TemplateLiteral",
    quasis,
    expressions,
  };
}

function makeTemplateElement(raw: string): TemplateElement {
  return {
    type: "TemplateElement",
    value: { raw, cooked: raw },
    tail: false,
  };
}

export function filterNameAllowOrExclude(
  name: string,
  allowed: string | string[] | true,
  excluded: string | string[] | true | undefined,
): boolean {
  // Handle exclusions
  if (excluded) {
    if (excluded === true) return false;
    if (typeof excluded === "string") {
      if (excluded === name) return false;
    } else {
      if (excluded.includes(name)) return false;
    }
  }

  // Handle inclusions
  if (allowed === true) return true;
  return typeof allowed === "string" ? allowed === name : allowed.includes(name);
}

/**
 * Reverses the string and replaces structural characters (brackets, etc.)
 * with their mirrored counterparts.
 */
const mirrorString = (text: string): string => {
  const mapping: Record<string, string> = {
    "(": ")",
    ")": "(",
    "[": "]",
    "]": "[",
    "{": "}",
    "}": "{",
    "<": ">",
    ">": "<",
  };

  return Array.from(text)
    .reverse()
    .map((char) => mapping[char] || char)
    .join("");
};

/**
 * Professional Escape Function
 * Escapes EVERY character that isn't a letter or a number or underscore.
 * This is the safest way to handle symbols like $, <, :, [, etc.
 */
const escapeRegex = (s: string) => s.replace(/[^a-zA-Z0-9_]/g, "\\$&");

/**
 * Generates a dynamic regex for interpolation syntax in code fences.
 * It strictly captures valid JavaScript identifiers or member expressions (e.g., name or props.user.name).
 * The target is capturing JavaScript object keys or dot-notated member expressions.
 */
export function getInterpolationRegexForCodeFence(open: string, strict: boolean): RegExp {
  const close = mirrorString(open);

  const escapedOpen = escapeRegex(open);
  const escapedClose = escapeRegex(close);

  /**
   * Regex Logic:
   * 1. ${escapedOpen} : Start delimiter (e.g., \$\$)
   * 2. (strict === false) \s* : Optional whitespace before the expression
   * 3. ([a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$-]*)*) :
   *    - [a-zA-Z_$] : First identifier must start with a letter, _ or $
   *    - [\w$]* : Remaining characters of the first identifier may include alphanumeric, _ or $
   *    - (?:\.[a-zA-Z_$][\w$-]*)* : Optional member expressions using dot notation
   *      where each property:
   *        • starts with a letter, _ or $
   *        • may contain alphanumeric, _, $, or dash (-)
   *      This allows patterns like: name, version.name, version.my-name
   * 4. (strict === false) \s* : Optional whitespace after the expression
   * 5. ${escapedClose} : End delimiter
   */
  return strict
    ? new RegExp(
        `${escapedOpen}([a-zA-Z_$][\\w$]*(?:\\.[a-zA-Z_$][\\w$-]*)*)${escapedClose}`,
        "g",
      )
    : new RegExp(
        `${escapedOpen}\\s*([a-zA-Z_$][\\w$]*(?:\\.[a-zA-Z_$][\\w$-]*)*)\\s*${escapedClose}`,
        "g",
      );
}
