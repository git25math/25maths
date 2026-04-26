---
layout: legal
title: Privacy Policy / 隐私政策
permalink: /legal/privacy-policy/
noindex: false
---

# 25Maths Privacy Policy / 隐私政策

> **Status / 状态**: **DRAFT** · 待 NZH 法务审 + 签字后生效
> **Last updated / 最后更新**: 2026-04-26
> **Effective date / 生效日期**: TBD(待 NZH 签)
> **Applicable legal regimes / 适用法规**:
> - 🇨🇳 中国《个人信息保护法》(PIPL · 2021-11-01)
> - 🇪🇺 EU GDPR(若涉及欧盟学生 / 营销)
> - 🌏 学校 DPA(若学校签署独立条款)

---

## EN · English Version

### 1. Who We Are
25Maths ("we", "us", "our") is a self-built study platform created by an IGCSE international-school mathematics teacher (the "founder") for students in his class and a small invited circle. **During Internal Beta (until further notice), 25Maths is provided free of charge with no paywall** (per ADR-0058). We are **not a commercial tutoring service** (per ADR-0059 compliance red lines).

### 2. What We Collect

**Required**:
- Authentication identifier (email **or** phone, student/teacher/parent's choice)
- Learning data (question attempts, mastery progression, KP-level signals — internally keyed by anonymous UUID)
- User preferences (study track, language, year level)

**Not collected**:
- Real names (we use student-chosen display handles)
- Government ID / national ID
- Payment information (Internal Beta is free)
- Behavioral surveillance (no clickstream, no off-platform tracking)

**Minor protections**:
- Users under 14 require parent / guardian explicit consent (PIPL 14 岁红线 / COPPA-equivalent)
- Sensitive personal information is never collected from minors

### 3. How We Use It
- Generate personalized study recommendations
- Show teacher-class-level progress (only to teacher who created the class)
- Show parent-monthly-summary (only to parent linked to their child)
- Improve the platform via aggregated, de-identified analytics

We **never** use student data for: advertising profiling, sale to third parties, training general-purpose AI models, peer-comparison ranking (per ADR-0040 soul charter red line 3-4).

### 4. Data Storage & Cross-Border
- Backend: Supabase (project ref `jjjigohjvmyewasmmmyf`)
- Primary storage region: **境外**(per NZH 2026-04-26 decision)
- **Cross-border data transfer / PIPL Article 38 compliance**:
  - Legal basis: Standard Contractual Clauses (SCC) — see DPA Schedule A
  - Data minimization (privacy § 2):no real names / no national ID / no payment / no surveillance
  - Sensitive personal information of minors:never collected (privacy § 8)
  - Subject rights mirror local execution:export / correction / deletion processed on Supabase backend within SLA
  - PIPL 安全评估申报:Beta 期免(< 100 万人脸 / < 10 万一般个人信息门槛)· 规模触线时启动申报
- Backups: encrypted at rest + isolated geo-region

### 5. Your Rights (GDPR + PIPL)
You may at any time:
- Access all your data via Settings → Export
- Correct inaccurate data
- **Delete your account and all associated data** (irreversible · processed within 7 days)
- Withdraw consent (effective immediately)
- Object to specific processing
- Receive a portable copy in JSON format
- For minors: parents may exercise these rights on the minor's behalf

### 6. Sharing & Disclosure
We share data with:
- **Supabase** (data processor · contractually bound to delete on our instruction)
- **Cloudflare** (CDN · sees IP for routing only · no personal-data retention)

We do NOT share with: advertisers, brokers, school administrators (unless legally compelled), or any 3rd-party analytics service.

### 7. Cookies & Local Storage
- Session cookie: required for login
- localStorage: used for caching learning state (offline-first)
- No tracking cookies, no advertising cookies

### 8. Children
- Default minimum age: 14 (PIPL alignment for general consent)
- Under 14: require **explicit parent consent**, separate registration flow
- We will never knowingly collect data from children under 14 without verified parental consent

### 9. Contact
- Privacy Officer / 隐私负责人: NZH (support@25maths.com)
- Response SLA: 7 days

### 10. Changes
We will notify users of material changes via in-app banner + email at least 14 days before effective date. Continued use after the effective date constitutes acceptance.

---

## 中文版本

### 1. 我们是谁
25Maths(「我们」)是一名 IGCSE 国际学校数学老师(「创办人」)为他班级里的学生及一小部分邀请用户自建的学习平台。**在 Internal Beta 期间(直至另行通知),25Maths 免费提供 · 无任何付费墙**(详见 ADR-0058)。我们**不是商业补习服务**(详见 ADR-0059 合规 6 红线)。

### 2. 我们收集什么

**必要信息**:
- 认证标识(邮箱 **或** 手机 · 学生/教师/家长可选)
- 学习数据(答题记录 / 掌握进展 / KP 级信号 · 内部以匿名 UUID 关联)
- 用户偏好(学习轨道 / 语言 / 年级)

**不收集**:
- 真实姓名(使用学生自选 display name)
- 政府身份证 / 国民身份证
- 支付信息(Beta 期免费)
- 行为监控(无 clickstream / 无平台外追踪)

**未成年人保护**:
- 14 岁以下用户必须有家长 / 监护人明确同意(PIPL 14 岁红线)
- 永不收集未成年人敏感个人信息

### 3. 我们如何使用
- 生成个性化学习推荐
- 班级进度(仅展示给创建班级的教师)
- 家长月度摘要(仅展示给关联学生的家长)
- 通过去标识聚合统计改进平台

我们**绝不**用学生数据用于:广告画像 / 转卖第三方 / 训练通用 AI 模型 / 同伴排名比较(详见 ADR-0040 灵魂宪章红线 3-4)。

### 4. 数据存储与跨境
- 后端:Supabase(项目 ref `jjjigohjvmyewasmmmyf`)
- 主存储区域:**境外**(NZH 2026-04-26 决策)
- **跨境数据传输 / PIPL 第 38 条合规**:
  - 法律基础:标准合同条款(SCC)— 详见 DPA 附件 A
  - 数据最小化(隐私 § 2):不收真名 / 不收身份证 / 不收支付 / 不行为监控
  - 未成年人敏感个人信息:永不收集(隐私 § 8)
  - 主体权利等效执行:Supabase 后端 SLA 内处理导出 / 更正 / 删除
  - PIPL 安全评估申报:Beta 期免(< 100 万人脸 / < 10 万一般个人信息门槛)· 规模触线时启动申报
- 备份:静态加密 + 地理隔离

### 5. 您的权利(GDPR + PIPL)
您随时可:
- 通过 设置 → 导出 访问全部数据
- 更正不准确数据
- **删除账户及关联全部数据**(不可逆 · 7 日内处理)
- 撤回同意(立即生效)
- 反对特定处理
- 接收 JSON 格式的便携副本
- 未成年人:家长可代为行使权利

### 6. 共享与披露
我们与以下方共享数据:
- **Supabase**(数据处理方 · 合同约束 · 我们指令删除)
- **Cloudflare**(CDN · 仅基于 IP 路由 · 不留存个人数据)

我们**不**与:广告商 / 数据中介 / 学校管理层(法律强制除外)/ 任何第三方分析服务 共享。

### 7. Cookies 与本地存储
- 会话 cookie:登录所需
- localStorage:学习状态缓存(离线优先)
- 无追踪 cookie · 无广告 cookie

### 8. 儿童保护
- 默认最低年龄:14 岁(PIPL 一般同意)
- 14 岁以下:必须**明确家长同意** · 独立注册流程
- 永不在未经家长验证同意的情况下知情收集 14 岁以下儿童数据

### 9. 联系方式
- 隐私负责人:NZH(support@25maths.com)
- 响应 SLA:7 日

### 10. 变更
重大变更将通过应用内 banner + 邮件 · 在生效日 14 日前通知用户。生效日后继续使用即视为接受。

---

*本草稿基于 ADR-0052(数据隐私治理)+ ADR-0058(Internal Beta 免费)+ ADR-0059(创立初心合规边界)+ ADR-0040(灵魂宪章红线)起草 · 待 NZH 法务审 + 签字后生效。*
