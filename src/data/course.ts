export interface Lesson {
  id: string;
  title: string;
  hasVideo: boolean;
  hasPdf: boolean;
}

export interface Module {
  id: number;
  title: string;
  color: string;
  lessons: Lesson[];
}

export interface Problem {
  id: string;
  title: string;
}

export interface CourseData {
  modules: Module[];
  problems: Problem[];
}

// Base URLs
const VIDEOS_BASE = 'https://sysdesign-course-videos.ams3.digitaloceanspaces.com';
const PDF_VIEWER = 'https://mycourse.sysdesign.online/pdfviewer.php';
const PDF_BASE = 'https://gammapdf.ams3.digitaloceanspaces.com';

// URL helpers
export function getVideoUrl(lessonId: string): string {
  return `${VIDEOS_BASE}/${lessonId}.mp4`;
}

export function getIntroVideoUrl(moduleId: number): string {
  return `${VIDEOS_BASE}/intro-${moduleId}.mp4`;
}

export function getProblemVideoUrl(problemId: string): string {
  return `${VIDEOS_BASE}/problems/${problemId}.mp4`;
}

export function getPdfUrl(lessonId: string): string {
  const encoded = encodeURIComponent(`${PDF_BASE}/${lessonId}.pdf`);
  return `${PDF_VIEWER}?file=${encoded}`;
}

export function getDirectPdfUrl(lessonId: string): string {
  return `${PDF_BASE}/${lessonId}.pdf`;
}

// Data query helpers
export function getModuleById(moduleId: number): Module | undefined {
  return courseData.modules.find((m) => m.id === moduleId);
}

export function getLessonById(lessonId: string): { lesson: Lesson; module: Module } | undefined {
  for (const module of courseData.modules) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, module };
  }
  return undefined;
}

export function getAdjacentLessons(lessonId: string): {
  prev: Lesson | null;
  next: Lesson | null;
} {
  const allLessons = courseData.modules.flatMap((m) => m.lessons);
  const idx = allLessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? allLessons[idx - 1] : null,
    next: idx < allLessons.length - 1 ? allLessons[idx + 1] : null,
  };
}

export function getTotalLessons(): number {
  return courseData.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

export function getProblemById(problemId: string): Problem | undefined {
  return courseData.problems.find((p) => p.id === problemId);
}

export function getAdjacentProblems(problemId: string): { prev: Problem | null; next: Problem | null } {
  const problems = courseData.problems;
  const idx = problems.findIndex((p) => p.id === problemId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? problems[idx - 1] : null,
    next: idx < problems.length - 1 ? problems[idx + 1] : null,
  };
}

// Course data
export const courseData: CourseData = {
  modules: [
    {
      id: 1,
      title: 'Основы архитектуры и системного проектирования',
      color: '#7c83ff',
      lessons: [
        { id: '1-1', title: 'Архитектура и системное проектирование', hasVideo: true, hasPdf: true },
        { id: '1-2', title: 'Архитектурные представления', hasVideo: true, hasPdf: true },
        { id: '1-3', title: 'Границы декомпозиции', hasVideo: true, hasPdf: true },
        { id: '1-4', title: 'Компромиссы в архитектуре программного обеспечения', hasVideo: true, hasPdf: true },
        { id: '1-5', title: 'Эволюция и управление изменениями в системной архитектуре', hasVideo: true, hasPdf: true },
        { id: '1-6', title: 'Инжиниринг требований', hasVideo: true, hasPdf: true },
        { id: '1-7', title: 'Атрибуты качества и ограничения', hasVideo: true, hasPdf: true },
        { id: '1-8', title: 'Модели коммуникации', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 2,
      title: 'Современные архитектурные стили и шаблоны',
      color: '#a855f7',
      lessons: [
        { id: '2-1', title: 'Доменно-ориентированное проектирование', hasVideo: true, hasPdf: true },
        { id: '2-4', title: 'Современные архитектурные стили', hasVideo: true, hasPdf: true },
        { id: '2-5', title: 'Модульные монолиты', hasVideo: true, hasPdf: true },
        { id: '2-6', title: 'От монолитных систем к микросервисам', hasVideo: true, hasPdf: true },
        { id: '2-7', title: 'Событийно-ориентированная архитектура', hasVideo: true, hasPdf: true },
        { id: '2-8', title: 'Реактивная архитектура', hasVideo: true, hasPdf: true },
        { id: '2-9', title: 'Архитектура serverless вычислений', hasVideo: true, hasPdf: true },
        { id: '2-10', title: 'Архитектура Multi-Tenancy', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 3,
      title: 'Сети и коммуникации',
      color: '#22d3ee',
      lessons: [
        { id: '3-1', title: 'Протоколы и модель OSI', hasVideo: true, hasPdf: true },
        { id: '3-2', title: 'Сетевые компоненты для распределенных систем', hasVideo: true, hasPdf: true },
        { id: '3-3', title: 'Service Mesh', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 4,
      title: 'Основы распределённых систем',
      color: '#f59e0b',
      lessons: [
        { id: '4-1', title: 'Обзор распределенных систем', hasVideo: true, hasPdf: true },
        { id: '4-2', title: 'Шардинг и репликация', hasVideo: true, hasPdf: true },
        { id: '4-3', title: 'CAP и PACELC', hasVideo: true, hasPdf: true },
        { id: '4-4', title: 'Масштабируемость баз данных и модели данных', hasVideo: true, hasPdf: true },
        { id: '4-5', title: 'Распределенный консенсус', hasVideo: true, hasPdf: true },
        { id: '4-6', title: 'Иерархия ресурсов AWS', hasVideo: true, hasPdf: true },
        { id: '4-7', title: 'Архитектура данных и ETL для облачных SaaS', hasVideo: true, hasPdf: true },
        { id: '4-8', title: 'Архитектура Kubernetes: основы', hasVideo: false, hasPdf: true },
        { id: '4-9', title: 'Иерархия ресурсов Kubernetes', hasVideo: false, hasPdf: true },
        { id: '4-10', title: 'Сети Kubernetes', hasVideo: false, hasPdf: true },
      ],
    },
    {
      id: 5,
      title: 'Хранение и обработка данных',
      color: '#10b981',
      lessons: [
        { id: '5-1', title: 'Масштабируемость баз данных: критерии выбора', hasVideo: true, hasPdf: true },
        { id: '5-2', title: 'ACID vs BASE', hasVideo: true, hasPdf: true },
        { id: '5-3', title: 'Уровни изоляции транзакций', hasVideo: true, hasPdf: true },
        { id: '5-4', title: 'Распределенные системы поиска', hasVideo: true, hasPdf: true },
        { id: '5-5', title: 'От очередей сообщений к глобальным потокам', hasVideo: true, hasPdf: true },
        { id: '5-6', title: 'Семантика "точно один раз"', hasVideo: true, hasPdf: true },
        { id: '5-7', title: 'Обработка больших данных', hasVideo: true, hasPdf: true },
        { id: '5-8', title: 'Kafka Deep Dive', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 6,
      title: 'Отказоустойчивость и observability',
      color: '#f43f5e',
      lessons: [
        { id: '6-1', title: 'Избыточность в распределенных системах', hasVideo: true, hasPdf: true },
        { id: '6-2', title: 'Rate Limiting', hasVideo: true, hasPdf: true },
        { id: '6-3', title: 'Паттерн Circuit Breaker', hasVideo: true, hasPdf: true },
        { id: '6-4', title: 'Паттерн Bulkhead', hasVideo: true, hasPdf: true },
        { id: '6-5', title: 'Паттерн Transactional Outbox', hasVideo: true, hasPdf: true },
        { id: '6-6', title: 'FinOps в System Design', hasVideo: true, hasPdf: true },
        { id: '6-7', title: 'Observability и SRE', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 7,
      title: 'Безопасность и защита данных',
      color: '#f97316',
      lessons: [
        { id: '7-1', title: 'Аутентификация, авторизация и безопасность', hasVideo: true, hasPdf: true },
        { id: '7-3', title: 'Защита данных в состоянии покоя и при передаче', hasVideo: true, hasPdf: true },
      ],
    },
  ],
  problems: [
    { id: 'airbnb', title: 'Проектирование Airbnb' },
    { id: 'messenger', title: 'Проектирование мессенджера' },
    { id: 'notification_service', title: 'Сервис уведомлений' },
    { id: 'url_shortener', title: 'Сокращатель URL' },
    { id: 'approach', title: 'Подход к решению задач' },
  ],
};
