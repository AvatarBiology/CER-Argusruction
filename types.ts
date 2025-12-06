export interface CerInputData {
  topic: string;
  claim: string;
  evidence: string;
  reasoning: string;
}

export interface AnalysisResult {
  overall_score: number;
  overall_comment: string;
  claim_score: number;
  claim_feedback: string;
  evidence_score: number;
  evidence_feedback: string;
  reasoning_score: number;
  reasoning_feedback: string;
  achievement_badge: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  input: CerInputData;
  result: AnalysisResult;
}

export type ViewState = 'INPUT' | 'FEEDBACK' | 'HISTORY' | 'DETAIL';