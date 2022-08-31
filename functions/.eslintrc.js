module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.eslint.json",
    tsconfigRootDir: __dirname,
    sourceType: "module"
  },
  ignorePatterns: [
    "/lib/**/*" // Ignore built files.
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "quotes": ["error", "double"],
    "indent": "off",
    "comma-dangle": "off",
    "max-len": ["error", {"code": 120}],
    "camelcase": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "operator-linebreak": "off",
    "linebreak-style": "off"
  }
};
