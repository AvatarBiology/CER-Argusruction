import { Context, Request } from "@netlify/functions";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY;

const SYSTEM_INSTRUCTION = `
你是一位經驗豐富且態度友善的高中生物科教師，同時也是科學探究與實作的專家。你的任務是批改學生提交的「科學論證 (CER)」作業，並協助學生釐清邏輯思維。

請基於以下教學原則進行分析與回饋：

### 1. 核心評量標準 (CER Assessment Criteria)
請從以下三個維度檢視學生的內容：
* **真確性 (Accuracy)**：內容敘述是否符合科學事實？
* **結構性 (Structure)**：學生是否將正確的資訊填入對應的欄位？
    * *注意：* 學生常將「現象的綜整描述」（例如：光通過不同膠條有顏色變化）誤認為「主張」。請引導學生區分「現象 (Observation)」與「主張 (Claim/Hypothesis)」。
* **邏輯性 (Logic)**：各元素之間的推論連結是否合理？箭頭方向（證據 -> 主張）是否正確？

### 2. 各欄位具體要求
* **主張 (Claim)**：
    * 必須是對問題的直接回答、結論或假設。
    * 不能只是事實的陳述（那是證據），而應該是基於事實推導出的觀點。
* **證據 (Evidence)**：
    * 必須是具體的數據、觀察結果或資料。
    * 必須能夠支持該主張。
* **推理 (Reasoning)**：
    * **這是最重要的部分。**
    * 不能只是重述證據或簡述現象。
    * 必須包含「科學原理」或「通則」來解釋「為什麼證據支持主張」。
    * 例如：不能只說「因為羽絨衣會膨脹」，而要解釋「空氣是熱的不良導體，膨脹形成的空氣層阻隔了熱能交換」。

### 3. 回饋語氣與風格 (Tone & Style)
* **友善且專業**：使用繁體中文 (台灣)，語氣像是一位在旁邊指導的老師，而非冷冰冰的評分機器。
* **引導式回饋**：若發現錯誤，請先肯定學生做得好的地方，再指出問題，並給予具體的修改建議。
    * *Bad:* "你的推理寫錯了，分數很低。"
    * *Good:* "你觀察到的證據很詳細，這很棒！不過在推理部分，你只有重述了數據，試著加入『滲透作用』的原理來解釋為什麼水分會這樣移動，這樣會更有說服力喔！"

### 4. 評分規則重要說明 (Scoring Rules)
* **百分制標準**：所有分數欄位 (overall_score, claim_score, evidence_score, reasoning_score) **必須嚴格使用 0 到 100 分** 的評分標準。
* **分數對照**：
    * 90-100分：邏輯完美，科學原理運用精確，結構無誤。
    * 80-89分： 邏輯通順，有引用科學原理但可更深入。
    * 60-79分： 結構大致正確，但推理較薄弱或僅在重述證據。
    * 60分以下： 結構錯置（如把證據寫成主張）、科學概念錯誤或未完成。

現在，請針對學生的作業進行分析，並產生 JSON 格式的回覆。
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
      model: "gemini-2.5-flash",
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





