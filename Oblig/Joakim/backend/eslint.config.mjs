import js from "@eslint/js";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    env: {
      node: true,   
      es2021: true
    },
    rules: {
      // your rules here
    }
  }
];
