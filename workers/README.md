# Cloudflare Workers 评论系统部署指南

## 方法一：网页部署（推荐，无需命令行）

### 1. 创建 D1 数据库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单选择 **Workers & Pages**
3. 点击 **D1 SQL Database**
4. 点击 **Create database**
5. 数据库名称填写：`comments`
6. 点击 **Create**

### 2. 初始化数据库表

1. 进入刚创建的 `comments` 数据库
2. 点击 **Console** 标签
3. 复制 `schema.sql` 文件的内容，粘贴到控制台
4. 点击 **Execute**

### 3. 创建 Worker

1. 返回 **Workers & Pages** 页面
2. 点击 **Create application** → **Create Worker**
3. Worker 名称填写：`comment-api`
4. 点击 **Deploy**
5. 部署后点击 **Edit code**
6. 删除默认代码，复制 `comment-api.js` 的全部内容粘贴进去
7. 点击右上角 **Save and Deploy**

### 4. 绑定 D1 数据库

1. 在 Worker 页面，点击 **Settings** 标签
2. 找到 **Variables and Secrets** → **D1 Database Bindings**
3. 点击 **Add binding**
4. Variable name 填写：`DB`
5. D1 database 选择：`comments`
6. 点击 **Save**

### 5. 获取 Worker URL

在 Worker 页面顶部可以看到你的 Worker URL，格式如：
```
https://comment-api.你的用户名.workers.dev
```

复制这个 URL，更新到 `src/components/comments.astro` 第 2 行的 `API_URL`

---

## 方法二：命令行部署

```bash
cd workers
wrangler d1 create comments
# 更新 wrangler.toml 中的 database_id
wrangler d1 execute comments --file=schema.sql
wrangler deploy
```
