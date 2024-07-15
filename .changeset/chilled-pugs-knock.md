---
'neverthrow': major
---

Declare the minimum supported Node.js version

`Neverthrow` does not depend on any Node.js version-specific features, so it should work with any version of Node.js that supports ES6 and other runtimes like Browser, Deno, etc.

However, for the sake of maintaining a consistent development environment, we should declare the minimum supported version of Node.js in the `engines` field of the `package.json` file.

