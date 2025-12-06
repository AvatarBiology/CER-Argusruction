import { Context, Request } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GOOGLE_API_KEY;

// 使用純 JSON 物件定義 Schema，避免 SDK 引用錯誤
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    overall_score: { type: "INTEGER", description: "0-100 score" },
    overall_comment: { type: "STRING", description: "Short summary comment" },
    claim_score: { type: "INTEGER", description: "0-100 score for claim" },
    claim_feedback: { type: "STRING", description: "Feedback for claim" },
    evidence_score: { type: "INTEGER", description: "0-100 score for evidence" },
    evidence_feedback: { type: "STRING", description: "Feedback for evidence" },
    reasoning_score: { type: "INTEGER", description: "0-100 score for reasoning" },
    reasoning_feedback: { type: "STRING", description: "Feedback for reasoning" },
    achievement_badge: { type: "STRING", description: "Award badge name based on score" },
  },
  required: [
    "overall_score", "overall_comment", "claim_score", "claim_feedback",
    "evidence_score", "evidence_feedback", "reasoning_score", "reasoning_feedback", "achievement_badge",
  ],
};

const SYSTEM_INSTRUCTION = `
你是一位專業的高中生物科教師，同時也是科學論證 (CER) 的專家。你的任務是批改學生提交的科學論證作業。
請務必嚴格但具引導性。請使用繁體中文 (Traditional Chinese, Taiwan) 回覆。
`;

export default async (req: Request, context: Context) => {
  // 1. 允許 CORS (避免跨域錯誤)
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
    console.error("Critical: GOOGLE_API_KEY is missing.");
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

    // 確保 Key 沒有多餘空白
    const cleanKey = API_KEY.trim();
    const ai = new GoogleGenAI({ apiKey: cleanKey });

    // 改用 gemini-1.5-flash (速度較快，避免 Netlify 10秒超時)
    const response = await ai.models.generateContent({
        model: "gemini-1.5-flash", 
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
        },
    });

    const text = response.text;
    if (!text) throw new Error("AI response was empty");

    return new Response(text, {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      status: 200,
    });

  } catch (error: any) {
    // 這裡會將詳細錯誤印在 Netlify 後台 Log，方便除錯
    console.error("Gemini API Error:", error);
    
    // 回傳具體錯誤給前端 (雖然前端目前會統一顯示錯誤，但在瀏覽器 Console 可以看到)
    return new Response(JSON.stringify({ 
        error: "Failed to process request", 
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
