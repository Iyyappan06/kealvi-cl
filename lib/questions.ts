import { supabase } from "@/lib/supabase";

export async function getQuestionsPage(offset: number, limit: number) {
  const { data, error } = await supabase
    .from("questions")
    .select("*");

  console.log({ data, error });

  if (error) throw new Error(error.message);

const rows = (data ?? []).map((q) => ({
  id: String(q.id),
  body: q.body,
  author: q.author,
  upvotes: 0,
  downvotes: 0,
}));

  const hasMore = rows.length === limit;

  return { questions: rows, hasMore };
}

export async function searchQuestions(q: string, limit: number) {
  const { data, error } = await supabase
    .from("questions")
    .select("id, body, author, created_at, votes(count)")
    .textSearch("body", q, { type: "websearch", config: "english" })
    .limit(limit);

  if (error) throw new Error(error.message);

 return (data ?? []).map((row) => ({
  id: String(row.id),
  body: row.body,
  author: row.author,
  upvotes: row.votes?.[0]?.count ?? 0,
  downvotes: 0,
}));
