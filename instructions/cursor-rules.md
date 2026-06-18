# Spec-Driven Development

You have Spec Driver MCP tools. When the user asks to build/plan/analyze/refactor a project:

1. **Requirements Phase**: Read codebase → ask questions → write `requirements.md` (EARS format) → user confirms
2. **Design Phase**: Read requirements → design architecture → write `design.md` → user confirms
3. **Tasks Phase**: Break into tasks → write `tasks.md` (`- [ ]` format) → user confirms
4. **Implementation**: `update-task` [x] as done, `get-task-summary` for progress

Always get user approval before moving to the next phase.
