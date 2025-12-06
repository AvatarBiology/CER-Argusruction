import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { CerInputData, AnalysisResult } from "../types";

// Schema 定義 (與後端一致)
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

const SYSTEM_INSTRUCTION = `
你是一位專業的高中生物科教師，同時也是科學論證 (CER) 的專家。你的任務是批改學生提交的科學論證作業。
請務必嚴格但具引導性。請使用繁體中文 (Traditional Chinese, Taiwan) 回覆。
`;

export const analyzeArgument = async (data: CerInputData): Promise<AnalysisResult> => {
  const apiKey = import.meta.env.VITE_API_KEY;

  if (apiKey) {
    // --- Client-Side Mode (Local Dev) ---
    console.log("Using Client-Side API Key");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const prompt = `
      探究主題: ${data.topic}
      學生的作業:
      1. 主張 (Claim): ${data.claim}
      2. 證據 (Evidence): ${data.evidence}
      3. 推理 (Reasoning): ${data.reasoning}
      請依照 CER 架構進行評分與回饋。
    `;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as AnalysisResult;
    } catch (error) {
      console.error("Gemini Client API Error:", error);
      throw error;
    }

  } else {
    // --- Server-Side Mode (Netlify) ---
    console.log("Calling Netlify Function...");
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.details || errorData.error || `Server error: ${response.status}`);
        }

        const result = await response.json();
        return result as AnalysisResult;

    } catch (error) {
        console.error("Netlify Function Error:", error);
        throw error;
    }
  }
};
