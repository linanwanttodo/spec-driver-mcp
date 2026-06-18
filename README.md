# Spec Driver MCP

> [English](README.md) | [中文](README.zh-CN.md) | [Русский](README.ru.md)

A Model Context Protocol server that brings Kiro-style **spec-driven development** to any AI coding tool (Claude Code, Cursor, opencode, Codex CLI, Reasonix, Gemini CLI, and more).

## What it does

Replaces unstructured chat with a **3-phase workflow** when you ask AI to build, plan, or refactor a project:

```
Phase 1: Requirements  →  requirements.md (EARS format: WHEN...THE SYSTEM SHALL...)
Phase 2: Design         →  design.md (architecture, components, data flow)
Phase 3: Tasks          →  tasks.md (trackable [x] checkboxes)
```

Each phase requires **your approval** before advancing. Hooks auto-maintain consistency.

## Quick Start

### 1. Install

```bash
npx spec-driver-mcp
```

Or install globally:

```bash
npm install -g spec-driver-mcp
```

### 2. Add to your AI tool

#### opencode
Add to `~/.config/opencode/opencode.json`:
```json
{
  "mcp": {
    "spec-driver": {
      "type": "local",
      "command": ["npx", "spec-driver-mcp"]
    }
  }
}
```

#### Claude Code
Add to `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "spec-driver": {
      "command": "npx",
      "args": ["spec-driver-mcp"]
    }
  }
}
```

Then copy `instructions/CLAUDE.md` to your project root as `CLAUDE.md`.

#### Cursor
Create `.cursor/mcp.json` in your project:
```json
{
  "mcpServers": {
    "spec-driver": {
      "command": "npx",
      "args": ["spec-driver-mcp"]
    }
  }
}
```

Then copy `instructions/cursor-rules.md` to your project root as `.cursorrules`.

#### Codex CLI
Add to `~/.codex/config.toml`:
```toml
[mcp_servers.spec-driver]
command = "npx"
args = ["spec-driver-mcp"]
```

#### Reasonix
Add to `~/.reasonix/config.json` `mcp` array:
```json
"spec-driver=npx spec-driver-mcp"
```

#### Gemini CLI
Add to `~/.gemini/config/mcp_config.json`:
```json
{
  "mcpServers": {
    "spec-driver": {
      "command": "npx",
      "args": ["spec-driver-mcp"]
    }
  }
}
```

## Usage

Once configured, just tell your AI:

> "帮我开发一个博客系统" or "帮我分析这个项目" or "我们来重构这个"

The AI will automatically:

1. **Read your codebase** to understand context
2. **Ask you clarifying questions** (requirements-first or design-first? specific details?)
3. **Write requirements.md** using EARS notation
4. **Wait for your approval** before proceeding
5. **Write design.md** with architecture and component design
6. **Wait for your approval**
7. **Write tasks.md** with `- [ ]` checkboxes
8. **Wait for your approval**, then implement

### Marking tasks done

During implementation:

```
- [x] Task completed via update-task
- [ ] Still pending
```

The AI auto-runs hooks at each event:
- `on-task-completed` → auto-mark task [x], check acceptance criteria
- `on-spec-phase-change` → validate document completeness
- `on-user-request-change` → sync all documents

## Tools

| Tool | Description |
|---|---|
| `init-spec` | Initialize .spec/ with config + 3 default hooks |
| `write-spec-file` | Write requirements.md / design.md / tasks.md |
| `read-spec-file` | Read any spec file |
| `list-spec-files` | Show file status + hooks |
| `update-task` | Toggle task [x] or [ ] |
| `get-task-summary` | Task completion stats |
| `create-hook` | Create automation rules |
| `list-hooks` | List all hooks |
| `delete-hook` | Remove a hook |
| `run-hooks` | Execute hooks for an event |

## Spec File Location

All files are created in `.spec/` at your project root:

```
your-project/
├── .spec/
│   ├── .config              # Project metadata
│   ├── requirements.md       # Phase 1: Requirements
│   ├── design.md             # Phase 2: Design
│   ├── tasks.md              # Phase 3: Tasks
│   └── hooks/                # Automation rules
│       ├── auto-mark-completed.md
│       ├── validate-before-phase.md
│       └── notify-on-change.md
├── ...your code...
```

## Default Hooks

| Hook | Event | What it does |
|---|---|---|
| `auto-mark-completed` | `on-task-completed` | Auto update-task after implementation |
| `validate-before-phase` | `on-spec-phase-change` | Validate doc completeness before advancing |
| `notify-on-change` | `on-user-request-change` | Sync all docs when requirements change |

## One-Click AI Install Prompt

If you're asking an AI to set this up for you, copy this:

```
Install spec-driver-mcp globally and configure it:
1. Run: npm install -g spec-driver-mcp
2. Add "spec-driver" to the MCP servers config of my AI tool
   (the config format depends on which tool I use)
3. Done - no server needed, no API keys, no registration
```

## License

MIT
