import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const req = await request.json();
    const base64audio = req.audio;

    const cloudflareWorkerUrl = `${process.env.CF_URL}tts`;

    const response = await fetch(cloudflareWorkerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio: base64audio }),
    });

    if (!response.ok) {
      throw new Error(`Cloudflare Worker Error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Transcription Error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
