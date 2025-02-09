import { defineConfig } from "tsup"

export default defineConfig([
    {
        entry: ["src/app.ts"],
        format: ["cjs"],
        sourcemap: true,
        clean: true,
        external: ["pg"]
    },
    {
        entry: ["knexfile.ts", "migrations/*.ts"],
        format: ["cjs"],
        sourcemap: false,
        clean: true
    }
])