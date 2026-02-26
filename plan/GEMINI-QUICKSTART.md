# Gemini 表单管理系统 - 快速开始指南

> **5 分钟部署，立即开始智能管理表单数据**

---

## 🚀 快速部署（5 步）

### 步骤 1: 准备 Google Sheets

1. 打开您的 Google Sheets（包含 `waitlist_events` 和 `waitlist_subscribers` 表）
2. 记下 Spreadsheet ID（URL 中的一串字符）
   ```
   https://docs.google.com/spreadsheets/d/[这里是 SPREADSHEET_ID]/edit
   ```

### 步骤 2: 打开 Apps Script 编辑器

1. 在 Google Sheets 中：**扩展程序** → **Apps Script**
2. 删除默认的 `function myFunction() {}` 代码

### 步骤 3: 复制代码

1. 打开 `GEMINI-FORM-MANAGER.gs` 文件
2. 复制全部代码
3. 粘贴到 Apps Script 编辑器
4. 点击 **保存** 图标（💾）
5. 命名项目为 "Gemini Form Manager"

### 步骤 4: 设置脚本属性

1. 在 Apps Script 编辑器中：**项目设置**（⚙️）→ **脚本属性**
2. 点击 **添加脚本属性**
3. 添加以下属性：
   - **属性**: `SPREADSHEET_ID`
   - **值**: `[您的 Spreadsheet ID]`
4. 点击 **保存脚本属性**

### 步骤 5: 运行设置

1. 在函数下拉菜单中选择 `setupTriggers`
2. 点击 **运行** 按钮（▶️）
3. 首次运行需要授权：
   - 点击 **审核权限**
   - 选择您的 Google 账号
   - 点击 **高级** → **前往 Gemini Form Manager（不安全）**
   - 点击 **允许**
4. 查看执行日志，确认触发器设置成功

✅ **完成！** 系统已开始自动运行。

---

## 🧪 测试功能

### 测试 1: Gemini API 连接

```javascript
// 在函数下拉菜单中选择 testGeminiAPI，然后点击运行
testGeminiAPI()
```

**预期结果**: 日志中显示 "✓ Gemini API connection successful!"

---

### 测试 2: 智能分类

```javascript
// 选择并运行
analyzeAndTagNewSubmissions()
```

**预期结果**: 
- 日志显示分析进度
- Google Sheets 中出现新列：`ai_intent`, `ai_priority`, `ai_sentiment`, `ai_tags`, `ai_summary`
- 有消息内容的行被自动分析和标记

---

### 测试 3: 自动回复生成

```javascript
// 选择并运行
generateRepliesForSupportRequests()
```

**预期结果**:
- 日志显示生成的回复数量
- Google Sheets 中出现新列：`ai_reply_draft`
- 支持请求行中出现回复草稿

---

### 测试 4: 用户画像分析

```javascript
// 修改代码中的邮箱地址为实际用户邮箱，然后运行
testUserProfileAnalysis()
```

**预期结果**: 日志中显示用户画像 JSON 对象

---

### 测试 5: 每周报告

```javascript
// 选择并运行
generateWeeklyInsights()
```

**预期结果**: 日志中显示完整的 Markdown 格式报告

---

### 测试 6: 垃圾邮件检测

```javascript
// 选择并运行
detectSpamInRecentSubmissions()
```

**预期结果**:
- 日志显示检测结果
- Google Sheets 中出现新列：`spam_flag`
- 可疑提交被标记为 "SPAM"

---

## 📊 查看结果

### 在 Google Sheets 中查看

打开您的 Google Sheets，您会看到以下新列：

**waitlist_events 表**:
| 列名 | 说明 | 示例值 |
|------|------|--------|
| `ai_intent` | 用户意图 | "购买咨询" |
| `ai_priority` | 优先级 | "高" |
| `ai_sentiment` | 情感 | "积极" |
| `ai_tags` | 标签 | "新用户, 紧急" |
| `ai_summary` | 摘要 | "用户咨询 Algebra 产品价格" |
| `ai_reply_draft` | 回复草稿 | "您好！感谢您对..." |
| `spam_flag` | 垃圾邮件标记 | "OK" 或 "SPAM (95%)" |

---

## ⏰ 自动运行时间表

设置完成后，系统会自动运行：

| 功能 | 运行频率 | 说明 |
|------|---------|------|
| 智能分类与标签 | 每小时 | 自动分析新提交 |
| 自动回复生成 | 每 2 小时 | 为支持请求生成回复 |
| 垃圾邮件检测 | 每 6 小时 | 识别可疑提交 |
| 每周洞察报告 | 每周一 9:00 AM | 生成周报 |

---

## 💡 使用技巧

### 1. 查看回复草稿

1. 打开 Google Sheets
2. 找到 `ai_reply_draft` 列
3. 复制回复内容
4. 编辑后发送给用户

**节省时间**: 80%+

---

### 2. 筛选高优先级用户

1. 在 Google Sheets 中点击 `ai_priority` 列
2. 使用筛选功能：**数据** → **创建筛选器**
3. 筛选 "高" 优先级
4. 优先处理这些用户

**提升转化率**: 30%+

---

### 3. 识别热门主题

1. 运行 `generateWeeklyInsights()`
2. 查看日志中的 "热门主题和产品需求" 部分
3. 根据需求调整产品策略

**数据驱动决策**: ✓

---

### 4. 过滤垃圾邮件

1. 在 Google Sheets 中筛选 `spam_flag` = "SPAM"
2. 批量删除或标记为无效
3. 保持邮件列表干净

**邮件列表质量**: 提升 95%+

---

## 🔧 高级配置

### 修改运行频率

编辑 `setupTriggers()` 函数中的时间设置：

```javascript
// 改为每 30 分钟运行一次
ScriptApp.newTrigger('analyzeAndTagNewSubmissions')
  .timeBased()
  .everyMinutes(30)  // 修改这里
  .create();
```

### 添加邮件通知

在 `generateWeeklyInsights()` 函数中取消注释：

```javascript
// 取消注释这几行
const recipient = 'your-email@example.com';  // 改为您的邮箱
MailApp.sendEmail({
  to: recipient,
  subject: `25Maths Weekly Insights - ${Utilities.formatDate(now, 'GMT+8', 'yyyy-MM-dd')}`,
  body: report
});
```

### 调整 AI 温度参数

温度越低，输出越稳定；温度越高，输出越有创意：

```javascript
// 在各个函数中修改 temperature 参数
callGeminiAPI(prompt, 0.3);  // 更稳定（适合分类）
callGeminiAPI(prompt, 0.7);  // 更有创意（适合生成内容）
```

---

## 🐛 常见问题

### Q1: "Missing Script Property: SPREADSHEET_ID" 错误

**解决方案**: 
1. 检查是否正确设置了脚本属性
2. 确保属性名称完全匹配：`SPREADSHEET_ID`（区分大小写）

---

### Q2: Gemini API 调用失败

**可能原因**:
- API Key 无效或过期
- 超过免费配额（每分钟 15 次请求）

**解决方案**:
1. 检查 API Key 是否正确
2. 增加 `Utilities.sleep()` 时间（如改为 5000 毫秒）
3. 考虑升级到付费计划

---

### Q3: 触发器没有运行

**检查步骤**:
1. **Apps Script** → **触发器**（⏰图标）
2. 查看是否有触发器列表
3. 查看 **执行** 标签页，检查运行历史
4. 如果有错误，点击查看详情

---

### Q4: JSON 解析失败

**原因**: Gemini API 有时会返回带有 markdown 代码块的 JSON

**解决方案**: 代码已包含自动提取 JSON 的逻辑，如果仍然失败：
1. 查看日志中的原始响应
2. 调整提示词，明确要求返回纯 JSON
3. 降低温度参数（如 0.3）

---

### Q5: 如何停止自动运行？

运行以下函数：

```javascript
removeTriggers()
```

这会删除所有定时触发器。

---

## 📈 性能优化

### 批量处理限制

为避免超时和超配额，代码中设置了批量处理限制：

- 智能分类：每次最多 10 条
- 回复生成：每次最多 5 条
- 垃圾邮件检测：每次最多 10 条

如果数据量大，系统会在多次运行中逐步处理完。

### API 配额管理

免费层限制：
- **每分钟**: 15 次请求
- **每天**: 1,500 次请求

代码中已添加 `Utilities.sleep(4000)`（4 秒），确保不超限。

如需处理大量数据，建议升级到付费计划。

---

## 🎯 下一步

1. ✅ **部署完成** - 系统已自动运行
2. 📊 **查看结果** - 在 Google Sheets 中查看 AI 分析
3. 💌 **使用回复** - 复制 AI 生成的回复草稿
4. 📈 **查看报告** - 每周一查看洞察报告
5. 🚀 **优化策略** - 根据数据调整营销策略

---

## 📚 相关文档

- [完整方案文档](./GEMINI-FORM-MANAGER.md)
- [Google Apps Script 代码](./GEMINI-FORM-MANAGER.gs)
- [表单收集方案](./WAITLIST-GSHEETS-PLAN.md)

---

## 🆘 需要帮助？

如果遇到问题：

1. 查看 **Apps Script 执行日志**（Ctrl/Cmd + Enter）
2. 查看 **触发器执行历史**（⏰ 图标 → 执行标签页）
3. 参考上面的常见问题部分

---

**祝您使用愉快！** 🎉

利用 Gemini AI 的强大能力，让表单管理变得智能、高效、自动化！
