<script lang="ts">
import Cropper from "cropperjs"
import { fade } from "svelte/transition"
import type { ChangeEventHandler } from "svelte/elements"
import { Check, FileUp } from "lucide-svelte"
import { Button } from "@/components"
import empty from "@/assets/empty.jpg"
import 'cropperjs/dist/cropper.css'

let { onSubmit }: {
    onSubmit?: (b: Blob) => void
} = $props()

let input: HTMLInputElement | undefined = $state()

let img: HTMLImageElement | undefined = $state()

let visible = $state(false)

let imaged = $state(false)

let cropper: Cropper | null = null

const openFileInput = () => {
    if(input) {
        input.value = ""
        input.click()
    }
}

const onFileChange: ChangeEventHandler<HTMLInputElement> = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if(file) {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = e => {
            imaged = true

            if(!cropper) cropper = new Cropper(img!, {
                aspectRatio: 1,
                viewMode: 1,
                autoCropArea: 1
            })

            cropper.replace(e.target!.result as string)
        }
    }
}

const submit = async () => {
    if(onSubmit && cropper) {
        const croppedData: Blob | null = await new Promise(resolve => cropper?.getCroppedCanvas().toBlob(blob => resolve(blob), 'image/jpeg'))
        if(croppedData) {
            onSubmit(croppedData)
        }
    }
    close()
}

export const open = () => {
    visible = true
}

export const close = () => {
    visible = false
    imaged = false
    if(cropper) {
        cropper.destroy()
        cropper = null
    }
}

</script>

{#if visible}
    <button transition:fade={{duration: 150}} class="fixed w-[100%] h-[100%] left-0 top-0 bg-black opacity-40" onclick={close} aria-label="bg"></button>
    <div transition:fade={{duration: 150}} class="central-page flex flex-col items-center rounded-xl dark:bg-neutral-800 bg-slate-100 border-2">
        <input bind:this={input} class="hidden height-0" type="file" id="avatar" name="avatar" accept="image/*" onchange={onFileChange} />
        <div class="w-[320px] h-[320px] mt-4 mx-4 border-1">
            <img bind:this={img} src={empty} alt="裁剪预览"/>
        </div>
        <div class="my-2">
            <Button mode="underline" onclick={openFileInput}><FileUp  size={18} class="mr-1"/> 上传文件</Button>
            <Button mode="underline" color={imaged ? "success" : "secondary"} disabled={!imaged} onclick={submit}><Check  size={18} class="mr-1"/> 确认使用</Button>
        </div>
    </div>
{/if}
