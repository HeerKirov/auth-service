# Auth Service Frontend

* node >= 22.11.0
* yarn >= 1.22.21

## Development

使用yarn安装全部依赖。
```shell
yarn install
```

前端的部分开发配置通过环境变量传入。复制一份`.env`到`.env.development.local`作为开发模式下的配置参数。
```dotenv
# 前端path的前缀
VITE_URL_PREFIX=/auth

# 后端api的前缀
VITE_API_PREFIX=/api

# 后端api的代理地址
VITE_API_TARGET=
```

vite已代理所有后端请求。默认为所有后端请求添加`/api`前缀，并代理到`http://localhost:3000`。可以通过修改环境变量改变此配置。

使用dev命令启动开发服务器。开发服务器用vite支持。
```shell
yarn dev
```

之后可以访问前端：`http://localhost:5173`。

## Production

在进行前端编译之前，复制一份`.env`到`.env.production.local`作为生产模式下的配置参数。根据生产环境的需要，修改`VITE_URL_PREFIX`前缀。配置参数在编译之后即不可更改。

使用build命令进行生产模式构建。
```shell
yarn build
```
构建产物位于`dist/client`目录。

### Nginx 配置

通常在生产环境下将前端资源配置到nginx以提供访问。nginx目录下已提供了默认的`auth-service.conf`示例配置文件。此配置文件默认将`/auth`路径映射给此服务。

例如，使用docker启动一个nginx服务器并使用此配置：
```shell
docker run --rm --name auth-service-nginx \
  -p 80:80 \
  -v ./nginx:/etc/nginx/conf.d \
  -v ./dist/client:/usr/share/nginx/html/auth \
  nginx:latest
```