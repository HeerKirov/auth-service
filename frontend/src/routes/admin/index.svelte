<script lang="ts">
import { onMount } from "svelte"
import { hasPermission } from "@/lib/store/user.svelte"
import { routeReplace } from "@/utils/route"

onMount(() => {
    if(hasPermission("ADMIN")) {
        routeReplace("/admin/system")
    }else if(hasPermission("APP_ADMIN")) {
        routeReplace("/admin/apps")
    }
})

</script>
