<script lang="ts" generics="T">
import type { ChangeEventHandler, HTMLSelectAttributes } from "svelte/elements"

let { value = $bindable(), setValue, items = [], onchange, class: clz }: {
    value?: T
    setValue?: (v: T) => void
    items?: {label: string, key: string, value: T}[]
} & HTMLSelectAttributes = $props()

let change: ChangeEventHandler<HTMLSelectElement> | null | undefined = $derived(onchange && setValue ? ((e) => {
    const index = (e.target as HTMLSelectElement).selectedIndex
    const v = items[index].value
    setValue!(v)
    onchange!(e)
}) : setValue ? ((e) => {
    const index = (e.target as HTMLSelectElement).selectedIndex
    const v = items[index].value
    setValue!(v)
}) : onchange)

</script>

<select class={[clz, "p-[0.3em]"]} bind:value={value} onchange={change}>
    {#each items as item (item.key)}
        <option value={item.value}>{item.label}</option>
    {/each}
</select>
