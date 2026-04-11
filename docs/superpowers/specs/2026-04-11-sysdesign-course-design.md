# System Design Course — course.sysdesign.online

> **Status**: Implemented and deployed. This spec updated 2026-04-11 to reflect the final state.

Open-source, free system design course website. Portfolio piece + real educational resource.

**Authors:** Alex Razkevich, Artem Gromovsky
**Language:** Russian only
**Domain:** course.sysdesign.online

---

## Architecture

Astro 6 static site with React 19 islands. All course data hardcoded in TypeScript. Interactive features (progress, bookmarks, notes, search, quizzes, sidebar) run client-side with localStorage and Fuse.js. PDF viewer via pdf.js (react-pdf-viewer).

Content hosted on DigitalOcean Spaces:
- Videos: `sysdesign-course-videos.ams3.digitaloceanspaces.com/{lessonId}.mp4`
- PDFs: `gammapdf.ams3.digitaloceanspaces.com/{lessonId}.pdf` (CORS enabled)
- Problem videos: `sysdesign-course-videos.ams3.digitaloceanspaces.com/problems/{name}.mp4`

Quizzes: 124 questions extracted from Moodle database on the same droplet, stored as `src/data/quizzes.json`.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Astro 6 (static output) |
| UI Components | React 19 islands (client:load) |
| Styling | Tailwind CSS 4 (@tailwindcss/vite) |
| PDF Viewer | @react-pdf-viewer/core v3 + pdfjs-dist v3 |
| Search | Fuse.js (client-side fuzzy) |
| Client State | localStorage |
| Hosting | Apache on DO droplet (146.190.19.161) |
| Domain | course.sysdesign.online (A record) |
| SSL | Let's Encrypt via certbot |
| Content | DO Spaces (existing buckets) |

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
2. **Hero** — Headline, description, "Начать обучение" → /course, GitHub link
3. **Authors** — Compact horizontal bar (avatars + LinkedIn links)
4. **Stats** — 46 уроков, 7 модулей, 7 тестов, 5 кейсов (white text, muted)
5. **Intro Video** — intro.mp4 embedded
6. **Program Accordion** — All 7 modules expandable with descriptions + lesson titles (informational only, no progress bars)
7. **CTA** — "Начать обучение" → /course
8. **Footer** — Telegram, YouTube, Email, GitHub links

### Materials Page (`/course`)

Learning dashboard. Shows interactive content.

- Module cards grid with progress bars and quiz badges
- Case studies section (links to /case/{id} pages)

### Module Page (`/module/{id}`) — uses CourseLayout with sidebar

- Back link, module header (colored number, title, description)
- Lesson list with completion checkmarks (LessonList.tsx)
- Quiz link card if module has quiz

### Lesson Page (`/lesson/{id}`) — uses CourseLayout with sidebar

- Breadcrumbs
- Lesson header (module label, lesson counter, title)
- Tabs: Видео / PDF / Заметки
  - Video: HTML5 `<video>` from DO Spaces
  - PDF: pdf.js viewer (dark theme, zoom, search, fullscreen)
  - Notes: textarea auto-saving to localStorage
- Mark complete + Bookmark buttons
- Prev/Next navigation

### Quiz Page (`/quiz/{id}`) — uses CourseLayout with sidebar

- Breadcrumbs, module header
- Interactive quiz: one question at a time, answer checking, score summary
- Best score saved to localStorage

### Case Study Page (`/case/{id}`) — uses CourseLayout with sidebar

- Breadcrumbs
- Video player + bookmark + prev/next navigation

### Other Pages

- `/search` — Search page with Fuse.js
- `/bookmarks` — Bookmarks from localStorage

## Course Sidebar

LMS-style collapsible navigation panel on all learning pages (lesson, module, quiz, case).

**Desktop:** 280px sidebar, collapsible to 48px strip with module number circles. Persisted in localStorage.

**Mobile:** Hidden by default, floating button opens as overlay.

**Content:** Full module tree with lesson links, completion dots, current page highlighting, quiz links, case study section.

## Course Data

7 modules, 46 lessons (not 48 — module 2 skips 2-2/2-3, module 7 skips 7-2):
- Module 1: 8 lessons (1-1 to 1-8)
- Module 2: 8 lessons (2-1, 2-4 to 2-10)
- Module 3: 3 lessons (3-1 to 3-3)
- Module 4: 10 lessons (4-1 to 4-10, 4-8/4-9/4-10 video-only=false)
- Module 5: 8 lessons (5-1 to 5-8)
- Module 6: 7 lessons (6-1 to 6-7)
- Module 7: 2 lessons (7-1, 7-3)

5 case studies: Airbnb, Messenger, Notification Service, URL Shortener, Approach

7 module-level quizzes: 124 questions total (from Moodle)

## Deployment

Static files served by Apache on DO droplet (146.190.19.161). Same server runs Moodle.

Deploy: `npm run build` then `rsync dist/` to server. Or `ssh root@146.190.19.161 /root/deploy-course.sh`.

Auto-deploy also configured via DO App Platform (sea-turtle-app) but primary serving is from the droplet for Russia accessibility.

## Cost

- Hosting: $0 incremental (reuses existing droplet)
- Content: existing DO Spaces
- Domain: already configured
