import QuestionsList from "./questions-list";
import { getQuestionsPage } from "@/lib/questions";
import PollCreator from "./poll-creator";
import PollsWidget from "./polls-widget";

// Render on every request (don't cache/prerender) so new questions show up.
export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

// Server component — runs only on the server, awaits the data, renders to HTML.
export default async function Page() {
  const { questions, hasMore } = await getQuestionsPage(0, PAGE_SIZE);

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* soft animated glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-10 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-sky-400/20 blur-3xl" />
      </div>

      {/* content */}
      <div className="relative mx-auto w-full max-w-2xl px-5 py-10 space-y-8">
        {/* header glass effect */}
        <header className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-5 shadow-sm">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            Live now
          </span>

          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Live Q&A
          </h1>

          <p className="mt-1.5 text-sm text-gray-600">
            Ask a question, upvote the ones you want answered.
          </p>
        </header>

        {/* Poll Creation */}
        <section className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-5 shadow-sm">
          <PollCreator />
        </section>

        {/* Active Polls */}
        <section className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-5 shadow-sm">
          <PollsWidget />
        </section>

        {/* Questions */}
        <QuestionsList
          initialQuestions={questions}
          initialHasMore={hasMore}
        />
      </div>
    </main>
  );
}