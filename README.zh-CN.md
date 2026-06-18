# Spec Driver MCP

> [English](README.md) | [中文](README.zh-CN.md) | [Русский](README.ru.md)

一个 Model Context Protocol 服务器，为任何 AI 编码工具（Claude Code、Cursor、opencode、Codex CLI、Reasonix、Gemini CLI 等）带来 Kiro 风格的**规格驱动开发**工作流。

## 它能做什么

当您让 AI 开发、规划或重构项目时，将非结构化的对话替换为**三阶段工作流**：

```
Phase 1: 需求分析 → requirements.md（EARS 格式：WHEN...THE SYSTEM SHALL...）
Phase 2: 设计     → design.md（架构、组件、数据流）
Phase 3: 任务     → tasks.md（可追踪的 [x] 复选框）
```

每个阶段都需要**您的批准**才能进入下一步。Hooks 自动维护一致性。

## 快速开始

### 1. 安装

```bash
npx github:linanwanttodo/spec-driver-mcp
```

或全局安装：

```bash
npm install -g github:linanwanttodo/spec-driver-mcp
```

### 2. 添加到您的 AI 工具

#### opencode
添加到 `~/.config/opencode/opencode.json`：
```json
{
  "mcp": {
    "spec-driver": {
      "type": "local",
      "command": ["npx", "github:linanwanttodo/spec-driver-mcp"]
    }
  }
}
```

#### Claude Code
添加到 `~/.claude/settings.json`：
```json
{
  "mcpServers": {
    "spec-driver": {
      "command": "npx",
      "args": ["github:linanwanttodo/spec-driver-mcp"]
    }
  }
}
```

然后将 `instructions/CLAUDE.md` 复制到项目根目录。

#### Cursor
在项目中创建 `.cursor/mcp.json`：
```json
{
  "mcpServers": {
    "spec-driver": {
      "command": "npx",
      "args": ["github:linanwanttodo/spec-driver-mcp"]
    }
  }
}
```

然后将 `instructions/cursor-rules.md` 复制到项目根目录并重命名为 `.cursorrules`。

#### Codex CLI
添加到 `~/.codex/config.toml`：
```toml
[mcp_servers.spec-driver]
command = "npx"
args = ["github:linanwanttodo/spec-driver-mcp"]
```

#### Reasonix
添加到 `~/.reasonix/config.json` 的 `mcp` 数组：
```json
"spec-driver=npx github:linanwanttodo/spec-driver-mcp"
```

#### Gemini CLI
添加到 `~/.gemini/config/mcp_config.json`：
```json
{
  "mcpServers": {
    "spec-driver": {
      "command": "npx",
      "args": ["github:linanwanttodo/spec-driver-mcp"]
    }
  }
}
```

## 使用方式

配置完成后，只需告诉您的 AI：

> "帮我开发一个博客系统" 或 "帮我分析这个项目" 或 "我们来重构这个"

AI 将自动执行：

1. **阅读您的代码**以了解上下文
2. **向您提问**（需求优先还是设计优先？具体细节？）
3. **编写 requirements.md**，使用 EARS 格式
4. **等待您批准**后再继续
5. **编写 design.md**，包含架构和组件设计
6. **等待您批准**
7. **编写 tasks.md**，包含 `- [ ]` 复选框任务
8. **等待您批准**，然后开始实现

### 标记任务完成

实现过程中：

```
- [x] 任务通过 update-task 标记完成
- [ ] 待完成
```

AI 在每个事件中自动执行 hooks：
- `on-task-completed` → 自动标记任务 [x]，检查验收标准
- `on-spec-phase-change` → 验证文档完整性
- `on-user-request-change` → 同步更新所有文档

## 工具列表

| 工具 | 说明 |
|---|---|
| `init-spec` | 初始化 .spec/ 目录 + 3 个默认 hooks |
| `write-spec-file` | 写入 requirements.md / design.md / tasks.md |
| `read-spec-file` | 读取任意 spec 文件 |
| `list-spec-files` | 显示文件状态 + hooks |
| `update-task` | 切换任务 [x] 或 [ ] 状态 |
| `get-task-summary` | 任务完成统计 |
| `create-hook` | 创建自动化规则 |
| `list-hooks` | 列出所有 hooks |
| `delete-hook` | 删除 hook |
| `run-hooks` | 按事件类型执行 hooks |

## Spec 文件位置

所有文件创建在项目根目录的 `.spec/` 下：

```
your-project/
├── .spec/
│   ├── .config              # 项目元数据
│   ├── requirements.md       # Phase 1: 需求
│   ├── design.md             # Phase 2: 设计
│   ├── tasks.md              # Phase 3: 任务
│   └── hooks/                # 自动化规则
│       ├── auto-mark-completed.md
│       ├── validate-before-phase.md
│       └── notify-on-change.md
├── ...您的代码...
```

## 默认 Hooks

| Hook | 事件 | 作用 |
|---|---|---|
| `auto-mark-completed` | `on-task-completed` | 实现完成后自动标记任务 |
| `validate-before-phase` | `on-spec-phase-change` | 阶段转换前验证文档完整性 |
| `notify-on-change` | `on-user-request-change` | 用户提修改时同步所有文档 |

## 一句话安装提示

如果您让 AI 帮您安装，复制这段：

```
Install spec-driver-mcp from GitHub and configure it:
1. Run: npm install -g github:linanwanttodo/spec-driver-mcp
2. Add "spec-driver" to the MCP servers config of my AI tool
   (the config format depends on which tool I use)
3. Done - no server needed, no API keys, no registration
```

## 许可证

MIT
