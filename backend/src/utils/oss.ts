import OSS from "ali-oss"
import config from "@/config"

const client = new OSS({
    accessKeyId: config.oss.accessKeyId || "",
    accessKeySecret: config.oss.accessKeySecret || "",
    bucket: config.oss.bucket,
    region: config.oss.region,
    internal: config.oss.internal,
    secure: config.oss.secure,
    endpoint: config.oss.endpoint
})

export async function uploadFile(objectName: string, file: Buffer | string, options?: OSS.PutObjectOptions): Promise<OSS.PutObjectResult> {
    try {
        return await client.put(`${config.oss.basePath}/${objectName}`, file, options)
    } catch (error) {
        console.error("Error uploading file to OSS:", error)
        throw error
    }
}

export async function existFile(objectName: string): Promise<boolean> {
    try {
        await client.head(`${config.oss.basePath}/${objectName}`)
        return true
    } catch (error) {
        return false
    }
}

export async function deleteFile(objectName: string): Promise<void> {
    try {
        await client.delete(`${config.oss.basePath}/${objectName}`)
    } catch (error) {
        console.error("Error deleting file from OSS:", error)
        throw error
    }
}

export async function getSignedUrl(objectName: string, expireTime: number = 3600): Promise<string> {
    try {
        return client.signatureUrl(`${config.oss.basePath}/${objectName}`, {expires: expireTime})
    } catch (error) {
        console.error("Error generating signed URL:", error)
        throw error
    }
}

export async function getUploadCredentical(options?: { dir?: string, filename?: string, contentLength?: number, contentType?: string, expireMilli?: number }): Promise<OSS.PostObjectParams & { dir: string, filename: string | undefined, host: string }> {
    const contentTypePolicy = options?.contentType?.includes("/") ? ["eq", "$Content-Type", options.contentType] : options?.contentType ? ["starts-with", "$Content-Type", `${options.contentType}/`] : undefined
    const contentLengthPolicy = ["content-length-range", 0, options?.contentLength ?? 1024 * 1024 * 10] //限制上传大小，默认10MB
    const keyPolicy = ["starts-with", "$key", config.oss.basePath + "/" + (options?.dir ? `${options.dir}/` : "/") + (options?.filename ?? "")]
    const expiration = new Date(Date.now() + (options?.expireMilli ?? 1000 * 60 * 60)).toISOString() //有效时长，默认10min
    
    const policy = {
        expiration,
        conditions: [
            contentLengthPolicy,
            contentTypePolicy,
            keyPolicy,
            ["eq", "$x-oss-forbid-overwrite", "true"],
            { bucket: config.oss.bucket }
        ]
    }

    const credentials = client.calculatePostSignature(policy)

    return {
        ...credentials,
        dir: config.oss.basePath + "/" + (options?.dir ? `${options.dir}/` : "/"),
        filename: options?.filename,
        host: `https://${config.oss.bucket}.${config.oss.region}.aliyuncs.com`
    }
}