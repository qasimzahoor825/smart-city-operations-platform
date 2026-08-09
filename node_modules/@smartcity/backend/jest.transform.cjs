/**
 * Zero-dependency TypeScript -> CommonJS transformer for Jest, built on
 * `typescript.transpileModule`. Transforms tree-shaken source (no type checks,
 * matching the repo's `ts-node --transpile-only` runtime) so the existing
 * runtime-oriented test suites actually execute.
 */
const ts = require("typescript");

module.exports = {
  process(sourceText, sourcePath) {
    const result = ts.transpileModule(sourceText, {
      fileName: sourcePath,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        resolveJsonModule: true,
        skipLibCheck: true,
        sourceMap: true,
        inlineSources: true,
        isolatedModules: true,
      },
      reportDiagnostics: false,
    });
    return { code: result.outputText, map: result.sourceMapText };
  },
};