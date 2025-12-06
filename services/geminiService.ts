import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CerInputData, AnalysisResult } from "../types";

// Note: These definitions are duplicated here for the Client-Side fallback mode.
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

export const analyzeArgument = async (data: CerInputData): Promise<AnalysisResult> => {
  // Use Vite's import.meta.env to check for a client-side key (mostly for local dev).
  // In Netlify production, this will likely be undefined, triggering the backend fallback.
  const apiKey = import.meta.env.VITE_API_KEY;

  if (apiKey) {
    // --- Client-Side Mode (Local Dev / Preview) ---
    console.log("Using Client-Side API Key");
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      探究主題: ${data.topic}
      
      學生的作業:
      1. 主張 (Claim): ${data.claim}
      2. 證據 (Evidence): ${data.evidence}
      3. 推理 (Reasoning): ${data.reasoning}
      
      請依照 CER 架構進行評分與回饋。
    `;

    try {
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
      return JSON.parse(text) as AnalysisResult;
    } catch (error) {
      console.error("Gemini Client API Error:", error);
      throw error;
    }

  } else {
    // --- Server-Side Mode (Production / Netlify) ---
    console.log("No Client Key found, calling Netlify Function...");
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const result = await response.json();
        return result as AnalysisResult;

    } catch (error) {
        console.error("Netlify Function Error:", error);
        throw new Error("無法連接到分析服務，請檢查網路連線或稍後再試。");
    }
  }
};
