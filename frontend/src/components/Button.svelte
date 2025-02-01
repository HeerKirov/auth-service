<script lang="ts">
import type { HTMLButtonAttributes } from "svelte/elements"

let { mode = "transparent", color = "primary", square = false, children, ...attrs }: HTMLButtonAttributes & {
    mode?: "transparent" | "outline" | "filled" | "underline"
    color?: "primary" | "secondary" | "success" | "info" | "warning" | "danger"
    square?: boolean
} = $props()

const getStyleOfColors = () => {
    if(mode === "filled") {
        switch (color) {
            case "primary": return ["bg-indigo-600", "dark:bg-indigo-800", "text-slate-100", "border-transparent", "hover:bg-indigo-300", "dark:hover:bg-indigo-700", "active:!bg-indigo-900"]
            case "secondary": return ["bg-zinc-400", "dark:bg-zinc-600", "text-slate-100", "border-transparent", "hover:bg-zinc-300", "dark:hover:bg-zinc-500", "active:!bg-zinc-700"]
            case "success": return ["bg-emerald-600", "dark:bg-emerald-800", "text-slate-100", "border-transparent", "hover:bg-emerald-300", "dark:hover:bg-emerald-700", "active:!bg-emerald-900"]
            case "info": return ["bg-sky-600", "dark:bg-sky-800", "text-slate-100", "border-transparent", "hover:bg-sky-300", "dark:hover:bg-sky-700", "active:!bg-sky-900"]
            case "warning": return ["bg-yellow-600", "dark:bg-yellow-800", "text-slate-100", "border-transparent", "hover:bg-yellow-300", "dark:hover:bg-yellow-700", "active:!bg-yellow-900"]
            case "danger": return ["bg-red-600", "dark:bg-red-800", "text-slate-100", "border-transparent", "hover:bg-red-300", "dark:hover:bg-red-700", "active:!bg-red-900"]
        }
    }else if(mode === "outline") {
        switch (color) {
            case "primary": return ["bg-transparent", "text-indigo-600", "border-indigo-600", "hover:border-indigo-300", "dark:hover:border-indigo-700", "active:!border-indigo-800"]
            case "secondary": return ["bg-transparent", "text-zinc-400", "border-zinc-400", "hover:border-zinc-300", "dark:hover:border-zinc-500", "active:!border-zinc-700"]
            case "success": return ["bg-transparent", "text-emerald-600", "border-emerald-600", "hover:border-emerald-300", "dark:hover:border-emerald-700", "active:!border-emerald-800"]
            case "info": return ["bg-transparent", "text-sky-600", "border-sky-600", "hover:border-sky-300", "dark:hover:border-sky-700", "active:!border-sky-800"]
            case "warning": return ["bg-transparent", "text-yellow-600", "border-yellow-600", "hover:border-yellow-300", "dark:hover:border-yellow-700", "active:!border-yellow-800"]
            case "danger": return ["bg-transparent", "text-red-600", "border-red-600", "hover:border-red-300", "dark:hover:border-red-700", "active:!border-red-800"]
        }
    }else{
        switch (color) {
            case "primary": return ["bg-transparent", "border-transparent", "text-indigo-600", "hover:border-indigo-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
            case "secondary": return ["bg-transparent", "border-transparent", "text-zinc-400", "hover:border-zinc-400", "active:bg-slate-200", "dark:active:bg-neutral-700"]
            case "success": return ["bg-transparent", "border-transparent", "text-emerald-600", "hover:border-emerald-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
            case "info": return ["bg-transparent", "border-transparent", "text-sky-600", "hover:border-sky-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
            case "warning": return ["bg-transparent", "border-transparent", "text-yellow-600", "hover:border-yellow-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
            case "danger": return ["bg-transparent", "border-transparent", "text-red-600", "hover:border-red-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
        }
    }
}

const getStyleOrBorder = () => {
    if(mode === "underline") {
        return ["border-b-2"]
    }else{
        return ["border-2", "rounded-lg"]
    }
}

const getStyleOfPadding = () => {
    if(square || mode === "underline") {
        return ["p-[0.3em]"]
    }else{
        return ["py-[0.3em] px-[0.6em]"]
    }
}

let cls = $derived([attrs["class"], square && "square", ...getStyleOfPadding(), ...getStyleOrBorder(), ...getStyleOfColors()])

</script>

<button {...attrs} class={cls}>
    {@render children?.()}
</button>

<style>
    button {
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: border-color 0.25s, background-color 0.25s;
    }
    button.square :global(svg) {
        display: block;
    }
</style>