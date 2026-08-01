import { MistakeQuestion } from '../types';

export const SAMPLE_MISTAKES: MistakeQuestion[] = [
  {
    id: 'sample-1',
    subject: '数学',
    knowledgePoint: '一元二次方程根与系数的关系 (韦达定理)',
    questionText: '已知关于 x 的一元二次方程 x² - (2k + 1)x + k² + 2 = 0 有两个不相等的实数根 x₁ 和 x₂，且满足 x₁² + x₂² = 11，求 k 的值。',
    myWrongAnswer: '解得 k = 3 或 k = -1，所以 k = 3 或 -1。',
    correctAnswer: 'k = 3 (需舍去 k = -1)',
    errorReason: '易错点提醒：求得 k 值后忽略了一元二次方程有实数根的前提条件 Δ = b² - 4ac > 0。当 k = -1 时，Δ = (-1)² - 4(3) = -11 < 0，方程无实根，故 k = -1 为增根必须舍去！',
    difficulty: '中等',
    imageUrl: null,
    createdAt: Date.now() - 86400000 * 2,
    variations: [
      {
        id: 'var-1-1',
        title: '变式 1（逆向判别式与增根检验）：已知关于 x 的方程 x² - 2mx + m² - 1 = 0 的两根 x₁, x₂ 满足 1/x₁ + 1/x₂ = 4/3，求实数 m 的值。',
        options: null,
        answer: 'm = 2',
        analysis: '由韦达定理得 x₁ + x₂ = 2m，x₁·x₂ = m² - 1。代入分式可得 2m / (m² - 1) = 4/3，解得 m = 2 或 m = -3/4。注意：要求分母 x₁·x₂ ≠ 0 且 Δ = 4m² - 4(m² - 1) = 4 > 0 恒成立。代入检验当 m = 2 时成立。',
        pitfalls: '易错点：忽视分式分母 x₁·x₂ ≠ 0 条件，以及分式通分时的符号符号转换误差。',
        variationType: '改变设问与分式结合'
      },
      {
        id: 'var-1-2',
        title: '变式 2（定值与范围迁移）：已知方程 x² - 4x + a = 0 的两根为 α, β，且 α > 1, β > 1，求 a 的取值范围。',
        options: ['A. a < 4', 'B. 3 < a ≤ 4', 'C. a > 3', 'D. 0 < a < 3'],
        answer: 'B. 3 < a ≤ 4',
        analysis: '由 α > 1 且 β > 1，相当于 (α-1) > 0 且 (β-1) > 0。因此满足：① Δ = 16 - 4a ≥ 0 ⇒ a ≤ 4；② (α-1)+(β-1) = α+β-2 = 4-2 = 2 > 0 恒成立；③ (α-1)(β-1) = αβ - (α+β) + 1 = a - 4 + 1 = a - 3 > 0 ⇒ a > 3。综合得 3 < a ≤ 4。',
        pitfalls: '易错点：只考虑 Δ ≥ 0 而遗漏根的分布条件 (α-1)(β-1) > 0。',
        variationType: '根分布与不等式约束'
      },
      {
        id: 'var-1-3',
        title: '变式 3（几何情境应用）：直角三角形两直角边长为方程 x² - 7x + 12 = 0 的两根，求该直角三角形斜边上的高。',
        options: null,
        answer: '2.4',
        analysis: '解方程 x² - 7x + 12 = 0 得两直角边长为 3 和 4。斜边长为 √(3² + 4²) = 5。利用面积法，(1/2) × 3 × 4 = (1/2) × 5 × h，故高 h = 12/5 = 2.4。',
        pitfalls: '易错点：误将 12 直接当成斜边，或混淆直角边与斜边的面积关系。',
        variationType: '跨模块几何结合应用'
      }
    ]
  },
  {
    id: 'sample-2',
    subject: '物理',
    knowledgePoint: '动量守恒定律与机械能守恒陷阱',
    questionText: '质量为 m 的木块在光滑水平面上以速度 v₀ 运动，碰撞质量为 2m 的静止木块并粘在一起。求碰撞过程中损失的机械能 ΔE。',
    myWrongAnswer: 'ΔE = 1/2 m v₀²',
    correctAnswer: 'ΔE = 1/3 m v₀²',
    errorReason: '易错点提醒：完全非弹性碰撞后两物体具有共同速度 v = v₀/3！损失的机械能为碰撞前总动能减去碰撞后系统剩余动能：ΔE = 1/2 m v₀² - 1/2 (3m)(v₀/3)² = 1/3 m v₀²。切勿将碰撞前动能误认为全部损失！',
    difficulty: '中等',
    imageUrl: null,
    createdAt: Date.now() - 86400000,
    variations: [
      {
        id: 'var-2-1',
        title: '变式 1（子弹打木块与弹簧）：质量为 m 的子弹以 v₀ 射入质量为 M 且连接在弹簧上的木块中，求弹簧的最大弹性势能。',
        options: null,
        answer: 'E_p = [m M / (2(m + M))] v₀²',
        analysis: '子弹打入木块瞬间动量守恒：m v₀ = (m + M) v。此后子弹与木块整体压缩弹簧，系统机械能守恒。弹簧最大弹性势能即为共速时的动能：E_p = 1/2 (m + M) v² = 1/2 m² v₀² / (m + M)。',
        pitfalls: '易错点：误认为子弹初始动能全部转化为弹簧弹性势能，忽略了嵌入过程中的热能损失。',
        variationType: '多阶段能量转化迁移'
      },
      {
        id: 'var-2-2',
        title: '变式 2（弹性碰撞逆向计算）：两质量分别为 m₁ 和 m₂ 的小球发生正碰，若碰撞前 m₂ 静止，碰后两球速度大小相等、方向相反，求 m₁ : m₂ 的比例。',
        options: ['A. 1 : 2', 'B. 1 : 3', 'C. 2 : 1', 'D. 3 : 1'],
        answer: 'B. 1 : 3',
        analysis: '设碰撞前 m₁ 速度为 v₀。碰后 v₁\' = -v，v₂\' = v。由动量守恒：m₁ v₀ = -m₁ v + m₂ v ⇒ m₁ v₀ = (m₂ - m₁) v。由机械能守恒（弹性碰撞）：m₁ v₀² = (m₁ + m₂) v²。相除可得 v₀ = (m₁ + m₂) v / m₁，代入得 m₂ = 3 m₁，故 m₁ : m₂ = 1 : 3。',
        pitfalls: '易错点：未明确正方向导致速度矢量符号写错。',
        variationType: '矢量方向与代数比例变式'
      },
      {
        id: 'var-2-3',
        title: '变式 3（平板车模型）：质量 M 的平板车停在光滑水平面上，质量 m 的滑块以 v₀ 冲上平板车，滑块与车面动摩擦因数为 μ。若滑块恰好不掉下，求车长 L。',
        options: null,
        answer: 'L = [M / (2 μ g (m + M))] v₀²',
        analysis: '对系统由动量守恒得 (m+M)v = m v₀。由能量守恒得摩擦力做功等于相对滑动损失的动能：μ m g L = 1/2 m v₀² - 1/2 (m+M) v²。解得 L。',
        pitfalls: '易错点：误把滑块相对于地面的位移代入摩擦力做功公式，滑动摩擦力做功对应的是“相对位移”。',
        variationType: '摩擦力相对位移做功陷阱'
      }
    ]
  },
  {
    id: 'sample-3',
    subject: '英语',
    knowledgePoint: '定语从句关系代词 which 与 that 混淆陷阱',
    questionText: 'This is the very notebook ______ I lost yesterday in the library.',
    myWrongAnswer: 'which',
    correctAnswer: 'that',
    errorReason: '易错点提醒：当先行词被 the very, the only, the same, the last 等修饰时，关系代词只能用 that，不能用 which！',
    difficulty: '简单',
    imageUrl: null,
    createdAt: Date.now() - 3600000 * 5,
    variations: [
      {
        id: 'var-3-1',
        title: '变式 1：China has become one of the most powerful countries ______ play an important role in international affairs.',
        options: ['A. which', 'B. that', 'C. who', 'D. where'],
        answer: 'B. that',
        analysis: '先行词被最高级 the most powerful 修饰，当先行词前有形容词最高级修饰时，关系代词优先使用 that。',
        pitfalls: '易错点：看到先行词是 countries 就随手填 which，忽略了形容词最高级的限制条件。',
        variationType: '最高级修饰限制词变式'
      },
      {
        id: 'var-3-2',
        title: '变式 2：They talked about the teachers and schools ______ they had visited during the summer holiday.',
        options: ['A. which', 'B. who', 'C. that', 'D. whom'],
        answer: 'C. that',
        analysis: '当先行词既包含“人”(teachers) 又包含“物”(schools) 时，关系代词只能用 that。',
        pitfalls: '易错点：只看前面的 teachers 选 who，或只看 schools 选 which。人和物并列必须选 that。',
        variationType: '人和物混合先行词陷阱'
      },
      {
        id: 'var-3-3',
        title: '变式 3：He passed the final math exam, ______ made his parents extremely proud.',
        options: ['A. that', 'B. which', 'C. what', 'D. it'],
        answer: 'B. which',
        analysis: '非限制性定语从句（有逗号隔开）指代前面整个句子所描述的事实，关系代词必须用 which，绝不能用 that。',
        pitfalls: '易错点：混淆限制性与非限制性定语从句，在非限制性定语从句中使用 that。',
        variationType: '非限制性句式对比反转'
      }
    ]
  }
];
