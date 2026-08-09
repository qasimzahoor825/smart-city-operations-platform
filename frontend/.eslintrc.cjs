module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "next/typescript", "prettier"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports" },
    ],
    "react/no-unescaped-entities": "off",
  },
  ignorePatterns: [".next", "node_modules", "next-env.d.ts"],
};