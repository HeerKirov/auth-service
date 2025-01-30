<script lang="ts">
import type { HTMLInputAttributes } from "svelte/elements"
import { autoFocus } from "@/utils/action"

let { value = $bindable(), setValue, autoFocus: isAutoFocus = false, color = "normal", onenter, onkeydown, ...attrs }: {
    value?: string
    setValue?: (newValue: string | undefined) => void
    onenter?: (e: KeyboardEvent) => void
    color?: "normal" | "primary" | "secondary" | "success" | "info" | "warning" | "danger"
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

const getStyleOfColors = () => {
    switch (color) {
        case "primary": return ["border-indigo-600", "focus:border-indigo-400"]
        case "secondary": return ["border-zinc-400", "focus:border-indigo-300"]
        case "success": return ["border-emerald-600", "focus:border-emerald-400"]
        case "info": return ["border-sky-600", "focus:border-sky-400"]
        case "warning": return ["border-yellow-600", "focus:border-yellow-400"]
        case "danger": return ["border-red-600", "focus:border-red-400"]
        default: return ["border-slate-700", "focus:border-slate-500", "dark:border-neutral-300", "dark:focus:border-neutral-50"]
    }
}

let cls = $derived([attrs["class"], ...getStyleOfColors()])

</script>

<input bind:value={internalValue} use:autoFocus={isAutoFocus} class={cls} onkeydown={keydown} {...attrs}/>

<style>
    input {
        border-width: 2px;
        border-style: solid;
        border-radius: 8px;
        padding: 0.15em 0.3em;
        outline: none;
        transition: border-color 0.25s;
    }
</style>