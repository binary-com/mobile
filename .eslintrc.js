module.exports = {
  "extends": ["airbnb-base", "prettier"],
  "plugins": ["angular", "jasmine"],
  "env": {
    "browser": true,
    "es6": true,
    "jquery": true,
    "jasmine": true,
  },
  "globals": {
    "window": true,
    "angular": true,
    "ionic": true,
    "cordova": true,
    "_": true,
    "localStorage": true,
    "sessionStorage": true,
    "isIOS9UIWebView": true,
    "ga": true,
    "Chart": true,
    "trackJs": true
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
    "no-param-reassign": "off",
    "radix": ['error', 'as-needed'],
    "no-prototype-builtins" : "off",

    //TODO Should be removed later
    "no-unused-vars": 0,
    "camelcase": 0,
    "no-underscore-dangle": 0,
    "no-shadow": 0,
    'no-restricted-properties': ['error', { object: 'arguments', property: 'callee', message: 'arguments.callee is deprecated' }],
  }
};
