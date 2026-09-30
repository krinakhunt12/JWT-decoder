import { fileURLToPath } from "node:url";
import { build } from "vite";

// Bundles a test entry for Node. Vite resolves the project's extensionless imports,
// which plain `node` cannot, so every test goes through this first.
//   node tests/run-test.mjs tests/unit-tests.mjs && node .test-out/test.mjs
const target = process.argv[2];
if (!target) {
  console.error("usage: node tests/run-test.mjs <test-entry>");
  process.exit(1);
}

await build({
  // fileURLToPath, not pathname: the project path contains a space, which
  // URL-encoding would turn into %20 and break resolution.
  root: fileURLToPath(new URL("..", import.meta.url)),
  logLevel: "error",
  build: {
    ssr: target,
    outDir: ".test-out",
    emptyOutDir: true,
    minify: false,
    rollupOptions: { output: { format: "esm", entryFileNames: "test.mjs" } },
  },
});
console.log(`bundled ${target}`);