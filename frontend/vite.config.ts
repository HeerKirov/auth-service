import path from "path"
import { defineConfig } from "vite"
import { configDotenv } from "dotenv"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import routify from "@roxi/routify/vite-plugin"
import tailwindcss from "@tailwindcss/vite"

configDotenv({path: [`.env.${process.env.NODE_ENV}.local`, ".env"]})

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        svelte(),
        routify(),
        tailwindcss()
    ],
    base: `${process.env.VITE_URL_PREFIX}/`,
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    server: {
        proxy: {
            "/api": {
                target: process.env.VITE_API_TARGET || "http://localhost:3000",
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api/, "")
            }
        }
    }
})
