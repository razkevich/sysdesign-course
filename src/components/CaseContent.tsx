import { useState, useEffect } from 'react';
import { type Problem, getProblemVideoUrl, getAdjacentProblems } from '../data/course';
import { isBookmarked, toggleBookmark } from '../lib/storage';

interface Props {
  problem: Problem;
}

export default function CaseContent({ problem }: Props) {
  const [bookmarked, setBookmarked] = useState(false);
  const [adjacent, setAdjacent] = useState<ReturnType<typeof getAdjacentProblems>>({ prev: null, next: null });

  useEffect(() => {
    setBookmarked(isBookmarked(`case-${problem.id}`));
    setAdjacent(getAdjacentProblems(problem.id));
  }, [problem.id]);

  function handleToggleBookmark() {
    const next = toggleBookmark(`case-${problem.id}`);
    setBookmarked(next);
  }

  return (
    <div>
      {/* Video container */}
      <div className="mt-6 rounded-lg border border-border bg-bg-secondary p-4">
        <video
          className="w-full rounded-lg"
          controls
          preload="metadata"
          src={getProblemVideoUrl(problem.id)}
        />
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-3 mt-4 flex-wrap">
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
              href={`/case/${adjacent.prev.id}`}
              className="hover:text-text-primary transition-colors"
            >
              ← {adjacent.prev.title}
            </a>
          )}
          {adjacent.next && (
            <a
              href={`/case/${adjacent.next.id}`}
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
