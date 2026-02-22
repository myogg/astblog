# Cloudflare Workers 评论系统部署指南

## 1. 创建 D1 数据库

```bash
cd workers
npx wrangler d1 create comments
```

复制输出的 `database_id`，更新 `wrangler.toml` 中的 `YOUR_DATABASE_ID`

## 2. 初始化数据库

```bash
npx wrangler d1 execute comments --file=schema.sql
```

## 3. 部署到 Cloudflare Workers

```bash
npx wrangler deploy
```

部署成功后会得到一个 URL，如：`https://comment-api.your-name.workers.dev`

## 4. 更新前端配置

将 Workers URL 填入前端评论组件的 `API_URL` 配置中。
