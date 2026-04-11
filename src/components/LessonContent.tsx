import { useState, useEffect } from 'react';
import { type Lesson, type Module, getVideoUrl, getPdfUrl, getAdjacentLessons } from '../data/course';
import { isCompleted, toggleCompleted, isBookmarked, toggleBookmark, getNote, setNote } from '../lib/storage';
import Quiz from './Quiz';
import quizData from '../data/quizzes.json';

interface Props {
  lesson: Lesson;
  module: Module;
}

type Tab = 'video' | 'pdf' | 'notes' | 'quiz';

function hasQuiz(lessonId: string): boolean {
  const moduleId = lessonId.split('-')[0];
  const data = quizData as Record<string, Record<string, unknown>>;
  return !!(data[moduleId]?.[lessonId]);
}

export default function LessonContent({ lesson, module }: Props) {
  const defaultTab: Tab = lesson.hasVideo ? 'video' : 'pdf';

  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [adjacent, setAdjacent] = useState<ReturnType<typeof getAdjacentLessons>>({ prev: null, next: null });

  useEffect(() => {
    setCompleted(isCompleted(lesson.id));
    setBookmarked(isBookmarked(lesson.id));
    setNoteText(getNote(lesson.id));
    setAdjacent(getAdjacentLessons(lesson.id));
  }, [lesson.id]);

  function handleToggleCompleted() {
    const next = toggleCompleted(lesson.id);
    setCompleted(next);
  }

  function handleToggleBookmark() {
    const next = toggleBookmark(lesson.id);
    setBookmarked(next);
  }

  function handleNoteChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    setNoteText(text);
    setNote(lesson.id, text);
  }

  const tabs: { key: Tab; label: string }[] = [
    ...(lesson.hasVideo ? [{ key: 'video' as Tab, label: 'Видео' }] : []),
    ...(lesson.hasPdf ? [{ key: 'pdf' as Tab, label: 'PDF' }] : []),
    { key: 'notes', label: 'Заметки' },
    ...(hasQuiz(lesson.id) ? [{ key: 'quiz' as Tab, label: '🧠 Квиз' }] : []),
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={
              activeTab === tab.key
                ? 'px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 border-border bg-bg-secondary text-accent-indigo'
                : 'px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors'
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-b-lg rounded-tr-lg border border-border bg-bg-secondary p-4">
        {activeTab === 'video' && lesson.hasVideo && (
          <video
            className="w-full rounded-lg"
            controls
            preload="metadata"
            src={getVideoUrl(lesson.id)}
          />
        )}

        {activeTab === 'pdf' && lesson.hasPdf && (
          <iframe
            className="w-full rounded-lg"
            style={{ aspectRatio: '4/3' }}
            src={getPdfUrl(lesson.id)}
          />
        )}

        {activeTab === 'notes' && (
          <textarea
            className="w-full min-h-[200px] bg-bg-primary text-text-primary rounded-lg border border-border p-3 text-sm resize-y focus:outline-none focus:border-accent-indigo"
            placeholder="Ваши заметки к уроку..."
            value={noteText}
            onChange={handleNoteChange}
          />
        )}

        {activeTab === 'quiz' && (
          <Quiz lessonId={lesson.id} />
        )}
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        {/* Complete button */}
        <button
          onClick={handleToggleCompleted}
          className={
            completed
              ? 'px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors'
              : 'px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 transition-all'
          }
        >
          {completed ? '✓ Пройден' : '✓ Отметить пройденным'}
        </button>

        {/* Bookmark button */}
        <button
          onClick={handleToggleBookmark}
          className={
            bookmarked
              ? 'px-4 py-2 text-sm font-semibold rounded-lg border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors'
              : 'px-4 py-2 text-sm font-semibold rounded-lg border border-border text-text-muted hover:border-text-primary hover:text-text-primary transition-colors'
          }
        >
          {bookmarked ? '★ В закладках' : '☆ Закладка'}
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Prev / Next */}
        <div className="flex items-center gap-4 text-sm text-text-muted">
          {adjacent.prev && (
            <a
              href={`/lesson/${adjacent.prev.id}`}
              className="hover:text-text-primary transition-colors"
            >
              ← {adjacent.prev.title}
            </a>
          )}
          {adjacent.next && (
            <a
              href={`/lesson/${adjacent.next.id}`}
              className="hover:text-text-primary transition-colors"
            >
              {adjacent.next.title} →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
