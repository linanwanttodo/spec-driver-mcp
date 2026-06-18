#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs";
import path from "node:path";
const SPEC_DIR = ".spec";
const HOOKS_DIR = "hooks";
const VALID_FILES = ["requirements.md", "design.md", "tasks.md"];
const VALID_EVENTS = [
    "on-requirements-confirmed",
    "on-design-confirmed",
    "on-tasks-confirmed",
    "on-task-completed",
    "on-implementation-done",
    "on-spec-phase-change",
    "on-user-request-change",
    "manual",
];
function specDir() {
    return path.resolve(process.cwd(), SPEC_DIR);
}
function hooksDir() {
    return path.resolve(specDir(), HOOKS_DIR);
}
function filePath(name) {
    return path.resolve(specDir(), name);
}
function ensureDir(d) {
    const target = d || specDir();
    if (!fs.existsSync(target))
        fs.mkdirSync(target, { recursive: true });
}
function readFile(name) {
    const p = filePath(name);
    return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "";
}
function writeFile(name, content) {
    ensureDir();
    fs.writeFileSync(filePath(name), content, "utf-8");
}
function parseTasks(content) {
    const lines = content.split("\n");
    const tasks = [];
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/^-\s*\[( |x)\]\s*(.+)/i);
        if (m)
            tasks.push({ line: i, text: m[2].trim(), done: m[1].toLowerCase() === "x" });
    }
    return tasks;
}
function fileMetadata(name) {
    const p = filePath(name);
    if (!fs.existsSync(p))
        return { exists: false, size: 0, tasks: 0, done: 0 };
    const content = fs.readFileSync(p, "utf-8");
    const tasks = parseTasks(content);
    return {
        exists: true,
        size: content.length,
        tasks: tasks.length,
        done: tasks.filter((t) => t.done).length,
    };
}
function listHooks() {
    const dir = hooksDir();
    if (!fs.existsSync(dir))
        return [];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    const hooks = [];
    for (const f of files) {
        const content = fs.readFileSync(path.join(dir, f), "utf-8");
        const eventMatch = content.match(/^## Event\s*\n`([^`]+)`/m);
        const descMatch = content.match(/^## Description\s*\n(.+)/m);
        const name = f.replace(/\.md$/, "");
        hooks.push({
            name,
            event: eventMatch ? eventMatch[1] : "manual",
            description: descMatch ? descMatch[1].trim() : "",
            file: f,
        });
    }
    return hooks;
}
function hookFilePath(name) {
    return path.join(hooksDir(), `${name.replace(/[^a-zA-Z0-9_-]/g, "_")}.md`);
}
const server = new Server({ name: "spec-driver-mcp", version: "0.3.0" }, { capabilities: { tools: {}, resources: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "init-spec",
            description: `Initialize a spec-driven development workspace for the current project.
Creates a .spec/ directory that will hold three files:
- requirements.md: User stories, acceptance criteria (EARS format)
- design.md: Architecture, diagrams, implementation approach
- tasks.md: Trackable checkbox tasks
- hooks/: Event-driven automation rules

Call this FIRST when user expresses intent to build, plan, design, analyze, or refactor.`,
            inputSchema: {
                type: "object",
                properties: {
                    projectName: { type: "string", description: "Project or feature name" },
                    specType: {
                        type: "string", enum: ["feature", "bugfix"],
                        description: "Type of spec (default: feature)",
                    },
                    workflowType: {
                        type: "string", enum: ["requirements-first", "design-first"],
                        description: "Workflow variant (default: requirements-first)",
                    },
                },
                required: ["projectName"],
            },
        },
        {
            name: "write-spec-file",
            description: `Write content to one of the three spec files.
Use this to create or update requirements.md, design.md, or tasks.md.`,
            inputSchema: {
                type: "object",
                properties: {
                    file: { type: "string", enum: ["requirements.md", "design.md", "tasks.md"] },
                    content: { type: "string", description: "Full markdown content" },
                },
                required: ["file", "content"],
            },
        },
        {
            name: "read-spec-file",
            description: `Read the content of one of the three spec files.
Use this to review requirements, check design decisions, or see task status.`,
            inputSchema: {
                type: "object",
                properties: {
                    file: { type: "string", enum: ["requirements.md", "design.md", "tasks.md"] },
                },
                required: ["file"],
            },
        },
        {
            name: "list-spec-files",
            description: `List all spec files with their status (exists, size, task count).`,
            inputSchema: { type: "object", properties: {} },
        },
        {
            name: "update-task",
            description: `Mark a task as done or pending in tasks.md.
Use this during implementation to track progress.
The task is identified by matching its text content (case-insensitive partial match).`,
            inputSchema: {
                type: "object",
                properties: {
                    match: { type: "string", description: "Text to match against task descriptions (partial, case-insensitive)" },
                    done: { type: "boolean", description: "true = [x], false = [ ]" },
                    line: { type: "number", description: "Exact line number (0-indexed)" },
                },
                required: ["done"],
            },
        },
        {
            name: "get-task-summary",
            description: `Get a summary of task completion status from tasks.md.`,
            inputSchema: { type: "object", properties: {} },
        },
        {
            name: "create-hook",
            description: `Register an automation hook for the spec workflow.
Hooks define actions the AI should automatically perform when specific events occur.
Events: on-requirements-confirmed, on-design-confirmed, on-tasks-confirmed,
        on-task-completed, on-implementation-done, on-spec-phase-change,
        on-user-request-change, manual

Example: when a task is completed (on-task-completed), auto-run update-task to mark it [x].`,
            inputSchema: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Unique hook name (e.g. auto-mark-completed)" },
                    event: {
                        type: "string",
                        enum: [...VALID_EVENTS],
                        description: "Event that triggers this hook",
                    },
                    description: { type: "string", description: "Short description of what this hook does" },
                    instructions: { type: "string", description: "Detailed instructions for the AI to execute when triggered" },
                },
                required: ["name", "event", "description", "instructions"],
            },
        },
        {
            name: "list-hooks",
            description: `List all registered hooks with their event type and description.
Use this to review what automations are active.`,
            inputSchema: { type: "object", properties: {} },
        },
        {
            name: "delete-hook",
            description: `Remove a hook by name.`,
            inputSchema: {
                type: "object",
                properties: {
                    name: { type: "string", description: "Name of the hook to delete" },
                },
                required: ["name"],
            },
        },
        {
            name: "run-hooks",
            description: `Get all hooks matching a specific event type.
The AI should call this when an event occurs and execute the matching hooks' instructions.
For example, after completing implementation of a task, call run-hooks with event "on-task-completed"
to find and execute all relevant hooks.`,
            inputSchema: {
                type: "object",
                properties: {
                    event: {
                        type: "string",
                        enum: [...VALID_EVENTS],
                        description: "The event that just occurred",
                    },
                },
                required: ["event"],
            },
        },
    ],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    switch (name) {
        /* ---- Spec file management ---- */
        case "init-spec": {
            const { projectName, specType, workflowType: rawWf } = args;
            const wf = rawWf || "requirements-first";
            ensureDir();
            const cfg = {
                specId: crypto.randomUUID(), specType: specType || "feature",
                workflowType: wf, projectName,
                createdAt: new Date().toISOString(),
            };
            fs.writeFileSync(path.join(specDir(), ".config"), JSON.stringify(cfg, null, 2), "utf-8");
            // Create default hooks directory with sample hooks
            const hookSamples = [
                {
                    name: "auto-mark-completed",
                    event: "on-task-completed",
                    desc: "Automatically update-task when implementation finishes",
                    body: `After implementing a task, the AI should automatically mark it as complete in tasks.md.\n\n1. Read tasks.md to find the matching task\n2. Call update-task with match text and done=true\n3. Read requirements.md to check if acceptance criteria are satisfied`,
                },
                {
                    name: "validate-before-phase",
                    event: "on-spec-phase-change",
                    desc: "Validate requirements.md before advancing to design phase",
                    body: `Before moving between phases, check the current phase's document is complete.\n\n1. Read the current phase's document\n2. Check EARS format compliance in requirements.md\n3. Check task checkboxes in tasks.md are properly formatted\n4. If issues found, ask user before proceeding`,
                },
                {
                    name: "notify-on-change",
                    event: "on-user-request-change",
                    desc: "When user requests changes, update specs and tasks accordingly",
                    body: `When the user requests changes during any phase, update the affected spec files.\n\n1. Read all existing spec files to understand current state\n2. Update the relevant file with write-spec-file\n3. Note downstream impacts (changing reqs after design done = design may need regen)`,
                },
            ];
            ensureDir(hooksDir());
            for (const h of hookSamples) {
                const hf = hookFilePath(h.name);
                if (!fs.existsSync(hf)) {
                    fs.writeFileSync(hf, [
                        `# Hook: ${h.name}`,
                        "## Event", `\`${h.event}\``,
                        "## Description", h.desc,
                        "## Instructions", h.body,
                    ].join("\n"), "utf-8");
                }
            }
            return {
                content: [{
                        type: "text",
                        text: [
                            `Spec initialized for "${projectName}"`,
                            `Type: ${cfg.specType}`,
                            `Workflow: ${cfg.workflowType}`,
                            `Location: ${specDir()}/`,
                            `Hooks: ${hookSamples.length} default hooks created in ${hooksDir()}/`,
                            "",
                            "Ready to start the " + (wf === "requirements-first" ? "Requirements" : "Design") + " phase. " +
                                (wf === "requirements-first"
                                    ? "Analyze the codebase, ask clarifying questions, then write requirements.md."
                                    : "Analyze the codebase, ask clarifying questions, then write design.md."),
                        ].join("\n"),
                    }],
            };
        }
        case "write-spec-file": {
            const { file, content } = args;
            writeFile(file, content);
            const meta = fileMetadata(file);
            return { content: [{ type: "text", text: `${file} written (${content.length} chars). ${meta.tasks > 0 ? `${meta.done}/${meta.tasks} tasks.` : ""}` }] };
        }
        case "read-spec-file": {
            const { file } = args;
            const content = readFile(file);
            if (!content)
                return { content: [{ type: "text", text: `${file} is empty or does not exist yet.` }] };
            return { content: [{ type: "text", text: content }] };
        }
        case "list-spec-files": {
            ensureDir();
            const items = fs.readdirSync(specDir());
            const files = VALID_FILES.filter((f) => items.includes(f));
            const meta = files.map((f) => ({ name: f, ...fileMetadata(f) }));
            const totalTasks = meta.reduce((s, m) => s + m.tasks, 0);
            const totalDone = meta.reduce((s, m) => s + m.done, 0);
            const hooksList = listHooks();
            const lines = [
                `Spec directory: ${specDir()}/`,
                "",
                ...meta.map((m) => m.exists ? `  ${m.name.padEnd(18)} ${m.tasks} tasks (${m.done} done, ${m.size} chars)` : `  ${m.name.padEnd(18)} (not yet created)`),
                "",
                totalTasks > 0 ? `Total: ${totalDone}/${totalTasks} tasks (${Math.round((totalDone / totalTasks) * 100)}%)` : "No tasks yet.",
                "",
                `Hooks: ${hooksList.length} registered`,
                ...hooksList.map((h) => `  ${h.name.padEnd(25)} event: ${h.event.padEnd(28)} ${h.description}`),
            ];
            return { content: [{ type: "text", text: lines.join("\n") }] };
        }
        case "update-task": {
            const { match, done, line } = args;
            const content = readFile("tasks.md");
            if (!content)
                return { content: [{ type: "text", text: "tasks.md not found." }] };
            const lines = content.split("\n");
            const tasks = parseTasks(content);
            let targetLine = -1;
            if (line !== undefined)
                targetLine = line;
            else if (match) {
                const found = tasks.find((t) => t.text.toLowerCase().includes(match.toLowerCase()) && t.done !== done);
                if (found)
                    targetLine = found.line;
            }
            if (targetLine === -1) {
                return { content: [{ type: "text", text: match ? `No task matching "${match}" with target status (done=${done}).` : "No line specified." }] };
            }
            const oldLine = lines[targetLine];
            lines[targetLine] = done ? oldLine.replace("- [ ]", "- [x]") : oldLine.replace("- [x]", "- [ ]");
            if (lines[targetLine] === oldLine) {
                return { content: [{ type: "text", text: `Line ${targetLine} is not a checkbox task.` }] };
            }
            writeFile("tasks.md", lines.join("\n"));
            const text = lines[targetLine].replace(/^-\s*\[.\]\s*/, "").trim();
            return { content: [{ type: "text", text: done ? `[x] ${text}` : `[ ] ${text}` }] };
        }
        case "get-task-summary": {
            const content = readFile("tasks.md");
            if (!content)
                return { content: [{ type: "text", text: "tasks.md does not exist yet." }] };
            const tasks = parseTasks(content);
            const done = tasks.filter((t) => t.done);
            const pending = tasks.filter((t) => !t.done);
            const pct = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;
            const lines = [
                `## Task Summary\n**${done.length}/${tasks.length}** completed (**${pct}%**)\n`,
            ];
            if (pending.length > 0) {
                lines.push(`### Pending (${pending.length})`);
                pending.forEach((t) => lines.push(`  - [ ] ${t.text}`));
                lines.push("");
            }
            if (done.length > 0) {
                lines.push(`### Completed (${done.length})`);
                done.forEach((t) => lines.push(`  - [x] ${t.text}`));
            }
            return { content: [{ type: "text", text: lines.join("\n") }] };
        }
        /* ---- Hook management ---- */
        case "create-hook": {
            const { name: hookName, event, description, instructions } = args;
            ensureDir(hooksDir());
            const content = [
                `# Hook: ${hookName}`,
                "",
                "## Event",
                `\`${event}\``,
                "",
                "## Description",
                description,
                "",
                "## Instructions",
                instructions,
                "",
            ].join("\n");
            const fp = hookFilePath(hookName);
            fs.writeFileSync(fp, content, "utf-8");
            return { content: [{ type: "text", text: `Hook "${hookName}" created (event: ${event}).` }] };
        }
        case "list-hooks": {
            const hooks = listHooks();
            if (hooks.length === 0) {
                return { content: [{ type: "text", text: "No hooks defined yet. Use create-hook to add one." }] };
            }
            const lines = [`Hooks in ${hooksDir()}/:\n`];
            for (const h of hooks) {
                lines.push(`  ${h.name.padEnd(25)} ${h.event.padEnd(30)} ${h.description}`);
            }
            return { content: [{ type: "text", text: lines.join("\n") }] };
        }
        case "delete-hook": {
            const { name: hookName } = args;
            const fp = hookFilePath(hookName);
            if (!fs.existsSync(fp)) {
                return { content: [{ type: "text", text: `Hook "${hookName}" not found.` }] };
            }
            fs.unlinkSync(fp);
            return { content: [{ type: "text", text: `Hook "${hookName}" deleted.` }] };
        }
        case "run-hooks": {
            const { event } = args;
            const hooks = listHooks().filter((h) => h.event === event);
            if (hooks.length === 0) {
                return { content: [{ type: "text", text: `No hooks found for event "${event}".` }] };
            }
            const results = [];
            for (const h of hooks) {
                const content = fs.readFileSync(path.join(hooksDir(), h.file), "utf-8");
                const instrMatch = content.match(/## Instructions\n([\s\S]*)/);
                results.push(`=== ${h.name} ===\n${instrMatch ? instrMatch[1].trim() : "(no instructions)"}`);
            }
            return { content: [{ type: "text", text: results.join("\n\n") }] };
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
});
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
        ...VALID_FILES.map((f) => ({
            uri: `spec://${f}`, name: f, description: `${f} content`, mimeType: "text/markdown",
        })),
        {
            uri: "spec://hooks",
            name: "Spec Hooks",
            description: "List of all registered hooks",
            mimeType: "text/markdown",
        },
    ],
}));
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    if (uri === "spec://hooks") {
        const hooks = listHooks();
        const lines = hooks.length === 0
            ? ["(no hooks defined)"]
            : hooks.map((h) => `- ${h.name} (event: ${h.event}): ${h.description}`);
        return { contents: [{ uri, mimeType: "text/markdown", text: lines.join("\n") }] };
    }
    const file = uri.replace("spec://", "");
    if (!VALID_FILES.includes(file))
        throw new Error(`Unknown resource: ${uri}`);
    return { contents: [{ uri, mimeType: "text/markdown", text: readFile(file) || `(${file} is empty)` }] };
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Spec Driver MCP v0.3 running on stdio");
}
main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
//# sourceMappingURL=index.js.map