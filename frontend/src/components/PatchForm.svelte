<script lang="ts" generics="T">
import type { Snippet } from "svelte"
import type { HTMLAttributes } from "svelte/elements"
import { Check, Pencil } from "lucide-svelte"
import { Button } from "@/components/index"

const {
    value, setValue,
    showEditButton = true, showSaveButton = true,
    display: defaultSnippet, edit: editSnippet,
    ...attrs
}: HTMLAttributes<HTMLDivElement> & {
    value: T
    setValue?: (value: T) => Promise<boolean> | boolean | void
    display?: Snippet<[T, () => void]>
    edit?: Snippet<[T, (newValue: T) => void, () => Promise<void>]>
    showEditButton?: boolean
    showSaveButton?: boolean
} = $props()

let editMode = $state(false)

let editValue: T | undefined = $state()

const setEditValue = (newValue: T) => {
    editValue = newValue
}

const edit = () => {
    editMode = true
    editValue = value
}

const save = async () => {
    if(setValue && editValue !== value) {
        const r = setValue(editValue!)
        const ok = r instanceof Promise ? await r : typeof r === "boolean" ? r : true
        if(ok) {
            editMode = false
            editValue = undefined
        }
    }else{
        editMode = false
        editValue = undefined
    }
}

</script>

<div {...attrs}>
    {#if editMode}
        {@render editSnippet?.(editValue!, setEditValue, save)}
        {#if showSaveButton}<Button class="absolute ml-1" square onclick={save}><Check size={20}/></Button>{/if}
    {:else}
        {@render defaultSnippet?.(value, edit)}
        {#if showEditButton}<Button class="absolute ml-1" square onclick={edit}><Pencil size={20}/></Button>{/if}
    {/if}
</div>