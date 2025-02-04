<script lang="ts">
import { Hash, LetterText, ToggleRight } from "lucide-svelte"
import type { ArgumentDefinition } from "@/lib/api"

let { value }: {
    value: ArgumentDefinition[]
} = $props()

</script>

{#each value as item (item.name)}
    <div class="flex mb-2 items-center">
        <pre class="basis-1/4 inline">{item.name}</pre>
        <div class="basis-1/3 text-nowrap">
            {#if item.type === "string"}
                <LetterText/>字符串
            {:else if item.type === "number"}
                <Hash/>数值
            {:else}
                <ToggleRight/>布尔值
            {/if}
            <span class="text-gray-400">(可选)</span>
        </div>
        <div class="basis-5/12">{item.comment}</div>
    </div>
{:else}
    <p class="text-gray-400">(没有参数)</p>
{/each}