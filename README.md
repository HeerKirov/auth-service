# Auth Service

登录认证服务。提供以下功能：

* 用户的登录、注册，以及用户管理；
* 第三方App的接入，通过此服务获得用户授权；
* 用户-权限-App的简单权限模型。

## Technologies

项目分离为前端(`/frontend`)和后端(`/backend`)两个模块。

### 后端

* Node.js + Koa + Postgres
* 提供对前端以及第三方App的API服务

### 前端

* Vite + Svelte + Routify + Tailwind
* SPA应用，生产环境静态部署

## 第三方App接入

首先，由系统管理员在登录服务中创建一个App，在此App中配置该App可用的所有redirectURI。
之后，提供此App的`App ID`和`App Secret`。

### 登录流程

1. 第三方App的前端需要用户授权登录。跳转至`<auth-service>/authorize`页面，并携带query参数`appId`, `redirectURI`, `state`。
    - `appId`: 之前已创建好的App的App ID。
    - `redirectURI`: 完成授权之后，重定向到的URI。该URI必须匹配已提前配置在App中的可用redirectURI。
    - `state`: 随机数字，在之后重定向返回时，会携带此参数用于验证。
2. 登录服务会要求用户登录、注册，或使用当前已登录的用户获得授权。如果appId、redirectURI都验证无误，将重定向至之前的redirectURI，并携带query参数`appId`, `authorizationCode`, `state`。
    - `appId`: 相同的App ID，可用于验证。
    - `state`: 之前携带的验证参数。
    - `authorizationCode`: 授权码。稍后提交给后端。
3. 第三方App的前端将授权码提交至第三方App的后端，由后端提交授权码验证。后端发送`POST`请求至`<auth-service>/api/verify`，并携带`application/json`body参数`appId`, `appSecret`, `authorizationCode`。
    - `appId`: 之前已创建好的App的App ID。
    - `appSecret`: 之前已创建好的App的App Secret。
    - `authorizationCode`: 由前端获得的授权码。
    > 授权码模式的认证，要求授权码必须由后端来发送请求来完成完成验证流程，App Secret不允许暴露给前端。
4. 若授权码与App的信息匹配无误，验证API将返回`application/json`body，包含字段`refreshToken`, `accessToken`, `user`。
    - `accessToken`: 真正用于授权的token。
    - `refreshToken`: 用于刷新accessToken的token，其中不包含任何有效信息。
    - `user`: 包含用户信息。

### 如何使用token

登录服务的授权采用双token模式。

* access token用于进行大多数的授权认证。它是一个JWT，因此无需每次都调用API校验，高效，但有效时间较短；且access token在签发后不可撤销。
* refresh token用于获得新的access token。每次使用它都需要API校验，获得新的access token；可以长期持有，可以被登出操作撤回。

在登录流程获得refresh token后，有两种使用方法：
1. 将refresh token写入http only cookie: `Set-Cookie: token=<token>; HttpOnly`。这种方式全程不会将refresh token暴露给前端，是更加推荐的使用方式。
2. 将refresh token存入前端的local storage等持久存储，并在需要刷新token时添加到Header: `Authorization: bearer <token>`。建议仅在需要后端发送请求时使用此方式。

当需要刷新access token时，由前端发送`POST`请求至`<auth-service>/api/token`，不需要携带任何参数。
- 如果refresh token仍然有效，API将返回`application/json`body，包含字段`accessToken`，此时statusCode为`201 Created`。
- 如果refresh token已失效，API的statusCode为`401 Unauthorized`。
- token API在使用时，会自动刷新refresh token的持续时间，并将refresh token写入http only cookie。

获得的access token通常可以存储在session storage或前端内存中。当需要使用access token时：
- 使用`jsonwebtoken`解析token，检验其过期时间。 如果token已过期，则使用前面的token刷新流程，更新access token。
- 持有有效token时，可将其附于API请求的Header`Authorization`中，或以其他任意方式发送给后端。

当API请求发送至后端时，就可以由后端校验了。使用任意JWT解析库即可校验access token，其JWT Secret即为先前的`App Secret`。

access token的payload部分结构如下所示：
```typescript
interface JsonWebTokenPayload {
    username: string
    appId: string
    permissions: {
        name: string
        args: Record<string, unknown>
    }[]
    tokenCreateTime: number
    tokenExpireTime: number
}
```
可以通过payload获得用户信息和该用户持有的权限信息。