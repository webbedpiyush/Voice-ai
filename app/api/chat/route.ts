import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    const cloudflareWorkerUrl = `${process.env.CF_URL}chat`;

    const response = await fetch(cloudflareWorkerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await response.text();
    return NextResponse.json({ content: data });
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve chat response" },
      { status: 500 }
    );
  }
}
