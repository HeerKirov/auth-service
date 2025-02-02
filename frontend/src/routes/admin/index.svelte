<script lang="ts">
import { onMount } from "svelte"
import { hasPermission } from "@/lib/store/user.svelte"

onMount(() => {
    if(hasPermission("ADMIN")) {
        history.pushState({}, "", "/admin/system")
    }else if(hasPermission("APP_ADMIN")) {
        history.pushState({}, "", "/admin/apps")
    }
})

</script>
