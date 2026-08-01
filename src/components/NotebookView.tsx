import React, { useState, useMemo } from 'react';
import { MistakeQuestion, FilterState } from '../types';
import {
  Search,
  Printer,
  Trash2,
  BookOpen,
  CheckSquare,
  Square,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Sparkles,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

interface NotebookViewProps {
  mistakes: MistakeQuestion[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onDeselectAll: () => void;
  onDeleteMistakes: (ids: string[]) => void;
  onLoadSampleData: () => void;
  onOpenPrintPreview: (selectedOnly?: boolean) => void;
  onGoToRecognize: () => void;
}

const SUBJECT_LIST = ['全部', '数学', '物理', '化学', '英语', '语文', '生物', '历史', '地理', '政治'];

export const NotebookView: React.FC<NotebookViewProps> = ({
  mistakes,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onDeleteMistakes,
  onLoadSampleData,
  onOpenPrintPreview,
  onGoToRecognize,
}) => {
  const [filter, setFilter] = useState<FilterState>({
    subject: '全部',
    keyword: '',
    difficulty: '全部',
    dateRange: 'all',
  });

  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Filtered List
  const filteredMistakes = useMemo(() => {
    return mistakes.filter((item) => {
      // Subject filter
      if (filter.subject !== '全部' && item.subject !== filter.subject) {
        return false;
      }
      // Difficulty filter
      if (filter.difficulty !== '全部' && item.difficulty !== filter.difficulty) {
        return false;
      }
      // Keyword Search
      if (filter.keyword.trim()) {
        const kw = filter.keyword.toLowerCase().trim();
        const textMatch = item.questionText?.toLowerCase().includes(kw);
        const kpMatch = item.knowledgePoint?.toLowerCase().includes(kw);
        const errMatch = item.errorReason?.toLowerCase().includes(kw);
        if (!textMatch && !kpMatch && !errMatch) {
          return false;
        }
      }
      return true;
    });
  }, [mistakes, filter]);

  // All selected status for filtered items
  const allFilteredSelected =
    filteredMistakes.length > 0 &&
    filteredMistakes.every((item) => selectedIds.includes(item.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      onDeselectAll();
    } else {
      onSelectAll(filteredMistakes.map((m) => m.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`确定要删除选中的 ${selectedIds.length} 条错题记录吗？`)) {
      onDeleteMistakes(selectedIds);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filter.keyword}
              onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
              placeholder="搜索错题内容、知识点或错因关键词..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              难度筛选:
            </span>
            <select
              value={filter.difficulty}
              onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="全部">全部分级</option>
              <option value="简单">简单</option>
              <option value="中等">中等</option>
              <option value="困难">困难</option>
            </select>
          </div>
        </div>

        {/* Subject Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 mr-1 whitespace-nowrap">
            学科分类:
          </span>
          {SUBJECT_LIST.map((subj) => {
            const isActive = filter.subject === subj;
            return (
              <button
                key={subj}
                onClick={() => setFilter({ ...filter, subject: subj })}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {subj}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Toolbar & Selection Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3">
          {/* Select All Checkbox */}
          <button
            onClick={handleToggleSelectAll}
            disabled={filteredMistakes.length === 0}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900"
          >
            {allFilteredSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>全选 / 多选 ({selectedIds.length}已选)</span>
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              删除所选 ({selectedIds.length})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {mistakes.length === 0 && (
            <button
              onClick={onLoadSampleData}
              className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              导入学科示范错题
            </button>
          )}

          <button
            onClick={() => onOpenPrintPreview(true)}
            disabled={selectedIds.length === 0 && mistakes.length === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-all ${
              selectedIds.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-98'
                : mistakes.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>
              {selectedIds.length > 0
                ? `生成选中错题 PDF/打印 (${selectedIds.length})`
                : '打印全套错题卷'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Mistake List */}
      {filteredMistakes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {mistakes.length === 0 ? '错题本暂无记录' : '未找到匹配条件的错题'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {mistakes.length === 0
                ? '前往“错题识别”拍照添加，或点击上方“导入学科示范错题”体验。'
                : '请尝试重置筛选分类或更改关键字搜索。'}
            </p>
          </div>
          {mistakes.length === 0 && (
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onGoToRecognize}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                前往拍照识别错题
              </button>

              <button
                onClick={onLoadSampleData}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                导入 3 道示例错题
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map((m, index) => {
            const isSelected = selectedIds.includes(m.id);
            const isExpanded = expandedCardId === m.id;

            return (
              <div
                key={m.id}
                className={`bg-white rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Card Top Row */}
                <div className="p-4 sm:p-5 flex items-start gap-3">
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => onToggleSelect(m.id)}
                    className="mt-1 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  {/* Main Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-600 text-white text-xs font-bold">
                          {m.subject}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
                          {m.knowledgePoint}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                            m.difficulty === '困难'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : m.difficulty === '中等'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {m.difficulty}
                        </span>
                      </div>

                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Question Text */}
                    <div className="text-sm font-semibold text-slate-900 leading-relaxed pt-1">
                      {m.questionText}
                    </div>

                    {/* Wrong answer & Correct answer preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      {m.myWrongAnswer && (
                        <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-900">
                          <span className="font-bold">错解：</span> {m.myWrongAnswer}
                        </div>
                      )}
                      {m.correctAnswer && (
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900">
                          <span className="font-bold">正解：</span> {m.correctAnswer}
                        </div>
                      )}
                    </div>

                    {/* Variation Count Badge */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        <Layers className="w-3.5 h-3.5" />
                        <span>含 {m.variations?.length || 0} 道举一反三变式练习题</span>
                      </div>

                      <button
                        onClick={() => setExpandedCardId(isExpanded ? null : m.id)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {isExpanded ? '收起详情与变式' : '查看易错点与变式练习'}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details & Variations */}
                {isExpanded && (
                  <div className="bg-slate-50/80 p-4 sm:p-5 border-t border-slate-200 rounded-b-2xl space-y-4 animate-fade-in">
                    {/* Error Analysis Box */}
                    {m.errorReason && (
                      <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-1">
                        <p className="font-bold text-amber-900 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          【错因与易错陷阱分析】：
                        </p>
                        <p className="leading-relaxed font-medium p-2 bg-white/80 rounded-lg border border-amber-200">
                          {m.errorReason}
                        </p>
                      </div>
                    )}

                    {/* Image preview if any */}
                    {m.imageUrl && (
                      <div>
                        <p className="text-xs font-bold text-slate-600 mb-1">错题照片原图：</p>
                        <img
                          src={m.imageUrl}
                          alt="错题原图"
                          className="max-h-48 object-contain rounded-lg border border-slate-200"
                        />
                      </div>
                    )}

                    {/* Variations Cards */}
                    {m.variations && m.variations.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          举一反三练习题（3道变式）：
                        </h4>

                        <div className="space-y-3">
                          {m.variations.map((v, vIdx) => (
                            <div
                              key={v.id || vIdx}
                              className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 shadow-2xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-blue-700">变式 {vIdx + 1}：</span>
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-semibold text-[11px]">
                                  {v.variationType}
                                </span>
                              </div>

                              <p className="font-medium text-slate-900 leading-relaxed">{v.title}</p>

                              {v.options && v.options.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                  {v.options.map((opt, oI) => (
                                    <div
                                      key={oI}
                                      className="p-1.5 bg-slate-50 rounded-lg text-slate-700 font-medium"
                                    >
                                      {opt}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-950 font-semibold">
                                答案：{v.answer}
                              </div>

                              <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700 leading-relaxed">
                                <span className="font-bold text-slate-900">解析：</span>
                                {v.analysis}
                              </div>

                              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-950 font-medium">
                                <span className="font-bold text-amber-900">易错点：</span>
                                {v.pitfalls}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
