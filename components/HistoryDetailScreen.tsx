import React from 'react';
import { HistoryItem } from '../types';

interface HistoryDetailScreenProps {
  item: HistoryItem;
  onBack: () => void;
}

const HistoryDetailScreen: React.FC<HistoryDetailScreenProps> = ({ item, onBack }) => {
  const { input, result } = item;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background-dark text-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-700 bg-background-dark p-4 shadow-md backdrop-blur-sm bg-opacity-90">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/10"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold tracking-wide">紀錄詳情</h1>
        <div className="size-10"></div>
      </div>

      <main className="flex-grow p-4 pb-12">
        <div className="mb-6 flex items-center justify-between px-2">
             <div>
                <h2 className="text-xl font-bold text-primary">{input.topic || "無主題"}</h2>
                <p className="text-xs text-gray-400 mt-1">{formatDate(item.timestamp)}</p>
             </div>
             <div className="flex flex-col items-center rounded-lg bg-card-dark p-2 border border-gray-700">
                <span className="text-xs text-gray-400">總分</span>
                <span className={`text-xl font-bold ${result.overall_score >= 80 ? 'text-score-high' : result.overall_score >= 60 ? 'text-score-medium' : 'text-score-low'}`}>{result.overall_score}</span>
             </div>
        </div>

        {/* Claim */}
        <section className="mb-6">
          <div className="mb-4 rounded-xl border border-white/5 bg-white/5 p-4">
            <h3 className="mb-2 text-sm font-bold text-gray-400">你的主張</h3>
            <p className="text-base leading-relaxed text-gray-200">{input.claim}</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-primary">主張回饋</h3>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">{result.claim_score}分</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">{result.claim_feedback}</p>
          </div>
        </section>

        {/* Evidence */}
        <section className="mb-6">
          <div className="mb-4 rounded-xl border border-white/5 bg-white/5 p-4">
            <h3 className="mb-2 text-sm font-bold text-gray-400">你的證據</h3>
            <p className="text-base leading-relaxed text-gray-200">{input.evidence}</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-primary">證據回饋</h3>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">{result.evidence_score}分</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">{result.evidence_feedback}</p>
          </div>
        </section>

        {/* Reasoning */}
        <section className="mb-6">
          <div className="mb-4 rounded-xl border border-white/5 bg-white/5 p-4">
            <h3 className="mb-2 text-sm font-bold text-gray-400">你的推理</h3>
            <p className="text-base leading-relaxed text-gray-200">{input.reasoning}</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-bold text-primary">推理回饋</h3>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">{result.reasoning_score}分</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">{result.reasoning_feedback}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HistoryDetailScreen;