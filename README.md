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

首先由系统管理员在登录服务中创建一个App，在此App中配置该App可用的所有redirectURI，并生成此App的`App ID`和`App Secret`。

### API

#### /authorize

用户授权页面。应该携带关键参数访问授权服务器的这个页面，以进行授权。格式如下：
```
GET /authorize?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}&state={state}
```
参数说明:
- `response_type`: 请求的授权类型。唯一支持的类型是`code`。
- `client_id`: 之前已创建好的App的App ID。
- `redirect_uri`: 完成授权之后，重定向到的URI。该URI必须匹配已提前配置在App中的可用redirectURI。
- `state`: 随机数字，在之后重定向返回时，会携带此参数用于验证。

授权响应: 如果用户同意授权，授权服务器会将用户重定向回`redirect_uri`，并附带一个授权码。其格式如下：
```
HTTP/1.1 302 Found
Location: <reduirect_uri>?code={code}&state={state}&client_id={client_id}
```
参数说明:
- `client_id`: 相同的App ID，可用于验证。
- `state`: 之前携带的验证参数。
- `code`: 授权码。稍后提交给后端。

#### /token

进行授权访问的API。通过`grant_type`参数决定要使用的功能。grant_type允许写在请求的request body内或query param上。

授权访问API支持多种request content-type，例如`application/json`或`application/x-www-form-urlencoded`。

授权访问API同时支持**驼峰式**字段与**下划线**式字段。在request body内的字段二者皆可识别；response body内字段的风格依`grant_type`字段所使用的风格而定。

##### grant_type=authorization_code

验证授权码并获得refresh token。格式如下：
```
POST /token?grant_type=authorization_code
```
参数说明:
- `client_id`: 之前已创建好的App的App ID。
- `client_secret`: 之前已创建好的App的App Secret。
- `code`: 通过授权认证页面取得的授权码。

验证响应：如果授权码验证通过，将返回授权token。
```json5
{
   "refresh_token": "<>", // 用于刷新access token的token，不能用于一般认证授权
   "access_token": "<>",  // JWT token，可以用于授权，并从中取得用户信息和权限信息
   "expire_in": 3600,     // 过期时间，单位秒
   "scope": "read write",
   "token_type": "bearer",
   "user": {}             // 用户信息
}
```

##### grant_type=refresh_token

验证refresh token，创建新的access token。此类型需要提供refresh token以认证，支持的提供方式有多种：
1. 通过request body参数`refresh_token`提供；
2. 通过Header`Authorization`的`bearer <token>`提供；
3. 通过Cookie`refresh-token`提供。

验证响应：如果refresh token有效，将生成新的token。
```json5
{
   "access_token": "<>",  // JWT token，可以用于授权，并从中取得用户信息和权限信息
   "expire_in": 3600,     // 过期时间，单位秒
   "scope": "read write",
   "token_type": "bearer"
}
```
除此之外，如果refresh token本身有刷新，还会设置Cookie`refresh-token`。

### 登录流程

登录流程基于OAuth2.0标准，在此基础上有一些扩展。

1. 第三方App的前端需要用户授权登录。携带相关参数跳转至`<auth-service>/authorize`页面；
2. 登录服务会要求用户登录、注册，或使用当前已登录的用户获得授权。如果App的身份验证无误，将重定向至之前的redirectURI，并携带授权码；
3. 第三方App的前端将授权码提交至第三方App的后端，由后端提交授权码到`<auth-service>/token?grant_type=authorization_code`进行验证；
4. 若授权码与App的信息匹配无误，验证API将生成新的refresh token与第一条access token。

### 如何使用token

登录服务的授权采用双token模式。

* access token用于进行大多数的授权认证。它是一个JWT，因此无需每次都调用API校验，高效，但有效时间较短；且access token在签发后不可撤销。
* refresh token用于获得新的access token。每次使用它都需要API校验，获得新的access token；可以长期持有，可以被登出操作撤回。

在登录流程获得refresh token后，有两种使用方法：
1. 将refresh token写入http only cookie: `Set-Cookie: token=<token>; HttpOnly`。这种方式全程不会将refresh token暴露给前端，是更加推荐的使用方式。
2. 将refresh token存入前端的local storage等持久存储，并在需要刷新token时添加到Header: `Authorization: bearer <token>`。建议仅在需要后端发送请求时使用此方式。

当需要刷新access token时，发送请求至`<auth-service>/token?grant_type=refresh_token`。
- 如果refresh token仍然有效，将生成新的access token。
- 如果refresh token已失效，返回的statusCode为`401 Unauthorized`。
- token API在使用时，会自动刷新refresh token的持续时间，并将refresh token写入httpOnly cookie。

获得的access token通常可以存储在session storage或前端内存中。当需要使用access token时：
- 使用`jsonwebtoken`解析token，检验其过期时间。 如果token已过期，则使用前面的token刷新流程，更新access token。
- 持有有效token时，可将其附于API请求的Header`Authorization`中，或以其他任意方式发送给后端。

当API请求发送至后端时，就可以由后端校验了。使用任意JWT解析库即可校验access token，其JWT Secret即为先前的`App Secret`。

access token的payload部分结构如下所示：
```typescript
interface JsonWebTokenPayload {
    sub: string //用户标识, UUID
    iss: string //签发者标识, https://auth-service.com
    aud: string //签发目标, appId
    jti: string //防重放攻击, UUID
    exp: number //过期时间戳(秒)
    iat: number //签发时间戳(秒)

    username: string //扩展字段: 用户名
    name: string     //扩展字段: 用户显示名称
    permissions: {   //扩展字段: 用户权限信息
        name: string
        args: Record<string, unknown>
    }[]
}
```
可以通过payload获得用户信息和该用户持有的权限信息。

