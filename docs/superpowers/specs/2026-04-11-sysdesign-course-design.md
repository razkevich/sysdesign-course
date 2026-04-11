# System Design Course — course.sysdesign.online

Open-source, free system design course website. Portfolio piece + real educational resource.

**Authors:** Alex Razkevich, Artem Gromovsky
**Language:** Russian only
**Domain:** course.sysdesign.online

---

## Architecture

Static site generated at build time. All course data lives in a JSON file in the repo. No backend, no database, no auth. Interactive features (progress, bookmarks, notes, search) run client-side with localStorage and Fuse.js.

Content (videos and PDFs) is already hosted on DigitalOcean Spaces:
- Videos: `https://sysdesign-course-videos.ams3.digitaloceanspaces.com/{module}-{lesson}.mp4`
- PDFs via viewer: `https://mycourse.sysdesign.online/pdfviewer.php?file=https://gammapdf.ams3.digitaloceanspaces.com/{module}-{lesson}.pdf`

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Astro | Static site generator with partial hydration. Ideal for content sites. |
| UI Components | React (via Astro islands) | Interactive components (tabs, search, progress) hydrate client-side. |
| Styling | Tailwind CSS | Dark theme, responsive, rapid development. |
| Search | Fuse.js | Client-side fuzzy search across lesson/module titles. |
| Client State | localStorage | Progress, bookmarks, notes. No auth needed. |
| Hosting | DO App Platform (static site) | Free tier. Auto-deploy from GitHub. HTTPS + CDN included. |
| Domain | course.sysdesign.online | Update existing A record in DO DNS to point to App Platform. |
| Content Storage | DO Spaces (existing) | Videos and PDFs already uploaded and accessible. |

## Visual Design

- **Theme:** Dark Indigo + Purple (primary: #7c83ff / #6366f1, secondary: #a855f7)
- **Background:** Deep indigo gradient (#0f0f1a → #1a1a2e → #16213e)
- **Text:** White (#fff) for headings, muted (#a0a0b8, #888) for secondary
- **Cards:** Semi-transparent with colored borders per module
- **Module accent colors:** Each module gets a distinct accent (indigo, purple, cyan, amber, emerald, rose, orange)
- **Typography:** System font stack, bold headings, clean hierarchy
- **No light mode toggle in v1** — ship dark only, add toggle later if needed

## Pages

### 1. Landing Page (`/`)

Top to bottom:
1. **Navbar** — Logo (SysDesign.online), links (Программа, Авторы, GitHub), CTA button (Начать)
2. **Hero** — "System Design" headline, description, badge stats (48 уроков, 7 модулей, Видео + PDF), dual CTA (Начать обучение + GitHub)
3. **Stats bar** — 48 уроков, 7 модулей, 20+ часов, 5 кейсов
4. **Module cards grid** — 7 cards in responsive grid (3 cols desktop, 2 tablet, 1 mobile). Each card shows: module number, title, lesson count, progress bar. Click navigates to module page.
5. **Problem walkthroughs section** — 5 case study cards (Airbnb, Messenger, Notification Service, URL Shortener, Approach). Each links to its video.
6. **Authors section** — Alex Razkevich and Artem Gromovsky. Avatar initials, name, brief role description, LinkedIn link.
7. **Footer** — Copyright, Open Source, GitHub link.

### 2. Module Page (`/module/[id]`)

- Module header: number, title, description, overall progress bar, lesson count
- Accordion list of lessons. Each lesson row shows:
  - Lesson number (e.g., 1-3)
  - Title
  - Indicators: video icon, PDF icon
  - Completion checkmark (from localStorage)
- Click a lesson row to navigate to lesson page

### 3. Lesson Page (`/lesson/[module]-[lesson]`)

- **Breadcrumbs:** Главная > Модуль N > Урок N-M
- **Lesson header:** Module label, lesson number (N of total), title
- **Tab switcher:** Видео / PDF / Заметки
  - **Видео tab:** HTML5 `<video>` element with `src` from DO Spaces. Native controls.
  - **PDF tab:** `<iframe>` loading `https://mycourse.sysdesign.online/pdfviewer.php?file=https://gammapdf.ams3.digitaloceanspaces.com/{module}-{lesson}.pdf`
  - **Заметки tab:** `<textarea>` that auto-saves to localStorage on input, keyed by lesson ID
- **Actions:**
  - "Отметить пройденным" button — toggles lesson completion in localStorage
  - Bookmark toggle — adds/removes from bookmarks in localStorage
- **Navigation:** Previous lesson (←) and Next lesson (→) buttons with lesson titles

### 4. Search (`/search?q=...`)

- Search input in navbar (visible on all pages)
- Search results page shows matching lessons and modules
- Fuse.js fuzzy search against: module titles, module descriptions, lesson titles
- Results show lesson title, module name, and link to lesson

### 5. Bookmarks Page (`/bookmarks`)

- List of bookmarked lessons from localStorage
- Each entry shows lesson title, module name, completion status
- Click navigates to lesson page
- Remove bookmark button per entry

## Course Data

Hardcoded JSON file (`src/data/course.json`) with this structure:

```json
{
  "modules": [
    {
      "id": 1,
      "title": "Основы архитектуры и системного проектирования",
      "description": "Архитектурные виды, декомпозиция, трейдоффы, эволюция, сбор требований, quality attributes, паттерны коммуникации",
      "color": "#7c83ff",
      "lessons": [
        { "id": "1-1", "title": "Введение в системный дизайн" },
        { "id": "1-2", "title": "Архитектурные виды" },
        { "id": "1-3", "title": "Декомпозиция и модульность" },
        { "id": "1-4", "title": "Архитектурные трейдоффы" },
        { "id": "1-5", "title": "Эволюция архитектуры" },
        { "id": "1-6", "title": "Сбор требований" },
        { "id": "1-7", "title": "Quality attributes" },
        { "id": "1-8", "title": "Паттерны коммуникации" }
      ]
    },
    {
      "id": 2,
      "title": "Современные архитектурные стили и шаблоны",
      "description": "DDD (тактический и стратегический), модульный монолит, микросервисы, event-driven архитектура, CQRS, саги, реактивное программирование, serverless, multi-tenancy",
      "color": "#a855f7",
      "lessons": [
        { "id": "2-1", "title": "Domain-Driven Design: основы" },
        { "id": "2-4", "title": "Модульный монолит" },
        { "id": "2-5", "title": "Микросервисы" },
        { "id": "2-6", "title": "Event-Driven архитектура" },
        { "id": "2-7", "title": "CQRS" },
        { "id": "2-8", "title": "Саги" },
        { "id": "2-9", "title": "Реактивное программирование" },
        { "id": "2-10", "title": "Serverless и multi-tenancy" }
      ]
    },
    {
      "id": 3,
      "title": "Сети и коммуникации",
      "description": "Протоколы, модель OSI, сетевые компоненты, service mesh, AWS networking",
      "color": "#22d3ee",
      "lessons": [
        { "id": "3-1", "title": "Сетевые протоколы и модель OSI" },
        { "id": "3-2", "title": "Сетевые компоненты и service mesh" },
        { "id": "3-3", "title": "AWS networking" }
      ]
    },
    {
      "id": 4,
      "title": "Основы распределённых систем",
      "description": "Шардирование, репликация, CAP теорема, консенсус, оркестрация Kubernetes, иерархия ресурсов AWS",
      "color": "#f59e0b",
      "lessons": [
        { "id": "4-1", "title": "Введение в распределённые системы" },
        { "id": "4-2", "title": "Шардирование" },
        { "id": "4-3", "title": "Репликация" },
        { "id": "4-4", "title": "CAP теорема" },
        { "id": "4-5", "title": "Консенсус" },
        { "id": "4-6", "title": "Kubernetes: основы" },
        { "id": "4-7", "title": "Kubernetes: продвинутые темы" },
        { "id": "4-8", "title": "AWS: иерархия ресурсов" },
        { "id": "4-9", "title": "AWS: базы данных" },
        { "id": "4-10", "title": "AWS: сетевые концепции" }
      ]
    },
    {
      "id": 5,
      "title": "Хранение и обработка данных",
      "description": "Масштабируемость, моделирование данных, ACID vs BASE, уровни изоляции, распределённый поиск, очереди сообщений, exactly-once семантика, обработка больших данных, Kafka",
      "color": "#10b981",
      "lessons": [
        { "id": "5-1", "title": "Масштабируемость данных" },
        { "id": "5-2", "title": "Моделирование данных" },
        { "id": "5-3", "title": "ACID vs BASE" },
        { "id": "5-4", "title": "Уровни изоляции транзакций" },
        { "id": "5-5", "title": "Распределённый поиск" },
        { "id": "5-6", "title": "Очереди сообщений" },
        { "id": "5-7", "title": "Exactly-once семантика" },
        { "id": "5-8", "title": "Kafka и обработка данных" }
      ]
    },
    {
      "id": 6,
      "title": "Отказоустойчивость и observability",
      "description": "Избыточность, rate limiting, circuit breakers, bulkheads, outbox pattern, оптимизация затрат, observability и SRE практики",
      "color": "#f43f5e",
      "lessons": [
        { "id": "6-1", "title": "Избыточность и отказоустойчивость" },
        { "id": "6-2", "title": "Rate limiting" },
        { "id": "6-3", "title": "Circuit breakers" },
        { "id": "6-4", "title": "Bulkheads и outbox pattern" },
        { "id": "6-5", "title": "Оптимизация затрат" },
        { "id": "6-6", "title": "Observability" },
        { "id": "6-7", "title": "SRE практики" }
      ]
    },
    {
      "id": 7,
      "title": "Безопасность и защита данных",
      "description": "Аутентификация, авторизация, защита облачных приложений, защита данных, стандарты комплаенса",
      "color": "#f97316",
      "lessons": [
        { "id": "7-1", "title": "Аутентификация и авторизация" },
        { "id": "7-3", "title": "Защита данных и комплаенс" }
      ]
    }
  ],
  "problems": [
    { "id": "airbnb", "title": "Проектирование Airbnb", "video": "airbnb.mp4" },
    { "id": "messenger", "title": "Проектирование мессенджера", "video": "Proektirovanie-messendzhera_pdf.mp4" },
    { "id": "notifications", "title": "Notification Service", "video": "notification_service.mp4" },
    { "id": "url-shortener", "title": "URL Shortener", "video": "URL_SHORTENER1.mp4" },
    { "id": "approach", "title": "Подход к System Design", "video": "approach.mp4" }
  ]
}
```

Note: Lesson titles above are best guesses from module descriptions and PDF naming. The actual titles should be verified from the PDF content. Module 2 is missing lessons 2-2 and 2-3 (no PDFs/videos found for those IDs in Google Drive).

## Content URLs

Videos: `https://sysdesign-course-videos.ams3.digitaloceanspaces.com/{lesson-id}.mp4`
- Exception: intro video is `intro.mp4`
- Problem videos: `https://sysdesign-course-videos.ams3.digitaloceanspaces.com/problems/{filename}.mp4` (airbnb, messenger, notification_service, url_shortener, approach)

PDFs: `https://mycourse.sysdesign.online/pdfviewer.php?file=https://gammapdf.ams3.digitaloceanspaces.com/{lesson-id}.pdf`

## Client-Side State (localStorage)

```
sysdesign:progress   → { "1-1": true, "1-2": true, ... }
sysdesign:bookmarks  → ["1-3", "4-5", ...]
sysdesign:notes      → { "1-1": "My notes...", "4-5": "..." }
```

## Deployment

1. GitHub repo (public, open source)
2. DO App Platform static site — auto-deploys on push to main
3. Update `course.sysdesign.online` DNS A record to point to App Platform
4. HTTPS via App Platform (automatic Let's Encrypt)

## Cost

- Hosting: $0/mo (DO App Platform static free tier)
- Content: already on DO Spaces (existing cost)
- Domain: already configured
- Total incremental cost: **$0/mo**

## Out of Scope (v1)

- Light mode toggle
- User authentication / cross-device sync
- Quizzes / flashcards
- Interactive architecture diagrams
- Coding Interview course (listed as "in development" on sysdesign.online)
- i18n / English translation
- Comments / discussion per lesson
- Analytics (can add Plausible or similar later)
