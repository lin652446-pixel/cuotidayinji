import React, { useState, useRef } from 'react';
import { MistakeQuestion, VariationQuestion } from '../types';
import { SAMPLE_MISTAKES } from '../data/samples';
import {
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Save,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Trash2,
  FileText
} from 'lucide-react';

interface RecognizeViewProps {
  onSaveToNotebook: (mistake: MistakeQuestion) => void;
  onGoToNotebook: () => void;
}

const SUBJECT_OPTIONS = ['数学', '物理', '化学', '英语', '语文', '生物', '历史', '地理', '政治', '通用'];
const DIFFICULTY_OPTIONS = ['简单', '中等', '困难'] as const;

export const RecognizeView: React.FC<RecognizeViewProps> = ({
  onSaveToNotebook,
  onGoToNotebook,
}) => {
  // Image Upload State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');

  // OCR Processing States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Editable Question Fields
  const [subject, setSubject] = useState<string>('数学');
  const [knowledgePoint, setKnowledgePoint] = useState<string>('');
  const [questionText, setQuestionText] = useState<string>('');
  const [myWrongAnswer, setMyWrongAnswer] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [errorReason, setErrorReason] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'简单' | '中等' | '困难'>('中等');

  // Variations States
  const [variations, setVariations] = useState<VariationQuestion[]>([]);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState<boolean>(false);
  const [variationError, setVariationError] = useState<string | null>(null);

  // UI state
  const [savedSuccessToast, setSavedSuccessToast] = useState<boolean>(false);
  const [expandedVarId, setExpandedVarId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件 (JPG, PNG, WebP等)');
      return;
    }
    setImageMime(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      // Auto trigger OCR
      analyzeImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Call OCR API
  const analyzeImage = async (base64Data: string, mime: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setSavedSuccessToast(false);

    try {
      const response = await fetch('/api/ocr-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mime,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || '识图解析失败，请检查图片或直接手动填入题目。');
      }

      const d = resData.data;
      if (d.subject && SUBJECT_OPTIONS.includes(d.subject)) {
        setSubject(d.subject);
      } else {
        setSubject('数学');
      }
      setKnowledgePoint(d.knowledgePoint || '');
      setQuestionText(d.questionText || '');
      setMyWrongAnswer(d.myWrongAnswer || '');
      setCorrectAnswer(d.correctAnswer || '');
      setErrorReason(d.errorReason || '');
      if (d.difficulty && DIFFICULTY_OPTIONS.includes(d.difficulty as any)) {
        setDifficulty(d.difficulty as any);
      } else {
        setDifficulty('中等');
      }

      // Auto generate 3 variations after OCR succeeds
      if (d.questionText && d.knowledgePoint) {
        generateVariations(d.subject, d.knowledgePoint, d.questionText, d.correctAnswer, d.errorReason);
      }
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || '识别出错');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load Preset Sample
  const handleLoadSample = (sample: MistakeQuestion) => {
    setImagePreview(sample.imageUrl || null);
    setSubject(sample.subject);
    setKnowledgePoint(sample.knowledgePoint);
    setQuestionText(sample.questionText);
    setMyWrongAnswer(sample.myWrongAnswer || '');
    setCorrectAnswer(sample.correctAnswer || '');
    setErrorReason(sample.errorReason || '');
    setDifficulty(sample.difficulty);
    setVariations(sample.variations);
    setAnalysisError(null);
    setVariationError(null);
    setSavedSuccessToast(false);
  };

  // Generate 3 Variation Questions
  const generateVariations = async (
    subj = subject,
    kp = knowledgePoint,
    qText = questionText,
    cAns = correctAnswer,
    eReason = errorReason
  ) => {
    if (!qText.trim()) {
      alert('请先识别或填写错题文本内容！');
      return;
    }
    if (!kp.trim()) {
      alert('请填写知识点考点名称，便于精密生成变式题！');
      return;
    }

    setIsGeneratingVariations(true);
    setVariationError(null);

    try {
      const response = await fetch('/api/generate-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subj,
          knowledgePoint: kp,
          questionText: qText,
          correctAnswer: cAns,
          errorReason: eReason,
          count: 3,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || '生成变式题失败，请重试。');
      }

      setVariations(resData.variations || []);
      // expand first variation by default
      if (resData.variations?.length > 0) {
        setExpandedVarId(resData.variations[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setVariationError(err.message || '生成变式题发生错误');
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  // Save to Mistake Bank
  const handleSave = () => {
    if (!questionText.trim()) {
      alert('请先填写错题题目！');
      return;
    }

    const newMistake: MistakeQuestion = {
      id: `mistake-${Date.now()}`,
      subject,
      knowledgePoint: knowledgePoint || '综合考点',
      questionText,
      myWrongAnswer,
      correctAnswer,
      errorReason,
      difficulty,
      imageUrl: imagePreview,
      variations,
      createdAt: Date.now(),
    };

    onSaveToNotebook(newMistake);
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 4000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Guidance */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <BookOpen className="w-80 h-80 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            AI 智能拍题与举一反三特训
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            上传错题照片，一键拆解易错陷阱与同类变式练习
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed opacity-95">
            拍照识别错题后，AI 将自动分析考点与错因，并为您定制 3 道题型、考点一致的演练变式题。支持手动校对识别文本与一键导出 A4 卷面。
          </p>
        </div>
      </div>

      {/* Grid: Left - Image Upload / Sample Selection; Right - OCR Text Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Photo Upload Zone (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                错题图片上传
              </h3>
              {imagePreview && (
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setQuestionText('');
                    setKnowledgePoint('');
                    setVariations([]);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  清除图片
                </button>
              )}
            </div>

            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 min-h-[220px] rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer relative overflow-hidden ${
                imagePreview
                  ? 'border-blue-400 bg-blue-50/20 hover:border-blue-500'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-blue-400'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative w-full h-full min-h-[200px] flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="错题预览"
                    className="max-h-64 object-contain rounded-lg shadow-sm border border-slate-200"
                  />
                  <div className="absolute bottom-2 bg-slate-900/70 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> 点击更换图片
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      点击或拖拽上传错题照片
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      支持 JPG、PNG、WebP，试卷截屏或手机拍照
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* OCR Progress Loading State */}
            {isAnalyzing && (
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-3 animate-pulse">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                <div className="text-xs text-blue-900">
                  <p className="font-bold">名师 AI 正在智能识别错题并归纳考点...</p>
                  <p className="opacity-80">分析学科知识点、识别步骤错因中，请稍候</p>
                </div>
              </div>
            )}

            {analysisError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">识别提示：{analysisError}</p>
                  <p className="mt-0.5">您也可以直接在右侧手动输入题目内容及考点进行举一反三。</p>
                </div>
              </div>
            )}

            {/* Preset Samples Quick Load Buttons */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                或快速点击测试经典学科范例：
              </p>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_MISTAKES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleLoadSample(s)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-xs font-medium text-slate-700 text-left transition-all truncate"
                  >
                    <span className="font-bold text-blue-600 mr-1">[{s.subject}]</span>
                    {s.knowledgePoint}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* OCR Result & Manual Editor (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">
                  错题识别与考点编辑
                </h3>
              </div>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> 可手动修改以修正 OCR 误差
              </span>
            </div>

            {/* Subject, KnowledgePoint & Difficulty Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  学科分类
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {SUBJECT_OPTIONS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  知识点 / 考点
                </label>
                <input
                  type="text"
                  value={knowledgePoint}
                  onChange={(e) => setKnowledgePoint(e.target.value)}
                  placeholder="例如：一元二次方程韦达定理"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  题目难度
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {DIFFICULTY_OPTIONS.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                错题题目内容
              </label>
              <textarea
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="识别到的题目文字... 可直接在此修正或补充选项"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-sm text-slate-800 leading-relaxed focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-y"
              />
            </div>

            {/* Wrong Answer & Correct Answer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-rose-700 mb-1">
                  我的错解 / 选错答案
                </label>
                <input
                  type="text"
                  value={myWrongAnswer}
                  onChange={(e) => setMyWrongAnswer(e.target.value)}
                  placeholder="试卷上的错误解答或错选的字母..."
                  className="w-full px-3 py-2 rounded-xl border border-rose-200 bg-rose-50/30 text-sm text-rose-900 focus:ring-2 focus:ring-rose-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-700 mb-1">
                  正确答案与关键步骤
                </label>
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  placeholder="标准答案..."
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/30 text-sm text-emerald-900 focus:ring-2 focus:ring-emerald-400 outline-none"
                />
              </div>
            </div>

            {/* Error Analysis & Pitfalls */}
            <div>
              <label className="block text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                错因剖析与【易错点陷阱分析】
              </label>
              <textarea
                rows={2}
                value={errorReason}
                onChange={(e) => setErrorReason(e.target.value)}
                placeholder="例如：忽视判别式Δ>0的前提条件导致产生增根..."
                className="w-full px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50/30 text-sm text-amber-900 leading-relaxed focus:bg-white focus:ring-2 focus:ring-amber-400 outline-none"
              />
            </div>

            {/* Action Buttons: Generate Variations */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => generateVariations()}
                disabled={isGeneratingVariations || !questionText.trim()}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                  isGeneratingVariations || !questionText.trim()
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 shadow-blue-500/25'
                }`}
              >
                {isGeneratingVariations ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>智能编制3道同类变式题...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>生成举一反三题目</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSave}
                disabled={!questionText.trim()}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${
                  !questionText.trim()
                    ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 active:scale-98'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>保存至错题库</span>
              </button>
            </div>

            {/* Toast Notification */}
            {savedSuccessToast && (
              <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between text-xs font-semibold animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>错题及已生成的举一反三题目已成功入库！</span>
                </div>
                <button
                  onClick={onGoToNotebook}
                  className="underline hover:text-emerald-100 flex items-center gap-0.5 ml-3"
                >
                  前往错题本查看 <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Variations Section (举一反三生成区) */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-lg">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              举一反三演练（同考点变式练习 3 道）
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              基于核心知识点【{knowledgePoint || '未指定'}】定制，专治马虎与解题定势，每题附带【易错点高亮剖析】。
            </p>
          </div>

          {variations.length > 0 && (
            <button
              onClick={() => generateVariations()}
              disabled={isGeneratingVariations}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingVariations ? 'animate-spin' : ''}`} />
              重新生成一套变式题
            </button>
          )}
        </div>

        {/* Variations List */}
        {isGeneratingVariations ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto animate-bounce">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">
                名师 AI 正在为您生成【{knowledgePoint || subject}】3 道高质量举一反三变式题...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                第一题：改变参数与表达 · 第二题：新情境迁移应用 · 第三题：逆向思维与陷阱避坑
              </p>
            </div>
          </div>
        ) : variationError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-2">
            <p className="text-sm font-bold text-rose-800">变式题生成失败：{variationError}</p>
            <button
              onClick={() => generateVariations()}
              className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
            >
              点击重试
            </button>
          </div>
        ) : variations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">暂无生成的变式题目</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              请在上方上传图片识别错题或点击示范错题，然后点击“生成举一反三题目”按钮。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {variations.map((v, idx) => {
              const isExpanded = expandedVarId === v.id;
              return (
                <div
                  key={v.id || idx}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all"
                >
                  {/* Header Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {v.variationType || '同类变式'}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedVarId(isExpanded ? null : v.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {isExpanded ? '收起答案解析' : '查看答案与易错点剖析'}
                      <ArrowRight
                        className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Variation Title */}
                  <div className="text-sm font-medium text-slate-900 leading-relaxed">
                    {v.title}
                  </div>

                  {/* Options if Multiple Choice */}
                  {v.options && v.options.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {v.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expanded Solution & Highlighted Pitfalls */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fade-in">
                      {/* Correct Answer */}
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                        <span className="font-bold text-emerald-900 mr-2">【参考答案】</span>
                        <span className="text-emerald-800 font-semibold">{v.answer}</span>
                      </div>

                      {/* Step Analysis */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
                        <p className="font-bold text-slate-900 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          详细解析与步骤：
                        </p>
                        <p className="leading-relaxed opacity-90 whitespace-pre-line">{v.analysis}</p>
                      </div>

                      {/* Pitfall & Error Highlight */}
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 space-y-1 shadow-2xs">
                        <p className="font-bold text-amber-900 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          【易错点避坑指南】：
                        </p>
                        <p className="leading-relaxed font-medium bg-amber-100/60 p-2 rounded-lg border border-amber-200">
                          {v.pitfalls}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
