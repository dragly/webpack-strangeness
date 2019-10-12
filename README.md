# Webpack strangeness #

This is an attempt at making one of the wasm-pack examples into an NPM package that can be
reused by others.
However, it appears as if Webpack produces code that it cannot parse properly itself when looking
for dependencies.
The result is that the WASM module in the `producer` project is not found by the `consumer`
project.

## Introduction ##

The project consists of the `producer` project, which is basically the `hello_world` example
from `wasm-bindgen`.
It has a simple library written in Rust that is being exposed to JavaScript using `wasm-pack`
and a thin JavaScript wrapper.
This project is built into the `producer/dist` folder, and the `package.json#main` points to
`dist/index.js`.

The `consumer` project depends on the `producer` project and calls a function from this module.

Building the `producer` project results in a `dist` folder that includes an `index.js`,
a Webpack JS chunk (`0.index.js`) and WASM:

```
producer/dist/
├── 0.index.js
├── a3c2a86a685292656af3.module.wasm
└── index.js
```

However, when building the `consumer` project, it does not include any `.wasm` files,
even though it is expected to do so since it will be using this code:

```
consumer/dist/
├── 0.index.js
├── index.html
└── index.js
```

The chunk also appears to be the wrong one, since the resulting output from running the
`consumer` project in the browser is:

```
index.js:131 Uncaught (in promise) ChunkLoadError: Loading chunk 0 failed.
(missing: http://localhost:8080/0.index.js)
    at Function.requireEnsure [as e] (webpack:///../producer/dist/index.js?:131:26)
    at eval (webpack://blah/./src/index.js?:3:34)
    at Module../src/index.js (webpack:///../producer/dist/index.js?:272:1)
    at __webpack_require__ (webpack:///../producer/dist/index.js?:89:30)
    at eval (webpack:///../producer/dist/index.js?:259:18)
    at eval (webpack:///../producer/dist/index.js?:262:10)
    at webpackUniversalModuleDefinition (webpack:///../producer/dist/index.js?:3:20)
    at eval (webpack:///../producer/dist/index.js?:5:3)
    at Object.../producer/dist/index.js (http://localhost:8080/0.index.js:10:1)
    at __webpack_require__ (http://localhost:8080/index.js:64:30)

index.js:170 GET http://localhost:8080/a3c2a86….module.wasm 404 (Not Found)
```

Chunking seems to be a mechanism in Webpack to load parts of a project dynamically or async code.
However, the code that loads the chunks does not appear to be parsed correctly by Webpack
when inspecting a project it depends on.
It therefore appears not to include the code for loading `.wasm` files nor the file itself in the
`consumer` project after parsing the contents of `producer/dist/index.js`.

## Steps to reproduce ##

- Clone this repository
- Build the producer
    ```
    cd producer
    npm install
    npm run build
    npm link
    ```
- Build the consumer
    ```
    cd ../consumer
    npm install
    npm link webpack-strangeness-producer
    npm run serve
    ```
- Open a browser and point it to http://localhost:8080
- Notice how it fails to load the `.wasm`.
- Look at the `dist` folder in the `consumer` and notice that there is no `.wasm` nor the necessary
  `index.js` chunk files.

The reason appears to be that Webpack cannot detect and follow the `require(...)` calls in 
`producer/dist/index.js` because these are loaded as chunks.

## Workarounds ##

The problem can be "fixed" by adding `"module": "src/index.js"` to `producer/package.json`.
In addition, the source code must be distributed as part of the npm package 
by adding `"files": [..., "src"]` to `producer/package.json`.

For the project where I first encountered this issue, we are using TypeScript.
I have realized that we might as well just distribute the compiled JavaScript files that TypeScript
produces in the NPM package and point the `main` field in `package.json` to the `index.js` produced
by TypeScript.
This means that we might as well drop Webpack altogether, because we do not need any other features
of Webpack and it gives us the resulting code that it itself cannot parse correctly.

My best guess is that there is some option, somewhere, that allows you to tell Webpack to build a
proper module that it itself can parse correctly.
I have not been able to find it, however.

