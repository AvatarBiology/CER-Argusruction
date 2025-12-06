import { Context, Request } from "@netlify/functions";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY;

const SYSTEM_INSTRUCTION = `
你是一位專業的高中生物科教師，同時也是科學論證 (CER) 的專家。你的任務是批改學生提交的科學論證作業。
請務必嚴格但具引導性。請使用繁體中文 (Traditional Chinese, Taiwan) 回覆。
`;

// 定義回傳格式 Schema
const schema = {
  type: SchemaType.OBJECT,
  properties: {
    overall_score: { type: SchemaType.INTEGER },
    overall_comment: { type: SchemaType.STRING },
    claim_score: { type: SchemaType.INTEGER },
    claim_feedback: { type: SchemaType.STRING },
    evidence_score: { type: SchemaType.INTEGER },
    evidence_feedback: { type: SchemaType.STRING },
    reasoning_score: { type: SchemaType.INTEGER },
    reasoning_feedback: { type: SchemaType.STRING },
    achievement_badge: { type: SchemaType.STRING },
  },
  required: [
    "overall_score", "overall_comment", "claim_score", "claim_feedback",
    "evidence_score", "evidence_feedback", "reasoning_score", "reasoning_feedback", "achievement_badge",
  ],
};

export default async (req: Request, context: Context) => {
  // 處理 CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!API_KEY) {
    console.error("Critical Error: GOOGLE_API_KEY is missing in environment variables.");
    return new Response(JSON.stringify({ error: "Server configuration error: API Key missing" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.json();
    const { topic, claim, evidence, reasoning } = body;

    const prompt = `
      探究主題: ${topic || '未指定'}
      學生的作業:
      1. 主張 (Claim): ${claim}
      2. 證據 (Evidence): ${evidence}
      3. 推理 (Reasoning): ${reasoning}
      請依照 CER 架構進行評分與回饋。
    `;

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return new Response(responseText, {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      status: 200,
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return new Response(JSON.stringify({ 
      error: "Analysis failed", 
      details: error.message 
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};



