
export class ServerError extends Error {
    readonly statusCode: number
    readonly error: string

    constructor(statusCode: number, error: string, message?: string) {
        super(message)
        this.statusCode = statusCode
        this.error = error
    }
}

/**
 * 通行错误代码。放置于error字段中。
 */
export const ErrorCode = {
    /**
     * 没有提供所需要的认证信息。
     */
    Unauthorized: "UNAUTHORIZED",
    /**
     * 认证信息无效：错误的用户名和密码。
     */
    InvalidUsernameOrPassword: "INVALID_USERNAME_OR_PASSWORD",
    /**
     * 授权信息无效：未经授权的重定向URI。
     */
    InvalidRedirectURI: "INVALID_REDIRECT_URI",
    /**
     * 授权信息无效：错误的AppSecret。
     */
    InvalidAppSecret: "INVALID_APP_SECRET",
    /**
     * 授权信息无效：授权码错误，或者已经失效。
     */
    InvalidAuthorizationCode: "INVALID_AUTH_CODE",
    /**
     * 无权进行此操作，即没有对此API或没有对此资源的操作权限。
     */
    Forbidden: "FORBIDDEN",
    /**
     * 被禁用的用户：该用户已被禁用，因此阻止了其大部分外部功能，仅允许在auth-service中登录并查看/修改信息。
     */
    DisabledUser: "DISABLED_USER",
    /**
     * 被禁用的App：该App已被禁用，因此阻止了面向该App的登录请求，仅允许管理员在auth-service中查看/修改其信息。
     */
    DisabledApp: "DISABLED_APP",
    /**
     * 无权进行此操作，对admin用户和auth service应用本身的某些操作是被禁止的(如修改enabled，或删除它们)，以确保系统稳定。
     */
    RootProtected: "ROOT_PROTECTED",
    /**
     * 404：资源未找到。
     */
    NotFound: "NOT_FOUND",
}