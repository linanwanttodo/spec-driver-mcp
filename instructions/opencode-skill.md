# Spec-Driven Development (3-Phase + Hooks)

当用户表达开发、规划、分析、设计、重构等意图时，自动启动三阶段规格驱动流程。

## 触发场景

- "帮我开发一个 xxx 项目"
- "帮我规划/分析/设计 xxx"
- "我们来重构这个项目"
- 任何构建、规划、设计、分析的请求

## 三阶段工作流 + Hook 自动化

### Phase 1: 需求分析 (Requirements)

1. **读代码了解上下文**
2. **提问澄清** — 需求优先还是设计优先？功能细节？约束条件？
3. **写 requirements.md**（EARS 格式 `WHEN...THE SYSTEM SHALL...`）
4. **展示给用户确认**，迭代修改
5. **用户确认后** → 调用 `run-hooks on-requirements-confirmed` 执行相关 hooks
6. **进入下一阶段前** → `run-hooks on-spec-phase-change` 验证完整性

### Phase 2: 设计 (Design)

1. 重新读取 requirements.md
2. 设计架构、组件、数据流
3. **写 design.md**
4. **展示给用户确认**，迭代修改
5. **用户确认后** → `run-hooks on-design-confirmed`

### Phase 3: 任务拆解 (Tasks)

1. 重新读取 design.md
2. 拆解为可执行任务，写 tasks.md
3. **展示给用户确认**
4. **用户确认后** → `run-hooks on-tasks-confirmed`

### 实现阶段 (Implementation)

1. 每次完成一个任务 → `update-task` 标记 `[x]` → **然后** `run-hooks on-task-completed`
2. 用户中途提新需求 → `run-hooks on-user-request-change` → 更新文档后再实现
3. 定期 `get-task-summary` 展示进度

## 预置 Hooks（init-spec 时自动创建）

| Hook | 事件 | 作用 |
|---|---|---|
| `auto-mark-completed` | `on-task-completed` | 实现完后自动 update-task |
| `validate-before-phase` | `on-spec-phase-change` | 阶段转换前校验文档完整性 |
| `notify-on-change` | `on-user-request-change` | 用户提修改时同步更新所有文档 |

## 工具全表

| 工具 | 用途 |
|---|---|
| `init-spec` | 初始化 .spec/ 目录 + 预置 hooks |
| `write-spec-file` | 写入 requirements.md / design.md / tasks.md |
| `read-spec-file` | 读取任一 spec 文件 |
| `list-spec-files` | 查看所有文件 + hooks 状态 |
| `update-task` | 标记任务 [x] 或 [ ] |
| `get-task-summary` | 任务完成统计 |
| `create-hook` | 创建自动化规则 |
| `list-hooks` | 列出所有 hooks |
| `delete-hook` | 删除 hook |
| `run-hooks` | 触发事件，执行匹配的 hooks |

## 核心原则

- **每阶段用户确认**后才能进入下一阶段
- **先读代码再提问**
- **有问题就问**，不要替用户做假设
- **hooks 自动执行**重复性操作
