import { useState } from 'react';
import { courseData } from '../data/course';

// Reorder problems: "approach" first, then the rest in original order
const orderedProblems = [
  courseData.problems.find((p) => p.id === 'approach')!,
  ...courseData.problems.filter((p) => p.id !== 'approach'),
];

const moduleDescriptions: Record<number, string> = {
  1: 'Фундаментальные концепции архитектуры ПО: декомпозиция систем, атрибуты качества, модели коммуникации и управление изменениями.',
  2: 'DDD, микросервисы, модульные монолиты, событийно-ориентированная и реактивная архитектура, serverless и multi-tenancy.',
  3: 'Протоколы TCP/IP, модель OSI, сетевые компоненты для распределённых систем и service mesh.',
  4: 'Теоремы и паттерны распределённых систем: шардинг, репликация, CAP/PACELC, консенсус, Kubernetes и облачные инфраструктуры.',
  5: 'Выбор баз данных, транзакционные гарантии, очереди сообщений, потоковая обработка данных и Kafka.',
  6: 'Паттерны надёжности: circuit breaker, bulkhead, rate limiting, outbox, observability и FinOps.',
  7: 'Аутентификация, авторизация, защита данных в покое и при передаче.',
};

export default function ProgramAccordion() {
  const [openId, setOpenId] = useState<number | string | null>(1);
  const isCasesOpen = openId === 'cases';

  return (
    <div className="flex flex-col gap-2">
      {courseData.modules.map((module) => {
        const isOpen = openId === module.id;

        return (
          <div
            key={module.id}
            className="rounded-xl border border-border bg-bg-secondary overflow-hidden"
            style={{ borderLeftColor: module.color, borderLeftWidth: '3px' }}
          >
            {/* Header row */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-bg-primary/40 transition-colors"
              onClick={() => setOpenId(isOpen ? null : module.id)}
              aria-expanded={isOpen}
            >
              {/* Number badge */}
              <span
                className="shrink-0 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${module.color}22`, color: module.color }}
              >
                {module.id < 10 ? `0${module.id}` : module.id}
              </span>

              {/* Title */}
              <span className="flex-1 text-sm font-semibold text-text-primary leading-snug">
                {module.title}
              </span>

              {/* Lesson count */}
              <span className="shrink-0 text-xs text-text-muted mr-3">
                {module.lessons.length} уроков
              </span>

              {/* Chevron */}
              <svg
                className="shrink-0 w-4 h-4 text-text-muted transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Expandable body */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: isOpen ? '1000px' : '0px' }}
            >
              <div className="px-5 pb-5">
                {/* Description */}
                {moduleDescriptions[module.id] && (
                  <p className="text-sm text-text-muted mb-4 leading-relaxed">
                    {moduleDescriptions[module.id]}
                  </p>
                )}

                {/* Lesson list */}
                <ul className="flex flex-col gap-1.5">
                  {module.lessons.map((lesson, idx) => (
                    <li key={lesson.id} className="flex items-center gap-2.5 text-sm text-text-secondary">
                      <span className="shrink-0 text-xs text-text-muted w-5 text-right">
                        {idx + 1}.
                      </span>
                      <span className="leading-snug">{lesson.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}

      {/* Case studies section */}
      <div
        className="rounded-xl border border-border bg-bg-secondary overflow-hidden"
        style={{ borderLeftColor: '#7c83ff', borderLeftWidth: '3px' }}
      >
        {/* Header row */}
        <button
          type="button"
          className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-bg-primary/40 transition-colors"
          onClick={() => setOpenId(isCasesOpen ? null : 'cases')}
          aria-expanded={isCasesOpen}
        >
          {/* Play icon badge */}
          <span
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs"
            style={{ backgroundColor: '#7c83ff22', color: '#7c83ff' }}
          >
            ▶
          </span>

          {/* Title */}
          <span className="flex-1 text-sm font-semibold text-text-primary leading-snug">
            🎯 Разбор кейсов
          </span>

          {/* Case count */}
          <span className="shrink-0 text-xs text-text-muted mr-3">
            {orderedProblems.length} кейсов
          </span>

          {/* Chevron */}
          <svg
            className="shrink-0 w-4 h-4 text-text-muted transition-transform duration-200"
            style={{ transform: isCasesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Expandable body */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: isCasesOpen ? '1000px' : '0px' }}
        >
          <div className="px-5 pb-5">
            <ul className="flex flex-col gap-1.5">
              {orderedProblems.map((problem, idx) => (
                <li key={problem.id} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <span className="shrink-0 text-xs" style={{ color: '#7c83ff' }}>▶</span>
                  <span className="leading-snug">
                    {idx === 0 ? `🔥 ${problem.title}` : problem.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
