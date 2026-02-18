import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import pluginJest from "eslint-plugin-jest";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig(
  {
    ignores: [
      ".DS_Store",
      ".vscode/",
      "archive/",
      "coverage/",
      "dist/",
      "node_modules/",
      "package-lock.json",
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    name: "javascript",
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    name: "jest",
    files: ["**/*.spec.ts", "**/*.test.ts"],
    plugins: { jest: pluginJest },
    languageOptions: {
      globals: pluginJest.environments.globals.globals,
    },
    rules: {
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
    },
  },
  eslintPluginPrettierRecommended,
);
