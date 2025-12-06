import React, { useState, useEffect } from 'react';
import { ViewState, CerInputData, AnalysisResult, HistoryItem } from './types';
import InputScreen from './components/InputScreen';
import FeedbackScreen from './components/FeedbackScreen';
import HistoryScreen from './components/HistoryScreen';
import HistoryDetailScreen from './components/HistoryDetailScreen';
import { analyzeArgument } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('INPUT');
  const [inputData, setInputData] = useState<CerInputData>({
    topic: '',
    claim: '',
    evidence: '',
    reasoning: '',
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('cer_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cer_history', JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeArgument(inputData);
      setAnalysisResult(result);
      
      // Save to history immediately upon success
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(), // Simple ID
        timestamp: Date.now(),
        input: { ...inputData },
        result: result,
      };
      
      setHistory(prev => [newHistoryItem, ...prev]);
      setView('FEEDBACK');
    } catch (error) {
      alert("分析失敗，請稍後再試。\n" + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRevise = () => {
    setView('INPUT');
    // We keep the inputData as is, so the user can edit it.
  };

  const handleGoToHistory = () => {
    setView('HISTORY');
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setView('DETAIL');
  };

  const handleBackToHistory = () => {
    setSelectedHistoryItem(null);
    setView('HISTORY');
  };

  const handleBackToInputFromHistory = () => {
     setView('INPUT');
  };

  // Render Logic
  if (view === 'INPUT') {
    return (
      <InputScreen
        inputData={inputData}
        setInputData={setInputData}
        onAnalyze={handleAnalyze}
        onGoToHistory={handleGoToHistory}
        isAnalyzing={isAnalyzing}
      />
    );
  }

  if (view === 'FEEDBACK' && analysisResult) {
    return (
      <FeedbackScreen
        result={analysisResult}
        inputData={inputData}
        onRevise={handleRevise}
        onGoToHistory={handleGoToHistory}
      />
    );
  }

  if (view === 'HISTORY') {
    return (
      <HistoryScreen
        history={history}
        onSelect={handleSelectHistoryItem}
        onBack={handleBackToInputFromHistory}
      />
    );
  }

  if (view === 'DETAIL' && selectedHistoryItem) {
    return (
      <HistoryDetailScreen
        item={selectedHistoryItem}
        onBack={handleBackToHistory}
      />
    );
  }

  // Fallback (e.g. if analysisResult is null but view is FEEDBACK)
  return (
      <div className="flex h-screen w-full items-center justify-center bg-background-dark text-white">
          <p>Loading...</p>
          {/* Automatically redirect if stuck */}
          {setTimeout(() => setView('INPUT'), 1000) && null}
      </div>
  );
};

export default App;