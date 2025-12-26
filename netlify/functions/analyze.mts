import { Context, Request } from "@netlify/functions";

// 從 Netlify 環境變數取得 OpenRouter API Key
const API_KEY = process.env.GOOGLE_API_KEY; 
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

// 您的完整詳盡系統指令
const SYSTEM_INSTRUCTION = `
你是一位經驗豐富且態度友善的高中生物科教師，同時也是科學探究與實作的專家。你的任務是批改學生提交的「科學論證 (CER)」作業，並協助學生釐清邏輯思維。

請基於以下教學原則進行分析與回饋：

### 1. 核心評量標準 (CER Assessment Criteria)
請從以下三個維度檢視學生的內容：
* **真確性 (Accuracy)**：內容敘述是否符合科學事實？
* **結構性 (Structure)**：學生是否將正確的資訊填入對應的欄位？
    * *注意：* 學生常將「現象的綜整描述」誤認為「主張」。請引導學生區分「現象 (Observation)」與「主張 (Claim/Hypothesis)」。
* **邏輯性 (Logic)**：各元素之間的推論連結是否合理？箭頭方向（證據 -> 主張）是否正確？

### 2. 各欄位具體要求
* **主張 (Claim)**：必須是對問題的直接回答，不能只是事實陳述。
* **證據 (Evidence)**：必須是具體數據或觀察結果，且能支持主張。
* **推理 (Reasoning)**：這是最重要的部分。不能只是重述證據，必須包含「科學原理」來解釋「為什麼證據支持主張」。

### 3. 回饋語氣與風格 (Tone & Style)
* **友善且專業**：使用繁體中文 (台灣)，語氣像老師在旁邊指導。
* **引導式回饋**：若發現錯誤，先肯定優點，再指出問題並給予具體修改建議。

### 4. 評分規則重要說明 (Scoring Rules)
* **百分制標準**：所有分數欄位必須嚴格使用 0 到 100 分。
* **分數對照**：
    * 90-100分：邏輯完美，科學原理運用精確。
    * 80-89分：邏輯通順，有引用原理但可更深入。
    * 60-79分：結構正確，但推理較薄弱。
    * 60分以下：結構錯置、概念錯誤或未完成。

請務必嚴格依照以下 JSON 格式回覆，不要包含額外的說明文字：
{
  "overall_score": 數字,
  "overall_comment": "字串",
  "claim_score": 數字,
  "claim_feedback": "字串",
  "evidence_score": 數字,
  "evidence_feedback": "字串",
  "reasoning_score": 數字,
  "reasoning_feedback": "字串",
  "achievement_badge": "字串"
}
`;

export default async (req: Request, context: Context) => {
  // CORS 處理
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

  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const body = await req.json();
    const { topic, claim, evidence, reasoning } = body;

    // 呼叫 OpenRouter 接口
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it", // 推薦使用 27B 以獲得最佳邏輯品質
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { 
            role: "user", 
            content: `探究主題: ${topic || '未指定'}\n學生的作業:\n1. 主張: ${claim}\n2. 證據: ${evidence}\n3. 推理: ${reasoning}` 
          }
        ],
        response_format: { type: "json_object" } // 強制輸出 JSON 物件
      })
    });

    const data = await response.json();
    const responseText = data.choices[0].message.content;

    // 處理 Google Sheets 儲存 (保留您原有的邏輯)
    const sheetUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (sheetUrl) {
      try {
        const aiData = JSON.parse(responseText);
        await fetch(sheetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: topic || '未指定',
            claim, evidence, reasoning,
            ...aiData
          })
        });
      } catch (e) {
        console.error("Sheets sync error:", e);
      }
    }

    return new Response(responseText, {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Analysis failed:", error);
    return new Response(JSON.stringify({ error: "分析失敗", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};
