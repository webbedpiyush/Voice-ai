import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const req = await request.json();
    const base64audio = req.audio;
    const audio = Buffer.from(base64audio, "base64");
    // console.log(audio);
    console.log(process.env.OPENAI_API_KEY);

    const text = await convertAudioToText(audio);
    console.log(text);

    return NextResponse.json({ result: text }, { status: 200 });
  } catch (error) {
    return handleErrorResponse(error);
  }
}

async function convertAudioToText(audioData: Buffer) {
  const outputPath = "/tmp/input.webm";
  fs.writeFileSync(outputPath, audioData);

  try {
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(outputPath),
      model: "whisper-1",
    });

    console.log(response.text);
    return response.text;
  } catch (err) {
    console.log("this is the error");
  } finally {
    fs.unlinkSync(outputPath);
  }
}

function handleErrorResponse(error: any): NextResponse {
  if (error.response) {
    console.error(error.response.status, error.response.data);
    return NextResponse.json({ error: error.response.data }, { status: 500 });
  } else {
    console.error(`Error with openai api request: ${error.message}`);
    return NextResponse.json({ error: "a error has occured" }, { status: 500 });
  }
}
