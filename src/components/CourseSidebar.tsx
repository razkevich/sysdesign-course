import { useState, useEffect, useRef } from 'react';
import { courseData } from '../data/course';
import { isCompleted } from '../lib/storage';
import quizData from '../data/quizzes.json';

const SIDEBAR_KEY = 'sysdesign:sidebar';

interface Props {
  currentPath: string;
}

export default function CourseSidebar({ currentPath }: Props) {
  // Determine which module contains the current page (for auto-expand)
  function getActiveModuleId(): number | null {
    const lessonMatch = currentPath.match(/^\/lesson\/(\d+)-/);
    if (lessonMatch) return Number(lessonMatch[1]);
    const moduleMatch = currentPath.match(/^\/module\/(\d+)/);
    if (moduleMatch) return Number(moduleMatch[1]);
    const quizMatch = currentPath.match(/^\/quiz\/(\d+)/);
    if (quizMatch) return Number(quizMatch[1]);
    return null;
  }

  const activeModuleId = getActiveModuleId();

  // Sidebar open/collapsed (desktop). Start "open" to avoid layout shift.
  const [isOpen, setIsOpen] = useState(true);
  // Mobile overlay open
  const [mobileOpen, setMobileOpen] = useState(false);
  // Which modules are expanded
  const [expandedModules, setExpandedModules] = useState<Set<number>>(
    () => new Set(activeModuleId ? [activeModuleId] : [])
  );
  // Hydrated flag to avoid SSR mismatch
  const [hydrated, setHydrated] = useState(false);
  // Completion state (loaded client-side)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load sidebar open/closed preference
    try {
      const saved = localStorage.getItem(SIDEBAR_KEY);
      if (saved === 'collapsed') setIsOpen(false);
      else if (saved === 'open') setIsOpen(true);
      // else: keep default (open)
    } catch {
      // ignore
    }

    // Load completion state
    const allLessonIds = courseData.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const completed = new Set(allLessonIds.filter((id) => isCompleted(id)));
    setCompletedLessons(completed);

    setHydrated(true);
  }, []);

  // Listen for progress changes (e.g., when user marks lesson complete on the page)
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'sysdesign:progress') {
        const allLessonIds = courseData.modules.flatMap((m) => m.lessons.map((l) => l.id));
        const completed = new Set(allLessonIds.filter((id) => isCompleted(id)));
        setCompletedLessons(completed);
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  function toggleSidebar() {
    const next = !isOpen;
    setIsOpen(next);
    try {
      localStorage.setItem(SIDEBAR_KEY, next ? 'open' : 'collapsed');
    } catch {
      // ignore
    }
    if (!next) setMobileOpen(false);
  }

  function toggleModule(moduleId: number) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  function openFromCollapsed(moduleId: number) {
    setIsOpen(true);
    try {
      localStorage.setItem(SIDEBAR_KEY, 'open');
    } catch {
      // ignore
    }
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.add(moduleId);
      return next;
    });
  }

  const isCurrentLesson = (lessonId: string) => currentPath === `/lesson/${lessonId}`;
  const isCurrentModule = (moduleId: number) => currentPath === `/module/${moduleId}`;
  const isCurrentQuiz = (moduleId: number) => currentPath === `/quiz/${moduleId}`;
  const isCurrentCase = (caseId: string) => currentPath === `/case/${caseId}`;

  // Sidebar content (shared between desktop and mobile overlay)
  function SidebarContent({ onClose }: { onClose?: () => void }) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <span className="text-sm font-semibold text-text-primary">Навигация</span>
          <button
            onClick={onClose ?? toggleSidebar}
            className="p-1 rounded hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors"
            aria-label="Свернуть"
          >
            {onClose ? '✕' : '«'}
          </button>
        </div>

        {/* Scrollable nav content */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {/* Modules */}
          {courseData.modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const hasQuiz = !!(quizData as Record<string, unknown[]>)[String(module.id)];
            const isModuleActive = isCurrentModule(module.id);
            const isQuizActive = isCurrentQuiz(module.id);
            const hasActiveLessonInModule = module.lessons.some((l) =>
              isCurrentLesson(l.id)
            );

            return (
              <div key={module.id}>
                {/* Module row */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-white/5 transition-colors group ${
                    isModuleActive || hasActiveLessonInModule || isQuizActive
                      ? 'bg-white/5'
                      : ''
                  }`}
                >
                  {/* Colored dot */}
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: module.color }}
                  />
                  <span className="flex-1 text-sm text-text-secondary truncate">
                    <span className="text-text-muted text-xs mr-1">
                      {module.id < 10 ? `0${module.id}` : module.id}
                    </span>
                    {module.title}
                  </span>
                  <span
                    className="text-text-muted text-xs transition-transform duration-200"
                    style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                  >
                    ▾
                  </span>
                </button>

                {/* Expanded: lessons + quiz */}
                {isExpanded && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                    {module.lessons.map((lesson) => {
                      const done = completedLessons.has(lesson.id);
                      const active = isCurrentLesson(lesson.id);
                      return (
                        <a
                          key={lesson.id}
                          href={`/lesson/${lesson.id}`}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                            active
                              ? 'bg-accent-indigo/10 text-text-primary border-l-2 border-accent-indigo -ml-px pl-3'
                              : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                          }`}
                        >
                          {/* Completion dot */}
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              done ? 'bg-accent-emerald' : 'bg-border'
                            }`}
                            style={done ? {} : { backgroundColor: 'rgba(124,131,255,0.2)' }}
                          />
                          <span className="truncate">{lesson.title}</span>
                        </a>
                      );
                    })}

                    {/* Quiz link */}
                    {hasQuiz && (
                      <a
                        href={`/quiz/${module.id}`}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors mt-1 ${
                          isQuizActive
                            ? 'bg-accent-indigo/10 text-text-primary border-l-2 border-accent-indigo -ml-px pl-3'
                            : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                        }`}
                      >
                        <span className="shrink-0">🧠</span>
                        <span>Тест</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Case studies section */}
          <div className="pt-3 mt-2 border-t border-border">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider px-2 mb-1">
              Разбор кейсов
            </p>
            {courseData.problems.map((problem) => {
              const active = isCurrentCase(problem.id);
              return (
                <a
                  key={problem.id}
                  href={`/case/${problem.id}`}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                    active
                      ? 'bg-accent-indigo/10 text-text-primary border-l-2 border-accent-indigo'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  <span className="text-text-muted shrink-0">▶</span>
                  <span className="truncate">{problem.title}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Collapsed strip (desktop only)
  function CollapsedStrip() {
    return (
      <div className="flex flex-col items-center py-3 gap-3 h-full">
        {/* Expand button */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors mb-1"
          aria-label="Развернуть"
        >
          »
        </button>
        {/* Module circles */}
        {courseData.modules.map((module) => {
          const isActive =
            isCurrentModule(module.id) ||
            module.lessons.some((l) => isCurrentLesson(l.id)) ||
            isCurrentQuiz(module.id);
          return (
            <button
              key={module.id}
              onClick={() => openFromCollapsed(module.id)}
              title={`Модуль ${module.id}: ${module.title}`}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isActive ? 'ring-2 ring-offset-1 ring-offset-bg-secondary' : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: module.color + '33',
                color: module.color,
                ...(isActive ? { '--tw-ring-color': module.color } as React.CSSProperties : {}),
              }}
            >
              {module.id}
            </button>
          );
        })}

        {/* К circle for case studies */}
        {(() => {
          const isCaseActive = currentPath.startsWith('/case/');
          return (
            <button
              onClick={() => {
                setIsOpen(true);
                try {
                  localStorage.setItem(SIDEBAR_KEY, 'open');
                } catch {
                  // ignore
                }
              }}
              title="Разбор кейсов"
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                isCaseActive ? 'ring-2 ring-offset-1 ring-offset-bg-secondary' : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: '#7c83ff33',
                color: '#7c83ff',
                ...(isCaseActive ? { '--tw-ring-color': '#7c83ff' } as React.CSSProperties : {}),
              }}
            >
              К
            </button>
          );
        })()}
      </div>
    );
  }

  // Render nothing until hydrated on client to avoid flash
  // But keep the desktop sidebar width reserved via CSS
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-bg-secondary border-r border-border transition-all duration-300 overflow-hidden ${
          isOpen ? 'w-[280px]' : 'w-12'
        }`}
        style={{ height: 'calc(100vh - 57px)', position: 'sticky', top: '57px' }}
      >
        {hydrated && isOpen && <SidebarContent />}
        {hydrated && !isOpen && <CollapsedStrip />}
        {/* Before hydration: show a minimal collapsed strip placeholder */}
        {!hydrated && (
          <div className="flex flex-col items-center py-3 gap-3">
            <div className="w-6 h-6 rounded bg-white/5" />
          </div>
        )}
      </aside>

      {/* Mobile: floating button */}
      <button
        className="lg:hidden fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-accent-indigo flex items-center justify-center text-white shadow-lg hover:bg-accent-indigo-dark transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Открыть навигацию"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-50 sidebar-backdrop"
            onClick={() => setMobileOpen(false)}
          />
          {/* Slide-in panel */}
          <div className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-bg-secondary border-r border-border flex flex-col overflow-hidden">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
