<script lang="ts">
import { createRouter, Router } from "@roxi/routify"
import routes from "@/../.routify/routes.default.js"

const router = createRouter({
    routes,
    urlRewrite: {
        toExternal: url => import.meta.env.VITE_URL_PREFIX + url,
        toInternal: url => url.startsWith(import.meta.env.VITE_URL_PREFIX) ? url.substring(import.meta.env.VITE_URL_PREFIX.length) : url,
    }
})

</script>

<Router {router}/>