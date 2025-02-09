# Auth Service Backend

* node >= 22.11.0
* yarn >= 1.22.21

## Development

使用yarn安装全部依赖。
```shell
yarn install
```

后端的所有配置通过环境变量传入。复制一份`.env`到`.env.development.local`作为开发模式下的配置参数。
```dotenv
DEBUG=true

# 通过openssl生成JWT SECRET并填入
APP_JWT_SECRET='openssl rand -base64 32'
# 修改一个admin账户的默认密码
ADMIN_PASSWORD='default password'

# 数据库连接参数
DB_HOST=postgres
DB_PORT=5432
DB_NAME=auth_service
DB_USER=postgres
DB_PASSWORD=postgres
```

在开始之前，首先完成数据库的migration。使用knex的migrate:latest命令将数据库迁移到最新版本。
```shell
npx knex migrate:latest
```

完成配置之后，使用dev命令启动开发服务器。开发服务器由ts-node-dev支持。
```shell
yarn dev
```

之后可以访问后端: `http://localhost:3000`。

## Production

使用build命令进行生产环境构建。构建由tsup支持。
```shell
yarn build
```
构建产物位于`dist`目录，包含以下内容：
* `app.js`: 编译产物
* `node_modules`: 仅运行时的依赖
* `package.json`: 包文件
* `knexfile.js`, `migrations`: knex配置与迁移文件

以上内容已经覆盖所有需要，因此，可以使用`dist`目录下的文件完成生产环境的所有操作。

> knex迁移文件经过编译后与开发环境不同，因此不能对同一个数据库混用开发环境和编译后的knex迁移文件。

将生产环境的.env拷贝到`dist`目录下，或者通过其他任意方式通过环境变量配置好后端的配置参数，之后可以运行：
```shell
node app.js
```

### Docker 环境编译

除了本机编译之外，还支持在docker中完成编译。使用`docker/compile.sh`脚本完成编译。
```shell
./docker/compile.sh
```
这会在node容器中完成编译，并使用本地的yarn cache。  
编译产物的位置与标准编译流程相同。

### Docker 容器构建

除了本机环境运行之外，还支持构建docker镜像。使用`docker/build.sh`脚本完成镜像构建。在构建之前，首先要完成编译构建流程。
```shell
./docker/build.sh <TAG> # TAG参数指定镜像tag。如不指定tag，默认tag为"dev"。
```
构建完成得到镜像`auth-service:<TAG>`。

### Docker Compose 编排

docker目录下已提供了默认的`docker-compose.yml`示例文件。

使用docker compose完成数据库迁移：
```shell
docker compose up migrate
```
完成迁移之后，启动后端：
```shell
docker compose up -d
```