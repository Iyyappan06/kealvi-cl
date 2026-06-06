"use client";
import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

type Question = {
  id: string;
  body: string;
  author: string | null;
  upvotes: number;
  downvotes: number;
};

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // Debounced search: wait 300ms after typing stops; each keystroke cancels
  // the previous timer, so "deploying" fires one request, not nine.
  useEffect(() => {
    const id = setTimeout(async () => {
      const url = query
        ? `/api/questions?q=${encodeURIComponent(query)}`
        : `/api/questions`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data.questions);
      setHasMore(data.hasMore);
    }, 300);

    return () => clearTimeout(id); // cancel the pending timer on each keystroke
  }, [query]);

  async function submit() {
    if (!draft.trim()) return;

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });
    const created = await res.json();

    setQuestions((qs) => [{ ...created, votes: 0 }, ...qs]);
    setDraft("");
  }

  async function upvote(id: string) {
  // optimistic UI update
  setQuestions((qs) =>
    qs.map((q) =>
      q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q
    )
  );

  await fetch(`/api/questions/${id}/upvote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voterId: getVoterId() }),
  });
}

async function downvote(id: string) {
  setQuestions((qs) =>
    qs.map((q) =>
      q.id === id ? { ...q, downvotes: q.downvotes + 1 } : q
    )
  );

  await fetch(`/api/questions/${id}/downvote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voterId: getVoterId() }),
  });
}

  async function loadMore() {
    setLoading(true);
    const res = await fetch(`/api/questions?offset=${questions.length}`);
    const data = await res.json();
    setQuestions((qs) => [...qs, ...data.questions]);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* Ask box */}
      <div className="rounded-2xl border bg-surface p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ask a question…"
            className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-brand"
          />
          <button
            onClick={submit}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
          >
            Ask
          </button>
        </div>
      </div>

      {/* Search + hydration status */}
      <div className="flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="w-full flex-1 rounded-xl border bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-brand"
        />
        <span className="shrink-0 text-xs text-muted">
          {hydrated ? "Interactive ✓" : "Loading interactivity…"}
        </span>
      </div>

      {/* Questions */}
      <ul className="space-y-3">
        {questions.map((q) => (
          <li
              key={q.id}
              className="flex items-start gap-3 border border-indigo-100 bg-indigo-50/40 p-4 rounded-2xl shadow-sm hover:shadow-md transition"
    >
            <div className="flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-indigo-100 bg-white/80 px-3 py-2">

  {/* Upvote */}
  <button
    onClick={() => upvote(q.id)}
    className="text-indigo-600 hover:text-indigo-800 text-xs leading-none"
  >
    ▲
  </button>

  {/* Score */}
  <span className="text-sm font-bold text-gray-800 tabular-nums leading-none">
  {(q.upvotes ?? 0) - (q.downvotes ?? 0)}
</span>

  {/* Downvote */}
  <button
    onClick={() => downvote(q.id)}
    className="text-red-500 hover:text-red-700 text-xs leading-none"
  >
    ▼
  </button>

</div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="leading-snug">{q.body}</p>
              {q.author && (
                <p className="mt-1.5 text-xs text-muted">{q.author}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {questions.length === 0 && (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted">
          No questions yet — be the first to ask.
        </p>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-xl border bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
