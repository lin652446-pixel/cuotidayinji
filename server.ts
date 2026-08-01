import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit for image uploads (base64)
  app.use(express.json({ limit: '20mb' }));

  // Initialize Gemini SDK lazily / safely
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY environment variable. Please add it in Settings > Secrets.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Route: OCR Image Analysis
  app.post('/api/ocr-analyze', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg' } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Missing imageBase64 field.' });
      }

      const ai = getAi();
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const prompt = `你是一位全科通用的资深中小学教师与名师教研组组长。请仔细识别并分析这张错题照片中的内容。
请提取并规范输出以下信息：
1. subject: 学科（仅选其一：数学、语文、英语、物理、化学、生物、历史、地理、政治、通用）
2. knowledgePoint: 核心知识点/考点名称（如“一元二次方程韦达定理”、“牛顿第二定律动量结合”、“定语从句关系代词用法”）
3. questionText: 识别出的完整题目文字内容（保持排版清晰）
4. myWrongAnswer: 试卷/照片中学生写错的答案或错误解答（如果能识别，否则写“未识别到错解”）
5. correctAnswer: 题目的标准正确答案及关键步骤
6. errorReason: 深入的错因剖析与【易错点陷阱说明】（着重分析学生容易在什么步骤掉坑、混淆概念或忽视边界条件）
7. difficulty: 难度级别（简单、中等、困难）`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING, description: '学科名称' },
              knowledgePoint: { type: Type.STRING, description: '知识点或考点' },
              questionText: { type: Type.STRING, description: '题目文本' },
              myWrongAnswer: { type: Type.STRING, description: '学生的错解' },
              correctAnswer: { type: Type.STRING, description: '正确答案与步骤' },
              errorReason: { type: Type.STRING, description: '错因剖析与易错点说明' },
              difficulty: { type: Type.STRING, description: '难度：简单/中等/困难' },
            },
            required: ['subject', 'knowledgePoint', 'questionText', 'correctAnswer', 'errorReason', 'difficulty'],
          },
        },
      });

      const jsonText = response.text || '{}';
      const parsedData = JSON.parse(jsonText);
      return res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error('Error in /api/ocr-analyze:', error);
      return res.status(500).json({
        error: error.message || '识别错题图片失败，请重试',
      });
    }
  });

  // API Route: Generate 3 Variations (举一反三变式题)
  app.post('/api/generate-variations', async (req, res) => {
    try {
      const { subject, knowledgePoint, questionText, correctAnswer, errorReason, count = 3 } = req.body;

      if (!questionText || !knowledgePoint) {
        return res.status(400).json({ error: 'Missing questionText or knowledgePoint' });
      }

      const ai = getAi();

      const prompt = `你是一位顶级教研专家。请根据以下原错题的【学科】、【知识点】、【题目文本】和【易错点】，智能生成 ${count} 道同类考点的“举一反三”高质量练习变式题！

原题学科：${subject || '通用'}
核心知识点：${knowledgePoint}
原题内容：${questionText}
原题标准答案：${correctAnswer || '未知'}
原题易错点：${errorReason || '无'}

要求：
1. 必须精准覆盖同一个核心知识点【${knowledgePoint}】。
2. 3道题的变式维度应有所区别：
   - 变式 1 (数值/表达变换)：改变已知条件数据或问法，检验基本公式/概念熟练度；
   - 变式 2 (情境迁移/综合应用)：结合新情境或跨模块知识，提升迁移能力；
   - 变式 3 (逆向思维/防坑陷阱)：设置逆向推理或高频易错防坑点，专治马虎和概念混淆。
3. 每道变式题必须附带：
   - title: 题目完整描述
   - options: 选择题选项列表（如 ["A. ...", "B. ...", "C. ...", "D. ..."]），如果是填空或解答题则设为 null 或空数组
   - answer: 正确答案
   - analysis: 详细解题步骤与思路
   - pitfalls: 【易错点剖析与防坑提醒】（特别高亮标出解题时最容易出错的关键细节或陷阱）
   - variationType: 变式类型名称（如：“数值变换”、“情境迁移”、“逆向陷阱”）`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              variations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: '变式题题目' },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: '选择题选项，非选择题为 null',
                    },
                    answer: { type: Type.STRING, description: '参考答案' },
                    analysis: { type: Type.STRING, description: '步骤解析' },
                    pitfalls: { type: Type.STRING, description: '易错点剖析与陷阱提示' },
                    variationType: { type: Type.STRING, description: '变式类型' },
                  },
                  required: ['title', 'answer', 'analysis', 'pitfalls', 'variationType'],
                },
              },
            },
            required: ['variations'],
          },
        },
      });

      const jsonText = response.text || '{"variations": []}';
      const parsedData = JSON.parse(jsonText);

      // Attach random or timestamp ids
      const variations = (parsedData.variations || []).map((item: any, idx: number) => ({
        ...item,
        id: `var-${Date.now()}-${idx + 1}`,
      }));

      return res.json({ success: true, variations });
    } catch (error: any) {
      console.error('Error in /api/generate-variations:', error);
      return res.status(500).json({
        error: error.message || '生成举一反三题目失败，请重试',
      });
    }
  });

  // Vite middleware for dev or static server for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] 错题举一反三打印机 API Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
