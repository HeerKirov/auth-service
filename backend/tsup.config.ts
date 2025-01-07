import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/app.ts"],
    format: ["esm"],
    sourcemap: true,
    clean: true,
    external: ["pg"]
});