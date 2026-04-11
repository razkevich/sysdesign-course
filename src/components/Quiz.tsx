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
  lessonId: string;
}

const STORAGE_PREFIX = 'sysdesign:quiz:';

function getQuestions(lessonId: string): Question[] | null {
  const moduleId = lessonId.split('-')[0];
  const data = quizData as Record<string, Record<string, Question[]>>;
  return data[moduleId]?.[lessonId] ?? null;
}

function getBestScore(lessonId: string): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + lessonId);
    return raw !== null ? Number(raw) : null;
  } catch {
    return null;
  }
}

function saveBestScore(lessonId: string, score: number) {
  try {
    const current = getBestScore(lessonId);
    if (current === null || score > current) {
      localStorage.setItem(STORAGE_PREFIX + lessonId, String(score));
    }
  } catch {
    // ignore
  }
}

export default function Quiz({ lessonId }: Props) {
  const questions = getQuestions(lessonId);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [scores, setScores] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  useEffect(() => {
    setBestScore(getBestScore(lessonId));
  }, [lessonId]);

  if (!questions || questions.length === 0) {
    return null;
  }

  const total = questions.length;
  const question = questions[current];
  const correctIndex = question.answers.findIndex((a) => a.correct);

  function handleSelect(index: number) {
    if (checked) return;
    setSelected(index);
  }

  function handleCheck() {
    if (selected === null) return;
    setChecked(true);
  }

  function handleNext() {
    const isCorrect = selected === correctIndex;
    const newScores = [...scores, isCorrect];

    if (current + 1 >= total) {
      const finalScore = newScores.filter(Boolean).length;
      saveBestScore(lessonId, finalScore);
      setBestScore(getBestScore(lessonId));
      setScores(newScores);
      setFinished(true);
    } else {
      setScores(newScores);
      setCurrent(current + 1);
      setSelected(null);
      setChecked(false);
    }
  }

  function handleRestart() {
    setCurrent(0);
    setSelected(null);
    setChecked(false);
    setScores([]);
    setFinished(false);
  }

  if (finished) {
    const finalScore = scores.filter(Boolean).length;
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
        <h3 className="text-lg font-semibold text-text-primary mb-4">Квиз завершён</h3>
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

  const progressPct = Math.round((current / total) * 100);

  return (
    <div className="rounded-xl border border-border bg-bg-secondary/30 p-6">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-muted">
            Вопрос {current + 1} из {total}
          </span>
          {bestScore !== null && (
            <span className="text-xs text-text-muted">Лучший: {bestScore}/{total}</span>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-accent-indigo transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
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

      {/* Actions */}
      <div className="flex gap-2">
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selected === null}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Проверить
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 transition-all"
          >
            {current + 1 >= total ? 'Завершить' : 'Следующий вопрос →'}
          </button>
        )}
      </div>
    </div>
  );
}
