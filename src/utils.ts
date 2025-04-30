import type {
  Literal,
  Identifier,
  MemberExpression,
  TemplateElement,
  TemplateLiteral,
  Expression,
} from "estree";

export function isStringLiteral(node: unknown): node is Literal & { value: string } {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Literal).type === "Literal" &&
    typeof (node as Literal).value === "string"
  );
}

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
  return {
    type: "MemberExpression",
    object: composeMemberExpressionOrIdentifier(parts.slice(0, -1).join(".")),
    property: {
      type: "Identifier",
      name: parts[parts.length - 1],
    },
    computed: false,
    optional: false,
  };
}

export function composeTemplateLiteral(
  value: string,
): TemplateLiteral | MemberExpression | Identifier {
  const quasis: TemplateElement[] = [];
  const expressions: Expression[] = [];

  const regex = /\{([^{}]+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const RegexCurlyBraced = /^\{[^{}]*\}$/;

  if (RegexCurlyBraced.test(value)) {
    return composeMemberExpressionOrIdentifier(value.slice(1, -1));
  }

  while ((match = regex.exec(value)) !== null) {
    const [whole, expr] = match;
    const index = match.index;

    // Always push the in-between or leading text (even if empty)
    const raw = value.slice(lastIndex, index);
    quasis.push(makeTemplateElement(raw));

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

export function filterNameAllowOrExlude(
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
