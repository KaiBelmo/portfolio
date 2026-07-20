---
title: "TypeScript: Not Always the Answer"
slug: "typescript-not-always-the-answer-2e98"
source: "https://dev.to/b1m0110/typescript-not-always-the-answer-2e98"
published_at: "2023-07-27T21:03:28Z"
description: "JavaScript is a versatile and dynamic programming language that allows developers to build a wide..."
tags: ["typescript", "jsdoc", "javascript"]
---
JavaScript is a versatile and dynamic programming language that allows developers to build a wide range of applications. However, its dynamic nature can sometimes lead to errors and bugs that are challenging to detect during development. To address this, developers often turn to type annotations to provide clarity and ensure code correctness. Two popular approaches for adding type annotations to JavaScript code are JSDoc and TypeScript.

### Understanding JSDoc
JSDoc is a comment syntax that can be used to annotate JavaScript code with type information. JSDoc annotations are not enforced by the JavaScript compiler, but they can be used by linters and IDEs to provide static type checking. 
JSDoc annotations are written in the form of @tag, where the tag specifies the type or purpose of the annotated element. For example: 
```JS
/**
 * @type {string}
 */
const randomestring = "42";
```
JSDoc also supports more complex type annotations, such as custom objects, arrays, and function signatures.
```JS
/**
 * @typedef {Object} Foo
 * @property {string} bar
 * @property {number} nda
 */

/**
 * @type {Foo[]}
 */
const randomObj = [
  { bar: "the answer to life, universe and everything", nda: 42 },
  { bar: "random string", nda: 25 }
];

/**
 * @param {Foo} obj
 * @returns {string}
 */
function randomFunction(obj) {
  return `${obj[0].bar} is ${obj[0].nda}.`;
}
```

### Understanding TypeScript
TypeScript is JavaScript on steroids, adding optional static typing and other powerful features to the language. It allows developers to write a more strict form of JavaScript that helps write less error-prone code. 

> TypeScript needs to be compiled before it can be executed. 

```TS
interface Foo {
  bar: string;
  nda: number;
}

const randomObj: Foo[] = [
  { bar: "the answer to life, universe and everything", nda: 42 },
  { bar: "random string", nda: 25 }
];

function randomFunction(obj: Foo): string {
  return `${obj[0].bar} is ${obj[0].nda}.`;
}

```
### JSDoc vs. TypeScript: Choosing the Right Approach

- Scenario #1 If you are using a framework like Next.js or Vue, there is always a build step. Therefore, you can ignore JSDoc and use TypeScript.
- JSDoc is a favorable option over TypeScript in scenarios where faster shipping is crucial due to the absence of compilation steps. Additionally, it proves beneficial when working with third-party JavaScript libraries without TypeScript support, handling small projects or scripts, and when incrementally adding type annotations to existing JavaScript codebases instead of rewriting them in TypeScript.

## useful links
- [Rich Harris (creator of Svelte) talks about Typescript and JSdoc.](https://www.youtube.com/watch?v=MJHO6FSioPI)