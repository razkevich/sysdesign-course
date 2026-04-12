import { useState, useEffect } from 'react';
import quizData from '../data/quizzes.json';

interface Answer {
  text: string;
  correct: boolean;
}

interface Question {
  question: string;
  type: string;
  answers: Answer[];
}

interface Props {
  moduleId: number;
}

const SCORE_PREFIX = 'sysdesign:quiz:module-';
const PROGRESS_PREFIX = 'sysdesign:quiz:progress-';

interface QuizProgress {
  current: number;
  // answers[i] = selected answer index for question i, or null if unanswered
  answers: (number | null)[];
  checked: boolean; // whether current question has been checked
}

function getQuestions(moduleId: number): Question[] | null {
  const data = quizData as Record<string, Question[]>;
  return data[String(moduleId)] ?? null;
}

function getBestScore(moduleId: number): number | null {
  try {
    const raw = localStorage.getItem(SCORE_PREFIX + moduleId);
    return raw !== null ? Number(raw) : null;
  } catch {
    return null;
  }
}

function saveBestScore(moduleId: number, score: number) {
  try {
    const current = getBestScore(moduleId);
    if (current === null || score > current) {
      localStorage.setItem(SCORE_PREFIX + moduleId, String(score));
    }
  } catch {}
}

function getProgress(moduleId: number): QuizProgress | null {
  try {
    const raw = localStorage.getItem(PROGRESS_PREFIX + moduleId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProgressToStorage(moduleId: number, progress: QuizProgress) {
  try {
    localStorage.setItem(PROGRESS_PREFIX + moduleId, JSON.stringify(progress));
  } catch {}
}

function clearProgress(moduleId: number) {
  try {
    localStorage.removeItem(PROGRESS_PREFIX + moduleId);
  } catch {}
}

export default function Quiz({ moduleId }: Props) {
  const questions = getQuestions(moduleId);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  // answers[i] = selected answer index for question i
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    setBestScore(getBestScore(moduleId));
    const saved = getProgress(moduleId);
    if (saved && questions && saved.current < questions.length) {
      setCurrent(saved.current);
      setAnswers(saved.answers);
      setSelected(saved.answers[saved.current] ?? null);
      setChecked(saved.checked);
    } else if (questions) {
      setAnswers(new Array(questions.length).fill(null));
    }
  }, [moduleId]);

  if (!questions || questions.length === 0) {
    return null;
  }

  const total = questions.length;
  const question = questions[current];
  const correctIndex = question.answers.findIndex((a) => a.correct);
  const isAnswered = answers[current] !== null && answers[current] !== undefined;
  const answeredCount = answers.filter((a) => a !== null).length;

  function persist(cur: number, ans: (number | null)[], sel: number | null, chk: boolean) {
    saveProgressToStorage(moduleId, { current: cur, answers: ans, checked: chk });
  }

  function handleSelect(index: number) {
    if (checked) return;
    setSelected(index);
    const newAnswers = [...answers];
    newAnswers[current] = index;
    setAnswers(newAnswers);
    persist(current, newAnswers, index, false);
  }

  function handleCheck() {
    if (selected === null) return;
    setChecked(true);
    persist(current, answers, selected, true);
  }

  function goTo(index: number) {
    if (index < 0 || index >= total) return;
    setCurrent(index);
    setSelected(answers[index] ?? null);
    // If this question was already answered, show it as checked
    setChecked(answers[index] !== null);
    persist(index, answers, answers[index] ?? null, answers[index] !== null);
  }

  function handleFinish() {
    const score = questions.reduce((acc, q, i) => {
      const ci = q.answers.findIndex((a) => a.correct);
      return acc + (answers[i] === ci ? 1 : 0);
    }, 0);
    saveBestScore(moduleId, score);
    setBestScore(getBestScore(moduleId));
    setFinished(true);
    clearProgress(moduleId);
  }

  function handleRestart() {
    setCurrent(0);
    setSelected(null);
    setChecked(false);
    setAnswers(new Array(total).fill(null));
    setFinished(false);
    clearProgress(moduleId);
  }

  if (finished) {
    const finalScore = questions.reduce((acc, q, i) => {
      const ci = q.answers.findIndex((a) => a.correct);
      return acc + (answers[i] === ci ? 1 : 0);
    }, 0);
    const pct = Math.round((finalScore / total) * 100);
    const colorClass =
      pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400';
    const bgClass =
      pct >= 70
        ? 'border-green-500 bg-green-500/10'
        : pct >= 50
        ? 'border-yellow-500 bg-yellow-500/10'
        : 'border-red-500 bg-red-500/10';

    return (
      <div className="rounded-xl border border-border bg-bg-secondary/30 p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Тест завершён</h3>
        <div className={`rounded-lg border p-4 mb-4 ${bgClass}`}>
          <p className={`text-2xl font-bold ${colorClass}`}>
            Результат: {finalScore} из {total}
          </p>
          <p className={`text-sm mt-1 ${colorClass}`}>{pct}% правильных ответов</p>
        </div>
        {bestScore !== null && (
          <p className="text-sm text-text-muted mb-4">
            Лучший результат: {bestScore} из {total}
          </p>
        )}
        <button
          onClick={handleRestart}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 transition-all"
        >
          Пройти заново
        </button>
      </div>
    );
  }

  const progressPct = Math.round((answeredCount / total) * 100);

  return (
    <div className="rounded-xl border border-border bg-bg-secondary/30 p-6">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-muted">
            Вопрос {current + 1} из {total}
          </span>
          <span className="text-xs text-text-muted">
            {answeredCount}/{total} отвечено
            {bestScore !== null && ` · Лучший: ${bestScore}/${total}`}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-accent-indigo transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question dots — clickable mini-nav */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {questions.map((_, i) => {
          const isActive = i === current;
          const wasAnswered = answers[i] !== null;
          const wasCorrect = wasAnswered && answers[i] === questions[i].answers.findIndex((a) => a.correct);
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-7 h-7 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'ring-2 ring-accent-indigo ring-offset-1 ring-offset-bg-secondary'
                  : ''
              } ${
                wasAnswered
                  ? wasCorrect
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                  : 'bg-bg-secondary text-text-muted hover:bg-white/10'
              }`}
              title={`Вопрос ${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Question */}
      <p className="text-text-primary font-medium mb-4 leading-relaxed">
        {question.question}
      </p>

      {/* Answers */}
      <ul className="space-y-2 mb-4">
        {question.answers.map((answer, i) => {
          let borderClass = 'border-border';
          let bgClass = '';

          if (checked) {
            if (i === correctIndex) {
              borderClass = 'border-green-500';
              bgClass = 'bg-green-500/10';
            } else if (i === selected && selected !== correctIndex) {
              borderClass = 'border-red-500';
              bgClass = 'bg-red-500/10';
            }
          } else if (i === selected) {
            borderClass = 'border-accent-indigo';
            bgClass = 'bg-accent-indigo/10';
          }

          return (
            <li key={i}>
              <button
                onClick={() => handleSelect(i)}
                className={`w-full text-left rounded-lg border ${borderClass} ${bgClass} p-3 text-sm text-text-primary transition-colors duration-150 ${
                  checked ? 'cursor-default' : 'hover:border-accent-indigo/60 cursor-pointer'
                }`}
              >
                {answer.text}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Navigation + actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => goTo(current - 1)}
          disabled={current === 0}
          className="px-3 py-2 text-sm rounded-lg border border-border text-text-muted hover:text-text-primary hover:border-text-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Назад
        </button>

        {!checked && selected !== null && (
          <button
            onClick={handleCheck}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 transition-all"
          >
            Проверить
          </button>
        )}

        {checked && current + 1 < total && (
          <button
            onClick={() => goTo(current + 1)}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 transition-all"
          >
            Следующий →
          </button>
        )}

        {checked && current + 1 >= total && answeredCount === total && (
          <button
            onClick={handleFinish}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 transition-all"
          >
            Завершить
          </button>
        )}

        <div className="flex-1" />

        {answeredCount === total && !checked && (
          <button
            onClick={handleFinish}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-accent-indigo text-accent-indigo hover:bg-accent-indigo/10 transition-colors"
          >
            Завершить тест
          </button>
        )}
      </div>
    </div>
  );
}
