<script lang="ts">
import type { HTMLInputAttributes } from "svelte/elements"

let { value = $bindable(), ...attrs }: {
    value?: string
} & HTMLInputAttributes = $props()


</script>

<input bind:value={value} {...attrs}/>

<style>
    input {
        border: 1px solid #ccc;
        border-radius: 8px;
    }
</style>