module.exports = {
  "extends": ["airbnb-base", "prettier"],
  "plugins": ["angular"],
  "globals": {
    "window": true,
    "angular": true,
    "_": true,
    "localStorage": true,
    "sessionStorage": true,
    "isIOS9UIWebView": true
  },
  rules: {
    "no-extend-native": "off",
    indent: ["error", 4, {SwitchCase: 1}],
    "key-spacing": ["error", {align: "colon"}],
    "max-len": [
      "error",
      120,
      4,
      {
        ignoreUrls: true,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    "func-names": "off",
    "no-use-before-define": "off",
    "no-plusplus": "off",
    "no-return-assign": "off",
    "prefer-rest-params": "off",
    "no-param-reassign": "off"
  }
};
