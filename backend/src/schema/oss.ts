import { z } from "zod"

export const ossUploadCallbackSchema = z.object({
    filepath: z.string()
})