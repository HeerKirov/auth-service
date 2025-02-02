<script lang="ts">
import type { HTMLInputAttributes } from "svelte/elements"
import { Input } from "@/components"

let { value = $bindable(), setValue, ...attrs }: {
    value?: number
    setValue?: (newValue: number | undefined) => void
    onenter?: (e: KeyboardEvent) => void
    color?: "normal" | "primary" | "secondary" | "success" | "info" | "warning" | "danger"
    autoFocus?: boolean
} & HTMLInputAttributes = $props()

const internalSetValue = (v: string | undefined) => setValue?.(v as any as number | undefined)

</script>

<Input {...attrs} type="number" bind:value={value} setValue={internalSetValue} />
