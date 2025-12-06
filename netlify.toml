import { Context, Request } from "@netlify/functions";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const API_KEY = process.env.GOOGLE_API_KEY;

// 定義與前端一致的 Schema
const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overall_score: { type: Type.INTEGER, description: "0-100 score" },
    overall_comment: { type: Type.STRING, description: "Short summary comment" },
    claim_score: { type: Type.INTEGER, description: "0-100 score for claim" },
    claim_feedback: { type: Type.STRING, description: "Feedback for claim" },
    evidence_score: { type: Type.INTEGER, description: "0-100 score for evidence" },
    evidence_feedback: { type: Type.STRING, description: "Feedback for evidence" },
    reasoning_score: { type: Type.INTEGER, description: "0-100 score for reasoning" },
    reasoning_feedback: { type: Type.STRING, description: "Feedback for reasoning" },
    achievement_badge: { type: Type.STRING, description: "Award badge name based on score" },
  },
  required: [
    "overall_score",
    "overall_comment",
    "claim_score",
    "claim_feedback",
    "evidence_score",
    "evidence_feedback",
    "reasoning_score",
    "reasoning_feedback",
    "achievement_badge",
  ],
};

const SYSTEM_INSTRUCTION = `
你是一位專業的高中生物科教師，同時也是科學論證 (CER) 的專家。你的任務是批改學生提交的科學論證作業。

評分標準 (Evaluation Rubric):
1. 主張 (Claim): 是否清晰？是否直接回答了探究問題？(佔 30%)
2. 證據 (Evidence): 是否包含具體的數據、觀察結果或引用來源？證據是否充分支持主張？(佔 35%)
3. 推理 (Reasoning): 是否解釋了證據為何能支持主張？是否運用了生物學原理？邏輯是否連貫？(佔 35%)

請務必嚴格但具引導性。請使用繁體中文 (Traditional Chinese, Taiwan) 回覆。
`;

export default async (req: Request, context: Context) => {
  // 1. 檢查方法
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // 2. 檢查 API Key
  if (!API_KEY) {
    console.error("GOOGLE_API_KEY is missing in environment variables.");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 3. 解析 Request
    const body = await req.json();
    const { topic, claim, evidence, reasoning } = body;

    if (!claim || !evidence || !reasoning) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // 4. 建構 Prompt (與前端一致)
    const prompt = `
      探究主題: ${topic || '未指定'}
      
      學生的作業:
      1. 主張 (Claim): ${claim}
      2. 證據 (Evidence): ${evidence}
      3. 推理 (Reasoning): ${reasoning}
      
      請依照 CER 架構進行評分與回饋。
    `;

    // 5. 呼叫 Gemini API
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    // 注意：使用與前端相同的模型版本 (gemini-2.5-flash)
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
        },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // 6. 回傳結果
    return new Response(text, {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in analyze function:", error);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
