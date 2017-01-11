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

Creates `/dist/backbone-viewport.js` and `/dist/backbone-viewport.min.js` from `src/backbone-viewport.js`.

```
grunt default
```

Build current source code and run tests in `/test/*.html` files.
