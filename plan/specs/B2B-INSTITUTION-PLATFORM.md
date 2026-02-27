# B2B 教培机构平台 — 技术规格与商业策略

> Version: 1.0
> Created: 2026-02-27
> Owner: Claude Code Opus (Architecture + Research)
> Status: Draft — awaiting approval

## 1. 市场研究摘要

### 1.1 市场规模

| 市场 | 规模 (2024-2025) | 增长率 |
|------|-----------------|--------|
| 全球教培 CRM 市场 | $16.3 亿 | 12.4% CAGR → 2033 年 $46.5 亿 |
| 亚太教培 CRM | $3.8 亿 | 15.2% CAGR (最快增长区) |
| 中国课后辅导市场 | $993 亿 | 11.2% CAGR → 2030 年 $1,689 亿 |
| 补习中心管理软件 | $7.2 亿 | 14.6% CAGR → 2032 年 $18.6 亿 |

### 1.2 竞品分析

| 平台 | 定位 | B2B 定价 | IGCSE 支持 | 教师工具 | 中文 |
|------|------|---------|-----------|---------|------|
| **Kognity** | IGCSE+IB 课程平台 | 按学校报价 | 完整大纲对齐 | 分析+评估 | 无 |
| **Century Tech** | AI 自适应 K-12 | £950-1350/校/年 ($0.40-2/生/月) | 部分 | 仪表盘+推荐 | 无 |
| **Sparx Maths** | UK 数学刷题 | ~£5/生/年 | 无 (GCSE only) | 作业+追踪 | 无 |
| **IXL** | 全科练习平台 | 按座位报价 | 部分 | 诊断+报告 | 无 |
| **Revision Village** | IB 数学专精 | 学生端一次性 $49-99; 教师 EducatorPro 按年 | IGCSE 新上线 | 评估+题库 | 无 |
| **Save My Exams** | 考试资源库 | 学生端 £4-12/月; 无机构版 | 完整 | 无 | 无 |
| **松鼠 AI** | AI 自适应 SaaS | 90%+收入来自技术订阅费 | 无 | 精准诊断+知识图谱 | 完整 |
| **好未来 (TAL)** | 九章大模型教育 | 学习机 ¥2,699+; B2B 按校报价 | 无 | AI 批改+个性化 | 完整 |
| **唯寻 (Vision)** | IGCSE/A-Level 培训 | 课程制; 无 SaaS 平台 | 完整 (人工) | 网校系统 | 完整 |
| **Quizlet** | 闪卡/学习工具 | 2-49 人 8 折; 50+ 人 75 折 (~$27-29/生/年) | 无 | 班级管理 | 部分 |

### 1.3 关键洞察

1. **空白地带**: 目前没有一个平台同时满足 **IGCSE 大纲对齐 + 中文界面 + B2B 教培管理 + AI 自适应**
2. **唯寻/犀牛/翰林** 等头部 IGCSE 教培机构使用自建系统或通用工具，缺少专业化 SaaS
3. **定价参考**: B2B 教育 SaaS 在中国市场的 sweet spot 是 **¥50-200/学生/月** (含教师端免费)
4. **松鼠 AI 模式验证**: 教育 AI SaaS 在中国可行，关键是 **精准诊断 + 个性化路径**
5. **教培机构核心痛点**: 排课、作业追踪、家长报告、学生续费率

## 2. 教培机构核心需求矩阵

基于市场研究，教培机构按优先级排列的功能需求：

### Tier 1: 必须有 (签约决定因素)

| 功能 | 描述 | 竞品覆盖度 | 我们的差异化 |
|------|------|-----------|-------------|
| **教师仪表盘** | 实时查看所有学生练习数据、正确率、弱项 | Century/Kognity/Sparx 有 | + IGCSE 大纲对齐 + 中文 |
| **作业布置与追踪** | 教师按主题/难度布置练习，追踪完成情况 | Sparx/Kognity 有 | + 自动从错题生成 + 截止时间 |
| **学生进度报告** | 按学生/班级的周报/月报，可导出 PDF | Century/IXL 有 | + 双语 EN/CN + 家长端 |
| **班级管理** | 创建班级、分组、批量导入学生 | 基本都有 | + WeChat 通知集成 |
| **大纲对齐** | 练习题按 CIE 0580 / 4MA1 大纲章节组织 | Kognity 有 | 已有 — 完整大纲映射 |

### Tier 2: 高价值 (提升续约率)

| 功能 | 描述 | 竞品覆盖度 | 我们的差异化 |
|------|------|-----------|-------------|
| **弱项诊断** | AI 分析学生弱项并生成个性化学习路径 | Century/松鼠AI 有 | + 考试预测分数 |
| **家长面板** | 家长查看孩子进度、弱项、出勤 | Century 有 | + 中文界面 + WeChat 小程序 |
| **考试预测** | 基于练习数据预测考试成绩和等级 | Revision Village 部分有 | + IGCSE 专精准度高 |
| **排课管理** | 管理教师课表、教室、学生排课 | 通用 SaaS 有 | + 与练习数据联动 |

### Tier 3: 锦上添花 (高端机构需求)

| 功能 | 描述 |
|------|------|
| **白标/品牌定制** | 机构 Logo、域名、配色 |
| **课程管理** | 自定义课程大纲、进度表 |
| **教师绩效** | 教师带教效果分析 |
| **财务集成** | 学费管理、续费提醒 |
| **视频课集成** | 录播/直播课与练习关联 |

## 3. 产品架构设计

### 3.1 多租户 (Multi-Tenant) 模型

```
┌─────────────────────────────────────────────────────────┐
│                    25maths Platform                       │
├─────────────┬───────────────┬───────────────────────────┤
│  B2C Layer  │  B2B Layer    │  Admin Layer              │
│  (学生端)    │  (机构端)      │  (25maths 运营)           │
├─────────────┼───────────────┼───────────────────────────┤
│ • 练习      │ • 教师仪表盘   │ • 机构管理                │
│ • 会员      │ • 作业系统     │ • 用量计费                │
│ • 成就      │ • 班级管理     │ • 内容管理                │
│ • 个人报告   │ • 进度报告     │ • 系统监控                │
│             │ • 家长通知     │                           │
│             │ • 机构管理     │                           │
├─────────────┴───────────────┴───────────────────────────┤
│                  Shared Infrastructure                    │
│  Supabase (Auth + DB + Storage) | Cloudflare Functions   │
└─────────────────────────────────────────────────────────┘
```

### 3.2 角色体系

| 角色 | 权限 | 典型用户 |
|------|------|---------|
| `student` | 做题、查看自己的数据 | 学生 |
| `parent` | 查看绑定孩子的数据 (只读) | 家长 |
| `teacher` | 管理班级、布置作业、查看班级数据 | 教师 |
| `institution_admin` | 管理教师、班级、查看机构数据、配置 | 机构管理员 |
| `platform_admin` | 全局管理 | 25maths 团队 |

### 3.3 数据隔离

```sql
-- 机构表
CREATE TABLE institutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    -- URL-safe identifier: "visionacademy", "hanlin-edu"

    logo_url TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    contact_wechat TEXT,

    plan TEXT NOT NULL DEFAULT 'starter'
        CHECK (plan IN ('starter', 'professional', 'enterprise')),
    max_students INTEGER NOT NULL DEFAULT 50,
    max_teachers INTEGER NOT NULL DEFAULT 5,

    billing_email TEXT,
    billing_cycle TEXT DEFAULT 'annual'
        CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),

    features JSONB DEFAULT '{}',
    -- {"white_label": false, "parent_portal": true, "exam_prediction": false}

    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- 机构成员关系
CREATE TABLE institution_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID REFERENCES institutions NOT NULL,
    user_id UUID REFERENCES auth.users NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),

    display_name TEXT,
    student_number TEXT,
    -- 学号 (机构内部编号)

    joined_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,

    UNIQUE(institution_id, user_id)
);

CREATE INDEX idx_im_institution ON institution_members(institution_id);
CREATE INDEX idx_im_user ON institution_members(user_id);

-- RLS: 机构成员只能看到本机构数据
ALTER TABLE institution_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Institution admins can manage members"
    ON institution_members FOR ALL
    USING (
        institution_id IN (
            SELECT institution_id FROM institution_members
            WHERE user_id = auth.uid() AND role IN ('admin', 'teacher')
        )
    );

CREATE POLICY "Members can view own record"
    ON institution_members FOR SELECT
    USING (user_id = auth.uid());
```

## 4. 教师仪表盘

### 4.1 页面结构

**URL**: `/institution/dashboard`

```
┌──────────────────────────────────────────────────────────┐
│ [机构Logo] 唯寻教育 · CIE 0580 Mathematics               │
│ 欢迎回来，张老师                          [切换班级 ▼]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ 32      │ │ 78%     │ │ 12      │ │ 5       │       │
│  │ 学生总数 │ │ 平均正确率│ │ 本周练习数│ │ 需关注学生│       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                          │
│  ┌──────────────────────┐ ┌─────────────────────────┐   │
│  │ 📋 未完成作业         │ │ ⚠️ 需关注学生            │   │
│  │                      │ │                         │   │
│  │ Algebra Ch2: 5/32    │ │ 王小明 — Trig 正确率 32%  │   │
│  │ Trig Practice: 20/32 │ │ 李华 — 连续3天未登录      │   │
│  │ Mock Exam 1: 28/32   │ │ 张三 — 成绩持续下降       │   │
│  └──────────────────────┘ └─────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 📊 班级成绩趋势 (最近4周)                          │   │
│  │                                                    │   │
│  │  90% ┤                          ╭─                │   │
│  │  80% ┤              ╭──────────╯                  │   │
│  │  70% ┤    ╭────────╯                              │   │
│  │  60% ┤───╯                                        │   │
│  │      ├────────┬────────┬────────┬────────          │   │
│  │      W1       W2       W3       W4                 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 📈 主题掌握度热力图                                │   │
│  │                                                    │   │
│  │           Alg  Num  Geo  Trig  Stat  Func         │   │
│  │ 王小明    🟢   🟢   🟡   🔴    🟡    🟢            │   │
│  │ 李华      🟡   🟢   🟢   🟡    🔴    🟡            │   │
│  │ 张三      🔴   🟡   🟡   🔴    🟡    🔴            │   │
│  │ ...                                                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 4.2 核心功能

**实时班级概览**:
- 全班平均正确率、趋势
- 本周活跃学生数
- 作业完成率
- 需关注学生自动标记 (正确率 < 50% 或 连续 3 天不活跃)

**主题热力图**:
- 每个学生 × 每个大纲主题 的掌握度矩阵
- 颜色: 🟢 (>80%) / 🟡 (50-80%) / 🔴 (<50%) / ⬜ (未练习)
- 点击单元格查看该学生该主题的详细错题

**学生排名 (可选，默认关闭)**:
- 按正确率、练习量、进步幅度排序
- 教师可选择是否对学生可见

## 5. 作业系统

### 5.1 数据模型

```sql
CREATE TABLE assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID REFERENCES institutions NOT NULL,
    teacher_id UUID REFERENCES auth.users NOT NULL,
    class_id UUID REFERENCES classes NOT NULL,

    title TEXT NOT NULL,
    description TEXT,

    -- 作业内容
    exercise_slugs TEXT[] NOT NULL,
    -- 指定要做的练习: ["cie0580-algebra-c2-c2-01", "cie0580-algebra-c2-c2-02"]

    question_count INTEGER,
    -- NULL = 做完所有题; 数字 = 随机抽 N 题

    difficulty_mode TEXT DEFAULT 'linear'
        CHECK (difficulty_mode IN ('linear', 'adaptive', 'fixed-easy', 'fixed-medium', 'fixed-hard')),

    -- 时间
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    due_at TIMESTAMPTZ NOT NULL,
    late_submission BOOLEAN DEFAULT TRUE,

    -- 配置
    show_answers_after TEXT DEFAULT 'due'
        CHECK (show_answers_after IN ('immediately', 'submit', 'due', 'never')),
    allow_retry BOOLEAN DEFAULT FALSE,
    max_retries INTEGER DEFAULT 1,

    status TEXT DEFAULT 'active'
        CHECK (status IN ('draft', 'active', 'closed')),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assignment_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments NOT NULL,
    student_id UUID REFERENCES auth.users NOT NULL,
    session_id UUID REFERENCES exercise_sessions,

    status TEXT DEFAULT 'not_started'
        CHECK (status IN ('not_started', 'in_progress', 'submitted', 'late')),

    score INTEGER,
    question_count INTEGER,
    accuracy_pct NUMERIC(4,1),
    time_spent_seconds INTEGER,

    started_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,

    UNIQUE(assignment_id, student_id)
);

CREATE TABLE classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID REFERENCES institutions NOT NULL,
    name TEXT NOT NULL,
    -- e.g., "IGCSE Maths Y10 Extended", "CIE 0580 周六班"

    board TEXT NOT NULL,
    -- "cie0580" or "edexcel-4ma1"

    tier TEXT,
    -- "Core", "Extended", "Foundation", "Higher"

    teacher_id UUID REFERENCES auth.users NOT NULL,
    academic_year TEXT,
    -- "2025-2026"

    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE class_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    class_id UUID REFERENCES classes NOT NULL,
    student_id UUID REFERENCES auth.users NOT NULL,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,

    UNIQUE(class_id, student_id)
);
```

### 5.2 作业布置流程

```
教师选择主题 → 选择题目/难度 → 设置截止时间 → 发布
                                                    ↓
学生端显示 "新作业" 提醒 → 做题 → 自动提交 → 教师查看结果
```

**教师操作 UI**:

```html
<!-- 作业创建表单 -->
<div class="space-y-6">
    <div>
        <label>作业标题</label>
        <input type="text" placeholder="例: Algebra Chapter 2 Weekly Practice">
    </div>

    <div>
        <label>选择练习主题</label>
        <div class="grid grid-cols-2 gap-2" id="topic-selector">
            <!-- Checkboxes for each syllabus topic -->
            <label><input type="checkbox" value="c2-01"> C2-01 Introduction to Algebra</label>
            <label><input type="checkbox" value="c2-02"> C2-02 Algebraic Manipulation</label>
            <!-- ... -->
        </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
        <div>
            <label>难度模式</label>
            <select>
                <option value="linear">标准顺序</option>
                <option value="adaptive">自适应 (推荐)</option>
                <option value="fixed-easy">简单</option>
                <option value="fixed-medium">中等</option>
                <option value="fixed-hard">困难</option>
            </select>
        </div>
        <div>
            <label>截止时间</label>
            <input type="datetime-local">
        </div>
    </div>

    <div>
        <label>答案显示时机</label>
        <select>
            <option value="immediately">提交后立即显示</option>
            <option value="due">截止后显示</option>
            <option value="never">不显示 (仅教师可见)</option>
        </select>
    </div>

    <button class="cta-button">发布作业</button>
</div>
```

### 5.3 作业结果视图

教师可看到:
- 每个学生的完成状态、分数、用时
- 全班正确率分布图
- 最常见错题 (自动聚合)
- 一键从错题生成补练作业

## 6. 家长面板

### 6.1 访问方式

两种模式 (教培机构可选):

**模式 A: 邮件报告**
- 每周自动发送 PDF 报告到家长邮箱
- 双语 (EN/CN)

**模式 B: 微信小程序 (计划中)**
- 家长扫码关注
- 实时查看孩子练习数据
- 接收作业提醒和成绩通知
- 与教师沟通

### 6.2 家长报告内容

```
═══════════════════════════════════════════
📊 学生进度报告 | Student Progress Report
═══════════════════════════════════════════
学生: 王小明 | Student: Xiaoming Wang
班级: CIE 0580 Extended 周六班
教师: 张老师
报告周期: 2026年2月20日 — 2月27日
═══════════════════════════════════════════

📈 本周概览 | This Week's Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
练习次数: 6 次 (班级平均: 4.5)  ↑
正确率:   72% (班级平均: 68%)   ↑
练习时长: 3小时15分
连续打卡: 12天 🔥

📊 各主题表现 | Topic Performance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
代数 Algebra:      ████████░░ 82% ↑ 进步明显
三角 Trigonometry:  ██████░░░░ 61% ↓ 需要加强
数论 Number:       █████████░ 91% → 保持良好
几何 Geometry:     ███████░░░ 72% ↑ 稳步提升

⚠️ 需关注 | Areas of Concern
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 三角函数 (正弦余弦法则) — 本周5道错题
   建议: 加强 SOHCAHTOA 基础练习

🎯 预测成绩 | Predicted Grade
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
当前预测: B (70-79%)
目标成绩: A (80-89%)
差距分析: 三角函数+10%, 几何+5% 可达标

✅ 作业完成情况 | Homework Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Algebra Ch2:     ✅ 已完成 85%
Trig Practice:   ✅ 已完成 58%
Mock Exam 1:     ⏳ 未开始 (截止: 3月1日)

═══════════════════════════════════════════
25Maths · www.25maths.com
═══════════════════════════════════════════
```

## 7. 考试预测系统

### 7.1 预测模型

基于学生的练习数据预测 IGCSE 考试成绩:

```python
def predict_grade(student_data):
    # 权重分配按大纲各主题的考试占比
    topic_weights = {
        "algebra": 0.20,
        "number": 0.18,
        "geometry": 0.14,
        "trigonometry": 0.12,
        "statistics": 0.12,
        "functions": 0.10,
        "mensuration": 0.08,
        "sequences": 0.06
    }

    weighted_accuracy = sum(
        student_data.topic_accuracy.get(topic, 0.5) * weight
        for topic, weight in topic_weights.items()
    )

    # 调整因子
    consistency_factor = min(student_data.streak / 30, 1.0) * 0.05
    # 持续练习的学生 +5%

    volume_factor = min(student_data.total_sessions / 100, 1.0) * 0.05
    # 练习量充足的学生 +5%

    improvement_factor = student_data.accuracy_trend * 0.10
    # 趋势向上 +10%, 向下 -10%

    predicted_pct = (weighted_accuracy + consistency_factor + volume_factor + improvement_factor) * 100

    # 映射到等级
    if predicted_pct >= 90: return "A*"
    elif predicted_pct >= 80: return "A"
    elif predicted_pct >= 70: return "B"
    elif predicted_pct >= 60: return "C"
    elif predicted_pct >= 50: return "D"
    else: return "E"
```

### 7.2 差距分析

为每个学生生成个性化的 "达标路径":

```
当前预测: B (72%)
目标: A (80%)
差距: 8%

路径建议:
1. 三角函数从 61% → 75% (+14%) → 贡献 +1.7%
2. 几何从 72% → 85% (+13%) → 贡献 +1.8%
3. 函数从 70% → 85% (+15%) → 贡献 +1.5%
4. 统计从 68% → 80% (+12%) → 贡献 +1.4%
总提升潜力: +6.4% → 预测 78.4% (接近 A)

建议每周练习计划:
- 三角: 3次/周 (当前弱项, 提升空间大)
- 几何: 2次/周
- 函数: 2次/周
- 统计: 1次/周
```

## 8. API 设计

### 8.1 机构管理 API

```
POST   /api/v1/institution/register
GET    /api/v1/institution/:id
PUT    /api/v1/institution/:id
GET    /api/v1/institution/:id/members
POST   /api/v1/institution/:id/members/invite
DELETE /api/v1/institution/:id/members/:userId
```

### 8.2 班级管理 API

```
POST   /api/v1/institution/:id/classes
GET    /api/v1/institution/:id/classes
GET    /api/v1/institution/:id/classes/:classId
PUT    /api/v1/institution/:id/classes/:classId
POST   /api/v1/institution/:id/classes/:classId/students
DELETE /api/v1/institution/:id/classes/:classId/students/:studentId
GET    /api/v1/institution/:id/classes/:classId/stats
```

### 8.3 作业 API

```
POST   /api/v1/institution/:id/assignments
GET    /api/v1/institution/:id/assignments
GET    /api/v1/institution/:id/assignments/:assignmentId
PUT    /api/v1/institution/:id/assignments/:assignmentId
GET    /api/v1/institution/:id/assignments/:assignmentId/submissions
GET    /api/v1/student/assignments           (学生端: 我的作业)
POST   /api/v1/student/assignments/:id/start
POST   /api/v1/student/assignments/:id/submit
```

### 8.4 报告 API

```
GET    /api/v1/institution/:id/reports/class/:classId/weekly
GET    /api/v1/institution/:id/reports/student/:studentId
GET    /api/v1/institution/:id/reports/student/:studentId/prediction
POST   /api/v1/institution/:id/reports/student/:studentId/send-parent
GET    /api/v1/parent/child/:studentId/report
```

### 8.5 教师仪表盘 API

```
GET    /api/v1/teacher/dashboard
GET    /api/v1/teacher/classes/:classId/heatmap
GET    /api/v1/teacher/classes/:classId/at-risk-students
GET    /api/v1/teacher/classes/:classId/common-mistakes
```

## 9. 定价策略

### 9.1 B2B 定价模型

| 方案 | Starter | Professional | Enterprise |
|------|---------|-------------|------------|
| **价格** | ¥99/学生/月 | ¥149/学生/月 | 定制报价 |
| **美元** | ~$14/学生/月 | ~$21/学生/月 | 定制 |
| **最少学生数** | 10 | 30 | 100 |
| **教师账号** | 2 | 5 | 不限 |
| **教师仪表盘** | 基础版 | 完整版 | 完整版 |
| **作业系统** | ✅ | ✅ | ✅ |
| **班级管理** | 1 个班 | 不限 | 不限 |
| **学生练习** | 全部题库 | 全部题库 | 全部题库 |
| **错题分析** | ✅ | ✅ | ✅ |
| **家长报告** | 邮件 (月报) | 邮件 (周报) | 邮件+小程序 |
| **考试预测** | ❌ | ✅ | ✅ |
| **自适应难度** | ❌ | ✅ | ✅ |
| **数据导出** | CSV | CSV + PDF | CSV + PDF + API |
| **白标品牌** | ❌ | ❌ | ✅ |
| **专属客服** | 邮件 | 微信群 | 专属对接人 |
| **API 集成** | ❌ | ❌ | ✅ |

### 9.2 年付折扣

- 月付: 原价
- 季付: 9 折
- 年付: 8 折 (锁定价格)

### 9.3 收入预测

| 阶段 | 机构数 | 平均学生/机构 | 平均 ARPU | 月收入 |
|------|-------|-------------|----------|--------|
| Q2 2026 (Beta) | 3 | 20 | ¥99 | ¥5,940 |
| Q3 2026 | 10 | 30 | ¥120 | ¥36,000 |
| Q4 2026 | 25 | 40 | ¥130 | ¥130,000 |
| Q2 2027 | 50 | 50 | ¥140 | ¥350,000 |

## 10. 获客策略

### 10.1 目标客户画像

**头部 IGCSE 教培机构 (10 家)**:
- 唯寻教育 (Vision Academy) — 全国 IGCSE 头部
- 翰林国际教育 (Hanlin Edu) — AMC + IGCSE
- 犀牛国际教育 (X-New Edu) — 竞赛 + IGCSE
- 学为贵 — IGCSE 辅导
- 朗播 — 国际课程

**区域型机构 (50+ 家)**:
- 上海: 国际课程中心 5-10 家
- 深圳: IGCSE 辅导班 5-10 家
- 北京: 国际部/国际学校合作 5-10 家
- 广州: 国际课程 3-5 家
- 其他: 成都、杭州、南京等

### 10.2 获客路径

1. **免费 → 付费漏斗**:
   - 教师免费注册 → 使用题库 → 需要班级管理 → 升级 Starter
   - 学生免费使用 → 教师看到 → 机构决策采购

2. **内容营销**:
   - SEO 博客文章 (已有 11 篇，持续增加)
   - 教师版题库 (teacher-only question bank)
   - IGCSE 考试趋势分析报告 (免费下载 → 留资)

3. **社群运营**:
   - IGCSE 教师微信群
   - 定期线上教学研讨会
   - 考前冲刺活动 (免费开放 → 付费转化)

4. **地推**:
   - 上海/深圳/北京 国际学校展会
   - 教培机构 1v1 拜访
   - 试用 30 天免费 (含全功能)

## 11. 技术实施路线图

### Phase 1: MVP (4 周)
- [ ] 机构注册与管理
- [ ] 班级创建与学生邀请
- [ ] 教师仪表盘 (基础版)
- [ ] 作业布置与追踪
- [ ] 基础进度报告

### Phase 2: 增强 (4 周)
- [ ] 主题热力图
- [ ] 家长邮件报告
- [ ] 考试预测模型
- [ ] 错题自动补练
- [ ] 数据导出 (CSV + PDF)

### Phase 3: 规模化 (4 周)
- [ ] 多机构管理后台
- [ ] 白标功能
- [ ] API 集成
- [ ] 计费系统
- [ ] 微信小程序 (家长端)

### Phase 4: 智能化 (持续)
- [ ] AI 教学助手 (课堂辅助)
- [ ] 自动化学习路径
- [ ] 同业对标数据
- [ ] 视频课集成

## 12. 风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 教培机构决策周期长 | 签约慢 | 30 天免费试用 + 教师个人端先渗透 |
| 与现有系统集成难 | 实施成本高 | 提供 CSV 批量导入 + 标准 API |
| 中国教培政策不确定 | 市场波动 | 同时服务东南亚 (新加坡、马来西亚、泰国) |
| 数据隐私合规 | 法律风险 | PIPL 合规 + 数据本地化 (阿里云/腾讯云) |
| 竞品跟进 | 差异化被追平 | 深耕 IGCSE 垂直场景 + 双语壁垒 |

## 13. 实施分工

| 任务 | 分配给 | 交付物 |
|------|--------|--------|
| 数据库迁移 (机构/班级/作业) | Codex-Backend | SQL migration files |
| 机构管理 API | Codex-Backend | `functions/api/v1/institution/` |
| 作业 API | Codex-Backend | `functions/api/v1/institution/assignments/` |
| 教师仪表盘 UI | Codex-Frontend | `institution/dashboard.html` + JS |
| 作业管理 UI | Codex-Frontend | `institution/assignments.html` + JS |
| 家长报告模板 | Claude Code Opus | HTML email template |
| 考试预测引擎 | Claude Code Opus (设计) → Codex (实现) | `functions/_lib/prediction_engine.js` |
| 主题热力图组件 | Codex-Frontend | `assets/js/heatmap.js` |
| B2B 落地页 | Codex-Frontend | `institution/index.html` |
| 微信小程序 | 外部开发或后续 | 独立项目 |
| 安全审计 | Gemini-QA | RLS 策略 + API 鉴权测试 |
