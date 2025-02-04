<script lang="ts">
import type { FormEventHandler, HTMLInputAttributes } from "svelte/elements"

let { checked = $bindable(), setChecked, onchange, children, ...attrs }: {
    checked?: boolean
    setChecked?: (newValue: boolean) => void
} & HTMLInputAttributes = $props()

let change: FormEventHandler<HTMLInputElement> | null | undefined = $derived(onchange && setChecked ? ((e) => {
    setChecked!((e.target as HTMLInputElement).checked)
    onchange!(e)
}) : setChecked ? ((e) => {
    setChecked!((e.target as HTMLInputElement).checked)
}) : onchange)

</script>

<label>
    <input type="checkbox" {...attrs} bind:checked={checked} onchange={change}/>
    {@render children?.()}
</label>

<style>

</style>