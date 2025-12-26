// 修改路徑: avatarbiology/cer-argusruction/services/geminiServices.ts

import { CerInputData, AnalysisResult } from "../types";

export const analyzeArgument = async (data: CerInputData): Promise<AnalysisResult> => {
  // 統一呼叫 Netlify Function (後端已改為 Gemma 3)
  console.log("Calling Netlify Function (Gemma 3)...");
  
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
    console.error("Analysis Error:", error);
    throw error;
  }
};
