

import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  rollup: {
    emitCJS: true,
    esbuild: {
      treeShaking: true,
    },
  },
  declaration: true,
  outDir: "dist",
  clean: false,
  failOnWarn: false,
  externals: ["better-auth"],
  entries: ["src/index.ts"],
});
