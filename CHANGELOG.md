# neverthrow

## 7.0.0

### Major Changes

- [#553](https://github.com/supermacro/neverthrow/pull/553) [`5a3af0a`](https://github.com/supermacro/neverthrow/commit/5a3af0a55d0c440dfd50bfbbe021c6e4b973184b) Thanks [@m-shaka](https://github.com/m-shaka)! - Declare the minimum supported Node.js version

  `Neverthrow` does not depend on any Node.js version-specific features, so it should work with any version of Node.js that supports ES6 and other runtimes like Browser, Deno, etc.

  However, for the sake of maintaining a consistent development environment, we should declare the minimum supported version of Node.js in the `engines` field of the `package.json` file.
