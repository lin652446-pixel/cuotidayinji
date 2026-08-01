import React from 'react';
import { ViewMode } from '../types';
import { BookOpen, Camera, Printer, Sparkles, CheckSquare } from 'lucide-react';

interface HeaderProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  savedCount: number;
  onOpenPrintPreview: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  savedCount,
  onOpenPrintPreview,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                错题举一反三打印机
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  全科AI名师版
                </span>
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                拍照识别错题 · 智能提炼易错点 · 举一反三变式训练 · A4排版打印
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveView('recognize')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeView === 'recognize'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>错题识别</span>
              </button>

              <button
                onClick={() => setActiveView('notebook')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                  activeView === 'notebook'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>错题本</span>
                {savedCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-blue-600 text-white">
                    {savedCount}
                  </span>
                )}
              </button>
            </div>

            {/* Quick Print Button */}
            <button
              onClick={onOpenPrintPreview}
              disabled={savedCount === 0}
              title={savedCount === 0 ? '错题本为空，请先添加错题' : '打印选中的错题卷'}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                savedCount > 0
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-xs active:scale-95'
                  : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">导出/打印</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
