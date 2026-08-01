import React, { useState } from 'react';
import { MistakeQuestion } from '../types';
import { exportElementToPdf } from '../utils/pdfExporter';
import {
  Printer,
  Download,
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakes: MistakeQuestion[];
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  mistakes,
}) => {
  const [printTitle, setPrintTitle] = useState<string>('【专项突破】错题举一反三巩固特训卷');
  const [studentName, setStudentName] = useState<string>('');
  const [printMode, setPrintMode] = useState<'full' | 'exam' | 'pitfalls'>('full');
  const [showAnswersAtEnd, setShowAnswersAtEnd] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      await exportElementToPdf('pdf-print-container', `${printTitle}.pdf`);
    } catch (err: any) {
      console.error(err);
      alert('导出 PDF 发生错误：' + (err.message || '系统繁忙'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Toolbar (hidden during native print) */}
      <div className="w-full max-w-5xl bg-white rounded-t-2xl border-b border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg print:hidden">
        <div className="flex items-center gap-2">
          <Printer className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">PDF 打印排版预览</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            标准 A4 规格
          </span>
        </div>

        {/* Options */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Mode Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setPrintMode('full')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                printMode === 'full' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              全能特训版 (含解析)
            </button>
            <button
              onClick={() => setPrintMode('exam')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                printMode === 'exam' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              自测刷题卷 (纯题目)
            </button>
            <button
              onClick={() => setPrintMode('pitfalls')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                printMode === 'pitfalls' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              易错重难点卷
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? '正在生成 PDF...' : '下载 PDF 文件'}</span>
          </button>

          <button
            onClick={handleNativePrint}
            className="px-4 py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>直接打印</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Title & Student Name Bar */}
      <div className="w-full max-w-5xl bg-slate-50 border-x border-slate-200 p-3 px-6 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <span className="font-semibold text-slate-600">试卷标题:</span>
          <input
            type="text"
            value={printTitle}
            onChange={(e) => setPrintTitle(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">学生姓名:</span>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="填写姓名..."
            className="w-28 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium outline-none"
          />
        </div>

        {printMode === 'exam' && (
          <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={showAnswersAtEnd}
              onChange={(e) => setShowAnswersAtEnd(e.target.checked)}
              className="rounded text-blue-600"
            />
            在试卷末尾附统一答案
          </label>
        )}
      </div>

      {/* A4 Paper Printable Area */}
      <div className="w-full max-w-5xl flex-1 bg-slate-200/60 p-4 sm:p-8 overflow-y-auto max-h-[75vh] print:p-0 print:max-h-none print:overflow-visible">
        <div
          id="pdf-print-container"
          className="bg-white text-slate-900 mx-auto p-8 sm:p-12 rounded-xl shadow-xl print:shadow-none print:rounded-none min-h-[1050px] w-full max-w-[800px] border border-slate-200 print:border-none space-y-8 text-slate-900"
        >
          {/* Header */}
          <div className="text-center space-y-3 pb-6 border-b-2 border-slate-900">
            <h1 className="text-2xl font-extrabold tracking-wide text-slate-900">
              {printTitle || '错题举一反三特训卷'}
            </h1>
            <div className="flex items-center justify-center gap-8 text-xs font-semibold text-slate-700 pt-1">
              <span>姓名：{studentName || '___________'}</span>
              <span>日期：{new Date().toLocaleDateString()}</span>
              <span>得分：___________</span>
              <span>题目总数：{mistakes.length * 4} 道 (原题+变式)</span>
            </div>
          </div>

          {/* Mistakes and Variations List */}
          <div className="space-y-8">
            {mistakes.map((m, mIdx) => (
              <div key={m.id || mIdx} className="space-y-4 page-break-inside-avoid">
                {/* Original Question Block */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                  <div className="flex items-center justify-between font-bold text-xs text-slate-800">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center text-[11px]">
                        {mIdx + 1}
                      </span>
                      【原错题】学科：{m.subject} | 考点：{m.knowledgePoint}
                    </span>
                    <span>难度：{m.difficulty}</span>
                  </div>

                  <div className="text-sm font-semibold text-slate-900 leading-relaxed pt-1">
                    {m.questionText}
                  </div>

                  {/* Show Analysis according to mode */}
                  {printMode !== 'exam' && (
                    <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {m.myWrongAnswer && (
                        <div className="text-rose-900">
                          <span className="font-bold">错解：</span> {m.myWrongAnswer}
                        </div>
                      )}
                      {m.correctAnswer && (
                        <div className="text-emerald-900">
                          <span className="font-bold">正解：</span> {m.correctAnswer}
                        </div>
                      )}
                    </div>
                  )}

                  {printMode !== 'exam' && m.errorReason && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 font-medium">
                      <span className="font-bold text-amber-900">【易错陷阱】：</span> {m.errorReason}
                    </div>
                  )}
                </div>

                {/* 3 Variations */}
                {m.variations && m.variations.length > 0 && (
                  <div className="pl-4 sm:pl-6 space-y-4 border-l-2 border-indigo-200">
                    {m.variations.map((v, vIdx) => (
                      <div key={v.id || vIdx} className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                          <span>
                            {mIdx + 1}.{vIdx + 1} 【举一反三变式题·{v.variationType || '同类拓展'}】
                          </span>
                        </div>

                        <div className="text-sm font-medium text-slate-900 leading-relaxed">
                          {v.title}
                        </div>

                        {/* Options */}
                        {v.options && v.options.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                            {v.options.map((opt, oI) => (
                              <div key={oI} className="p-1.5 bg-slate-50 rounded border border-slate-200">
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Full mode or Pitfalls mode inline answers */}
                        {printMode === 'full' && (
                          <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                            <div className="font-bold text-emerald-800">答案：{v.answer}</div>
                            <div className="text-slate-700"><span className="font-bold">解析：</span>{v.analysis}</div>
                            <div className="text-amber-900 bg-amber-50 p-1.5 rounded border border-amber-200">
                              <span className="font-bold">易错点剖析：</span>{v.pitfalls}
                            </div>
                          </div>
                        )}

                        {printMode === 'pitfalls' && (
                          <div className="mt-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950">
                            <span className="font-bold text-amber-900">【易错点避坑提醒】：</span>
                            {v.pitfalls}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* End Page Answers for Exam Mode */}
          {printMode === 'exam' && showAnswersAtEnd && (
            <div className="pt-12 border-t-2 border-slate-900 space-y-6 page-break-inside-avoid">
              <div className="text-center font-bold text-base text-slate-900">
                -------------------- 参 考 答 案 与 考 点 解 析 --------------------
              </div>

              {mistakes.map((m, mIdx) => (
                <div key={`ans-${m.id || mIdx}`} className="space-y-2 text-xs border-b border-slate-200 pb-4">
                  <div className="font-bold text-slate-900">
                    第 {mIdx + 1} 题【{m.subject} - {m.knowledgePoint}】答案：
                  </div>
                  <div className="text-emerald-900 font-semibold">原题正解：{m.correctAnswer}</div>
                  <div className="text-slate-700">易错陷阱：{m.errorReason}</div>

                  {m.variations?.map((v, vIdx) => (
                    <div key={`ans-v-${vIdx}`} className="pl-4 pt-1 space-y-1">
                      <div className="font-bold text-indigo-900">
                        变式 {mIdx + 1}.{vIdx + 1} 答案：{v.answer}
                      </div>
                      <div className="text-slate-700">解析：{v.analysis}</div>
                      <div className="text-amber-900">易错避坑：{v.pitfalls}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="pt-8 text-center text-xs text-slate-400 border-t border-slate-200">
            错题举一反三打印机 · AI全科名师智能特训卷 · 祝学习进步！
          </div>
        </div>
      </div>
    </div>
  );
};
