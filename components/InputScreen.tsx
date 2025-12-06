import React from 'react';
import { CerInputData } from '../types';

interface InputScreenProps {
  inputData: CerInputData;
  setInputData: React.Dispatch<React.SetStateAction<CerInputData>>;
  onAnalyze: () => void;
  onGoToHistory: () => void;
  isAnalyzing: boolean;
}

const InputScreen: React.FC<InputScreenProps> = ({
  inputData,
  setInputData,
  onAnalyze,
  onGoToHistory,
  isAnalyzing,
}) => {
  const handleChange = (field: keyof CerInputData, value: string) => {
    setInputData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    inputData.claim.trim() !== '' &&
    inputData.evidence.trim() !== '' &&
    inputData.reasoning.trim() !== '';

  return (
    <div className="flex min-h-screen w-full flex-col bg-background-dark text-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-700 bg-background-dark p-4 shadow-md">
        <div className="w-10"></div> {/* Spacer */}
        <h1 className="flex-1 text-center text-lg font-bold tracking-wide">論證建構</h1>
        <button
          onClick={onGoToHistory}
          className="flex size-10 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/10"
        >
          <span className="material-symbols-outlined">history</span>
        </button>
      </div>

      <main className="flex-grow space-y-6 p-4 pb-24">
        {/* Topic Section */}
        <section className="rounded-xl bg-card-dark p-5 shadow-lg">
          <label className="mb-2 block text-sm font-medium text-primary">探究主題</label>
          <input
            type="text"
            className="w-full rounded-lg border-gray-600 bg-background-dark p-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="例如：細胞膜的滲透作用..."
            value={inputData.topic}
            onChange={(e) => handleChange('topic', e.target.value)}
          />
        </section>

        {/* Claim Section */}
        <section className="rounded-xl bg-card-dark p-5 shadow-lg">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base font-bold text-white">主張 (Claim)</span>
            <div className="group relative cursor-help">
              <span className="material-symbols-outlined text-sm text-gray-400">info</span>
              <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-md bg-black/90 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                你對問題的核心回答或結論。
              </div>
            </div>
          </div>
          <textarea
            className="min-h-[100px] w-full resize-none rounded-lg border-gray-600 bg-background-dark p-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="在此輸入你的核心主張..."
            value={inputData.claim}
            onChange={(e) => handleChange('claim', e.target.value)}
          />
        </section>

        {/* Evidence Section */}
        <section className="rounded-xl bg-card-dark p-5 shadow-lg">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base font-bold text-white">證據 (Evidence)</span>
            <div className="group relative cursor-help">
              <span className="material-symbols-outlined text-sm text-gray-400">info</span>
              <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-md bg-black/90 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                支持你主張的數據或觀察結果。
              </div>
            </div>
          </div>
          <textarea
            className="min-h-[120px] w-full resize-none rounded-lg border-gray-600 bg-background-dark p-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="在此列出支持你主張的數據或觀察結果..."
            value={inputData.evidence}
            onChange={(e) => handleChange('evidence', e.target.value)}
          />
        </section>

        {/* Reasoning Section */}
        <section className="rounded-xl bg-card-dark p-5 shadow-lg">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-base font-bold text-white">推理 (Reasoning)</span>
            <div className="group relative cursor-help">
              <span className="material-symbols-outlined text-sm text-gray-400">info</span>
              <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-md bg-black/90 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                解釋你的證據如何支持你的主張，並運用科學原理。
              </div>
            </div>
          </div>
          <textarea
            className="min-h-[120px] w-full resize-none rounded-lg border-gray-600 bg-background-dark p-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="在此解釋你的證據如何支持你的主張..."
            value={inputData.reasoning}
            onChange={(e) => handleChange('reasoning', e.target.value)}
          />
        </section>

        {/* Placeholder for results hint */}
        <div className="rounded-xl border-2 border-dashed border-gray-700 bg-white/5 p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <span className="material-symbols-outlined text-3xl text-gray-500">auto_awesome</span>
            <p className="text-sm font-medium text-gray-400">分析後，您的 AI 回饋將顯示在此處。</p>
          </div>
        </div>
      </main>

      {/* Floating Action Button area */}
      <div className="fixed bottom-0 left-0 right-0 bg-background-dark/90 p-4 backdrop-blur-md">
        <button
          onClick={onAnalyze}
          disabled={!isFormValid || isAnalyzing}
          className={`flex h-14 w-full items-center justify-center rounded-xl text-lg font-bold text-background-dark shadow-lg transition-all ${
            !isFormValid || isAnalyzing
              ? 'cursor-not-allowed bg-gray-600 text-gray-400'
              : 'bg-primary hover:bg-primary-hover shadow-primary/20'
          }`}
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 animate-spin text-background-dark" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>分析中...</span>
            </div>
          ) : (
            '開始分析'
          )}
        </button>
      </div>
    </div>
  );
};

export default InputScreen;