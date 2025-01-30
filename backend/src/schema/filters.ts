import { z } from "zod"

export const userFilter = z.object({
    search: z.string().optional(),
    enabled: z.boolean().optional(),
    limit: z.coerce.number().min(1).optional(),
    offset: z.coerce.number().min(0).optional(),
})

export const appFilter = z.object({
    search: z.string().optional(),
    enabled: z.string().optional(),
    limit: z.coerce.number().min(1).optional(),
    offset: z.coerce.number().min(0).optional(),
})

export const offsetAndLimitFilter = z.object({
    limit: z.coerce.number().min(1).optional(),
    offset: z.coerce.number().min(0).optional(),
})

export type UserFilter = z.infer<typeof userFilter>

export type AppFilter = z.infer<typeof appFilter>

export type OffsetAndLimitFilter = z.infer<typeof offsetAndLimitFilter>
