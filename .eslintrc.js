module.exports = {
  "env": {
    "node": true,
    "commonjs": true,
    "es6": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2015
  },
  "rules": {
    "quotes": [2, "single"],
    "no-alert": "error",
    "no-irregular-whitespace": "error",
    "eqeqeq": "warn",
    "key-spacing": "error",
    "no-dupe-keys": "error",
    "no-mixed-spaces-and-tabs": "error",
    "no-multiple-empty-lines": ["error", { "max": 1 }],
    "no-multi-spaces": ["error", { "ignoreEOLComments": true }],
    "no-underscore-dangle": "warn",
    "no-control-regex": "warn",
    "no-use-before-define": "error",
    "no-restricted-globals": "warn",
    "indent": ["error", 2]
  }
};