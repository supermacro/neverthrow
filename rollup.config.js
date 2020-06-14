import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: {
      file: "tmp/index.es.js",
      format: "es",
    },
    plugins: [typescript()], // { useTsconfigDeclarationDir: true }
  },
  {
    input: "src/index.ts",
    output: {
      file: "tmp/index.cjs.js",
      format: "cjs",
    },
    plugins: [typescript()],
  },
  {
    input: "tmp/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
