import React, { useState, useEffect } from 'react';
import { MistakeQuestion, ViewMode } from './types';
import { SAMPLE_MISTAKES } from './data/samples';
import { Header } from './components/Header';
import { RecognizeView } from './components/RecognizeView';
import { NotebookView } from './components/NotebookView';
import { PrintPreviewModal } from './components/PrintPreviewModal';

const LOCAL_STORAGE_KEY = 'mistake_printer_data_v1';

export default function App() {
  const [activeView, setActiveView] = useState<ViewMode>('recognize');
  const [mistakes, setMistakes] = useState<MistakeQuestion[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Load saved mistakes on mount
  useEffect(() => {
    try {
      const savedStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStr) {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed)) {
          setMistakes(parsed);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading local mistakes:', e);
    }
    // Default to sample mistakes if empty so user experiences populated state
    setMistakes(SAMPLE_MISTAKES);
  }, []);

  // Sync to localStorage
  const updateMistakes = (newMistakes: MistakeQuestion[]) => {
    setMistakes(newMistakes);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newMistakes));
    } catch (e) {
      console.error('Error saving mistakes to localStorage:', e);
    }
  };

  // Add a new mistake
  const handleSaveToNotebook = (mistake: MistakeQuestion) => {
    const updated = [mistake, ...mistakes];
    updateMistakes(updated);
  };

  // Delete mistakes
  const handleDeleteMistakes = (idsToDelete: string[]) => {
    const updated = mistakes.filter((item) => !idsToDelete.includes(item.id));
    updateMistakes(updated);
    setSelectedIds(selectedIds.filter((id) => !idsToDelete.includes(id)));
  };

  // Select / Deselect
  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedIds(Array.from(new Set([...selectedIds, ...ids])));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  // Load preset sample data
  const handleLoadSampleData = () => {
    updateMistakes(SAMPLE_MISTAKES);
    alert('已成功载入 3 道全科精选示范错题！');
  };

  // Open Print Preview
  const handleOpenPrintPreview = (selectedOnly: boolean = false) => {
    if (selectedOnly && selectedIds.length === 0 && mistakes.length > 0) {
      // If nothing selected but has mistakes, auto-select all
      setSelectedIds(mistakes.map((m) => m.id));
    }
    setIsPrintModalOpen(true);
  };

  // Get printable list
  const getPrintableMistakes = () => {
    if (selectedIds.length > 0) {
      return mistakes.filter((m) => selectedIds.includes(m.id));
    }
    return mistakes;
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col antialiased">
      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        savedCount={mistakes.length}
        onOpenPrintPreview={() => handleOpenPrintPreview(false)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'recognize' ? (
          <RecognizeView
            onSaveToNotebook={handleSaveToNotebook}
            onGoToNotebook={() => setActiveView('notebook')}
          />
        ) : (
          <NotebookView
            mistakes={mistakes}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onDeleteMistakes={handleDeleteMistakes}
            onLoadSampleData={handleLoadSampleData}
            onOpenPrintPreview={handleOpenPrintPreview}
            onGoToRecognize={() => setActiveView('recognize')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>错题举一反三打印机 · 全科智能AI错题教研系统</p>
          <p className="text-slate-400">支持拍照识题 / 智能改错 / 3变式精准训练 / A4打印导出</p>
        </div>
      </footer>

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        mistakes={getPrintableMistakes()}
      />
    </div>
  );
}
