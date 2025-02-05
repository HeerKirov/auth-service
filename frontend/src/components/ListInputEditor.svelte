<script lang="ts">
import { Plus, X } from "lucide-svelte"
import type { ClassValue, HTMLAttributes } from "svelte/elements"
import { Button, Input } from "@/components"

let { value = $bindable(), setValue, placeholder, inputClass, class: clz, ...attrs }: {
    value?: string[]
    setValue?: (value: string[]) => void
    placeholder?: string
    inputClass?: ClassValue
} & HTMLAttributes<HTMLDivElement> = $props()

const setAt = (idx: number, newValue: string | undefined) => {
    if(value?.length) {
        const nv = [
            ...value.slice(0, idx),
            newValue ?? "",
            ...value.slice(idx + 1)
        ]
        value = nv
        setValue?.(nv)
    }
}

const removeAt = (idx: number) => {
    if(value?.length) {
        const nv = [
            ...value.slice(0, idx),
            ...value.slice(idx + 1)
        ]
        value = nv
        setValue?.(nv)
    }
}

const addAt = (idx: number) => {
    const nv = [
        ...(value ?? []).slice(0, idx),
        "",
        ...(value ?? []).slice(idx)
    ]
    value = nv
    setValue?.(nv)
}

const addFirst = () => {
    const nv = [""]
    value = nv
    setValue?.(nv)
}

</script>

<div {...attrs} class={[clz, "flex flex-col gap-1"]}>
    {#each value ?? [] as item, index}
        <div class="flex">
            <Input class={inputClass} {placeholder} value={item} setValue={v => setAt(index, v)}/>
            <Button color="secondary" square onclick={() => removeAt(index)}><X/></Button>
            <Button color="success" square onclick={() => addAt(index + 1)}><Plus/></Button>
        </div>
    {:else}
        <div>
            <Button color="success" square onclick={addFirst}><Plus/></Button>
        </div>
    {/each}
</div>