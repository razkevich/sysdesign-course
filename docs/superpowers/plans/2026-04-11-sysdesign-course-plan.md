# System Design Course Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static course website at course.sysdesign.online that lists 48 system design lessons across 7 modules with embedded video/PDF content, progress tracking, search, bookmarks, and notes — all client-side.

**Architecture:** Astro static site with React islands for interactive components. Course data hardcoded in TypeScript. Content served from existing DO Spaces buckets. Deployed to DO App Platform free tier.

**Tech Stack:** Astro 5, React 19, Tailwind CSS 4, Fuse.js, TypeScript

---

## File Structure

```
sysdesign-course/
├── astro.config.mjs           # Astro config: React integration, site URL, static output
├── package.json
├── tsconfig.json
├── tailwind.config.mjs        # Dark theme colors, fonts
├── public/
│   └── favicon.svg            # Simple icon
├── src/
│   ├── data/
│   │   └── course.ts          # Course data (modules, lessons, problems) + helper functions
│   ├── lib/
│   │   └── storage.ts         # localStorage wrapper (progress, bookmarks, notes)
│   ├── layouts/
│   │   └── Layout.astro       # Base HTML shell (head, meta, body wrapper, dark bg)
│   ├── components/
│   │   ├── Navbar.astro       # Top nav (logo, links, search input)
│   │   ├── Footer.astro       # Footer (copyright, GitHub, open source)
│   │   ├── Hero.astro         # Landing hero section
│   │   ├── StatsBar.astro     # Stats bar (lessons, modules, hours, cases)
│   │   ├── ModuleCardsGrid.tsx # Module cards with live progress bars (React island)
│   │   ├── ProblemCard.astro  # Single problem walkthrough card
│   │   ├── Authors.astro      # Authors section
│   │   ├── LessonList.tsx     # Accordion lesson list with checkmarks (React island)
│   │   ├── LessonContent.tsx  # Tabs: video/pdf/notes + mark complete + bookmark (React island)
│   │   ├── SearchWidget.tsx   # Search input + results dropdown (React island)
│   │   └── BookmarksList.tsx  # Bookmarks list (React island)
│   ├── pages/
│   │   ├── index.astro        # Landing page
│   │   ├── module/
│   │   │   └── [id].astro     # Module detail page
│   │   ├── lesson/
│   │   │   └── [id].astro     # Lesson page
│   │   ├── search.astro       # Search results page
│   │   └── bookmarks.astro    # Bookmarks page
│   └── styles/
│       └── global.css         # Tailwind directives + custom scrollbar + global overrides
├── .gitignore
└── .do/
    └── app.yaml               # DO App Platform deployment spec
```

**Key design decisions:**
- Astro components (`.astro`) for static content that doesn't need JS (Hero, Footer, etc.)
- React islands (`.tsx`) with `client:load` for anything that reads localStorage or has interactivity
- One `storage.ts` module wraps all localStorage access with typed functions
- Course data in TypeScript (not JSON) so we get type checking and helper functions
- `SearchWidget.tsx` lives in the Navbar and combines input + dropdown results (no separate search page needed — but `/search` page exists for direct URL access)

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `tailwind.config.mjs`
- Create: `src/styles/global.css`
- Create: `.gitignore`
- Create: `public/favicon.svg`

- [ ] **Step 1: Initialize Astro project**

```bash
cd /Users/razkevich/code/sysdesign-course
npm create astro@latest . -- --template minimal --no-install --no-git --typescript strict
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @astrojs/react @astrojs/tailwind react react-dom fuse.js
npm install -D @types/react @types/react-dom tailwindcss @tailwindcss/vite
```

- [ ] **Step 3: Configure Astro**

Replace `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://course.sysdesign.online',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 4: Configure Tailwind**

Create `src/styles/global.css`:

```css
@import "tailwindcss";

@theme {
  --color-bg-primary: #0f0f1a;
  --color-bg-secondary: #1a1a2e;
  --color-bg-tertiary: #16213e;
  --color-accent-indigo: #7c83ff;
  --color-accent-indigo-dark: #6366f1;
  --color-accent-purple: #a855f7;
  --color-accent-cyan: #22d3ee;
  --color-accent-amber: #f59e0b;
  --color-accent-emerald: #10b981;
  --color-accent-rose: #f43f5e;
  --color-accent-orange: #f97316;
  --color-text-primary: #ffffff;
  --color-text-secondary: #a0a0b8;
  --color-text-muted: #888888;
  --color-border: rgba(124, 131, 255, 0.15);
}

body {
  background-color: var(--color-bg-primary);
  color: var(--color-text-secondary);
  font-family: system-ui, -apple-system, sans-serif;
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: var(--color-bg-primary);
}
::-webkit-scrollbar-thumb {
  background: var(--color-bg-tertiary);
  border-radius: 4px;
}
```

- [ ] **Step 5: Create favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#6366f1"/>
  <text x="16" y="22" text-anchor="middle" font-size="18" font-weight="bold" fill="white" font-family="system-ui">S</text>
</svg>
```

- [ ] **Step 6: Update .gitignore**

Replace `.gitignore`:

```
node_modules/
dist/
.astro/
.superpowers/
.DS_Store
```

- [ ] **Step 7: Update tsconfig.json**

Replace `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 8: Verify build**

```bash
npx astro build
```

Expected: Build succeeds with 0 errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro project with React + Tailwind"
```

---

### Task 2: Course Data and Storage Utilities

**Files:**
- Create: `src/data/course.ts`
- Create: `src/lib/storage.ts`

- [ ] **Step 1: Create course data**

Create `src/data/course.ts`:

```typescript
export interface Lesson {
  id: string;
  title: string;
  hasVideo: boolean;
  hasPdf: boolean;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  color: string;
  lessons: Lesson[];
}

export interface Problem {
  id: string;
  title: string;
  videoFile: string;
}

export interface CourseData {
  modules: Module[];
  problems: Problem[];
}

const VIDEOS_BASE = 'https://sysdesign-course-videos.ams3.digitaloceanspaces.com';
const PDF_VIEWER = 'https://mycourse.sysdesign.online/pdfviewer.php';
const PDF_BASE = 'https://gammapdf.ams3.digitaloceanspaces.com';

export function getVideoUrl(lessonId: string): string {
  return `${VIDEOS_BASE}/${lessonId}.mp4`;
}

export function getIntroVideoUrl(): string {
  return `${VIDEOS_BASE}/intro.mp4`;
}

export function getProblemVideoUrl(videoFile: string): string {
  return `${VIDEOS_BASE}/problems/${videoFile}`;
}

export function getPdfUrl(lessonId: string): string {
  return `${PDF_VIEWER}?file=${PDF_BASE}/${lessonId}.pdf`;
}

export function getModuleById(id: number): Module | undefined {
  return course.modules.find((m) => m.id === id);
}

export function getLessonById(id: string): { lesson: Lesson; module: Module } | undefined {
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.id === id);
    if (lesson) return { lesson, module: mod };
  }
  return undefined;
}

export function getAdjacentLessons(lessonId: string): { prev: Lesson | null; next: Lesson | null } {
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const idx = allLessons.findIndex((l) => l.id === lessonId);
  return {
    prev: idx > 0 ? allLessons[idx - 1] : null,
    next: idx < allLessons.length - 1 ? allLessons[idx + 1] : null,
  };
}

export function getTotalLessons(): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

export const course: CourseData = {
  modules: [
    {
      id: 1,
      title: 'Основы архитектуры и системного проектирования',
      description: 'Архитектурные виды, декомпозиция, трейдоффы, эволюция, сбор требований, quality attributes, паттерны коммуникации',
      color: '#7c83ff',
      lessons: [
        { id: '1-1', title: 'Введение в системный дизайн', hasVideo: true, hasPdf: true },
        { id: '1-2', title: 'Архитектурные виды', hasVideo: true, hasPdf: true },
        { id: '1-3', title: 'Декомпозиция и модульность', hasVideo: true, hasPdf: true },
        { id: '1-4', title: 'Архитектурные трейдоффы', hasVideo: true, hasPdf: true },
        { id: '1-5', title: 'Эволюция архитектуры', hasVideo: true, hasPdf: true },
        { id: '1-6', title: 'Сбор требований', hasVideo: true, hasPdf: true },
        { id: '1-7', title: 'Quality attributes', hasVideo: true, hasPdf: true },
        { id: '1-8', title: 'Паттерны коммуникации', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 2,
      title: 'Современные архитектурные стили и шаблоны',
      description: 'DDD, модульный монолит, микросервисы, event-driven архитектура, CQRS, саги, реактивное программирование, serverless, multi-tenancy',
      color: '#a855f7',
      lessons: [
        { id: '2-1', title: 'Domain-Driven Design: основы', hasVideo: true, hasPdf: true },
        { id: '2-4', title: 'Модульный монолит', hasVideo: true, hasPdf: true },
        { id: '2-5', title: 'Микросервисы', hasVideo: true, hasPdf: true },
        { id: '2-6', title: 'Event-Driven архитектура', hasVideo: true, hasPdf: true },
        { id: '2-7', title: 'CQRS', hasVideo: true, hasPdf: true },
        { id: '2-8', title: 'Саги', hasVideo: true, hasPdf: true },
        { id: '2-9', title: 'Реактивное программирование', hasVideo: true, hasPdf: true },
        { id: '2-10', title: 'Serverless и multi-tenancy', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 3,
      title: 'Сети и коммуникации',
      description: 'Протоколы, модель OSI, сетевые компоненты, service mesh, AWS networking',
      color: '#22d3ee',
      lessons: [
        { id: '3-1', title: 'Сетевые протоколы и модель OSI', hasVideo: true, hasPdf: true },
        { id: '3-2', title: 'Сетевые компоненты и service mesh', hasVideo: true, hasPdf: true },
        { id: '3-3', title: 'AWS networking', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 4,
      title: 'Основы распределённых систем',
      description: 'Шардирование, репликация, CAP теорема, консенсус, оркестрация Kubernetes, иерархия ресурсов AWS',
      color: '#f59e0b',
      lessons: [
        { id: '4-1', title: 'Введение в распределённые системы', hasVideo: true, hasPdf: true },
        { id: '4-2', title: 'Шардирование', hasVideo: true, hasPdf: true },
        { id: '4-3', title: 'Репликация', hasVideo: true, hasPdf: true },
        { id: '4-4', title: 'CAP теорема', hasVideo: true, hasPdf: true },
        { id: '4-5', title: 'Консенсус', hasVideo: true, hasPdf: true },
        { id: '4-6', title: 'Kubernetes: основы', hasVideo: true, hasPdf: true },
        { id: '4-7', title: 'Kubernetes: продвинутые темы', hasVideo: true, hasPdf: true },
        { id: '4-8', title: 'AWS: иерархия ресурсов', hasVideo: false, hasPdf: true },
        { id: '4-9', title: 'AWS: базы данных', hasVideo: false, hasPdf: true },
        { id: '4-10', title: 'AWS: сетевые концепции', hasVideo: false, hasPdf: true },
      ],
    },
    {
      id: 5,
      title: 'Хранение и обработка данных',
      description: 'Масштабируемость, моделирование данных, ACID vs BASE, уровни изоляции, распределённый поиск, очереди сообщений, exactly-once семантика, Kafka',
      color: '#10b981',
      lessons: [
        { id: '5-1', title: 'Масштабируемость данных', hasVideo: true, hasPdf: true },
        { id: '5-2', title: 'Моделирование данных', hasVideo: true, hasPdf: true },
        { id: '5-3', title: 'ACID vs BASE', hasVideo: true, hasPdf: true },
        { id: '5-4', title: 'Уровни изоляции транзакций', hasVideo: true, hasPdf: true },
        { id: '5-5', title: 'Распределённый поиск', hasVideo: true, hasPdf: true },
        { id: '5-6', title: 'Очереди сообщений', hasVideo: true, hasPdf: true },
        { id: '5-7', title: 'Exactly-once семантика', hasVideo: true, hasPdf: true },
        { id: '5-8', title: 'Kafka и обработка данных', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 6,
      title: 'Отказоустойчивость и observability',
      description: 'Избыточность, rate limiting, circuit breakers, bulkheads, outbox pattern, оптимизация затрат, observability и SRE практики',
      color: '#f43f5e',
      lessons: [
        { id: '6-1', title: 'Избыточность и отказоустойчивость', hasVideo: true, hasPdf: true },
        { id: '6-2', title: 'Rate limiting', hasVideo: true, hasPdf: true },
        { id: '6-3', title: 'Circuit breakers', hasVideo: true, hasPdf: true },
        { id: '6-4', title: 'Bulkheads и outbox pattern', hasVideo: true, hasPdf: true },
        { id: '6-5', title: 'Оптимизация затрат', hasVideo: true, hasPdf: true },
        { id: '6-6', title: 'Observability', hasVideo: true, hasPdf: true },
        { id: '6-7', title: 'SRE практики', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 7,
      title: 'Безопасность и защита данных',
      description: 'Аутентификация, авторизация, защита облачных приложений, защита данных, стандарты комплаенса',
      color: '#f97316',
      lessons: [
        { id: '7-1', title: 'Аутентификация и авторизация', hasVideo: true, hasPdf: true },
        { id: '7-3', title: 'Защита данных и комплаенс', hasVideo: true, hasPdf: true },
      ],
    },
  ],
  problems: [
    { id: 'airbnb', title: 'Проектирование Airbnb', videoFile: 'airbnb.mp4' },
    { id: 'messenger', title: 'Проектирование мессенджера', videoFile: 'messenger.mp4' },
    { id: 'notifications', title: 'Notification Service', videoFile: 'notification_service.mp4' },
    { id: 'url-shortener', title: 'URL Shortener', videoFile: 'url_shortener.mp4' },
    { id: 'approach', title: 'Подход к System Design', videoFile: 'approach.mp4' },
  ],
};
```

- [ ] **Step 2: Create localStorage utilities**

Create `src/lib/storage.ts`:

```typescript
const KEYS = {
  progress: 'sysdesign:progress',
  bookmarks: 'sysdesign:bookmarks',
  notes: 'sysdesign:notes',
} as const;

function getJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Progress ---

export function getProgress(): Record<string, boolean> {
  return getJson(KEYS.progress, {});
}

export function isCompleted(lessonId: string): boolean {
  return getProgress()[lessonId] === true;
}

export function toggleCompleted(lessonId: string): boolean {
  const progress = getProgress();
  const newState = !progress[lessonId];
  if (newState) {
    progress[lessonId] = true;
  } else {
    delete progress[lessonId];
  }
  setJson(KEYS.progress, progress);
  return newState;
}

export function getModuleProgress(lessonIds: string[]): number {
  const progress = getProgress();
  const completed = lessonIds.filter((id) => progress[id]).length;
  return lessonIds.length > 0 ? completed / lessonIds.length : 0;
}

// --- Bookmarks ---

export function getBookmarks(): string[] {
  return getJson(KEYS.bookmarks, []);
}

export function isBookmarked(lessonId: string): boolean {
  return getBookmarks().includes(lessonId);
}

export function toggleBookmark(lessonId: string): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(lessonId);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
    setJson(KEYS.bookmarks, bookmarks);
    return false;
  } else {
    bookmarks.push(lessonId);
    setJson(KEYS.bookmarks, bookmarks);
    return true;
  }
}

// --- Notes ---

export function getNotes(): Record<string, string> {
  return getJson(KEYS.notes, {});
}

export function getNote(lessonId: string): string {
  return getNotes()[lessonId] || '';
}

export function setNote(lessonId: string, text: string): void {
  const notes = getNotes();
  if (text.trim()) {
    notes[lessonId] = text;
  } else {
    delete notes[lessonId];
  }
  setJson(KEYS.notes, notes);
}
```

- [ ] **Step 3: Verify types compile**

```bash
npx astro check
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/data/course.ts src/lib/storage.ts
git commit -m "feat: add course data and localStorage utilities"
```

---

### Task 3: Base Layout, Navbar, and Footer

**Files:**
- Create: `src/layouts/Layout.astro`
- Create: `src/components/Navbar.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create base layout**

Create `src/layouts/Layout.astro`:

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Бесплатный курс по проектированию высоконагруженных систем' } = Astro.props;
---

<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title} | SysDesign.online</title>
    <meta property="og:title" content={`${title} | SysDesign.online`} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
  </head>
  <body class="min-h-screen bg-bg-primary text-text-secondary">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Create Navbar**

Create `src/components/Navbar.astro`:

```astro
---
const currentPath = Astro.url.pathname;
---

<nav class="sticky top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-md">
  <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
    <a href="/" class="flex items-center gap-2">
      <div class="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-accent-indigo to-accent-indigo-dark text-sm font-bold text-white">
        S
      </div>
      <span class="text-lg font-bold text-text-primary">SysDesign</span>
      <span class="text-lg text-accent-indigo">.online</span>
    </a>

    <div class="flex items-center gap-6">
      <a href="/#program" class="hidden text-sm text-text-muted transition-colors hover:text-text-primary sm:block">
        Программа
      </a>
      <a href="/#authors" class="hidden text-sm text-text-muted transition-colors hover:text-text-primary sm:block">
        Авторы
      </a>
      <a href="/bookmarks" class="hidden text-sm text-text-muted transition-colors hover:text-text-primary sm:block">
        Закладки
      </a>
      <a
        href="https://github.com/arazkevich/sysdesign-course"
        target="_blank"
        rel="noopener"
        class="hidden text-sm text-text-muted transition-colors hover:text-text-primary sm:block"
      >
        GitHub
      </a>

      <form action="/search" method="get" class="relative">
        <input
          type="text"
          name="q"
          placeholder="Поиск..."
          class="w-36 rounded-md border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:w-48 focus:border-accent-indigo sm:w-48 sm:focus:w-64"
        />
      </form>
    </div>
  </div>
</nav>
```

- [ ] **Step 3: Create Footer**

Create `src/components/Footer.astro`:

```astro
<footer class="border-t border-border py-8">
  <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
    <p class="text-sm text-text-muted">
      © 2025 SysDesign.online · Open Source
    </p>
    <div class="flex gap-6">
      <a
        href="https://github.com/arazkevich/sysdesign-course"
        target="_blank"
        rel="noopener"
        class="text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        GitHub
      </a>
      <a
        href="https://sysdesign.online"
        target="_blank"
        rel="noopener"
        class="text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        sysdesign.online
      </a>
    </div>
  </div>
</footer>
```

- [ ] **Step 4: Create minimal index page to verify layout**

Create `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';
---

<Layout title="System Design Course">
  <Navbar />
  <main class="mx-auto max-w-6xl px-4 py-16">
    <h1 class="text-4xl font-bold text-text-primary">Placeholder</h1>
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 5: Build and dev-test**

```bash
npx astro build
```

Expected: Build succeeds. Then run `npx astro dev` and verify localhost shows the navbar, placeholder text, and footer on a dark background.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/ src/components/Navbar.astro src/components/Footer.astro src/pages/index.astro
git commit -m "feat: add base layout, navbar, and footer"
```

---

### Task 4: Landing Page

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/StatsBar.astro`
- Create: `src/components/ModuleCardsGrid.tsx`
- Create: `src/components/ProblemCard.astro`
- Create: `src/components/Authors.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create Hero component**

Create `src/components/Hero.astro`:

```astro
---
import { getTotalLessons, course } from '../data/course';

const totalLessons = getTotalLessons();
const totalModules = course.modules.length;
---

<section class="bg-gradient-to-b from-bg-primary to-bg-secondary px-4 py-16 text-center sm:py-24">
  <p class="mb-4 text-xs uppercase tracking-[3px] text-accent-indigo">
    Бесплатный курс · Open Source
  </p>
  <h1 class="mb-4 text-4xl font-extrabold text-text-primary sm:text-5xl lg:text-6xl">
    System Design
  </h1>
  <p class="mx-auto mb-8 max-w-xl text-base text-text-secondary sm:text-lg">
    Проектирование высоконагруженных систем — от основ архитектуры до распределённых систем и безопасности
  </p>
  <div class="mb-8 flex flex-wrap justify-center gap-3">
    <span class="rounded-md bg-accent-indigo/15 px-3 py-1.5 text-sm text-accent-indigo">
      {totalLessons} уроков
    </span>
    <span class="rounded-md bg-accent-purple/15 px-3 py-1.5 text-sm text-accent-purple">
      {totalModules} модулей
    </span>
    <span class="rounded-md bg-accent-emerald/15 px-3 py-1.5 text-sm text-accent-emerald">
      Видео + PDF
    </span>
  </div>
  <div class="flex justify-center gap-4">
    <a
      href="#program"
      class="rounded-lg bg-gradient-to-r from-accent-indigo to-accent-indigo-dark px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      Начать обучение →
    </a>
    <a
      href="https://github.com/arazkevich/sysdesign-course"
      target="_blank"
      rel="noopener"
      class="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm text-text-secondary transition-colors hover:bg-white/10"
    >
      GitHub ⭐
    </a>
  </div>
</section>
```

- [ ] **Step 2: Create StatsBar component**

Create `src/components/StatsBar.astro`:

```astro
---
const stats = [
  { value: '48', label: 'уроков', color: 'text-accent-indigo' },
  { value: '7', label: 'модулей', color: 'text-accent-purple' },
  { value: '20+', label: 'часов', color: 'text-accent-cyan' },
  { value: '5', label: 'кейсов', color: 'text-accent-emerald' },
];
---

<section class="flex justify-center gap-12 border-y border-border bg-accent-indigo/5 px-4 py-5 sm:gap-16">
  {stats.map((stat) => (
    <div class="text-center">
      <div class={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
      <div class="text-xs text-text-muted">{stat.label}</div>
    </div>
  ))}
</section>
```

- [ ] **Step 3: Create ModuleCardsGrid React component**

Create `src/components/ModuleCardsGrid.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { course, type Module } from '../data/course';
import { getModuleProgress } from '../lib/storage';

function ModuleCard({ module }: { module: Module }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const lessonIds = module.lessons.map((l) => l.id);
    setProgress(getModuleProgress(lessonIds));
  }, [module.lessons]);

  const completedCount = Math.round(progress * module.lessons.length);

  return (
    <a
      href={`/module/${module.id}`}
      class="group block rounded-xl border bg-bg-secondary/50 p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"
      style={{ borderColor: `${module.color}30` }}
    >
      <div class="mb-1 text-xs font-medium uppercase tracking-wider" style={{ color: module.color }}>
        Модуль {module.id}
      </div>
      <h3 class="mb-2 text-base font-bold text-text-primary transition-colors group-hover:text-white">
        {module.title}
      </h3>
      <p class="mb-4 text-xs leading-relaxed text-text-muted line-clamp-2">{module.description}</p>
      <div class="flex items-center justify-between text-xs text-text-muted">
        <span>{module.lessons.length} уроков</span>
        <span>{completedCount}/{module.lessons.length}</span>
      </div>
      <div class="mt-2 h-1 overflow-hidden rounded-full" style={{ backgroundColor: `${module.color}20` }}>
        <div
          class="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%`, backgroundColor: module.color }}
        />
      </div>
    </a>
  );
}

export default function ModuleCardsGrid() {
  return (
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {course.modules.map((module) => (
        <ModuleCard key={module.id} module={module} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create ProblemCard component**

Create `src/components/ProblemCard.astro`:

```astro
---
import { getProblemVideoUrl, type Problem } from '../data/course';

interface Props {
  problem: Problem;
}

const { problem } = Astro.props;
const videoUrl = getProblemVideoUrl(problem.videoFile);
---

<a
  href={videoUrl}
  target="_blank"
  rel="noopener"
  class="group flex items-center gap-4 rounded-lg border border-border bg-bg-secondary/30 p-4 transition-all hover:-translate-y-0.5 hover:border-accent-indigo/30 hover:bg-bg-secondary/60"
>
  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-indigo/10 text-lg text-accent-indigo transition-colors group-hover:bg-accent-indigo/20">
    ▶
  </div>
  <div>
    <h4 class="text-sm font-semibold text-text-primary">{problem.title}</h4>
    <p class="text-xs text-text-muted">Разбор кейса · Видео</p>
  </div>
</a>
```

- [ ] **Step 5: Create Authors component**

Create `src/components/Authors.astro`:

```astro
---
const authors = [
  {
    name: 'Alex Razkevich',
    initials: 'AR',
    gradient: 'from-accent-indigo to-accent-purple',
    linkedin: 'https://www.linkedin.com/in/alex-razkevich-2b27531b/',
  },
  {
    name: 'Artem Gromovsky',
    initials: 'AG',
    gradient: 'from-accent-cyan to-accent-emerald',
    linkedin: 'https://www.linkedin.com/in/artem-gromovsky-11773b78/',
  },
];
---

<section id="authors" class="bg-white/[0.02] px-4 py-16">
  <div class="mx-auto max-w-6xl text-center">
    <h2 class="mb-10 text-2xl font-bold text-text-primary">Авторы</h2>
    <div class="flex flex-wrap justify-center gap-12">
      {authors.map((author) => (
        <div class="text-center">
          <div
            class={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${author.gradient} text-2xl font-bold text-white`}
          >
            {author.initials}
          </div>
          <h3 class="mb-1 text-lg font-semibold text-text-primary">{author.name}</h3>
          <a
            href={author.linkedin}
            target="_blank"
            rel="noopener"
            class="text-sm text-accent-indigo transition-colors hover:text-accent-purple"
          >
            LinkedIn →
          </a>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 6: Assemble landing page**

Replace `src/pages/index.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.astro';
import Hero from '../components/Hero.astro';
import StatsBar from '../components/StatsBar.astro';
import ModuleCardsGrid from '../components/ModuleCardsGrid';
import ProblemCard from '../components/ProblemCard.astro';
import Authors from '../components/Authors.astro';
import Footer from '../components/Footer.astro';
import { course } from '../data/course';
---

<Layout title="System Design Course">
  <Navbar />
  <Hero />
  <StatsBar />

  <section id="program" class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <h2 class="mb-2 text-2xl font-bold text-text-primary">Программа курса</h2>
      <p class="text-sm text-text-muted">7 модулей от основ до продвинутых тем</p>
    </div>
    <ModuleCardsGrid client:load />
  </section>

  <section class="mx-auto max-w-6xl px-4 py-16">
    <div class="mb-10 text-center">
      <h2 class="mb-2 text-2xl font-bold text-text-primary">Разбор кейсов</h2>
      <p class="text-sm text-text-muted">Проектирование реальных систем с нуля</p>
    </div>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {course.problems.map((problem) => (
        <ProblemCard problem={problem} />
      ))}
    </div>
  </section>

  <Authors />
  <Footer />
</Layout>
```

- [ ] **Step 7: Build and dev-test**

```bash
npx astro build
```

Expected: Build succeeds. Run `npx astro dev` and verify the full landing page renders: hero, stats, 7 module cards with progress bars, 5 problem cards, authors section, footer.

- [ ] **Step 8: Commit**

```bash
git add src/components/Hero.astro src/components/StatsBar.astro src/components/ModuleCardsGrid.tsx src/components/ProblemCard.astro src/components/Authors.astro src/pages/index.astro
git commit -m "feat: build complete landing page with modules and authors"
```

---

### Task 5: Module Page

**Files:**
- Create: `src/components/LessonList.tsx`
- Create: `src/pages/module/[id].astro`

- [ ] **Step 1: Create LessonList React component**

Create `src/components/LessonList.tsx`:

```tsx
import { useState, useEffect } from 'react';
import type { Lesson } from '../data/course';
import { isCompleted, getModuleProgress } from '../lib/storage';

interface Props {
  lessons: Lesson[];
  moduleColor: string;
}

export default function LessonList({ lessons, moduleColor }: Props) {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const l of lessons) {
      map[l.id] = isCompleted(l.id);
    }
    setCompletedMap(map);
    setProgress(getModuleProgress(lessons.map((l) => l.id)));
  }, [lessons]);

  const completedCount = lessons.filter((l) => completedMap[l.id]).length;

  return (
    <div>
      <div class="mb-6 flex items-center justify-between text-sm text-text-muted">
        <span>
          {completedCount} из {lessons.length} пройдено
        </span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
      <div class="mb-8 h-2 overflow-hidden rounded-full" style={{ backgroundColor: `${moduleColor}20` }}>
        <div
          class="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%`, backgroundColor: moduleColor }}
        />
      </div>

      <div class="space-y-2">
        {lessons.map((lesson, idx) => (
          <a
            key={lesson.id}
            href={`/lesson/${lesson.id}`}
            class="group flex items-center gap-4 rounded-lg border border-border bg-bg-secondary/30 p-4 transition-all hover:border-opacity-50 hover:bg-bg-secondary/60"
            style={{ borderColor: completedMap[lesson.id] ? `${moduleColor}40` : undefined }}
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{
                backgroundColor: completedMap[lesson.id] ? `${moduleColor}20` : 'rgba(255,255,255,0.05)',
                color: completedMap[lesson.id] ? moduleColor : '#888',
              }}
            >
              {completedMap[lesson.id] ? '✓' : idx + 1}
            </div>
            <div class="flex-1">
              <div class="text-sm font-medium text-text-primary">{lesson.title}</div>
              <div class="mt-0.5 flex gap-3 text-xs text-text-muted">
                {lesson.hasVideo && <span>▶ Видео</span>}
                {lesson.hasPdf && <span>📄 PDF</span>}
              </div>
            </div>
            <div class="text-xs text-text-muted opacity-0 transition-opacity group-hover:opacity-100">
              Открыть →
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create module page**

Create `src/pages/module/[id].astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Navbar from '../../components/Navbar.astro';
import Footer from '../../components/Footer.astro';
import LessonList from '../../components/LessonList';
import { course, getModuleById } from '../../data/course';

export function getStaticPaths() {
  return course.modules.map((m) => ({ params: { id: String(m.id) } }));
}

const { id } = Astro.params;
const module = getModuleById(Number(id))!;
---

<Layout title={`Модуль ${module.id}: ${module.title}`} description={module.description}>
  <Navbar />
  <main class="mx-auto max-w-3xl px-4 py-10">
    <div class="mb-2">
      <a href="/" class="text-sm text-text-muted transition-colors hover:text-accent-indigo">← Все модули</a>
    </div>
    <div class="mb-1 text-xs font-medium uppercase tracking-wider" style={`color: ${module.color}`}>
      Модуль {module.id}
    </div>
    <h1 class="mb-3 text-3xl font-bold text-text-primary">{module.title}</h1>
    <p class="mb-8 text-text-secondary">{module.description}</p>

    <LessonList client:load lessons={module.lessons} moduleColor={module.color} />
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 3: Build and dev-test**

```bash
npx astro build
```

Expected: Build succeeds, generating `/module/1` through `/module/7`. Run `npx astro dev`, navigate to `/module/1`, verify lesson list renders with proper styling.

- [ ] **Step 4: Commit**

```bash
git add src/components/LessonList.tsx src/pages/module/
git commit -m "feat: add module page with lesson list and progress tracking"
```

---

### Task 6: Lesson Page

**Files:**
- Create: `src/components/LessonContent.tsx`
- Create: `src/pages/lesson/[id].astro`

- [ ] **Step 1: Create LessonContent React component**

Create `src/components/LessonContent.tsx`:

```tsx
import { useState, useEffect, useCallback } from 'react';
import type { Lesson, Module } from '../data/course';
import { getVideoUrl, getPdfUrl, getAdjacentLessons } from '../data/course';
import { isCompleted, toggleCompleted, isBookmarked, toggleBookmark, getNote, setNote } from '../lib/storage';

interface Props {
  lesson: Lesson;
  module: Module;
}

type Tab = 'video' | 'pdf' | 'notes';

export default function LessonContent({ lesson, module }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(lesson.hasVideo ? 'video' : 'pdf');
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [noteText, setNoteText] = useState('');
  const { prev, next } = getAdjacentLessons(lesson.id);

  useEffect(() => {
    setCompleted(isCompleted(lesson.id));
    setBookmarked(isBookmarked(lesson.id));
    setNoteText(getNote(lesson.id));
  }, [lesson.id]);

  const handleToggleComplete = useCallback(() => {
    const newState = toggleCompleted(lesson.id);
    setCompleted(newState);
  }, [lesson.id]);

  const handleToggleBookmark = useCallback(() => {
    const newState = toggleBookmark(lesson.id);
    setBookmarked(newState);
  }, [lesson.id]);

  const handleNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setNoteText(text);
      setNote(lesson.id, text);
    },
    [lesson.id],
  );

  const tabs: { key: Tab; label: string; icon: string; show: boolean }[] = [
    { key: 'video', label: 'Видео', icon: '▶', show: lesson.hasVideo },
    { key: 'pdf', label: 'PDF', icon: '📄', show: lesson.hasPdf },
    { key: 'notes', label: 'Заметки', icon: '📝', show: true },
  ];

  return (
    <div>
      {/* Tabs */}
      <div class="mb-0 flex gap-0">
        {tabs
          .filter((t) => t.show)
          .map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              class={`px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'rounded-t-lg border border-b-0 border-border bg-bg-secondary text-accent-indigo'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
      </div>

      {/* Tab content */}
      <div class="rounded-b-lg rounded-tr-lg border border-border bg-bg-secondary">
        {activeTab === 'video' && lesson.hasVideo && (
          <div class="aspect-video w-full">
            <video
              controls
              preload="metadata"
              class="h-full w-full rounded-b-lg rounded-tr-lg"
              src={getVideoUrl(lesson.id)}
            >
              Ваш браузер не поддерживает видео.
            </video>
          </div>
        )}

        {activeTab === 'pdf' && lesson.hasPdf && (
          <div class="aspect-[4/3] w-full">
            <iframe
              src={getPdfUrl(lesson.id)}
              class="h-full w-full rounded-b-lg rounded-tr-lg"
              title={`PDF: ${lesson.title}`}
            />
          </div>
        )}

        {activeTab === 'notes' && (
          <div class="p-4">
            <textarea
              value={noteText}
              onChange={handleNoteChange}
              placeholder="Ваши заметки к этому уроку... (сохраняются в браузере)"
              class="min-h-[200px] w-full resize-y rounded-lg border border-border bg-bg-primary p-4 text-sm text-text-primary placeholder-text-muted outline-none focus:border-accent-indigo"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div class="flex gap-3">
          <button
            onClick={handleToggleComplete}
            class={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              completed
                ? 'bg-accent-emerald/20 text-accent-emerald'
                : 'bg-gradient-to-r from-accent-indigo to-accent-indigo-dark text-white hover:opacity-90'
            }`}
          >
            {completed ? '✓ Пройден' : '✓ Отметить пройденным'}
          </button>
          <button
            onClick={handleToggleBookmark}
            class={`rounded-lg border px-4 py-2.5 text-sm transition-all ${
              bookmarked
                ? 'border-accent-amber/30 bg-accent-amber/10 text-accent-amber'
                : 'border-border text-text-muted hover:border-accent-amber/30 hover:text-accent-amber'
            }`}
          >
            {bookmarked ? '★ В закладках' : '☆ Закладка'}
          </button>
        </div>

        {/* Prev/Next */}
        <div class="flex gap-3 text-sm">
          {prev && (
            <a
              href={`/lesson/${prev.id}`}
              class="text-text-muted transition-colors hover:text-text-primary"
            >
              ← {prev.title}
            </a>
          )}
          {next && (
            <a
              href={`/lesson/${next.id}`}
              class="text-text-muted transition-colors hover:text-text-primary"
            >
              {next.title} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create lesson page**

Create `src/pages/lesson/[id].astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Navbar from '../../components/Navbar.astro';
import Footer from '../../components/Footer.astro';
import LessonContent from '../../components/LessonContent';
import { course, getLessonById } from '../../data/course';

export function getStaticPaths() {
  return course.modules.flatMap((m) =>
    m.lessons.map((l) => ({ params: { id: l.id } }))
  );
}

const { id } = Astro.params;
const result = getLessonById(id!)!;
const { lesson, module } = result;

const lessonIndex = module.lessons.findIndex((l) => l.id === lesson.id);
---

<Layout title={lesson.title} description={`${module.title} · Урок ${lessonIndex + 1}`}>
  <Navbar />
  <main class="mx-auto max-w-4xl px-4 py-10">
    <nav class="mb-6 flex items-center gap-2 text-sm text-text-muted">
      <a href="/" class="transition-colors hover:text-accent-indigo">Главная</a>
      <span class="text-border">›</span>
      <a href={`/module/${module.id}`} class="transition-colors hover:text-accent-indigo">
        Модуль {module.id}
      </a>
      <span class="text-border">›</span>
      <span class="text-text-primary">Урок {lesson.id}</span>
    </nav>

    <div class="mb-1 text-xs font-medium uppercase tracking-wider" style={`color: ${module.color}`}>
      Модуль {module.id} · Урок {lessonIndex + 1} из {module.lessons.length}
    </div>
    <h1 class="mb-8 text-2xl font-bold text-text-primary sm:text-3xl">{lesson.title}</h1>

    <LessonContent client:load lesson={lesson} module={module} />
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 3: Build and dev-test**

```bash
npx astro build
```

Expected: Build succeeds, generating lesson pages for all 48 lessons. Run `npx astro dev`, navigate to `/lesson/1-1`, verify:
- Video tab plays from DO Spaces
- PDF tab loads in iframe
- Notes tab saves text
- Mark complete button works
- Bookmark button works
- Prev/Next navigation works

- [ ] **Step 4: Commit**

```bash
git add src/components/LessonContent.tsx src/pages/lesson/
git commit -m "feat: add lesson page with video, PDF, notes, and progress"
```

---

### Task 7: Search

**Files:**
- Create: `src/components/SearchWidget.tsx`
- Create: `src/pages/search.astro`
- Modify: `src/components/Navbar.astro` (replace plain input with SearchWidget)

- [ ] **Step 1: Create SearchWidget React component**

Create `src/components/SearchWidget.tsx`:

```tsx
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { course } from '../data/course';

interface SearchItem {
  type: 'module' | 'lesson';
  title: string;
  subtitle: string;
  href: string;
  color?: string;
}

const searchItems: SearchItem[] = [
  ...course.modules.map((m) => ({
    type: 'module' as const,
    title: `Модуль ${m.id}: ${m.title}`,
    subtitle: m.description,
    href: `/module/${m.id}`,
    color: m.color,
  })),
  ...course.modules.flatMap((m) =>
    m.lessons.map((l) => ({
      type: 'lesson' as const,
      title: l.title,
      subtitle: `Модуль ${m.id}: ${m.title}`,
      href: `/lesson/${l.id}`,
      color: m.color,
    })),
  ),
];

const fuse = new Fuse(searchItems, {
  keys: ['title', 'subtitle'],
  threshold: 0.4,
  includeScore: true,
});

export default function SearchWidget() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    return fuse.search(query, { limit: 8 }).map((r) => r.item);
  }, [query]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div ref={ref} class="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Поиск..."
        class="w-36 rounded-md border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text-primary placeholder-text-muted outline-none transition-all focus:w-48 focus:border-accent-indigo sm:w-48 sm:focus:w-64"
      />

      {isOpen && results.length > 0 && (
        <div class="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-bg-secondary shadow-xl shadow-black/30">
          {results.map((item) => (
            <a
              key={item.href}
              href={item.href}
              class="flex items-start gap-3 border-b border-border/50 px-4 py-3 transition-colors last:border-0 hover:bg-bg-tertiary"
              onClick={() => setIsOpen(false)}
            >
              <div
                class="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <div class="text-sm font-medium text-text-primary">{item.title}</div>
                <div class="text-xs text-text-muted">{item.subtitle}</div>
              </div>
            </a>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div class="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-bg-secondary p-4 text-center text-sm text-text-muted shadow-xl">
          Ничего не найдено
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update Navbar to use SearchWidget**

Replace the `<form>` block in `src/components/Navbar.astro` with the React island:

```astro
---
import SearchWidget from './SearchWidget';
// ... rest of frontmatter unchanged
---
```

Replace the `<form action="/search" ...>...</form>` element with:

```astro
<SearchWidget client:load />
```

- [ ] **Step 3: Create search page for direct URL access**

Create `src/pages/search.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';
import SearchWidget from '../components/SearchWidget';
---

<Layout title="Поиск">
  <Navbar />
  <main class="mx-auto max-w-3xl px-4 py-16 text-center">
    <h1 class="mb-6 text-2xl font-bold text-text-primary">Поиск по курсу</h1>
    <div class="mx-auto max-w-md">
      <SearchWidget client:load />
    </div>
    <p class="mt-4 text-sm text-text-muted">Начните вводить название урока или модуля</p>
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 4: Build and dev-test**

```bash
npx astro build
```

Expected: Build succeeds. Run `npx astro dev`, type "kafka" in the search input — should show "Kafka и обработка данных" in dropdown. Type "DDD" — should show "Domain-Driven Design: основы".

- [ ] **Step 5: Commit**

```bash
git add src/components/SearchWidget.tsx src/components/Navbar.astro src/pages/search.astro
git commit -m "feat: add fuzzy search with Fuse.js"
```

---

### Task 8: Bookmarks Page

**Files:**
- Create: `src/components/BookmarksList.tsx`
- Create: `src/pages/bookmarks.astro`

- [ ] **Step 1: Create BookmarksList React component**

Create `src/components/BookmarksList.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { getBookmarks, toggleBookmark, isCompleted } from '../lib/storage';
import { getLessonById } from '../data/course';

export default function BookmarksList() {
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkIds(getBookmarks());
  }, []);

  const handleRemove = (lessonId: string) => {
    toggleBookmark(lessonId);
    setBookmarkIds((prev) => prev.filter((id) => id !== lessonId));
  };

  if (bookmarkIds.length === 0) {
    return (
      <div class="py-16 text-center">
        <div class="mb-4 text-4xl">☆</div>
        <h2 class="mb-2 text-lg font-semibold text-text-primary">Нет закладок</h2>
        <p class="text-sm text-text-muted">
          Добавляйте уроки в закладки, чтобы быстро к ним возвращаться
        </p>
        <a
          href="/"
          class="mt-4 inline-block text-sm text-accent-indigo transition-colors hover:text-accent-purple"
        >
          ← К программе курса
        </a>
      </div>
    );
  }

  return (
    <div class="space-y-2">
      {bookmarkIds.map((id) => {
        const result = getLessonById(id);
        if (!result) return null;
        const { lesson, module } = result;
        const completed = isCompleted(id);

        return (
          <div
            key={id}
            class="flex items-center gap-4 rounded-lg border border-border bg-bg-secondary/30 p-4"
          >
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{
                backgroundColor: completed ? `${module.color}20` : 'rgba(255,255,255,0.05)',
                color: completed ? module.color : '#888',
              }}
            >
              {completed ? '✓' : '○'}
            </div>
            <a href={`/lesson/${lesson.id}`} class="flex-1">
              <div class="text-sm font-medium text-text-primary transition-colors hover:text-accent-indigo">
                {lesson.title}
              </div>
              <div class="text-xs text-text-muted">
                Модуль {module.id}: {module.title}
              </div>
            </a>
            <button
              onClick={() => handleRemove(id)}
              class="text-xs text-text-muted transition-colors hover:text-accent-rose"
              title="Удалить закладку"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create bookmarks page**

Create `src/pages/bookmarks.astro`:

```astro
---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.astro';
import Footer from '../components/Footer.astro';
import BookmarksList from '../components/BookmarksList';
---

<Layout title="Закладки">
  <Navbar />
  <main class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="mb-8 text-2xl font-bold text-text-primary">Закладки</h1>
    <BookmarksList client:load />
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 3: Build and dev-test**

```bash
npx astro build
```

Expected: Build succeeds. Run `npx astro dev`, navigate to `/bookmarks` — should show empty state. Bookmark a lesson from a lesson page, then navigate to `/bookmarks` — should show the bookmarked lesson.

- [ ] **Step 4: Commit**

```bash
git add src/components/BookmarksList.tsx src/pages/bookmarks.astro
git commit -m "feat: add bookmarks page"
```

---

### Task 9: Build Verification and Polish

**Files:**
- Create: `.do/app.yaml`
- Modify: `package.json` (verify build script)

- [ ] **Step 1: Verify full build**

```bash
npx astro build
```

Expected: Build succeeds with all pages generated:
- `/index.html`
- `/module/1/index.html` through `/module/7/index.html`
- `/lesson/1-1/index.html` through `/lesson/7-3/index.html` (48 lesson pages)
- `/search/index.html`
- `/bookmarks/index.html`

Verify with:

```bash
find dist -name "*.html" | wc -l
```

Expected: ~57 HTML files (1 index + 7 modules + 48 lessons + 1 search + 1 bookmarks = 58, but some might be fewer if module pages share).

- [ ] **Step 2: Create DO App Platform spec**

Create `.do/app.yaml`:

```yaml
name: sysdesign-course
static_sites:
  - name: web
    build_command: npm run build
    output_dir: dist
    environment_slug: node-js
    routes:
      - path: /
    source_dir: /
```

- [ ] **Step 3: Verify package.json has build script**

Ensure `package.json` has:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

- [ ] **Step 4: Run dev server and manually verify all pages**

```bash
npx astro preview
```

Check in browser:
- Landing page: hero, stats, module cards, problem cards, authors, footer
- Module 1 page: lesson list with progress
- Lesson 1-1: video plays, PDF loads, notes save, complete/bookmark work
- Search: typing shows results in dropdown
- Bookmarks: shows bookmarked lessons

- [ ] **Step 5: Commit**

```bash
git add .do/app.yaml package.json
git commit -m "feat: add DO App Platform deployment config"
```

---

### Task 10: Deploy to DigitalOcean

**Files:** None (all infrastructure)

- [ ] **Step 1: Create GitHub repo**

```bash
cd /Users/razkevich/code/sysdesign-course
gh repo create sysdesign-course --public --source=. --push
```

- [ ] **Step 2: Create DO App Platform app**

```bash
doctl apps create --spec .do/app.yaml
```

Or via the DO console: connect to the GitHub repo `arazkevich/sysdesign-course`, select the `main` branch, and detect the `app.yaml` spec.

- [ ] **Step 3: Get the app's default URL and verify it loads**

```bash
doctl apps list
```

Note the live URL (something like `https://sysdesign-course-xxxxx.ondigitalocean.app`). Open it in a browser and verify the site works.

- [ ] **Step 4: Update DNS for course.sysdesign.online**

First, get the app's live URL domain to create a CNAME:

```bash
# Delete existing A record for 'course'
doctl compute domain records delete sysdesign.online <record-id> --force

# Add CNAME pointing to the DO App Platform app
doctl compute domain records create sysdesign.online \
  --record-type CNAME \
  --record-name course \
  --record-data <app-url>.ondigitalocean.app. \
  --record-ttl 300
```

Then configure the custom domain in the app:

```bash
doctl apps update <app-id> --spec .do/app.yaml
```

(The spec needs the `domains` field added with `course.sysdesign.online`)

- [ ] **Step 5: Verify course.sysdesign.online loads with HTTPS**

Wait for DNS propagation (up to 5 minutes), then:

```bash
curl -sI https://course.sysdesign.online | head -5
```

Expected: HTTP 200 with valid TLS.

- [ ] **Step 6: Final commit with any deployment adjustments**

```bash
git add -A
git commit -m "chore: finalize deployment configuration"
git push
```
