import { NextResponse } from "next/server";
import {
  getActivePolls,
  createPoll,
} from "@/lib/polls";

export async function GET() {
  const polls = await getActivePolls();

  return NextResponse.json(polls);
}

export async function POST(req: Request) {
  const body = await req.json();

  const poll = await createPoll(
    body.question,
    body.options
  );

  return NextResponse.json(poll);
}