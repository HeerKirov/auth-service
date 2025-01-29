
export function toDateString(date: string | Date | number) {
    const d = date instanceof Date ? date : new Date(date)

    return `${d.getFullYear()}-${zero2(d.getMonth() + 1)}-${zero2(d.getDate())}`
}

function zero2(i: number): string | number {
    return i >= 10 ? i : `0${i}`
}