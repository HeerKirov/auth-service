<script lang="ts">
import { CircleUserRound, UserCircle, UserCog, UserRoundCheck } from "lucide-svelte"
import type { UserAppPermission } from "@/lib/api"

let { permissions }: {
    permissions: UserAppPermission[]
} = $props()

</script>

{#each permissions as p}
    <div class="mt-1">
        {#if p.name === "ADMIN"}<UserCog class="mr-1" size={20}/>{:else if p.name === "APP_ADMIN"}<UserRoundCheck class="mr-1" size={20}/>{:else}<CircleUserRound class="mr-1" size={20}/>{/if}
        {p.displayName}
        {#if p.argumentDefinitions.length > 0}
            <span class="text-sm text-slate-600 dark:text-neutral-400">
                (
                {#each p.argumentDefinitions as arg, i (arg.name)}
                    {i > 0 ? ", ": ""}
                    {arg.comment ?? arg.name}: <pre class="inline">{p.args[arg.name]}</pre>
                {/each}
                )
            </span>
        {/if}
    </div>
{:else}
    <div class="mt-1">
        <UserCircle class="mr-1" size={20}/>
        一般用户
    </div>
{/each}