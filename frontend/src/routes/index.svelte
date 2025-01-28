<script lang="ts">
import { onMount } from "svelte"
import { type User, user } from "@/lib/api"

let userInfo: User | null = $state(null)

onMount(async () => {
    const r = await user.getUserInfo()
    if(r.ok) {
        userInfo = r.data
    }
})
</script>

<div>
    {userInfo?.displayName ?? "Not Login"}
</div>
