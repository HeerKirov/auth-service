import { z } from "zod";

export const settingSchema = z.object({
    REGISTRATION_SWITCH: z.boolean(),
    ACCESS_TOKEN_DELAY: z.number(),
    REFRESH_TOKEN_DELAY: z.number(),
    REFRESH_TOKEN_AUTO_FLUSH: z.number(),
    AUTHORIZATION_CODE_DELAY: z.number()
})

export const settingUpdateSchema = z.object({
    REGISTRATION_SWITCH: z.boolean().optional(),
    ACCESS_TOKEN_DELAY: z.number().min(1000 * 60).max(1000 * 60 * 60 * 24 * 30).optional(),
    REFRESH_TOKEN_DELAY: z.number().min(1000 * 60).max(1000 * 60 * 60 * 24 * 30).optional(),
    REFRESH_TOKEN_AUTO_FLUSH: z.number().min(1000 * 60).max(1000 * 60 * 60 * 24 * 30).optional(),
    AUTHORIZATION_CODE_DELAY: z.number().min(1000 * 60).max(1000 * 60 * 60 * 24 * 30).optional()
})

