# Codex FastAPI 服务

该项目提供一个精简的 FastAPI 后端，同时提供 REST API 与静态资源。应用暴露登录与配置接口，使用基于令牌的认证方式进行保护，并通过 `static/` 目录中的前端文件完成页面展示。

## 前置条件

- Python 3.12
- Pip 与 Virtualenv（可选，但推荐）
- Docker（可选，用于容器化部署）

## 环境变量

将 `.env.example` 复制为 `.env`，并根据实际情况调整：

```
CODEX_USERNAME="your-username"
CODEX_PASSWORD="your-password"

TOKEN_PREFIX="codex_"
TOKEN_EXPIRE=7200

DB_HOST="127.0.0.1"
DB_USERNAME="root"
DB_PASSWORD="secret"
DB_PORT="3306"
DB_DATABASE="codex"
```

`Dockerfile` 已包含当前仓库 `.env` 中的默认值。运行容器时可通过覆盖环境变量的方式使用其他凭据或数据库地址。

## Docker 使用

### 构建镜像

在项目根目录执行以下命令创建名为 `codex` 的镜像：

```
docker build -t codex .
```

### 运行容器

启动容器并映射 8001 端口：

```
docker run --rm -p 8001:8001 codex
```

如需覆盖环境变量，使用 `-e` 选项：

```
docker run --rm -p 8001:8001 ^
  -e CODEX_USERNAME=myuser ^
  -e CODEX_PASSWORD=mypassword ^
  codex
```

### Docker Compose（可选）

若使用 Docker Compose，可创建如下 `docker-compose.yml`：

```
services:
  codex:
    build: .
    ports:
      - "8001:8001"
    environment:
      CODEX_USERNAME: myuser
      CODEX_PASSWORD: mypassword
```

随后执行：

```
docker compose up --build
```

## 项目结构

- `main.py`：FastAPI 应用启动入口、路由定义与中间件。
- `static/`：由 FastAPI 静态挂载提供的前端资源。
- `requirements.txt`：Python 依赖列表。
- `Dockerfile`：包含默认环境变量的容器构建说明。

## 其他说明

- 请保持 `.env` 与 `Dockerfile` 中的环境变量同步，避免凭证不一致。
- 部署时确认数据库服务允许容器主机进行访问。
