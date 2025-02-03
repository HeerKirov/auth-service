<script lang="ts" generics="T">
import type { HTMLSelectAttributes } from "svelte/elements"

let { value = $bindable(), items = [], class: clz }: {
    value?: T
    items?: {label: string, key: string, value: T}[]
} & HTMLSelectAttributes = $props()

</script>

<select class={[clz, "p-[0.3em]"]} bind:value={value}>
    {#each items as item (item.key)}
        <option value={item.value}>{item.label}</option>
    {/each}
</select>
