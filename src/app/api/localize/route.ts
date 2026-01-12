import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { MEME_LOCALIZER_PROMPT, IMAGE_MEME_LOCALIZER_PROMPT } from "@/lib/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { koreanText, imageData } = await request.json();

    if (!koreanText && !imageData) {
      return NextResponse.json(
        { error: "Korean text or image is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    let result;

    if (imageData) {
      // Handle image input
      // Extract base64 data from data URL
      const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!base64Match) {
        return NextResponse.json(
          { error: "Invalid image format" },
          { status: 400 }
        );
      }

      const mimeType = `image/${base64Match[1]}`;
      const base64Data = base64Match[2];

      result = await model.generateContent([
        IMAGE_MEME_LOCALIZER_PROMPT,
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
      ]);
    } else {
      // Handle text input
      result = await model.generateContent([
        MEME_LOCALIZER_PROMPT,
        `\n\nLocalize this Korean ad copy for US audiences:\n\n${koreanText}`,
      ]);
    }

    const response = result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 }
    );
  }
}
