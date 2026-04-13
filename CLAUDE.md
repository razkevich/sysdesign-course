# SysDesign Course — course.sysdesign.online

Open-source system design course website. Portfolio piece + real educational resource.

## Quick Reference

- **Live site**: https://course.sysdesign.online
- **Repo**: https://github.com/razkevich/sysdesign-course
- **Authors**: Alex Razkevich, Artem Gromovsky
- **Language**: Russian
- **Analytics**: Yandex Metrica counter `108513607` — https://metrika.yandex.ru/dashboard?id=108513607

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

### DNS: Yandex Cloud DNS

- **Zone**: sysdesign.online (public, managed in YC DNS, zone ID `dns2oujjqm9rsvn3a1dl`)
- **Nameservers**: ns1.yandexcloud.net, ns2.yandexcloud.net (configured at reg.ru registrar)
- **Key records**: `course` A → 111.88.242.35 (YC VM), `mycourse` A → 146.190.19.161 (DO Moodle droplet)
- **List records**: `yc dns zone list-records --id dns2oujjqm9rsvn3a1dl`

### Content Storage: Yandex Cloud Object Storage

- **Videos bucket**: `sysdesign-course-videos-yc` (lessons, intro.mp4, problems/*.mp4)
- **PDFs bucket**: `sysdesign-course-pdfs-yc` (lesson PDFs)
- **Service account**: `storage-admin`, credentials on YC VM at `~/.aws/credentials` (profile `yc`)
- **Endpoint**: `https://storage.yandexcloud.net`
- **Public URLs**:
  - Videos: `https://storage.yandexcloud.net/sysdesign-course-videos-yc/{lessonId}.mp4`
  - PDFs: `https://storage.yandexcloud.net/sysdesign-course-pdfs-yc/{lessonId}.pdf`

### Legacy (DigitalOcean)

- **DO droplet** (146.190.19.161): runs Moodle (mycourse.sysdesign.online). Quiz data was extracted from here.
- **DO Spaces**: old copies of videos/PDFs in `sysdesign-course-videos` and `gammapdf` buckets (can be deleted — content is now on YC).
- Source content also lives in Google Drive as the original source of truth.

## Tech Stack

- **Framework**: Astro 6 (static output)
- **UI Islands**: React 19 (via `@astrojs/react`) — only where interactivity requires it
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite`, theme tokens in `src/styles/global.css`)
- **Search**: Fuse.js (client-side fuzzy search)
- **State**: localStorage (progress, bookmarks, notes, quiz scores, quiz progress, sidebar state)
- **Lesson tabs**: Pure CSS (radio input + `:checked` sibling selectors) — works without JS
- **Lesson actions** (complete/bookmark/notes): Inline `<script>` with vanilla JS — no React dependency
- **Analytics**: Yandex Metrica with webvisor, clickmap, track links, accurate bounce

## Content

- **Videos** (YC Object Storage): lesson videos, `intro.mp4`, problem walkthroughs in `problems/`
- **PDFs** (YC Object Storage): lesson PDFs by ID
- **Quizzes**: 124 questions across 7 modules in `src/data/quizzes.json` (extracted from Moodle)

## Architecture

### Page Types

**Marketing/Portfolio layer:**
- `/` — Landing page (Hero with target personas, CredibilityBar with authors+stats, Intro Video, Program Accordion, CTA)

**Learning layer** (all use `CourseLayout.astro` with collapsible sidebar):
- `/course` — Materials dashboard (module cards with progress, case studies with "Подход к решению задач" highlighted first)
- `/module/{id}` — Module page (lesson list with completion, quiz link card)
- `/lesson/{id}` — Lesson page (pure CSS tabs: Видео/PDF/Заметки, vanilla JS for complete/bookmark/notes)
- `/quiz/{id}` — Module quiz (React island with navigation between questions, progress saved to localStorage)
- `/case/{id}` — Case study (video player, bookmark, prev/next navigation)
- `/search`, `/bookmarks` — utility pages

### Key Design Decisions

- **Lesson tabs are pure CSS** (not React) — the radio-input pattern works without JS hydration. Done because React islands frequently failed to hydrate from Russia due to network issues.
- **Lesson action buttons use inline vanilla JS** — tiny `<script>` tags that access localStorage directly. No external dependencies.
- **React islands are only used where truly needed**: sidebar, quiz, search widget, module cards grid, program accordion, bookmarks list, case content.
- **Quiz features**: navigate between questions (back/forward buttons + clickable question dots), auto-check on answer select (no "Проверить" button), mid-quiz progress saved to localStorage, resume where you left off.
- **Content on YC Object Storage** — served from Russian datacenter for reliable access.

### Component Architecture

**Astro components** (`.astro`) — static, no client JS:
- `Layout.astro`, `CourseLayout.astro` — page shells (Layout contains Yandex Metrica snippet)
- `Navbar.astro`, `Footer.astro` — shared chrome
- `Hero.astro`, `CredibilityBar.astro`, `IntroVideo.astro` — landing sections
- `ProblemCard.astro` — case study card (supports `highlight` prop)

**React islands** (`.tsx`, hydrated with `client:load`):
- `CourseSidebar.tsx` — LMS-style collapsible navigation (280px expanded / 48px collapsed strip)
- `ModuleCardsGrid.tsx` — module cards with localStorage progress bars
- `LessonList.tsx` — lesson list with completion checkmarks
- `Quiz.tsx` — interactive quiz with navigation, progress saving, auto-check answers
- `SearchWidget.tsx` — Fuse.js search dropdown
- `BookmarksList.tsx` — bookmarks list
- `ProgramAccordion.tsx` — expandable program overview with lesson titles + case studies section
- `CaseContent.tsx` — case study video player
- `PdfViewer.tsx` — pdf.js viewer (kept but lesson pages now use simple iframe instead)
- `LessonContent.tsx` — legacy React lesson content (not used, pure CSS tabs in `pages/lesson/[id].astro` instead)

### Data Layer

- `src/data/course.ts` — course structure, YC URL helpers, query functions
- `src/data/quizzes.json` — 124 quiz questions keyed by module ID
- `src/lib/storage.ts` — typed localStorage wrappers

## Development

```bash
npm install
npm run dev      # Astro dev server at localhost:4321
npm run build    # Build static site to dist/
npm run preview  # Preview built site
```

## Deployment

Static files served by nginx on Yandex Cloud.

**Standard deploy:**
```bash
npm run build
rsync -avz --delete dist/ yc-user@111.88.242.35:/tmp/course-dist/
ssh yc-user@111.88.242.35 "sudo cp -r /tmp/course-dist/* /var/www/course.sysdesign.online/"
```

**If the VM is stopped** (preemptible instances auto-stop after 24h):
```bash
export PATH="$HOME/yandex-cloud/bin:$PATH"
yc compute instance start sysdesign-course
# Wait ~30s, IP stays the same
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
export PATH="$HOME/yandex-cloud/bin:$PATH"
yc dns zone remove-records --id dns2oujjqm9rsvn3a1dl --record "course 300 A <old-ip>"
yc dns zone add-records --id dns2oujjqm9rsvn3a1dl --record "course 300 A <new-ip>"
```

## localStorage Keys

```
sysdesign:progress                → { "1-1": true, "1-2": true, ... }
sysdesign:bookmarks               → ["1-3", "case-airbnb", ...]
sysdesign:notes                   → { "1-1": "My notes...", ... }
sysdesign:quiz:module-{N}         → number (best score)
sysdesign:quiz:progress-{N}       → { current, answers: (number|null)[], checked }
sysdesign:sidebar                 → "open" | "collapsed"
```

## Adding Content

**New lesson**:
1. Add entry to `src/data/course.ts` in appropriate module
2. Upload video to `sysdesign-course-videos-yc` bucket (S3-compatible, use YC credentials from VM)
3. Upload PDF to `sysdesign-course-pdfs-yc` bucket
4. Rebuild and deploy

**New quiz questions**: Edit `src/data/quizzes.json` (keyed by module ID) or re-extract from Moodle on DO droplet.

**New module**: Add to `courseData.modules` in `course.ts` with a unique color.

## Social Links

- Telegram: https://t.me/ship_happens_404
- YouTube: https://youtube.com/@shiphappens-404
- Email: info@sysdesign.online
- GitHub: https://github.com/razkevich/sysdesign-course
