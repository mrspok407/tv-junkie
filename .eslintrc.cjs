module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "react-app",
    "airbnb",
    "airbnb-typescript"
  ],
  parserOptions: {
    project: "./tsconfig.json"
  },
  rules: {
    "@typescript-eslint/semi": 0
  }
}
