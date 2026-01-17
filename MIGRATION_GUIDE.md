# 博客迁移完成指南

## 快速开始

### 1. 配置环境变量

编辑 `.env` 文件，设置你的 GitHub 仓库信息：

```env
GITHUB_OWNER=你的GitHub用户名
GITHUB_REPO=你的仓库名
GITHUB_TOKEN=你的GitHub Token（可选但推荐）
```

**获取 GitHub Token：**
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 权限选择：
   - 公开仓库：勾选 `public_repo`
   - 私有仓库：勾选整个 `repo`
4. 复制生成的 token 到 `.env` 文件

### 2. 安装依赖

```bash
pnpm install
```

### 3. 本地开发

```bash
pnpm dev
```

访问 http://localhost:4321

### 4. 构建项目

```bash
pnpm build
```

### 5. 预览生产构建

```bash
pnpm preview
```

## 创建文章

直接在你的 GitHub 仓库创建 Issue：

1. 标题 = 文章标题
2. 内容 = Markdown 格式的文章内容
3. 标签（Labels）= 文章分类标签
4. 状态：保持 Open（关闭的 Issue 不会显示）

## Cloudflare Pages 部署

### 首次部署

1. 登录 Cloudflare Dashboard
2. 进入 Pages → Create a project → Connect to Git
3. 选择你的 GitHub 仓库
4. 配置构建设置：
   - **Framework preset**: Astro
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Node version**: 18 或 20

5. 设置环境变量（Settings → Environment variables）：
   ```
   GITHUB_OWNER=你的用户名
   GITHUB_REPO=你的仓库名
   GITHUB_TOKEN=你的token
   ```

6. 点击 "Save and Deploy"

### 更新 site 配置

部署完成后，更新 `astro.config.mjs` 中的 `site` 配置：

```js
export default defineConfig({
  integrations: [tailwind()],
  site: "https://你的项目名.pages.dev",
});
```

然后提交并重新部署。

## 文章更新机制

由于是静态站点，新建 Issue 后需要触发重新部署：

**方式 1：手动触发**
- 在 Cloudflare Pages 控制台点击 "Retry deployment" 或推送任何 commit

**方式 2：自动部署（可选）**
- 使用 GitHub Actions 定时触发（例如每小时检查一次）
- 配置 GitHub Webhook 在 Issue 创建时自动触发

## 项目结构

```
.
├── src/
│   ├── lib/
│   │   └── github.ts          # GitHub API 集成
│   ├── pages/
│   │   ├── index.astro        # 首页
│   │   ├── posts.astro        # 文章列表
│   │   ├── about.astro        # 关于页
│   │   ├── rss.xml.ts         # RSS Feed
│   │   └── post/
│   │       └── [slug].astro   # 文章详情页
│   ├── components/
│   │   ├── posts-loop.astro   # 文章列表组件
│   │   └── home/
│   │       └── writings.astro # 首页文章展示
│   └── collections/
│       └── menu.json          # 导航菜单配置
├── .env.example               # 环境变量示例
├── .env                       # 环境变量配置（不提交）
├── package.json
└── astro.config.mjs
```

## 常见问题

### Q: 文章不显示？
A: 检查：
1. Issue 是否为 Open 状态
2. 环境变量是否正确配置
3. GitHub Token 权限是否足够
4. 是否是 Pull Request（PR 会被过滤）

### Q: API 速率限制？
A:
- 未认证：60 次/小时
- 已认证：5000 次/小时
- **解决方案**：配置 GITHUB_TOKEN

### Q: 构建失败？
A:
1. 检查 Node 版本（推荐 18 或 20）
2. 确认所有依赖已安装
3. 查看构建日志中的具体错误信息

### Q: 如何更新 RSS Feed URL？
A: 编辑 `src/components/home/writings.astro` 中的 `feed` 变量

## 功能特性

- ✅ GitHub Issues 作为 CMS
- ✅ Markdown 支持（GitHub Flavored Markdown）
- ✅ 文章标签支持
- ✅ RSS Feed
- ✅ 响应式设计
- ✅ 暗色模式
- ✅ SEO 友好的 URL（`/post/1-hello-world`）
- ✅ 自动提取文章描述
- ✅ 链接到原始 GitHub Issue

## 后续优化建议

1. **代码高亮**：集成 Shiki 或 Highlight.js
2. **自动部署**：GitHub Actions 定时重新构建
3. **评论系统**：集成 Giscus（基于 GitHub Discussions）
4. **搜索功能**：添加客户端搜索（Fuse.js）
5. **图片优化**：使用 Astro Image 组件
6. **分析统计**：Google Analytics 或 Umami

## 支持

如有问题，请在仓库创建 Issue。
