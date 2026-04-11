import { useState, useEffect } from 'react';
import { courseData, type Module } from '../data/course';
import { getModuleProgress } from '../lib/storage';

export default function ModuleCardsGrid() {
  const [progressMap, setProgressMap] = useState<Record<number, { completed: number; total: number }>>({});

  useEffect(() => {
    const map: Record<number, { completed: number; total: number }> = {};
    for (const module of courseData.modules) {
      map[module.id] = getModuleProgress(module.lessons.map((l) => l.id));
    }
    setProgressMap(map);
  }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courseData.modules.map((module: Module) => {
        const progress = progressMap[module.id] ?? { completed: 0, total: module.lessons.length };
        const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

        return (
          <a
            key={module.id}
            href={`/module/${module.id}`}
            className="group block rounded-xl border border-border bg-bg-secondary p-5 hover:-translate-y-1 transition-transform duration-200"
            style={{ borderLeftColor: module.color, borderLeftWidth: '3px' }}
          >
            <div className="flex items-start gap-3 mb-3">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${module.color}20`, color: module.color }}
              >
                {module.id < 10 ? `0${module.id}` : module.id}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-2 line-clamp-2 leading-snug">
              {module.title}
            </h3>
            <p className="text-xs text-text-muted mb-4">
              {module.lessons.length} уроков
            </p>

            {/* Progress bar */}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-muted">
                  {progress.completed}/{progress.total}
                </span>
                <span className="text-xs text-text-muted">{pct}%</span>
              </div>
              <div className="h-1 rounded-full bg-bg-primary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: module.color }}
                />
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
