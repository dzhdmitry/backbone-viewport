# Compiling sources

Source code can be tested and compiled by [Grunt](http://gruntjs.com/).

## Installation

[NPM](https://www.npmjs.com/) must be installed.

Install grunt and all dependencies as per `package.json`:

```
npm install
```

## Building

```
grunt build
```

Creates `/dist/spa.js` and `/dist.spa.min.js` from `src/spa.js`.

```
grunt default
```

Build current source code and run tests in `/test/*.html` files.
