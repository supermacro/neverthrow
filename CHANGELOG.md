# neverthrow

## 7.0.1

### Patch Changes

- [#527](https://github.com/supermacro/neverthrow/pull/527) [`2e1f198`](https://github.com/supermacro/neverthrow/commit/2e1f19899800ce5e1164412c6a693cf2f1c40b20) Thanks [@3846masa](https://github.com/3846masa)! - fix: change type definitions to make inferring types of safeTry more strict

- [#497](https://github.com/supermacro/neverthrow/pull/497) [`e06203e`](https://github.com/supermacro/neverthrow/commit/e06203e90b2b64edaa42707cbca8383c9f4765e8) Thanks [@braxtonhall](https://github.com/braxtonhall)! - enhance type inferrence of `match`

## 7.0.0

### Major Changes

- [#553](https://github.com/supermacro/neverthrow/pull/553) [`5a3af0a`](https://github.com/supermacro/neverthrow/commit/5a3af0a55d0c440dfd50bfbbe021c6e4b973184b) Thanks [@m-shaka](https://github.com/m-shaka)! - Declare the minimum supported Node.js version

  `Neverthrow` does not depend on any Node.js version-specific features, so it should work with any version of Node.js that supports ES6 and other runtimes like Browser, Deno, etc.

  However, for the sake of maintaining a consistent development environment, we should declare the minimum supported version of Node.js in the `engines` field of the `package.json` file.
