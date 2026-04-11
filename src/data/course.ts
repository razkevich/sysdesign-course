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

// Course data
export const courseData: CourseData = {
  modules: [
    {
      id: 1,
      title: 'Основы архитектуры и системного проектирования',
      color: '#7c83ff',
      lessons: [
        { id: '1-1', title: 'Введение в системное проектирование', hasVideo: true, hasPdf: true },
        { id: '1-2', title: 'Основные компоненты систем', hasVideo: true, hasPdf: true },
        { id: '1-3', title: 'Масштабируемость и производительность', hasVideo: true, hasPdf: true },
        { id: '1-4', title: 'Надёжность и доступность', hasVideo: true, hasPdf: true },
        { id: '1-5', title: 'Балансировка нагрузки', hasVideo: true, hasPdf: true },
        { id: '1-6', title: 'Кэширование', hasVideo: true, hasPdf: true },
        { id: '1-7', title: 'CDN и статические ресурсы', hasVideo: true, hasPdf: true },
        { id: '1-8', title: 'Проектирование API', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 2,
      title: 'Современные архитектурные стили и шаблоны',
      color: '#a855f7',
      lessons: [
        { id: '2-1', title: 'Монолит vs Микросервисы', hasVideo: true, hasPdf: true },
        { id: '2-4', title: 'Event-Driven Architecture', hasVideo: true, hasPdf: true },
        { id: '2-5', title: 'CQRS и Event Sourcing', hasVideo: true, hasPdf: true },
        { id: '2-6', title: 'Serverless и FaaS', hasVideo: true, hasPdf: true },
        { id: '2-7', title: 'Service Mesh', hasVideo: true, hasPdf: true },
        { id: '2-8', title: 'API Gateway', hasVideo: true, hasPdf: true },
        { id: '2-9', title: 'BFF — Backend for Frontend', hasVideo: true, hasPdf: true },
        { id: '2-10', title: 'Паттерны интеграции', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 3,
      title: 'Сети и коммуникации',
      color: '#22d3ee',
      lessons: [
        { id: '3-1', title: 'Основы сетевых протоколов', hasVideo: true, hasPdf: true },
        { id: '3-2', title: 'HTTP/2, HTTP/3 и WebSocket', hasVideo: true, hasPdf: true },
        { id: '3-3', title: 'gRPC и Protocol Buffers', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 4,
      title: 'Основы распределённых систем',
      color: '#f59e0b',
      lessons: [
        { id: '4-1', title: 'CAP-теорема', hasVideo: true, hasPdf: true },
        { id: '4-2', title: 'Консистентность данных', hasVideo: true, hasPdf: true },
        { id: '4-3', title: 'Распределённые транзакции', hasVideo: true, hasPdf: true },
        { id: '4-4', title: 'Алгоритмы консенсуса', hasVideo: true, hasPdf: true },
        { id: '4-5', title: 'Gossip протоколы', hasVideo: true, hasPdf: true },
        { id: '4-6', title: 'Векторные часы и причинность', hasVideo: true, hasPdf: true },
        { id: '4-7', title: 'Шардирование', hasVideo: true, hasPdf: true },
        { id: '4-8', title: 'Репликация данных', hasVideo: false, hasPdf: true },
        { id: '4-9', title: 'Партиционирование', hasVideo: false, hasPdf: true },
        { id: '4-10', title: 'Координация узлов', hasVideo: false, hasPdf: true },
      ],
    },
    {
      id: 5,
      title: 'Хранение и обработка данных',
      color: '#10b981',
      lessons: [
        { id: '5-1', title: 'Реляционные БД и SQL', hasVideo: true, hasPdf: true },
        { id: '5-2', title: 'NoSQL базы данных', hasVideo: true, hasPdf: true },
        { id: '5-3', title: 'NewSQL и распределённые БД', hasVideo: true, hasPdf: true },
        { id: '5-4', title: 'Очереди сообщений', hasVideo: true, hasPdf: true },
        { id: '5-5', title: 'Потоковая обработка данных', hasVideo: true, hasPdf: true },
        { id: '5-6', title: 'Поиск и индексирование', hasVideo: true, hasPdf: true },
        { id: '5-7', title: 'Data Warehouse и OLAP', hasVideo: true, hasPdf: true },
        { id: '5-8', title: 'Object Storage и файловые системы', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 6,
      title: 'Отказоустойчивость и observability',
      color: '#f43f5e',
      lessons: [
        { id: '6-1', title: 'Circuit Breaker и Retry', hasVideo: true, hasPdf: true },
        { id: '6-2', title: 'Rate Limiting и Throttling', hasVideo: true, hasPdf: true },
        { id: '6-3', title: 'Bulkhead и Isolation', hasVideo: true, hasPdf: true },
        { id: '6-4', title: 'Chaos Engineering', hasVideo: true, hasPdf: true },
        { id: '6-5', title: 'Мониторинг и метрики', hasVideo: true, hasPdf: true },
        { id: '6-6', title: 'Distributed Tracing', hasVideo: true, hasPdf: true },
        { id: '6-7', title: 'Логирование и алертинг', hasVideo: true, hasPdf: true },
      ],
    },
    {
      id: 7,
      title: 'Безопасность и защита данных',
      color: '#f97316',
      lessons: [
        { id: '7-1', title: 'Аутентификация и авторизация', hasVideo: true, hasPdf: true },
        { id: '7-3', title: 'Шифрование и защита данных', hasVideo: true, hasPdf: true },
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
