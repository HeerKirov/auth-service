import { db } from "@/utils/db"

interface SettingRaw {
    key: string
    value: string
    updateTime: Date
}

interface SettingConst<TYPE extends "string" | "number" | "boolean"> {
    key: string
    type: TYPE
    defaultValue: string | number | boolean
}

export const SETTINGS = {
    REGISTRATION_SWITCH: <SettingConst<"boolean">>{key: "REGISTRATION_SWITCH", type: "boolean", defaultValue: true},
    ACCESS_TOKEN_DELAY: <SettingConst<"number">>{key: "ACCESS_TOKEN_DELAY", type: "number", defaultValue: 1000 * 60 * 60},
    REFRESH_TOKEN_DELAY: <SettingConst<"number">>{key: "REFRESH_TOKEN_DELAY", type: "number", defaultValue: 1000 * 60 * 60 * 24 * 7},
    REFRESH_TOKEN_AUTO_FLUSH: <SettingConst<"number">>{key: "REFRESH_TOKEN_AUTO_FLUSH", type: "number", defaultValue: 1000 * 60 * 60 * 24},
    AUTHORIZATION_CODE_DELAY: <SettingConst<"number">>{key: "AUTHORIZATION_CODE_DELAY", type: "number", defaultValue: 1000 * 60 * 10},
}

const settingCache = new Map<string, any>()

export async function getAllSettings(): Promise<Record<string, unknown>> {
    const ret: Record<string, unknown> = {}
    for(const con of Object.values(SETTINGS)) {
        ret[con.key] = await getSetting(con as any)
    }
    return ret
}

export async function updatePartialSettings(settings: Record<string, unknown | undefined>): Promise<void> {
    for(const [key, value] of Object.entries(settings)) {
        if(value !== undefined) {
            await setSetting(SETTINGS[key as keyof typeof SETTINGS] as any, value as any)
        }
    }
}

export async function getSetting(con: SettingConst<"string">): Promise<string>
export async function getSetting(con: SettingConst<"number">): Promise<number>
export async function getSetting(con: SettingConst<"boolean">): Promise<boolean>
export async function getSetting<T extends "string" | "number" | "boolean">(con: SettingConst<T>): Promise<T extends "string" ? string : T extends "number" ? number : boolean> {
    const cacheValue = settingCache.get(con.key)
    if(cacheValue !== undefined) {
        return cacheValue
    }

    const raw = await getSettingRaw(con.key)
    if(raw !== undefined) {
        const value = parseConValue(raw.value, con)
        settingCache.set(con.key, value)
        return value
    }

    return con.defaultValue as any
}

export async function setSetting(con: SettingConst<"string">, value: string): Promise<void>
export async function setSetting(con: SettingConst<"number">, value: number): Promise<void>
export async function setSetting(con: SettingConst<"boolean">, value: boolean): Promise<void>
export async function setSetting<T extends "string" | "number" | "boolean">(con: SettingConst<T>, value: T extends "string" ? string : T extends "number" ? number : boolean): Promise<void> {
    const current = settingCache.get(con.key)
    if(current !== value) {
        settingCache.set(con.key, value)

        await updateSettingRaw(con.key, value.toString())
    }
}

async function getSettingRaw(key: string): Promise<SettingRaw | undefined> {
    return db.from<SettingRaw>("setting").where({key}).first()
}

async function updateSettingRaw(key: string, value: string): Promise<void> {
    const r = await db.from<SettingRaw>("setting").where({key}).update({
        value,
        updateTime: new Date()
    })
    if(r <= 0) {
        await db.from<SettingRaw>("setting").insert({
            key, value, updateTime: new Date()
        })
    }
}

function parseConValue<T extends "string" | "number" | "boolean">(value: string, con: SettingConst<T>): T extends "string" ? string : T extends "number" ? number : boolean {
    if(con.type === "string") {
        return value as any
    }else if(con.type === "number") {
        return parseFloat(value) as any
    }else{
        return (value.toUpperCase() === "TRUE") as any
    }
}