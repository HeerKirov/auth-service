<script lang="ts">
import type { FormEventHandler, HTMLInputAttributes, KeyboardEventHandler } from "svelte/elements"
import { autoFocus } from "@/utils/action"

let { value = $bindable(), setValue, autoFocus: isAutoFocus = false, color = "normal", onenter, onkeydown, oninput, ...attrs }: {
    value?: string
    setValue?: (newValue: string) => void
    onenter?: (e: KeyboardEvent) => void
    color?: "normal" | "primary" | "secondary" | "success" | "info" | "warning" | "danger"
    autoFocus?: boolean
} & HTMLInputAttributes = $props()

let keydown: KeyboardEventHandler<HTMLInputElement> | null | undefined = $derived(onkeydown && onenter ? ((e) => {
    if(e.key === "Enter" && !e.altKey && !e.metaKey && !e.ctrlKey) {
        onenter!(e)
    }
    onkeydown!(e)
}) : onenter ? ((e) => {
    if(e.key === "Enter" && !e.altKey && !e.metaKey && !e.ctrlKey) {
        onenter!(e)
    }
}) : onkeydown)

let input: FormEventHandler<HTMLInputElement> | null | undefined = $derived(oninput && setValue ? ((e) => {
    setValue!((e.target as HTMLInputElement).value)
    oninput!(e)
}) : setValue ? ((e) => {
    setValue!((e.target as HTMLInputElement).value)
}) : oninput)

const getStyleOfColors = () => {
    switch (color) {
        case "primary": return ["border-indigo-600", "focus:border-indigo-400", "dark:border-indigo-500", "focus:border-indigo-300"]
        case "secondary": return ["border-zinc-400", "focus:border-indigo-300"]
        case "success": return ["border-emerald-600", "focus:border-emerald-400"]
        case "info": return ["border-sky-600", "focus:border-sky-400"]
        case "warning": return ["border-yellow-600", "focus:border-yellow-400"]
        case "danger": return ["border-red-600", "focus:border-red-400"]
        default: return ["border-slate-700", "focus:border-slate-900", "dark:border-neutral-300", "dark:focus:border-neutral-50"]
    }
}

let cls = $derived([attrs["class"], ...getStyleOfColors()])

</script>

<input {...attrs} bind:value={value} use:autoFocus={isAutoFocus} class={cls} onkeydown={keydown} oninput={input}/>

<style>
    input {
        border-width: 2px;
        border-style: solid;
        border-radius: 8px;
        padding: 0.15em 0.3em;
        outline: none;
        transition: border-color 0.25s;
    }
    input[type="number"] {
        -moz-appearance: textfield; /* Firefox */
        appearance: textfield;
    }

    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
        -webkit-appearance: none; /* Safari */
        margin: 0;
    }
</style>