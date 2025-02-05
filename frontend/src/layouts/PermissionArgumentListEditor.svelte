<script lang="ts">
import { Hash, LetterText, Plus, ToggleRight, X } from "lucide-svelte"
import type { ArgumentDefinition } from "@/lib/api"
import { Button, CheckBox, Input, Select } from "@/components"

let { value = $bindable(), setValue }: {
    value: ArgumentDefinition[]
    setValue?: (value: ArgumentDefinition[]) => void
} = $props()

const typeSelects = [
    {key: "string", value: "string", label: "字符串"} as const,
    {key: "number", value: "number", label: "数值"} as const,
    {key: "boolean", value: "boolean", label: "布尔值"} as const
]

function set<T extends keyof ArgumentDefinition>(index: number, field: T, v: ArgumentDefinition[T]) {
    const nv = [
        ...value.slice(0, index),
        {...value[index], [field]: v},
        ...value.slice(index + 1)
    ]
    value = nv
    setValue?.(nv)
}

const removeAt = (index: number) => {
    const nv = [
        ...value.slice(0, index),
        ...value.slice(index + 1)
    ]
    value = nv
    setValue?.(nv)
}

const add = () => {
    const nv = [
        ...value,
        {name: "", comment: "", optional: false, type: "string"} as const
    ]
    value = nv
    setValue?.(nv)
}

</script>

{#each value as item, index}
    <div class="flex mb-2 items-center">
        <div class="basis-1/2">
            <Input class="w-full" value={item.name} setValue={v => set(index, "name", v ?? "")} placeholder="参数名"/>
        </div>
        <div class="shrink-0 px-2">
            {#if item.type === "string"}
                <LetterText/>
            {:else if item.type === "number"}
                <Hash/>
            {:else}
                <ToggleRight/>
            {/if}
            <Select items={typeSelects} value={item.type} setValue={v => set(index, "type", v)}/>
        </div>
        <div class="shrink-0 pr-2">
            <CheckBox checked={item.optional} setChecked={v => set(index, "optional", v)}>可选</CheckBox>
        </div>
        <div class="basis-1/2">
            <Input value={item.comment ?? undefined} setValue={v => set(index, "comment", v || null)} placeholder="标注"/>
        </div>
        <div class="no-shrink pl-1">
            <Button color="danger" class="shrink-0" square onclick={() => removeAt(index)}><X/></Button>
        </div>
    </div>
{/each}
<Button class="text-sm" mode="underline" color="info" onclick={add}><Plus class="mr-1" size={20}/>添加一行</Button>