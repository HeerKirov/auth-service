<script lang="ts">
import type { HTMLButtonAttributes } from "svelte/elements"

let { children, ...attrs }: HTMLButtonAttributes = $props()

</script>

<button {...attrs}>
    {@render children?.()}
</button>

<style>
    button {
        border-radius: 8px;
        border: 1px solid transparent;
        padding: 0.6em 1.2em;
        font-size: 1em;
        font-weight: 500;
        font-family: inherit;
        background-color: #1a1a1a;
        cursor: pointer;
        transition: border-color 0.25s;
        @media (prefers-color-scheme: light) {
            background-color: #f9f9f9;
        }
    }
    button:hover {
        border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
    }
</style>