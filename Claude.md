## 项目概览
我的个人博客 + 稳定运行，代码规范
## 技术栈
- Next.js 15 + TypeScript + Tailwind
- Prisma + PostgreSQL
- Jest + React Testing Library

## 项目结构（只写特殊约定）
- `src/app/` → App Router 专属规则
- `src/components/` → 所有组件必须有对应 `.test.tsx`
- `src/lib/` → 纯函数工具库

## 编码规范（必须遵守）
- 所有组件必须有 unit test
- 使用 shadcn/ui 组件库
- TypeScript strict mode 必须开启
- 提交前必须通过 `npm run lint` 和 `npm run test`

## 常用命令
- 测试：`npm run test`
- 构建：`npm run build`
- Lint：`npm run lint -- --fix`
- 开发：`npm run dev`

## 外部文档引用
@docs/testing-strategy.md
@docs/security-rules.md

## 自我改进规则
- 每次出错后自动更新本文件对应章节
- 永远先 Plan → 再 Implement
- 变更后必须运行测试并修复