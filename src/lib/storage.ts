const PROGRESS_KEY = 'sysdesign:progress';
const BOOKMARKS_KEY = 'sysdesign:bookmarks';
const NOTES_KEY = 'sysdesign:notes';

// SSR guard
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// ---- Progress ----

export function getProgress(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isCompleted(lessonId: string): boolean {
  return getProgress().includes(lessonId);
}

export function toggleCompleted(lessonId: string): boolean {
  const completed = getProgress();
  const idx = completed.indexOf(lessonId);
  if (idx === -1) {
    completed.push(lessonId);
  } else {
    completed.splice(idx, 1);
  }
  if (isBrowser()) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
  }
  return idx === -1; // returns new state: true = now completed
}

export function getModuleProgress(lessonIds: string[]): { completed: number; total: number } {
  const progress = getProgress();
  const completed = lessonIds.filter((id) => progress.includes(id)).length;
  return { completed, total: lessonIds.length };
}

// ---- Bookmarks ----

export function getBookmarks(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(lessonId: string): boolean {
  return getBookmarks().includes(lessonId);
}

export function toggleBookmark(lessonId: string): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(lessonId);
  if (idx === -1) {
    bookmarks.push(lessonId);
  } else {
    bookmarks.splice(idx, 1);
  }
  if (isBrowser()) {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }
  return idx === -1; // returns new state: true = now bookmarked
}

// ---- Notes ----

export function getNotes(): Record<string, string> {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function getNote(lessonId: string): string {
  return getNotes()[lessonId] ?? '';
}

export function setNote(lessonId: string, text: string): void {
  const notes = getNotes();
  if (text.trim() === '') {
    delete notes[lessonId];
  } else {
    notes[lessonId] = text;
  }
  if (isBrowser()) {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }
}
