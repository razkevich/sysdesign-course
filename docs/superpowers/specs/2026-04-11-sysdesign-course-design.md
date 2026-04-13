# System Design Course — course.sysdesign.online

> **Status**: Implemented and deployed. Last updated 2026-04-13 to reflect Yandex Cloud migration and UX refinements.

Open-source, free system design course website. Portfolio piece + real educational resource.

**Authors:** Alex Razkevich, Artem Gromovsky
**Language:** Russian only
**Domain:** course.sysdesign.online

---

## Architecture

Astro 6 static site with React 19 islands (only where interactivity is required). All course data hardcoded in TypeScript. Interactive features (progress, bookmarks, notes, search, quizzes, sidebar) run client-side with localStorage and Fuse.js.

**Lesson pages use pure CSS tabs** (radio inputs + `:checked` sibling selectors) instead of React — this change was made after React hydration proved unreliable from Russia. Lesson action buttons (complete / bookmark / notes) use tiny inline vanilla JS for localStorage access.

Content hosted on Yandex Cloud Object Storage:
- Videos: `storage.yandexcloud.net/sysdesign-course-videos-yc/{lessonId}.mp4`
- PDFs: `storage.yandexcloud.net/sysdesign-course-pdfs-yc/{lessonId}.pdf`
- Problem videos: `storage.yandexcloud.net/sysdesign-course-videos-yc/problems/{name}.mp4`

Quizzes: 124 questions extracted from Moodle database (on legacy DO droplet), stored as `src/data/quizzes.json`.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Astro 6 (static output) |
| UI Components | React 19 islands (only where needed) |
| Styling | Tailwind CSS 4 (@tailwindcss/vite) |
| Lesson tabs | Pure CSS (radio inputs + `:checked` selectors) |
| Lesson actions | Inline vanilla JS (no React) |
| PDF viewer | `<iframe>` embedding direct YC Object Storage URL |
| Search | Fuse.js (client-side fuzzy) |
| Client state | localStorage |
| Hosting | nginx on Yandex Cloud VM (111.88.242.35, ru-central1-a) |
| DNS | Yandex Cloud DNS |
| Domain | reg.ru registrar, YC nameservers |
| SSL | Let's Encrypt via certbot |
| Content | Yandex Cloud Object Storage |
| Analytics | Yandex Metrica (counter 108513607, webvisor + clickmap) |

## Visual Design

- **Theme:** Dark Indigo + Purple (primary: #7c83ff / #6366f1, secondary: #a855f7)
- **Background:** Deep indigo gradient (#0f0f1a → #1a1a2e → #16213e)
- **Module accent colors:** Each module has a distinct accent (indigo, purple, cyan, amber, emerald, rose, orange)
- **Typography:** System font stack
- **Stats:** White numbers on dark, clean single row — no rainbow

## Pages

### Landing Page (`/`)

Portfolio-focused showcase. Does NOT show learning materials.

1. **Navbar** — Logo, links (Программа, Авторы, Материалы, GitHub), Search widget
2. **Hero** — Label, headline, subtitle, two persona cards (💼 interview prep / 🏗️ architect growth), CTA button → /course, GitHub link
3. **CredibilityBar** — Authors + stats merged into one compact bar (AR/AG avatars with LinkedIn, then 46 уроков / 7 модулей / 7 тестов / 5 кейсов)
4. **Intro Video** — intro.mp4 embedded
5. **Program Accordion** — All 7 modules + case studies section, each expandable with descriptions + lesson titles. "Подход к решению задач" shown first in case studies with 🔥.
6. **CTA** — "Начать обучение" → /course
7. **Footer** — Telegram, YouTube, Email, GitHub links

### Materials Page (`/course`)

Learning dashboard. Shows interactive content.

- Module cards grid with progress bars, "🧠 Тест" badge per module with quiz
- Case studies section, "Подход к решению задач" card first with 🔥 and ring highlight

### Module Page (`/module/{id}`) — uses CourseLayout with sidebar

- Back link, module header (colored number, title, description)
- Lesson list with completion checkmarks (LessonList.tsx)
- Quiz link card ("🧠 Тест по модулю") if module has quiz

### Lesson Page (`/lesson/{id}`) — uses CourseLayout with sidebar

- Breadcrumbs
- Lesson header (module label, lesson counter, title)
- **Pure CSS tabs**: Видео / PDF / Заметки
  - Video: HTML5 `<video>` from YC Object Storage
  - PDF: `<iframe>` loading direct PDF URL from YC Object Storage
  - Notes: textarea with inline vanilla JS auto-saving to localStorage
- Mark complete + Bookmark buttons (inline vanilla JS)
- Prev/Next navigation
- **No React island** on this page — pure server-rendered HTML + CSS + ~30 lines of inline JS

### Quiz Page (`/quiz/{id}`) — uses CourseLayout with sidebar

React island with full navigation:

- Breadcrumbs, module header
- Progress bar with answered count
- **Question dots** — numbered circles for every question (green = correct, red = wrong, neutral = unanswered, ring = current), clickable to jump anywhere
- One question at a time with multiple-choice answers
- Clicking an answer immediately reveals correct/incorrect (green/red) — no "Проверить" button
- **← Назад / Следующий →** navigation between questions
- "Завершить тест" button when all answered
- Best score saved to localStorage (`sysdesign:quiz:module-{N}`)
- Mid-quiz progress saved to localStorage (`sysdesign:quiz:progress-{N}`) — resume where you left off

### Case Study Page (`/case/{id}`) — uses CourseLayout with sidebar

- Breadcrumbs
- Video player + bookmark + prev/next navigation

### Other Pages

- `/search` — Search page with Fuse.js
- `/bookmarks` — Bookmarks from localStorage

## Course Sidebar

LMS-style collapsible navigation on all learning pages.

**Desktop:** 280px sidebar, collapsible to 48px strip with module number circles + "К" circle for cases. Persisted in localStorage.

**Mobile:** Hidden by default, floating button opens as overlay.

**Content:** Full module tree with lesson links, completion dots, current page highlighting, quiz links, case studies section (with 🔥 prefix on Approach).

## Course Data

7 modules, 46 lessons (not 48 — module 2 skips 2-2/2-3, module 7 skips 7-2):
- Module 1: 8 lessons (1-1 to 1-8)
- Module 2: 8 lessons (2-1, 2-4 to 2-10)
- Module 3: 3 lessons (3-1 to 3-3)
- Module 4: 10 lessons (4-1 to 4-10, 4-8/4-9/4-10 have PDF only)
- Module 5: 8 lessons (5-1 to 5-8)
- Module 6: 7 lessons (6-1 to 6-7)
- Module 7: 2 lessons (7-1, 7-3)

5 case studies: Airbnb, Messenger, Notification Service, URL Shortener, Approach (highlighted first)

7 module-level quizzes: 124 questions total (from Moodle)

## Infrastructure

### Yandex Cloud (primary)

- **VM**: 111.88.242.35 (preemptible, 2c/20%/1GB, ru-central1-a), nginx + HTTP/2 + gzip + LE SSL
- **Object Storage**: `sysdesign-course-videos-yc`, `sysdesign-course-pdfs-yc` (public read)
- **DNS**: zone `sysdesign-online` (public), NS delegated from reg.ru
- **CLI**: `~/yandex-cloud/bin/yc`, folder `b1g0bhqapbnodb35pp8r`

### DigitalOcean (legacy)

- **Droplet** (146.190.19.161): runs Moodle at mycourse.sysdesign.online (unchanged)
- **Spaces**: old video/PDF copies (can be deleted)

## Deployment

```bash
npm run build
rsync -avz --delete dist/ yc-user@111.88.242.35:/tmp/course-dist/
ssh yc-user@111.88.242.35 "sudo cp -r /tmp/course-dist/* /var/www/course.sysdesign.online/"
```

If VM is stopped (preemptible auto-stop after 24h): `yc compute instance start sysdesign-course`.

## Analytics

Yandex Metrica counter **108513607** embedded in `Layout.astro` head. Tracks:
- Page views, unique visitors, session duration, bounce rate
- Webvisor (session recordings)
- Click heatmaps
- External link clicks

Dashboard: https://metrika.yandex.ru/dashboard?id=108513607

## Cost

- YC VM: ~$3-4/mo (preemptible)
- YC Object Storage: ~$0.10/mo (under 1GB cold storage)
- YC DNS: free (public zones free up to 5)
- DO droplet (Moodle): existing ~$6/mo (unchanged, not incremental)
- Domain (reg.ru): existing (annual renewal)
- Total incremental cost: **~$4/mo**
