<script lang="ts">
import { onMount } from "svelte"
import { hasPermission } from "@/lib/store/user.svelte"

onMount(() => {
    if(hasPermission("ADMIN")) {
        history.replaceState({}, "", "/admin/system")
    }else if(hasPermission("APP_ADMIN")) {
        history.replaceState({}, "", "/admin/apps")
    }
})

</script>
