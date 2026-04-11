# SysDesign Course — course.sysdesign.online

Open-source system design course website. Portfolio piece + real educational resource.

## Quick Reference

- **Live site**: https://course.sysdesign.online
- **Repo**: https://github.com/razkevich/sysdesign-course
- **Authors**: Alex Razkevich, Artem Gromovsky
- **Language**: Russian
- **Hosting**: Apache on DigitalOcean droplet (146.190.19.161), static files in `/var/www/course.sysdesign.online/`
- **Domain**: course.sysdesign.online (A record in DO DNS)
- **SSL**: Let's Encrypt, auto-renews via certbot

## Tech Stack

- **Framework**: Astro 6 (static output)
- **UI Islands**: React 19 (via `@astrojs/react`) — interactive components hydrate client-side
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite`, theme tokens in `src/styles/global.css`)
- **PDF Viewer**: `@react-pdf-viewer/core` v3 + `pdfjs-dist` v3 (dark theme, with zoom/search/fullscreen)
- **Search**: Fuse.js (client-side fuzzy search)
- **State**: localStorage (progress, bookmarks, notes, quiz scores, sidebar state)

## Content Sources

- **Videos**: DO Spaces bucket `sysdesign-course-videos.ams3.digitaloceanspaces.com`
  - Lessons: `/{lessonId}.mp4` (e.g., `/1-1.mp4`)
  - Intro: `/intro.mp4`
  - Case studies: `/problems/{name}.mp4`
- **PDFs**: DO Spaces bucket `gammapdf.ams3.digitaloceanspaces.com`
  - `/{lessonId}.pdf` (e.g., `/1-1.pdf`)
  - CORS configured to allow `https://course.sysdesign.online`
- **Quizzes**: Extracted from Moodle DB on the same droplet (`moodle` database, `moodleuser`/`REDACTED_DB_PASS`)
  - Module-level tests: 124 questions across 7 modules
  - Stored in `src/data/quizzes.json`

## Architecture

### Page Types

The site has two layers:

**Marketing/Portfolio layer:**
- `/` — Landing page (Hero, Authors, Stats, Intro Video, Program Accordion, CTA)
- This page sells the course and showcases the authors

**Learning layer** (all use `CourseLayout.astro` with collapsible sidebar):
- `/course` — Materials dashboard (module cards with progress, case studies)
- `/module/{id}` — Module page (lesson list, quiz link)
- `/lesson/{id}` — Lesson page (video/PDF/notes tabs, complete/bookmark)
- `/quiz/{id}` — Module quiz (interactive, score saved to localStorage)
- `/case/{id}` — Case study (video player, bookmark)
- `/search` — Search page
- `/bookmarks` — Bookmarks page

### Component Architecture

**Astro components** (`.astro`) — static content, no client JS:
- `Layout.astro`, `CourseLayout.astro` — page shells
- `Navbar.astro`, `Footer.astro` — shared chrome
- `Hero.astro`, `StatsBar.astro`, `Authors.astro`, `IntroVideo.astro` — landing sections
- `ProblemCard.astro` — case study card

**React islands** (`.tsx`, hydrated with `client:load`) — interactive:
- `CourseSidebar.tsx` — LMS-style navigation sidebar (collapsible, shows progress)
- `LessonContent.tsx` — video/PDF/notes tabs, complete/bookmark buttons, prev/next
- `PdfViewer.tsx` — pdf.js viewer with dark theme
- `ModuleCardsGrid.tsx` — module cards with localStorage progress bars
- `LessonList.tsx` — lesson list with completion checkmarks
- `Quiz.tsx` — interactive quiz (one question at a time, score tracking)
- `SearchWidget.tsx` — Fuse.js search dropdown
- `BookmarksList.tsx` — bookmarks from localStorage
- `ProgramAccordion.tsx` — expandable program overview (landing page)
- `CaseContent.tsx` — case study video + bookmark

### Data Layer

- `src/data/course.ts` — course structure (modules, lessons, problems), URL helpers, query functions
- `src/data/quizzes.json` — quiz questions (extracted from Moodle)
- `src/lib/storage.ts` — typed localStorage wrappers for progress, bookmarks, notes

### Visual Design

- **Theme**: Dark Indigo + Purple (#7c83ff primary, #6366f1 dark, #a855f7 secondary)
- **Background**: Deep indigo (#0f0f1a base, #1a1a2e secondary, #16213e tertiary)
- **Module colors**: Each module has a distinct accent (indigo, purple, cyan, amber, emerald, rose, orange)
- **Custom tokens**: defined in `src/styles/global.css` under `@theme { ... }`

## Development

```bash
npm install
npm run dev      # Astro dev server at localhost:4321
npm run build    # Build static site to dist/
npm run preview  # Preview built site
```

## Deployment

The site is deployed as static files served by Apache on the existing DigitalOcean droplet.

**Manual deploy:**
```bash
npm run build
rsync -avz --delete dist/ root@146.190.19.161:/var/www/course.sysdesign.online/
```

**Deploy script on server:**
```bash
ssh root@146.190.19.161 /root/deploy-course.sh
```
This clones the repo, builds, and copies to the web root.

**Apache vhost**: `/etc/apache2/sites-enabled/course.sysdesign.online-le-ssl.conf`

## localStorage Keys

```
sysdesign:progress        → { "1-1": true, "1-2": true, ... }
sysdesign:bookmarks       → ["1-3", "case-airbnb", ...]
sysdesign:notes           → { "1-1": "My notes...", ... }
sysdesign:quiz:module-{N} → { score: 8, total: 10 }
sysdesign:sidebar         → "open" | "collapsed"
```

## Adding Content

**New lesson**: Add entry to `src/data/course.ts` in the appropriate module's `lessons` array. Upload video to `sysdesign-course-videos` bucket and PDF to `gammapdf` bucket. Rebuild and deploy.

**New quiz questions**: Update `src/data/quizzes.json` or re-extract from Moodle using:
```bash
ssh root@146.190.19.161 "mysql -u moodleuser -pREDACTED_DB_PASS moodle -e 'SELECT ...'"
```

**New module**: Add to `courseData.modules` in `course.ts` with a new color.

## DO Spaces Access

```
Access Key: REDACTED_DO_SPACES_KEY
Endpoint: ams3.digitaloceanspaces.com
Buckets: sysdesign-course-videos, gammapdf
```

Use `aws s3` CLI with `--endpoint-url https://ams3.digitaloceanspaces.com` or boto3.

## Social Links

- Telegram: https://t.me/ship_happens_404
- YouTube: https://youtube.com/@shiphappens-404
- Email: info@sysdesign.online
- GitHub: https://github.com/razkevich/sysdesign-course
