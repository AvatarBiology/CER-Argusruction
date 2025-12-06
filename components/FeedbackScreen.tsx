import React from 'react';
import { AnalysisResult, CerInputData } from '../types';

interface FeedbackScreenProps {
  result: AnalysisResult;
  inputData: CerInputData;
  onRevise: () => void;
  onGoToHistory: () => void;
}

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let colorClass = 'text-score-low';
  let icon = 'cancel';
  
  if (score >= 80) {
    colorClass = 'text-score-high';
    icon = 'check_circle';
  } else if (score >= 60) {
    colorClass = 'text-score-medium';
    icon = 'warning';
  }

  return (
    <div className="flex items-center gap-1">
      <span className={`material-symbols-outlined text-lg ${colorClass}`}>{icon}</span>
      <span className={`text-lg font-bold ${colorClass}`}>{score}<span className="text-sm text-gray-500">/100</span></span>
    </div>
  );
};

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ result, inputData, onRevise, onGoToHistory }) => {
  const getOverallColor = (score: number) => {
    if (score >= 80) return 'text-score-high';
    if (score >= 60) return 'text-score-medium';
    return 'text-score-low';
  };

  const overallColor = getOverallColor(result.overall_score);

  const handleDownload = () => {
    const { topic, claim, evidence, reasoning } = inputData;
    const {
      overall_score,
      overall_comment,
      claim_score,
      claim_feedback,
      evidence_score,
      evidence_feedback,
      reasoning_score,
      reasoning_feedback,
      achievement_badge
    } = result;

    const content = `CER 科學論證回饋單
----------------------------------------
評量時間: ${new Date().toLocaleString('zh-TW')}
探究主題: ${topic || '未命名'}

【總體評量】
總分: ${overall_score} / 100
等級: ${achievement_badge}
總評: ${overall_comment}

----------------------------------------
1. 主張 (Claim)
[學生填寫]
${claim}

[AI 回饋] (${claim_score}/100)
${claim_feedback}

----------------------------------------
2. 證據 (Evidence)
[學生填寫]
${evidence}

[AI 回饋] (${evidence_score}/100)
${evidence_feedback}

----------------------------------------
3. 推理 (Reasoning)
[學生填寫]
${reasoning}

[AI 回饋] (${reasoning_score}/100)
${reasoning_feedback}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CER_Feedback_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background-dark text-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-700 bg-background-dark p-4 shadow-md">
        <button
          onClick={onRevise}
          className="flex size-10 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/10"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold tracking-wide">AI Feedback</h1>
        <div className="flex gap-2">
            <button
                onClick={handleDownload}
                className="flex size-10 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/10"
                title="下載回饋"
            >
                <span className="material-symbols-outlined">download</span>
            </button>
            <button
                onClick={onGoToHistory}
                className="flex size-10 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/10"
                title="歷史紀錄"
            >
                <span className="material-symbols-outlined">history</span>
            </button>
        </div>
      </div>

      <main className="flex-grow space-y-4 p-4 pb-24">
        {/* Overall Score Card */}
        <div className="flex flex-col items-center justify-center rounded-xl bg-card-dark p-6 text-center shadow-lg">
          <div className="flex w-full items-center justify-center gap-8">
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-gray-400">總分</p>
              <p className={`text-6xl font-bold tracking-tighter ${overallColor}`}>
                {result.overall_score}
              </p>
              <div className={`mt-2 flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${overallColor} bg-white/5`}>
                <span className="material-symbols-outlined !text-lg filled">workspace_premium</span>
                <span>{result.achievement_badge}</span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-base leading-relaxed text-gray-300">
            {result.overall_comment}
          </p>
        </div>

        {/* Claim Feedback */}
        <div className="rounded-xl bg-card-dark p-5 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">主張回饋</h2>
            <ScoreBadge score={result.claim_score} />
          </div>
          <p className="text-base font-normal leading-relaxed text-gray-300">
            {result.claim_feedback}
          </p>
        </div>

        {/* Evidence Feedback */}
        <div className="rounded-xl bg-card-dark p-5 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">證據回饋</h2>
            <ScoreBadge score={result.evidence_score} />
          </div>
          <p className="text-base font-normal leading-relaxed text-gray-300">
            {result.evidence_feedback}
          </p>
        </div>

        {/* Reasoning Feedback */}
        <div className="rounded-xl bg-card-dark p-5 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">推理回饋</h2>
            <ScoreBadge score={result.reasoning_score} />
          </div>
          <p className="text-base font-normal leading-relaxed text-gray-300">
            {result.reasoning_feedback}
          </p>
        </div>
      </main>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-background-dark/90 p-4 backdrop-blur-md">
        <button
          onClick={onRevise}
          className="flex h-14 w-full items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 text-background-dark text-lg font-bold transition-transform active:scale-[0.98]"
        >
          修正論點
        </button>
      </div>
    </div>
  );
};

export default FeedbackScreen;