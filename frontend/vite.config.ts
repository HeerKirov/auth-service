import path from "path"
import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import routify from "@roxi/routify/vite-plugin"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        routify(),
        tailwindcss()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    server: {
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api/, "")
            }
        }
    }
})
