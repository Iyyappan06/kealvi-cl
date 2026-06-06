"use client";
import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

type Question = {
  id: string;
  body: string;
  author: string | null;
  upvotes: number | string | null;
  downvotes: number | string | null;
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

  // ✅ vote tracking (one vote per type)
  const [voted, setVoted] = useState<
    Record<string, "up" | "down" | null>
  >({});

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // safe number helper
  function normalize(n: any) {
    return Number(n ?? 0) || 0;
  }

  // SEARCH
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

    return () => clearTimeout(id);
  }, [query]);

  // CREATE QUESTION
  async function submit() {
    if (!draft.trim()) return;

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });

    const created = await res.json();

    setQuestions((qs) => [
      {
        ...created,
        upvotes: 0,
        downvotes: 0,
      },
      ...qs,
    ]);

    setDraft("");
  }

  // UPVOTE (ONE TIME ONLY)
  async function upvote(id: string) {
    if (voted[id] === "up") return;

    setVoted((prev) => ({ ...prev, [id]: "up" }));

    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id
          ? { ...q, upvotes: normalize(q.upvotes) + 1 }
          : q
      )
    );

    const res = await fetch(`/api/questions/${id}/upvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: getVoterId() }),
    });

    if (!res.ok) {
      setVoted((prev) => ({ ...prev, [id]: null }));

      setQuestions((qs) =>
        qs.map((q) =>
          q.id === id
            ? { ...q, upvotes: normalize(q.upvotes) - 1 }
            : q
        )
      );
    }
  }

  // DOWNVOTE (ONE TIME ONLY)
  async function downvote(id: string) {
    if (voted[id] === "down") return;

    setVoted((prev) => ({ ...prev, [id]: "down" }));

    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id
          ? { ...q, downvotes: normalize(q.downvotes) + 1 }
          : q
      )
    );

    const res = await fetch(`/api/questions/${id}/downvote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: getVoterId() }),
    });

    if (!res.ok) {
      setVoted((prev) => ({ ...prev, [id]: null }));

      setQuestions((qs) =>
        qs.map((q) =>
          q.id === id
            ? { ...q, downvotes: normalize(q.downvotes) - 1 }
            : q
        )
      );
    }
  }

  // LOAD MORE
  async function loadMore() {
    setLoading(true);

    const res = await fetch(
      `/api/questions?offset=${questions.length}`
    );

    const data = await res.json();

    setQuestions((qs) => [...qs, ...data.questions]);
    setHasMore(data.hasMore);

    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* ASK BOX */}
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
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-strong"
          >
            Ask
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="w-full flex-1 rounded-xl border bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-brand"
        />
        <span className="text-xs text-muted">
          {hydrated ? "Interactive ✓" : "Loading…"}
        </span>
      </div>

      {/* QUESTIONS */}
      <ul className="space-y-3">
        {questions.map((q) => (
          <li
            key={q.id}
            className="flex items-start gap-3 border border-indigo-100 bg-indigo-50/40 p-4 rounded-2xl shadow-sm hover:shadow-md transition"
          >
            {/* VOTE BOX */}
            <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-indigo-100 bg-white/80 px-3 py-2">

              {/* UP */}
              <button
                onClick={() => upvote(q.id)}
                disabled={voted[q.id] === "up"}
                className={`text-xs leading-none ${
                  voted[q.id] === "up"
                    ? "text-indigo-900 font-bold"
                    : "text-indigo-600"
                }`}
              >
                ▲
              </button>

              {/* SCORE */}
              <span className="text-sm font-bold text-gray-800 tabular-nums leading-none">
                {normalize(q.upvotes) - normalize(q.downvotes)}
              </span>

              {/* DOWN */}
              <button
                onClick={() => downvote(q.id)}
                disabled={voted[q.id] === "down"}
                className={`text-xs leading-none ${
                  voted[q.id] === "down"
                    ? "text-red-900 font-bold"
                    : "text-red-500"
                }`}
              >
                ▼
              </button>
            </div>

            {/* QUESTION */}
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="leading-snug">{q.body}</p>
              {q.author && (
                <p className="mt-1.5 text-xs text-muted">{q.author}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* EMPTY */}
      {questions.length === 0 && (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted">
          No questions yet — be the first to ask.
        </p>
      )}

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-xl border bg-surface px-5 py-2.5 text-sm font-medium hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}