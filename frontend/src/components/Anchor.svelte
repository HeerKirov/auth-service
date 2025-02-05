<script lang="ts">
import type { HTMLAnchorAttributes } from "svelte/elements"
import { classifyHref } from "@/utils/route"

let { color, mode = "normal", href, children, ...attrs }: HTMLAnchorAttributes & {
    mode?: "underline" | "normal"
    color?: "primary" | "secondary" | "success" | "info" | "warning" | "danger"
} = $props()

const getStyleOfColors = () => {
    if(mode === "underline") {
        switch (color) {
            case undefined:
            case "primary":
                return ["bg-transparent", "border-transparent", "text-indigo-600", "dark:text-indigo-500", "hover:border-indigo-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
            case "secondary": return ["bg-transparent", "border-transparent", "text-zinc-400", "hover:border-zinc-400", "active:bg-slate-200", "dark:active:bg-neutral-700"]
            case "success": return ["bg-transparent", "border-transparent", "text-emerald-600", "hover:border-emerald-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
            case "info": return ["bg-transparent", "border-transparent", "text-sky-600", "hover:border-sky-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
            case "warning": return ["bg-transparent", "border-transparent", "text-yellow-600", "hover:border-yellow-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
            case "danger": return ["bg-transparent", "border-transparent", "text-red-600", "hover:border-red-600", "active:bg-slate-200", "dark:active:bg-neutral-700"]
        }
    }else{
        switch (color) {
            case "primary": return ["text-indigo-600", "dark:text-indigo-500", "hover:text-indigo-500", "dark:hover:text-indigo-400", "active:text-indigo-700", "dark:active:text-indigo-600"]
            case "secondary": return ["text-zinc-400", "dark:text-zinc-400", "hover:text-zinc-300", "dark:hover:text-zinc-300", "active:text-zinc-500", "dark:active:text-zinc-500"]
            case "success": return ["text-emerald-600", "hover:text-emerald-500", "active:text-emerald-700"]
            case "info": return ["text-sky-600", "hover:text-sky-500", "active:text-sky-700"]
            case "warning": return ["text-yellow-600", "hover:text-yellow-500", "active:text-yellow-700"]
            case "danger": return ["text-red-600", "hover:text-red-500", "active:text-red-700"]
            default: return ["text-slate-700", "dark:text-neutral-200", "active:text-slate-900", "dark:active:text-neutral-200"]
        }
    }
}

let cls = $derived([attrs["class"], `mode-${mode}`, ...getStyleOfColors()])

//anchor的href具有对内部路由的自动修正机制。当href以绝对路径开头时，会将其自动修正为带有URL_PREFIX前缀的
let finalHref = $derived(href && classifyHref(href) === "absolute_path" ? `${import.meta.env.VITE_URL_PREFIX}${href}` : href)

</script>

<a {...attrs} href={finalHref} class={cls}>
    {@render children?.()}
</a>

<style>
    a.mode-underline {
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        border-bottom-width: 2px;
        border-bottom-style: solid;
        padding: 0.3em;
        transition: border-color 0.25s, color 0.25s;
    }
    a.mode-normal {
        font-size: 1em;
        cursor: pointer;
        transition: border-color 0.25s, color 0.25s;
    }
</style>