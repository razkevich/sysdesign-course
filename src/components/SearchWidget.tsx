import { useState, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { courseData } from '../data/course';

interface SearchItem {
  type: 'module' | 'lesson';
  title: string;
  subtitle: string;
  href: string;
  color: string;
}

const index: SearchItem[] = [];

for (const mod of courseData.modules) {
  index.push({
    type: 'module',
    title: `Модуль ${mod.id}: ${mod.title}`,
    subtitle: '',
    href: `/module/${mod.id}`,
    color: mod.color,
  });
  for (const lesson of mod.lessons) {
    index.push({
      type: 'lesson',
      title: lesson.title,
      subtitle: `Модуль ${mod.id}: ${mod.title}`,
      href: `/lesson/${lesson.id}`,
      color: mod.color,
    });
  }
}

const fuse = new Fuse(index, {
  keys: ['title', 'subtitle'],
  threshold: 0.4,
  includeScore: true,
});

export default function SearchWidget() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.length >= 2 ? fuse.search(query).slice(0, 8) : [];

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setOpen(true);
  }

  return (
    <div ref={containerRef} className="relative ml-auto">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        placeholder="Поиск..."
        className="bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-text-secondary placeholder:text-text-muted focus:outline-none focus:border-accent-indigo transition-colors w-40 sm:w-52"
      />
      {open && query.length >= 2 && (
        <div className="absolute right-0 z-50 mt-1 w-72 sm:w-96 rounded-lg border border-border bg-bg-secondary shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-muted">Ничего не найдено</div>
          ) : (
            <ul>
              {results.map(({ item }) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-bg-primary transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <span
                      className="mt-1.5 shrink-0 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm text-text-primary truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-xs text-text-muted truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
