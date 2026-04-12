# SysDesign Course — course.sysdesign.online

Open-source system design course website. Portfolio piece + real educational resource.

## Quick Reference

- **Live site**: https://course.sysdesign.online
- **Repo**: https://github.com/razkevich/sysdesign-course
- **Authors**: Alex Razkevich, Artem Gromovsky
- **Language**: Russian

## Infrastructure

### Hosting: Yandex Cloud VM (primary)

- **IP**: 111.88.242.35
- **VM name**: sysdesign-course (preemptible, 2 cores 20%, 1GB RAM)
- **OS**: Ubuntu 22.04
- **Web server**: nginx with HTTP/2, gzip, 1yr cache for static assets
- **SSL**: Let's Encrypt via certbot (auto-renews)
- **SSH**: `ssh yc-user@111.88.242.35` (key: `~/.ssh/id_ed25519`)
- **Web root**: `/var/www/course.sysdesign.online/`
- **Nginx config**: `/etc/nginx/sites-enabled/course.sysdesign.online`
- **Yandex Cloud CLI**: `~/yandex-cloud/bin/yc` (add to PATH)
- **YC folder**: `b1g0bhqapbnodb35pp8r` (default), zone `ru-central1-a`
- **Why Yandex Cloud**: DigitalOcean IPs are often blocked from Russia. Yandex Cloud has Russian datacenters with reliable connectivity.
- **Note**: VM is preemptible (can be stopped by YC after 24h). If site goes down, restart: `yc compute instance start sysdesign-course`

### DigitalOcean (DNS + content storage)

- **DNS**: sysdesign.online managed by DO nameservers. `course` A record → 111.88.242.35
- **DO Spaces** (content buckets, AMS3 region):
  - `sysdesign-course-videos`: lesson videos, intro, problem walkthroughs
  - `gammapdf`: lesson PDFs (CORS configured for course.sysdesign.online)
  - Access Key: `REDACTED_DO_SPACES_KEY`, endpoint: `ams3.digitaloceanspaces.com`
- **DO droplet** (146.190.19.161): runs Moodle (mycourse.sysdesign.online). Quiz data was extracted from here.

### Legacy: DO droplet also has the course site deployed (Apache), but DNS no longer points there.

## Tech Stack

- **Framework**: Astro 6 (static output)
- **UI Islands**: React 19 (via `@astrojs/react`) — interactive components hydrate client-side
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite`, theme tokens in `src/styles/global.css`)
- **Search**: Fuse.js (client-side fuzzy search)
- **State**: localStorage (progress, bookmarks, notes, quiz scores, sidebar state)
- **Lesson tabs**: Pure CSS (radio input + `:checked` sibling selectors) — works without JS for Russia reliability
- **Buttons** (complete/bookmark/notes): Inline `<script>` with vanilla JS — no React dependency

## Content Sources

- **Videos**: `https://sysdesign-course-videos.ams3.digitaloceanspaces.com/{lessonId}.mp4`
  - Intro: `/intro.mp4`
  - Case studies: `/problems/{name}.mp4`
- **PDFs**: `https://gammapdf.ams3.digitaloceanspaces.com/{lessonId}.pdf`
  - Embedded via `<iframe>` on lesson pages (direct URL, no PHP viewer wrapper)
  - CORS configured to allow `https://course.sysdesign.online`
- **Quizzes**: Extracted from Moodle DB on DO droplet
  - 124 questions across 7 modules, stored in `src/data/quizzes.json`
  - To re-extract: `ssh root@146.190.19.161 "mysql -u moodleuser -pREDACTED_DB_PASS moodle -e '...'"` (password: `REDACTED_SSH_PASS`)

## Architecture

### Page Types

**Marketing/Portfolio layer:**
- `/` — Landing page (Hero with personas, CredibilityBar, Intro Video, Program Accordion, CTA)

**Learning layer** (all use `CourseLayout.astro` with collapsible sidebar):
- `/course` — Materials dashboard (module cards with progress, case studies)
- `/module/{id}` — Module page (lesson list, quiz link)
- `/lesson/{id}` — Lesson page (pure CSS tabs: video/PDF/notes, vanilla JS for localStorage)
- `/quiz/{id}` — Module quiz (React island, score saved to localStorage)
- `/case/{id}` — Case study (video player, bookmark)
- `/search`, `/bookmarks` — utility pages

### Key Design Decisions

- **Lesson tabs are pure CSS** (not React) — the radio-input pattern works without JS hydration. This was changed because React islands frequently failed to hydrate from Russia due to network issues.
- **Complete/bookmark/notes buttons use inline vanilla JS** — tiny `<script>` tags that access localStorage directly. No external dependencies.
- **React islands are only used where truly needed**: sidebar, quiz, search widget, module cards grid, program accordion.
- **pdf.js worker served locally** (`/pdf.worker.min.js`) — unpkg.com CDN is blocked in Russia.

### Component Architecture

**Astro components** (`.astro`) — static, no client JS:
- `Layout.astro`, `CourseLayout.astro` — page shells
- `Navbar.astro`, `Footer.astro` — shared chrome
- `Hero.astro`, `CredibilityBar.astro`, `IntroVideo.astro` — landing sections
- `ProblemCard.astro` — case study card

**React islands** (`.tsx`, hydrated with `client:load`):
- `CourseSidebar.tsx` — LMS-style collapsible navigation sidebar
- `ModuleCardsGrid.tsx` — module cards with localStorage progress bars
- `LessonList.tsx` — lesson list with completion checkmarks
- `Quiz.tsx` — interactive quiz (one question at a time)
- `SearchWidget.tsx` — Fuse.js search dropdown
- `BookmarksList.tsx` — bookmarks list
- `ProgramAccordion.tsx` — expandable program overview (landing page)
- `CaseContent.tsx` — case study video + bookmark
- `PdfViewer.tsx` — pdf.js viewer (lazy-loaded with error boundary, used by LessonContent.tsx if JS hydrates)
- `LessonContent.tsx` — legacy React lesson content (kept in repo but lesson pages now use pure CSS tabs instead)

### Data Layer

- `src/data/course.ts` — course structure, URL helpers, query functions
- `src/data/quizzes.json` — quiz questions (from Moodle)
- `src/lib/storage.ts` — typed localStorage wrappers

## Development

```bash
npm install
npm run dev      # Astro dev server at localhost:4321
npm run build    # Build static site to dist/
npm run preview  # Preview built site
```

## Deployment

Site is static files served by nginx on Yandex Cloud.

**Quick deploy from local:**
```bash
npm run build
rsync -avz --delete dist/ yc-user@111.88.242.35:/tmp/course-dist/
ssh yc-user@111.88.242.35 "sudo cp -r /tmp/course-dist/* /var/www/course.sysdesign.online/"
```

**If the VM is stopped** (preemptible instances auto-stop after 24h):
```bash
export PATH="$HOME/yandex-cloud/bin:$PATH"
yc compute instance start sysdesign-course
# Wait ~30s, then the site is back. IP stays the same.
```

**If you need to recreate the VM:**
```bash
export PATH="$HOME/yandex-cloud/bin:$PATH"
yc compute instance create \
  --name sysdesign-course \
  --zone ru-central1-a \
  --platform standard-v3 \
  --cores 2 --core-fraction 20 --memory 1 \
  --create-boot-disk image-folder-id=standard-images,image-family=ubuntu-2204-lts,size=10,type=network-hdd \
  --network-interface subnet-name=default-ru-central1-a,nat-ip-version=ipv4 \
  --ssh-key ~/.ssh/id_ed25519.pub \
  --preemptible
# Then: install nginx, deploy files, update DNS A record, get SSL cert
```

**DNS update** (if IP changes):
```bash
# Find current record ID
doctl compute domain records list sysdesign.online | grep course
# Delete old, create new
doctl compute domain records delete sysdesign.online <old-id> --force
doctl compute domain records create sysdesign.online \
  --record-type A --record-name course --record-data <new-ip> --record-ttl 300
```

## localStorage Keys

```
sysdesign:progress        → { "1-1": true, "1-2": true, ... }
sysdesign:bookmarks       → ["1-3", "case-airbnb", ...]
sysdesign:notes           → { "1-1": "My notes...", ... }
sysdesign:quiz:module-{N} → { score: 8, total: 10 }
sysdesign:sidebar         → "open" | "collapsed"
```

## Adding Content

**New lesson**: Add entry to `src/data/course.ts` → upload video/PDF to DO Spaces → rebuild and deploy.

**New quiz questions**: Update `src/data/quizzes.json` or re-extract from Moodle.

**New module**: Add to `courseData.modules` in `course.ts` with a new color.

## Social Links

- Telegram: https://t.me/ship_happens_404
- YouTube: https://youtube.com/@shiphappens-404
- Email: info@sysdesign.online
- GitHub: https://github.com/razkevich/sysdesign-course
