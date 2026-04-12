import { config as reactInternal } from "@openng/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactInternal,
  {
    ignores: ["src/routeTree.gen.ts", ".next/**", "dist/**"],
  },
];
