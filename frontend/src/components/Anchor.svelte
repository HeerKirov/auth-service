<script lang="ts">
import type { HTMLAnchorAttributes } from "svelte/elements"

let { color = "primary", children, ...attrs }: HTMLAnchorAttributes & {
    color?: "primary" | "secondary" | "success" | "info" | "warning" | "danger"
} = $props()

const getStyleOfColors = () => {
    switch (color) {
        case "primary": return ["bg-transparent", "border-transparent", "text-indigo-600", "dark:text-indigo-500", "hover:border-indigo-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
        case "secondary": return ["bg-transparent", "border-transparent", "text-zinc-400", "hover:border-zinc-400", "active:bg-slate-200", "dark:active:bg-neutral-700"]
        case "success": return ["bg-transparent", "border-transparent", "text-emerald-600", "hover:border-emerald-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
        case "info": return ["bg-transparent", "border-transparent", "text-sky-600", "hover:border-sky-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
        case "warning": return ["bg-transparent", "border-transparent", "text-yellow-600", "hover:border-yellow-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
        case "danger": return ["bg-transparent", "border-transparent", "text-red-600", "hover:border-red-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
    }
}

let cls = $derived([attrs["class"], "a", ...getStyleOfColors()])

</script>

<a {...attrs} class={cls}>
    {@render children?.()}
</a>

<style>
    a {
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        border-bottom-width: 2px;
        border-bottom-style: solid;
        padding: 0.3em;
        transition: border-color 0.25s, background-color 0.25s;
    }
</style>