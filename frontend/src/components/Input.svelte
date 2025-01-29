<script lang="ts">
import type { HTMLInputAttributes } from "svelte/elements"
import { autoFocus } from "@/utils/action"

let { value = $bindable(), setValue, autoFocus: isAutoFocus = false, onenter, onkeydown, ...attrs }: {
    value?: string
    setValue?: (newValue: string | undefined) => void
    onenter?: (e: KeyboardEvent) => void
    autoFocus?: boolean
} & HTMLInputAttributes = $props()

let internalValue: string | undefined = $state(value)

$effect(() => {
    if(value !== internalValue) {
        value = internalValue
        if(setValue) setValue(internalValue)
    }
})

$effect(() => {
    if(internalValue !== value) {
        internalValue = value
    }
})

let keydown = $derived(onkeydown && onenter ? ((e: KeyboardEvent) => {
    if(e.key === "Enter" && !e.altKey && !e.metaKey && !e.ctrlKey) {
        onenter!(e)
    }
    onkeydown!(e as any)
}) : onenter ? ((e: KeyboardEvent) => {
    if(e.key === "Enter" && !e.altKey && !e.metaKey && !e.ctrlKey) {
        onenter!(e)
    }
}) : onkeydown)

</script>

<input bind:value={internalValue} use:autoFocus={isAutoFocus} onkeydown={keydown} {...attrs}/>

<style>
    input {
        border-width: 2px;
        border-style: solid;
        border-color: var(--color-indigo-700);
        border-radius: 8px;
        padding: 0.15em 0.3em;
    }
</style>