import { knex } from "knex"
import config from "@/config"

export const db = knex(config.db)

export function projectJoinNest(tableName: string, fields: readonly string[], asName?: string): string[] {
    return fields.map(field => `${tableName}.${field} AS __${asName ?? tableName}__${field}`)
}

export function constructJoinNest(result: any): any {
    const ret: Record<string, Record<string, any>> = {}
    for(const [key, value] of Object.entries(result)) {
        if(key.startsWith("__")) {
            const [t, f] = key.substring("__".length).split("__", 2)
            if(t in ret) {
                ret[t][f] = value
            }else{
                ret[t] = {[f]: value}
            }
        }
    }
    return ret
}