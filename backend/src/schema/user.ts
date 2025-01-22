import { z } from "zod"

export const userCreateSchema = z.object({
    username: z.string(),
    password: z.string(),
    displayName: z.string(),
    avatar: z.string().nullable(),
})

export interface User {
    id: number
    username: string
    password: string
    displayName: string
    avatar: string | null
    deleted: boolean
    createdAt: Date
}

export type UserCreateSchema = z.infer<typeof userCreateSchema>
