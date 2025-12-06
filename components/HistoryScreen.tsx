import React from 'react';
import { HistoryItem } from '../types';

interface HistoryScreenProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onSelect, onBack }) => {
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
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-700 bg-background-dark p-4 shadow-md">
        <button
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/10"
        >
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold tracking-wide">學習歷程紀錄</h1>
        <div className="size-10"></div>
      </div>

      <main className="flex-grow p-4">
        <div className="flex flex-col gap-4">
          {history.length === 0 ? (
            <div className="mt-20 flex flex-col items-center justify-center text-gray-500">
              <span className="material-symbols-outlined text-6xl opacity-50">history_edu</span>
              <p className="mt-4 text-lg">尚未有任何分析紀錄</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className="group flex cursor-pointer items-stretch gap-4"
              >
                {/* Timeline UI */}
                <div className="flex flex-col items-center pt-1">
                  <div className="h-3 w-3 rounded-full bg-primary ring-4 ring-primary/20"></div>
                  <div className="mt-2 h-full w-px flex-grow bg-primary/30 group-last:hidden"></div>
                </div>
                
                {/* Card UI */}
                <div className="flex-1 -mt-1 mb-4 flex items-center gap-2 rounded-xl bg-card-dark p-4 transition-colors hover:bg-white/10">
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between">
                      <p className="text-xs font-normal text-gray-400">{formatDate(item.timestamp)}</p>
                      <p className="text-lg font-bold text-primary">{item.result.overall_score}分</p>
                    </div>
                    <p className="mb-3 text-base font-medium leading-normal text-white line-clamp-2">
                      {item.input.topic || "無主題"}
                    </p>
                    <div className="flex justify-end">
                      <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
                        <span className="material-symbols-outlined text-sm text-primary filled">workspace_premium</span>
                        <span className="text-xs font-medium text-primary">{item.result.achievement_badge}</span>
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-gray-500">chevron_right</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default HistoryScreen;