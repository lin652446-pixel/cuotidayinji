export interface VariationQuestion {
  id: string;
  title: string;
  options?: string[] | null;
  answer: string;
  analysis: string;
  pitfalls: string; // 易错点分析 / 陷阱提醒
  variationType: string; // 变式类型：如“数值变换”、“逆向思考”、“场景迁移”
}

export interface MistakeQuestion {
  id: string;
  subject: string; // 学科: 数学, 语文, 英语, 物理, 化学, 生物, 历史, 地理, 政治, 通用
  knowledgePoint: string; // 知识点
  questionText: string; // 错题原文
  myWrongAnswer?: string; // 用户错解
  correctAnswer?: string; // 正确答案
  errorReason?: string; // 错因及易错点分析
  difficulty: '简单' | '中等' | '困难';
  imageUrl?: string | null; // 原图 base64 或 URL
  variations: VariationQuestion[]; // 举一反三变式题列表
  createdAt: number; // 保存时间戳
  tags?: string[];
}

export type ViewMode = 'recognize' | 'notebook' | 'print-preview';

export interface FilterState {
  subject: string;
  keyword: string;
  difficulty: string;
  dateRange: 'all' | 'today' | 'week' | 'month';
}
