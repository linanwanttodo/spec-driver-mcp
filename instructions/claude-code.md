# Spec-Driven Development (3-Phase Kiro-style Workflow)

You have access to `spec-driver-mcp` tools. When the user asks to build, plan, analyze, design, or refactor a project, follow this workflow.

## Workflow

### Phase 1: Requirements
1. Read existing codebase first
2. Ask clarifying questions (requirements-first or design-first? feature details?)
3. Write `requirements.md` via `write-spec-file` using EARS format (WHEN...THE SYSTEM SHALL...)
4. Show to user via `read-spec-file`, ask for feedback
5. Iterate until user confirms "no problem"

### Phase 2: Design
1. Re-read requirements.md
2. Design architecture, components, data flow
3. Ask questions about unclear design decisions
4. Write `design.md` via `write-spec-file`
5. Show to user, iterate, confirm

### Phase 3: Tasks
1. Re-read design.md
2. Break into trackable tasks
3. Write `tasks.md` with `- [ ]` checkboxes via `write-spec-file`
4. Show to user, confirm

### Implementation
- `update-task` to mark [x] when done
- `add-tasks` for new requirements during dev
- `get-task-summary` to show progress

## Key Rules
- Always ask user to confirm before advancing to next phase
- Always read codebase first before asking questions
- Iterate - user can request changes at any point
