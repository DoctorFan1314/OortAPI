# OortAPI 部署指南

## Docker 一键部署（推荐）

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+

### 部署步骤

```bash
# 方式一：直接下载 docker-compose.yml（推荐，使用预构建镜像）
curl -O https://raw.githubusercontent.com/DoctorFan1314/OortAPI/main/docker-compose.yml
docker compose up -d

# 方式二：克隆项目（可选，支持本地构建）
git clone https://github.com/DoctorFan1314/OortAPI.git
cd OortAPI
docker compose up -d
```

镜像从 GitHub Container Registry (ghcr.io) 自动拉取，无需本地构建。

### 常用命令

```bash
# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重新构建（代码更新后）
docker compose up -d --build

# 进入容器
docker compose exec oortapi sh
```

### 自定义端口

编辑 `docker-compose.yml`，修改端口映射：

```yaml
ports:
  - "8080:3000"  # 将 8080 改为你想用的端口
```

### 自定义站点 URL

编辑 `docker-compose.yml`，修改环境变量：

```yaml
environment:
  - NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 数据持久化

SQLite 数据库存储在 `./data` 目录，已通过 volume 挂载到宿主机。备份只需复制此目录：

```bash
cp -r data data-backup
```

### 安全密钥

`JWT_SECRET` 和 `ENCRYPTION_KEY` 会在首次启动时自动生成，存储在 `data/.jwt_secret` 和 `data/.encryption_key`。

如需手动指定，在 `docker-compose.yml` 中取消注释并填入：

```yaml
environment:
  - JWT_SECRET=your-random-string
  - ENCRYPTION_KEY=your-random-string
```

---

## 手动部署（不用 Docker）

### 环境要求

- Node.js 20+
- npm 9+

### 步骤

```bash
# 1. 安装依赖
npm ci

# 2. 构建
npm run build

# 3. 启动
npm start
```

生产环境建议使用 PM2 管理进程：

```bash
npm install -g pm2
pm2 start npm --name oortapi -- start
pm2 save
pm2 startup
```

---

## 反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NEXT_PUBLIC_SITE_URL` | 站点 URL（SEO、Sitemap） | `http://localhost:3000` |
| `PORT` | 服务端口 | `3000` |
| `DATABASE_PATH` | SQLite 数据库路径 | `./data/oortapi.db` |
| `JWT_SECRET` | JWT 签名密钥（首次运行自动生成） | 自动生成 |

---

## 常见问题

### Q: 构建时 `better-sqlite3` 报错？

Docker 部署已包含所需构建工具。手动部署需确保系统安装了 `python3`、`make`、`g++`（或 `build-essential`）。

### Q: 容器启动后无法访问？

检查端口是否被占用：`lsof -i :3000`，或换一个端口映射。

### Q: 数据库文件在哪里？

Docker 部署：宿主机 `./data/oortapi.db`
手动部署：项目根目录 `data/oortapi.db`
