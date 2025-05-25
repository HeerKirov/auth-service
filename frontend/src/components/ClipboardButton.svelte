<script lang="ts">
import { Clipboard, ClipboardCheck } from "lucide-svelte"
import { Button } from "@/components"

let { data }: { data?: string | null } = $props()

let copied = $state(false)

const copyToClipboard = async () => {
    if(!data) return
    await navigator.clipboard.writeText(data)
    copied = true
    setTimeout(() => copied = false, 2000)
}
</script>

<Button mode="underline" color="info" onclick={copyToClipboard}>
    {#if copied}
        <ClipboardCheck size={18}/>
    {:else}
        <Clipboard size={18}/>
    {/if}
</Button>