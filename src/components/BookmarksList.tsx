import { useState, useEffect } from 'react';
import { getLessonById } from '../data/course';
import { getBookmarks, toggleBookmark, isCompleted } from '../lib/storage';

interface BookmarkRow {
  id: string;
  lessonTitle: string;
  moduleTitle: string;
  completed: boolean;
}

export default function BookmarksList() {
  const [rows, setRows] = useState<BookmarkRow[]>([]);

  useEffect(() => {
    const ids = getBookmarks();
    const resolved: BookmarkRow[] = ids.flatMap((id) => {
      const result = getLessonById(id);
      if (!result) return [];
      return [
        {
          id,
          lessonTitle: result.lesson.title,
          moduleTitle: result.module.title,
          completed: isCompleted(id),
        },
      ];
    });
    setRows(resolved);
  }, []);

  function handleRemove(id: string) {
    toggleBookmark(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <span className="text-5xl">★</span>
        <h2 className="text-xl font-bold text-text-primary">Нет закладок</h2>
        <p className="text-text-secondary max-w-sm">
          Добавляйте уроки в закладки, чтобы быстро возвращаться к ним позже.
        </p>
        <a href="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
          ← К программе курса
        </a>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-center gap-4 rounded-lg border border-border bg-bg-secondary/30 p-4"
        >
          {/* Completion indicator */}
          <span className="flex-shrink-0 w-7 h-7 rounded-full border-2 border-border flex items-center justify-center text-sm">
            {row.completed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-green-500"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <span className="text-text-muted">○</span>
            )}
          </span>

          {/* Lesson info */}
          <div className="flex-1 min-w-0">
            <a
              href={`/lesson/${row.id}`}
              className="text-sm font-medium text-text-primary hover:underline truncate block"
            >
              {row.lessonTitle}
            </a>
            <p className="text-xs text-text-muted truncate">{row.moduleTitle}</p>
          </div>

          {/* Remove button */}
          <button
            onClick={() => handleRemove(row.id)}
            className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors text-lg leading-none"
            aria-label="Удалить закладку"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
