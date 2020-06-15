module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "parser": "@typescript-eslint/parser",
    "plugins": [
        "@typescript-eslint",
        "@typescript-eslint/tslint",
        "jsdoc",
        "react"
    ],
    "rules": {
        "react/jsx-uses-vars": "error",
        "react/jsx-uses-react": "error",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/consistent-type-definitions": "error",
        "@typescript-eslint/dot-notation": "error",
        "@typescript-eslint/explicit-member-accessibility": [
            "off",
            {
                "accessibility": "explicit"
            }
        ],
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "none",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/member-ordering": "off",
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-require-imports": "off",
        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          {
            "argsIgnorePattern": "^_" ,
            "varsIgnorePattern": "^_"
          }
        ] ,
        "@typescript-eslint/no-use-before-define": "error",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/quotes": [
            "error",
            "single",
            {
                "avoidEscape": true,
                "allowTemplateLiterals": true
            }
        ],
        "@typescript-eslint/semi": [
            "error",
            "never"
        ],
        "@typescript-eslint/strict-boolean-expressions": "off",
        "@typescript-eslint/type-annotation-spacing": "error",
        "arrow-parens": [
            "error",
            "as-needed"
        ],
        "brace-style": [
            "error",
            "1tbs"
        ],
        "camelcase": "error",
        "class-methods-use-this": "error",
        "comma-dangle": "error",
        "constructor-super": "error",
        "curly": "off",
        "default-case": "error",
        "eol-last": "error",
        "eqeqeq": [
            "error",
            "smart"
        ],
        "func-style": [
          "error",
          "declaration",
           { "allowArrowFunctions": true }
        ],
        "guard-for-in": "off",
        "id-blacklist": [
            "error",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined",
            "undefined"
        ],
        "id-match": "error",
        "jsdoc/check-alignment": "error",
        "jsdoc/check-indentation": "error",
        "jsdoc/newline-after-description": "error",
        "max-len": [
            "error",
            {
                "code": 100
            }
        ],
        "no-bitwise": "error",
        "no-caller": "error",
        "no-cond-assign": "error",
        "no-console": [
            "error",
            {
                "allow": [
                    "log",
                    "warn",
                    "error",
                    "dir",
                    "assert",
                    "clear",
                    "count",
                    "countReset",
                    "group",
                    "groupCollapsed",
                    "groupEnd",
                    "Console",
                    "dirxml",
                    "table",
                    "markTimeline",
                    "profile",
                    "profileEnd",
                    "timeline",
                    "timelineEnd",
                    "timeStamp",
                    "context"
                ]
            }
        ],
        "no-control-regex": "error",
        "no-debugger": "error",
        "no-empty": "error",
        "no-extra-semi": "error",
        "no-eval": "error",
        "no-fallthrough": "error",
        "no-invalid-regexp": "error",
        "no-irregular-whitespace": "error",
        "no-multiple-empty-lines": "error",
        "no-new-wrappers": "error",
        "no-null/no-null": "off",
        "no-redeclare": "error",
        "no-regex-spaces": "error",
        "no-shadow": [
            "off",
            {
                "hoist": "all"
            }
        ],
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-unused-labels": "error",
        "no-var": "error",
        "object-curly-spacing": [
            "error",
            "always"
        ],
        "prefer-const": "error",
        "radix": "error",
        "spaced-comment": [
            "error",
            "always",
            {
                "markers": [
                    "/"
                ]
            }
        ],
        "use-isnan": "error",
        /*
        "@typescript-eslint/tslint/config": [
            "error",
            {
                "rules": {
                    "function-name": [
                        true,
                        {
                            "method-regex": "^[a-z][\\w\\d]+$",
                            "private-method-regex": "^__?[a-z][\\w\\d]+$",
                            "static-method-regex": "^[a-z][\\w\\d]+$",
                            "function-regex": "^[a-z][\\w\\d]+$"
                        }
                    ],
                    "jsx-alignment": true,
                    "no-unnecessary-local-variable": true,
                    "no-unnecessary-override": true,
                    "prefer-method-signature": true,
                    "typedef": [
                        true,
                        "property-declaration"
                    ],
                    "whitespace": [
                        true,
                        "check-branch",
                        "check-decl",
                        "check-operator",
                        "check-separator",
                        "check-type",
                        "check-module",
                        "check-typecast"
                    ]
                }
            }
        ]
        */
    }
};
