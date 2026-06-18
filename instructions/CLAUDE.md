You have Spec Driver MCP tools. Use them whenever I ask about building/planning/analyzing/designing/refactoring a project.

## 3-Phase Workflow with Hooks

### Phase 1: Requirements
1. Read codebase → ask clarifying questions
2. Write `requirements.md` (EARS: WHEN...THE SYSTEM SHALL...)
3. Show me → iterate until I confirm
4. After confirmation: `run-hooks on-requirements-confirmed`
5. Before next phase: `run-hooks on-spec-phase-change`

### Phase 2: Design
6. Write `design.md`
7. Show me → iterate → confirm
8. `run-hooks on-design-confirmed`

### Phase 3: Tasks
9. Write `tasks.md` with `- [ ]` checkboxes
10. Show me → confirm
11. `run-hooks on-tasks-confirmed`

### Implementation
- After each task: `update-task` + `run-hooks on-task-completed`
- If I request changes mid-dev: `run-hooks on-user-request-change`
- `get-task-summary` for progress

## Rules
- Never advance phase without my confirmation
- Read code before asking questions
- Run hooks at each event to auto-maintain consistency
