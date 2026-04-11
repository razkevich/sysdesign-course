import { useState, useEffect } from 'react';
import { type Lesson } from '../data/course';
import { isCompleted, getModuleProgress } from '../lib/storage';

interface Props {
  lessons: Lesson[];
  moduleColor: string;
}

export default function LessonList({ lessons, moduleColor }: Props) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const ids = new Set(lessons.filter((l) => isCompleted(l.id)).map((l) => l.id));
    setCompletedIds(ids);
  }, [lessons]);

  const lessonIds = lessons.map((l) => l.id);
  const { completed, total } = getModuleProgress(lessonIds);
  const pct = total > 0 ? Math.round((completedIds.size / total) * 100) : 0;

  return (
    <div>
      {/* Progress summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">
            {completedIds.size} из {total} пройдено
          </span>
          <span className="text-sm font-semibold" style={{ color: moduleColor }}>
            {pct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: moduleColor }}
          />
        </div>
      </div>

      {/* Lesson list */}
      <ol className="space-y-2">
        {lessons.map((lesson, index) => {
          const done = completedIds.has(lesson.id);
          return (
            <li key={lesson.id}>
              <a
                href={`/lesson/${lesson.id}`}
                className="group flex items-center gap-3 rounded-lg border border-border bg-bg-secondary px-4 py-3 hover:border-[var(--module-color)] transition-colors duration-150"
                style={{ '--module-color': moduleColor } as React.CSSProperties}
              >
                {/* Numbered circle */}
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200"
                  style={
                    done
                      ? { backgroundColor: moduleColor, color: '#fff' }
                      : { backgroundColor: 'var(--bg-primary, #0f1117)', color: moduleColor, border: `2px solid ${moduleColor}` }
                  }
                >
                  {done ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Title */}
                <span
                  className={`flex-1 text-sm font-medium leading-snug ${done ? 'text-text-muted line-through' : 'text-text-primary'}`}
                >
                  {lesson.title}
                </span>

                {/* Indicators */}
                <span className="flex items-center gap-1.5 shrink-0">
                  {lesson.hasVideo && (
                    <span className="text-xs text-text-muted px-1.5 py-0.5 rounded bg-bg-primary">
                      Видео
                    </span>
                  )}
                  {lesson.hasPdf && (
                    <span className="text-xs text-text-muted px-1.5 py-0.5 rounded bg-bg-primary">
                      PDF
                    </span>
                  )}
                </span>

                {/* Open arrow */}
                <span className="shrink-0 text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  Открыть →
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
