import { createLogger, format, transports } from "winston"

export const logger = createLogger({
    transports: [
        new transports.Console({
            level: "info",
            format: format.combine(
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                format.align(),
                format.printf(info => `[${info.level}] ${[info.timestamp]}: ${info.message}`)
            ),
        }),
    ],
})
