---
layout: legal
title: Data Processing Agreement (DPA) / 数据处理协议
permalink: /legal/dpa/
noindex: false
---

# 25Maths Data Processing Agreement (DPA) / 数据处理协议

> **Status / 状态**: **DRAFT** · 待 NZH 法务审 + 签字后生效
> **Last updated / 最后更新**: 2026-04-26
> **Effective date / 生效日期**: TBD
> **Counterparties / 适用对象**: International schools / 教师 / 家长 与 25Maths 之间的数据处理关系

---

## EN · English Version

### 1. Definitions
- **Controller**: the school / parent / teacher who determines the purposes of student data processing
- **Processor**: 25Maths, processing data on behalf of the Controller
- **Sub-processor**: third parties used by 25Maths (e.g. Supabase, Cloudflare)
- **Data Subject**: the student whose data is processed

### 2. Subject Matter & Duration
- **Subject**: storage and processing of student learning data within the 25Maths platform
- **Duration**: matches the term of the relationship; data deleted within 30 days of termination unless legally required otherwise

### 3. Nature & Purpose of Processing
- Personalized study recommendation generation
- Teacher class-progress dashboards
- Parent monthly summary reports
- Aggregated, de-identified platform analytics
- **No** advertising / profiling / sale / AI model training

### 4. Categories of Data
- Authentication identifier (email or phone)
- Display handle (student-chosen, no real name)
- Learning attempts and mastery state
- Track / language / year preferences

**No sensitive categories** (race, religion, biometric, health) are processed.

### 5. Categories of Data Subjects
- Students (typically minors aged 14-18)
- Teachers
- Parents

### 6. Sub-processor List
| Sub-processor | Service | Region | Purpose |
|---|---|---|---|
| Supabase Inc. | Database / Auth | 境外 | Primary backend |
| Cloudflare Inc. | CDN / Workers | Global edge | Static delivery + serverless |

Adding a sub-processor requires 30 days advance written notice + Controller's right to object.

**Cross-border note**:Per NZH 2026-04-26 decision, primary storage is offshore. Compliance via PIPL Article 38 SCC (Schedule A) + data minimization. PIPL security assessment filing not required at current scale (< 100K general PI / < 1M facial). Filing triggered automatically when scale crosses threshold.

### 7. Security Measures
- Encryption at rest (Supabase native)
- Encryption in transit (TLS 1.3)
- Row-Level Security (RLS) for tenant isolation
- Periodic backup with geo-isolation
- Incident response: notify Controller within 72 hours of confirmed data breach

### 8. Data Subject Rights Assistance
25Maths shall, without undue delay, assist Controller in responding to:
- Access requests (export student data within 7 days)
- Correction requests (within 14 days)
- Deletion requests (irreversible · within 7 days)
- Portability requests (JSON format · within 7 days)
- Objection / restriction (effective immediately)

### 9. Cross-Border Transfer
If data is stored outside the Controller's jurisdiction:
- 25Maths confirms compliance with PIPL Article 38 / GDPR Chapter V
- Standard Contractual Clauses (SCC) attached as Schedule A
- Localized storage option available on Controller's request

### 10. Audit Rights
Controller may, with 14 days notice, request:
- Annual security questionnaire response
- Access to recent SOC 2 / equivalent reports of sub-processors
- On-site audit (Controller's expense, mutually agreed schedule)

### 11. Termination
Upon termination:
- Controller may export all data within 30 days
- 25Maths shall delete or return all data within 30 days
- Sub-processors must confirm deletion within 60 days

### 12. Liability & Insurance
TBD-NZH(Beta 期免费 · 商业产品启动后需重审)

---

## 中文版本

### 1. 定义
- **数据控制者**:决定学生数据处理目的的学校 / 家长 / 教师
- **数据处理者**:代表控制者处理数据的 25Maths
- **次级处理者**:25Maths 使用的第三方(如 Supabase / Cloudflare)
- **数据主体**:数据被处理的学生

### 2. 主题与期限
- **主题**:在 25Maths 平台内存储与处理学生学习数据
- **期限**:与关系期限一致 · 终止后 30 日内删除 · 除非法律另有要求

### 3. 处理性质与目的
- 个性化学习推荐生成
- 教师班级进度看板
- 家长月度摘要报告
- 聚合去标识平台统计
- **不**用于:广告 / 画像 / 转卖 / AI 模型训练

### 4. 数据类别
- 认证标识(邮箱或手机)
- Display handle(学生自选 · 无真名)
- 学习答题与掌握状态
- 学习轨道 / 语言 / 年级偏好

**不**处理敏感类别(种族 / 宗教 / 生物特征 / 健康)。

### 5. 数据主体类别
- 学生(通常 14-18 岁未成年人)
- 教师
- 家长

### 6. 次级处理者清单
| 次级处理者 | 服务 | 区域 | 用途 |
|---|---|---|---|
| Supabase Inc. | 数据库 / Auth | 境外 | 主后端 |
| Cloudflare Inc. | CDN / Workers | 全球 edge | 静态分发 + serverless |

新增次级处理者须 30 日前书面通知 + 控制者有权反对。

**跨境提示**:NZH 2026-04-26 决策主存储境外。合规路径走 PIPL 第 38 条 SCC(附件 A)+ 数据最小化。当前规模无须 PIPL 安全评估申报(< 10 万一般个人信息 / < 100 万人脸阈值)· 规模触线时自动启动申报。

### 7. 安全措施
- 静态加密(Supabase 原生)
- 传输加密(TLS 1.3)
- 行级安全(RLS)实现租户隔离
- 周期备份 + 地理隔离
- 事件响应:确认数据泄露后 72 小时内通知控制者

### 8. 数据主体权利协助
25Maths 应及时协助控制者响应:
- 访问请求(7 日内导出)
- 更正请求(14 日内)
- 删除请求(不可逆 · 7 日内)
- 便携性请求(JSON 格式 · 7 日内)
- 反对 / 限制(立即生效)

### 9. 跨境传输
若数据存储在控制者管辖区外:
- 25Maths 确认遵守 PIPL 第 38 条 / GDPR 第五章
- 标准合同条款(SCC)附为附件 A
- 应控制者请求 · 提供本地化存储选项

### 10. 审计权
控制者可在 14 日通知后请求:
- 年度安全问卷答复
- 访问次级处理者近期 SOC 2 / 等效报告
- 现场审计(控制者自费 · 双方约定时间)

### 11. 终止
终止时:
- 控制者可在 30 日内导出全部数据
- 25Maths 应在 30 日内删除或返还全部数据
- 次级处理者须在 60 日内确认删除

### 12. 责任与保险
待 NZH 决定(Beta 期免费 · 商业产品启动后须重审)

---

*本 DPA 草稿基于 ADR-0052(数据隐私治理)+ ADR-0058(Internal Beta 免费)起草 · 待 NZH 法务审 + 签字后生效 · 商业化阶段须重新审议。*
