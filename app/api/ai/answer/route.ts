import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Answer this question clearly and concisely:

${question}`,
    });

    return NextResponse.json({
      answer: response.text,
    });
  } catch (error: any) {
    console.error("Gemini Error:", error);

    if (error?.status === 503) {
      return NextResponse.json(
        {
          error:
            "Gemini is currently experiencing high demand. Please try again in a few seconds.",
        },
        { status: 503 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        {
          error:
            "Gemini API quota exceeded. Please check your Google AI Studio quota or try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: error?.message || "Failed to generate answer",
      },
      {
        status: 500,
      }
    );
  }
}