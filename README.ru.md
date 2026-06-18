# Spec Driver MCP

> [English](README.md) | [中文](README.zh-CN.md) | [Русский](README.ru.md)

Сервер Model Context Protocol, который привносит **спецификацию-ориентированную разработку** в стиле Kiro в любой AI инструмент для кодирования (Claude Code, Cursor, opencode, Codex CLI, Reasonix, Gemini CLI и другие).

## Что он делает

Заменяет неструктурированный чат на **3-фазный рабочий процесс**, когда вы просите AI создать, спланировать или рефакторить проект:

```
Фаза 1: Требования  →  requirements.md (формат EARS: WHEN...THE SYSTEM SHALL...)
Фаза 2: Дизайн      →  design.md (архитектура, компоненты, потоки данных)
Фаза 3: Задачи      →  tasks.md (отслеживаемые [x] чекбоксы)
```

Каждая фаза требует **вашего одобрения** перед переходом. Hooks автоматически поддерживают согласованность.

## Быстрый старт

### 1. Установка

```bash
npx spec-driver-mcp
```

Или глобальная установка:

```bash
npm install -g spec-driver-mcp
```

### 2. Добавление в ваш AI инструмент

#### opencode
Добавьте в `~/.config/opencode/opencode.json`:
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
Добавьте в `~/.claude/settings.json`:
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

Затем скопируйте `instructions/CLAUDE.md` в корень проекта.

#### Cursor
Создайте `.cursor/mcp.json` в вашем проекте:
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

Затем скопируйте `instructions/cursor-rules.md` в корень проекта как `.cursorrules`.

#### Codex CLI
Добавьте в `~/.codex/config.toml`:
```toml
[mcp_servers.spec-driver]
command = "npx"
args = ["spec-driver-mcp"]
```

#### Reasonix
Добавьте в массив `mcp` в `~/.reasonix/config.json`:
```json
"spec-driver=npx spec-driver-mcp"
```

#### Gemini CLI
Добавьте в `~/.gemini/config/mcp_config.json`:
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

## Использование

После настройки просто скажите вашему AI:

> "Разработай мне блог" или "Проанализируй этот проект" или "Давай сделаем рефакторинг"

AI автоматически:

1. **Прочитает ваш код** для понимания контекста
2. **Задаст уточняющие вопросы** (сначала требования или дизайн? детали?)
3. **Напишет requirements.md** в формате EARS
4. **Дождется вашего одобрения** перед продолжением
5. **Напишет design.md** с архитектурой и дизайном компонентов
6. **Дождется вашего одобрения**
7. **Напишет tasks.md** с чекбоксами `- [ ]`
8. **Дождется вашего одобрения**, затем приступит к реализации

### Отметка выполненных задач

Во время реализации:

```
- [x] Задача выполнена через update-task
- [ ] Ожидает выполнения
```

AI автоматически запускает hooks при каждом событии:
- `on-task-completed` → автоматически отметить задачу [x], проверить критерии приемки
- `on-spec-phase-change` → проверить полноту документации
- `on-user-request-change` → синхронизировать все документы

## Инструменты

| Инструмент | Описание |
|---|---|
| `init-spec` | Инициализация .spec/ с конфигом + 3 hooks по умолчанию |
| `write-spec-file` | Запись requirements.md / design.md / tasks.md |
| `read-spec-file` | Чтение любого spec файла |
| `list-spec-files` | Показать статус файлов + hooks |
| `update-task` | Переключение задачи [x] или [ ] |
| `get-task-summary` | Статистика выполнения задач |
| `create-hook` | Создание правил автоматизации |
| `list-hooks` | Список всех hooks |
| `delete-hook` | Удаление hook |
| `run-hooks` | Выполнение hooks для события |

## Расположение Spec файлов

Все файлы создаются в `.spec/` в корне вашего проекта:

```
your-project/
├── .spec/
│   ├── .config              # Метаданные проекта
│   ├── requirements.md       # Фаза 1: Требования
│   ├── design.md             # Фаза 2: Дизайн
│   ├── tasks.md              # Фаза 3: Задачи
│   └── hooks/                # Правила автоматизации
│       ├── auto-mark-completed.md
│       ├── validate-before-phase.md
│       └── notify-on-change.md
├── ...ваш код...
```

## Hooks по умолчанию

| Hook | Событие | Действие |
|---|---|---|
| `auto-mark-completed` | `on-task-completed` | Автоматически отметить задачу после реализации |
| `validate-before-phase` | `on-spec-phase-change` | Проверить полноту документа перед переходом |
| `notify-on-change` | `on-user-request-change` | Синхронизировать все документы при изменениях |

## Установка в одну команду

Если вы просите AI настроить это, скопируйте этот текст:

```
Install spec-driver-mcp globally and configure it:
1. Run: npm install -g spec-driver-mcp
2. Add "spec-driver" to the MCP servers config of my AI tool
   (the config format depends on which tool I use)
3. Done - no server needed, no API keys, no registration
```

## Лицензия

MIT
