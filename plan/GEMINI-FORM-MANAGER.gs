/**
 * Gemini API 表单数据智能管理系统
 * 
 * 功能：
 * 1. 智能分类与标签
 * 2. 自动回复生成
 * 3. 用户画像分析
 * 4. 每周洞察报告
 * 5. 垃圾邮件检测
 * 
 * 部署步骤：
 * 1. 打开 Google Sheets → 扩展程序 → Apps Script
 * 2. 复制此代码到编辑器
 * 3. 设置脚本属性：SPREADSHEET_ID（您的 Google Sheets ID）
 * 4. 运行 setupTriggers() 设置定时触发器
 * 5. 手动测试各个功能
 */

// ========== 配置 ==========

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// ========== 核心 API 调用函数 ==========

/**
 * 调用 Gemini API
 * @param {string} prompt - 提示词
 * @param {number} temperature - 温度参数（0-1，越高越随机）
 * @returns {string|null} - API 响应文本
 */
function callGeminiAPI(prompt, temperature = 0.7) {
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: 2048,
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      options
    );
    
    const json = JSON.parse(response.getContentText());
    
    if (json.candidates && json.candidates[0] && json.candidates[0].content) {
      return json.candidates[0].content.parts[0].text;
    }
    
    Logger.log('Invalid Gemini API response: ' + response.getContentText());
    return null;
  } catch (error) {
    Logger.log('Gemini API Error: ' + error.message);
    return null;
  }
}

/**
 * 获取 Google Sheets
 */
function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) {
    throw new Error('Missing Script Property: SPREADSHEET_ID');
  }
  return SpreadsheetApp.openById(id);
}

// ========== 功能模块 ==========

/**
 * 1. 智能分类与标签
 * 
 * 自动分析新提交的表单，识别用户意图、优先级、情感等
 * 建议：每小时运行一次
 */
function analyzeAndTagNewSubmissions() {
  const ss = getSpreadsheet_();
  const events = ss.getSheetByName('waitlist_events');
  
  if (!events) {
    Logger.log('Sheet "waitlist_events" not found');
    return;
  }
  
  const lastRow = events.getLastRow();
  if (lastRow < 2) {
    Logger.log('No data to analyze');
    return;
  }
  
  // 检查是否有分析列，如果没有则添加
  const headers = events.getRange(1, 1, 1, events.getLastColumn()).getValues()[0];
  const analysisStartCol = headers.length + 1;
  
  if (!headers.includes('ai_intent')) {
    events.getRange(1, analysisStartCol, 1, 5).setValues([[
      'ai_intent', 'ai_priority', 'ai_sentiment', 'ai_tags', 'ai_summary'
    ]]);
  }
  
  // 获取所有数据
  const data = events.getRange(2, 1, lastRow - 1, headers.length).getValues();
  let analyzed = 0;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // 检查是否已分析（如果 ai_intent 列有值则跳过）
    const intentColIndex = headers.indexOf('ai_intent');
    if (intentColIndex >= 0 && row[intentColIndex]) {
      continue;
    }
    
    const message = row[10]; // message 列
    const topic = row[3];    // topic 列
    const persona = row[11]; // persona 列
    
    // 只分析有消息内容的行
    if (!message || message.toString().trim() === '') continue;
    
    const prompt = `
分析以下用户提交的表单数据，提取关键信息：

用户消息: ${message}
感兴趣的主题: ${topic}
用户画像: ${persona}

请以 JSON 格式返回（确保是有效的 JSON）：
{
  "intent": "购买咨询|技术问题|退款请求|产品反馈|其他",
  "priority": "高|中|低",
  "sentiment": "积极|中性|消极",
  "tags": ["标签1", "标签2"],
  "summary": "一句话总结用户需求"
}
`;
    
    const response = callGeminiAPI(prompt, 0.5);
    if (response) {
      try {
        // 提取 JSON（可能包含在 markdown 代码块中）
        let jsonText = response;
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        }
        
        const analysis = JSON.parse(jsonText);
        
        // 将分析结果写入对应列
        const intentCol = headers.indexOf('ai_intent') + 1 || analysisStartCol;
        events.getRange(i + 2, intentCol, 1, 5).setValues([[
          analysis.intent || '',
          analysis.priority || '',
          analysis.sentiment || '',
          (analysis.tags || []).join(', '),
          analysis.summary || ''
        ]]);
        
        analyzed++;
        Logger.log(`✓ Analyzed row ${i + 2}: ${analysis.summary}`);
      } catch (e) {
        Logger.log(`✗ Failed to parse JSON for row ${i + 2}: ${e.message}`);
        Logger.log(`Response: ${response}`);
      }
    }
    
    // 避免超过 API 配额（免费版每分钟 15 次）
    Utilities.sleep(4000);
    
    // 每次最多处理 10 条，避免超时
    if (analyzed >= 10) break;
  }
  
  Logger.log(`=== Analysis Complete ===`);
  Logger.log(`Analyzed ${analyzed} new submissions`);
}

/**
 * 2. 自动回复生成
 * 
 * 为支持请求自动生成回复草稿
 * 建议：每 2 小时运行一次
 */
function generateRepliesForSupportRequests() {
  const ss = getSpreadsheet_();
  const events = ss.getSheetByName('waitlist_events');
  
  if (!events) {
    Logger.log('Sheet "waitlist_events" not found');
    return;
  }
  
  const lastRow = events.getLastRow();
  if (lastRow < 2) {
    Logger.log('No data to process');
    return;
  }
  
  // 检查是否有回复列
  const headers = events.getRange(1, 1, 1, events.getLastColumn()).getValues()[0];
  const replyColIndex = headers.indexOf('ai_reply_draft');
  
  if (replyColIndex === -1) {
    // 添加回复列
    const newCol = headers.length + 1;
    events.getRange(1, newCol).setValue('ai_reply_draft');
  }
  
  const data = events.getRange(2, 1, lastRow - 1, headers.length).getValues();
  let generated = 0;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const entryPoint = row[7]; // entry_point 列
    
    // 只处理支持请求
    if (entryPoint !== 'support_contact_form') continue;
    
    // 检查是否已生成回复
    const replyCol = headers.indexOf('ai_reply_draft');
    if (replyCol >= 0 && row[replyCol]) continue;
    
    const email = row[1];
    const name = row[2];
    const message = row[10];
    const lang = row[5];
    const topic = row[3];
    
    if (!message || message.toString().trim() === '') continue;
    
    const prompt = `
你是 25Maths 的客服代表。请为以下用户生成一封专业、友好的回复邮件草稿。

用户信息:
- 姓名: ${name || '用户'}
- 邮箱: ${email}
- 语言: ${lang === 'zh-cn' ? '简体中文' : '英文'}
- 感兴趣的主题: ${topic}
- 用户消息: ${message}

回复要求:
1. 使用${lang === 'zh-cn' ? '简体中文' : '英文'}
2. 语气专业但友好
3. 针对用户问题给出具体回答
4. 如果是产品咨询，提供相关产品链接（https://www.25maths.com/cie0580/products.html）
5. 结尾包含 CTA（如邀请查看产品、加入 waitlist 等）
6. 签名使用 "25Maths Team"

请直接返回邮件正文，不需要主题行。
`;
    
    const reply = callGeminiAPI(prompt, 0.7);
    if (reply) {
      // 写入回复列
      const replyColNum = headers.indexOf('ai_reply_draft') + 1 || headers.length + 1;
      events.getRange(i + 2, replyColNum).setValue(reply);
      
      generated++;
      Logger.log(`✓ Generated reply for ${email}`);
    }
    
    Utilities.sleep(4000);
    
    // 每次最多处理 5 条
    if (generated >= 5) break;
  }
  
  Logger.log(`=== Reply Generation Complete ===`);
  Logger.log(`Generated ${generated} reply drafts`);
}

/**
 * 3. 用户画像分析
 * 
 * 分析单个用户的行为数据，生成用户画像
 * @param {string} email - 用户邮箱
 * @returns {object|null} - 用户画像对象
 */
function analyzeUserProfile(email) {
  const ss = getSpreadsheet_();
  const events = ss.getSheetByName('waitlist_events');
  const subscribers = ss.getSheetByName('waitlist_subscribers');
  
  if (!events || !subscribers) {
    Logger.log('Required sheets not found');
    return null;
  }
  
  // 获取订阅者信息
  const subscriberData = subscribers.getDataRange().getValues();
  let subscriber = null;
  
  for (let i = 1; i < subscriberData.length; i++) {
    if (subscriberData[i][0].toLowerCase() === email.toLowerCase()) {
      subscriber = {
        email: subscriberData[i][0],
        first_seen_at: subscriberData[i][1],
        last_seen_at: subscriberData[i][2],
        topics_csv: subscriberData[i][3],
        submit_count: subscriberData[i][9]
      };
      break;
    }
  }
  
  if (!subscriber) {
    Logger.log(`User ${email} not found`);
    return null;
  }
  
  // 获取该用户的所有事件
  const eventsData = events.getDataRange().getValues();
  const userEvents = [];
  
  for (let i = 1; i < eventsData.length; i++) {
    if (eventsData[i][1].toLowerCase() === email.toLowerCase()) {
      userEvents.push({
        submitted_at: eventsData[i][0],
        entry_point: eventsData[i][7],
        topic: eventsData[i][3]
      });
    }
  }
  
  const prompt = `
分析以下用户的行为数据，生成用户画像：

基本信息:
- 首次访问: ${subscriber.first_seen_at}
- 最后访问: ${subscriber.last_seen_at}
- 提交次数: ${subscriber.submit_count}
- 感兴趣的主题: ${subscriber.topics_csv}

历史行为:
${userEvents.map(e => `- ${e.submitted_at}: ${e.entry_point} (${e.topic})`).join('\n')}

请以 JSON 格式返回（确保是有效的 JSON）：
{
  "engagement_level": "高|中|低",
  "purchase_intent": "强|中|弱",
  "preferred_topics": ["主题1", "主题2"],
  "exam_timeline": "紧急（1个月内）|中期（3个月内）|长期（6个月+）",
  "recommended_products": ["产品1", "产品2"],
  "marketing_strategy": "建议的营销策略（1-2句话）"
}
`;
  
  const response = callGeminiAPI(prompt, 0.5);
  if (response) {
    try {
      // 提取 JSON
      let jsonText = response;
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      
      const profile = JSON.parse(jsonText);
      Logger.log(`=== User Profile: ${email} ===`);
      Logger.log(JSON.stringify(profile, null, 2));
      return profile;
    } catch (e) {
      Logger.log('Failed to parse user profile: ' + e.message);
      Logger.log('Response: ' + response);
      return null;
    }
  }
  
  return null;
}

/**
 * 4. 每周洞察报告
 * 
 * 生成过去 7 天的用户行为分析报告
 * 建议：每周一早上 9 点运行
 */
function generateWeeklyInsights() {
  const ss = getSpreadsheet_();
  const events = ss.getSheetByName('waitlist_events');
  const subscribers = ss.getSheetByName('waitlist_subscribers');
  
  if (!events || !subscribers) {
    Logger.log('Required sheets not found');
    return;
  }
  
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // 获取最近一周的数据
  const eventsData = events.getDataRange().getValues();
  const lastWeekEvents = eventsData.filter((row, i) => {
    if (i === 0) return false; // 跳过标题行
    const date = new Date(row[0]);
    return date >= weekAgo;
  });
  
  const subscribersData = subscribers.getDataRange().getValues();
  const newSubscribers = subscribersData.filter((row, i) => {
    if (i === 0) return false;
    const date = new Date(row[1]); // first_seen_at
    return date >= weekAgo;
  });
  
  // 统计主题分布
  const topicCount = {};
  lastWeekEvents.forEach(row => {
    const topic = row[3];
    if (topic) {
      topicCount[topic] = (topicCount[topic] || 0) + 1;
    }
  });
  
  // 统计入口分布
  const entryPointCount = {};
  lastWeekEvents.forEach(row => {
    const entryPoint = row[7];
    if (entryPoint) {
      entryPointCount[entryPoint] = (entryPointCount[entryPoint] || 0) + 1;
    }
  });
  
  // 统计语言分布
  const langCount = {};
  lastWeekEvents.forEach(row => {
    const lang = row[5];
    if (lang) {
      langCount[lang] = (langCount[lang] || 0) + 1;
    }
  });
  
  const prompt = `
分析以下一周（${Utilities.formatDate(weekAgo, 'GMT+8', 'yyyy-MM-dd')} 至 ${Utilities.formatDate(now, 'GMT+8', 'yyyy-MM-dd')}）的用户数据，生成洞察报告：

📊 关键指标:
- 新增订阅者: ${newSubscribers.length}
- 总提交次数: ${lastWeekEvents.length}

📈 主题分布:
${Object.entries(topicCount).map(([k, v]) => `- ${k}: ${v} 次`).join('\n')}

🚪 入口分布:
${Object.entries(entryPointCount).map(([k, v]) => `- ${k}: ${v} 次`).join('\n')}

🌐 语言分布:
${Object.entries(langCount).map(([k, v]) => `- ${k}: ${v} 次`).join('\n')}

请生成一份简洁的洞察报告，包括：

## 📊 关键指标总结
（3-5个要点，突出重要数据）

## 📈 用户行为趋势
（分析用户行为模式，识别趋势）

## 🔥 热门主题和产品需求
（哪些主题最受欢迎？用户最关心什么？）

## 💡 可行动的建议
（2-3条具体的营销或产品建议）

使用 Markdown 格式，适合直接发送给团队。使用简体中文。
`;
  
  const report = callGeminiAPI(prompt, 0.5);
  
  if (report) {
    Logger.log('=== 📊 25Maths Weekly Insights Report ===');
    Logger.log(report);
    
    // 可选：将报告发送到邮箱
    // const recipient = 'your-email@example.com';
    // MailApp.sendEmail({
    //   to: recipient,
    //   subject: `25Maths Weekly Insights - ${Utilities.formatDate(now, 'GMT+8', 'yyyy-MM-dd')}`,
    //   body: report
    // });
    
    return report;
  }
  
  return null;
}

/**
 * 5. 垃圾邮件检测
 * 
 * 检测最近提交中的垃圾邮件
 * 建议：每 6 小时运行一次
 */
function detectSpamInRecentSubmissions() {
  const ss = getSpreadsheet_();
  const events = ss.getSheetByName('waitlist_events');
  
  if (!events) {
    Logger.log('Sheet "waitlist_events" not found');
    return;
  }
  
  const lastRow = events.getLastRow();
  if (lastRow < 2) {
    Logger.log('No data to check');
    return;
  }
  
  // 检查是否有垃圾邮件标记列
  const headers = events.getRange(1, 1, 1, events.getLastColumn()).getValues()[0];
  if (!headers.includes('spam_flag')) {
    events.getRange(1, headers.length + 1).setValue('spam_flag');
  }
  
  const data = events.getRange(2, 1, lastRow - 1, headers.length).getValues();
  const spamDetected = [];
  let checked = 0;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // 检查是否已标记
    const spamCol = headers.indexOf('spam_flag');
    if (spamCol >= 0 && row[spamCol]) continue;
    
    const email = row[1];
    const name = row[2];
    const message = row[10];
    
    // 计算该邮箱的提交次数
    const submitCount = data.filter(r => r[1] === email).length;
    
    const prompt = `
分析以下提交是否为垃圾邮件或异常行为：

邮箱: ${email}
姓名: ${name}
消息: ${message}
该邮箱提交次数: ${submitCount}

请以 JSON 格式返回（确保是有效的 JSON）：
{
  "is_spam": true/false,
  "confidence": 0-100,
  "reason": "判断理由",
  "action": "接受|标记审核|拒绝"
}

判断标准：
- 邮箱格式异常（如临时邮箱、明显假邮箱）
- 姓名包含垃圾关键词或明显随机字符
- 消息内容无意义、包含广告、或明显是机器人生成
- 同一邮箱短时间内大量提交（超过 5 次可疑）
- 如果消息为空或正常，通常不是垃圾邮件
`;
    
    const response = callGeminiAPI(prompt, 0.3);
    if (response) {
      try {
        // 提取 JSON
        let jsonText = response;
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        }
        
        const analysis = JSON.parse(jsonText);
        
        if (analysis.is_spam && analysis.confidence > 70) {
          spamDetected.push({
            row: i + 2,
            email: email,
            confidence: analysis.confidence,
            reason: analysis.reason
          });
          
          // 标记为垃圾邮件
          const spamColNum = headers.indexOf('spam_flag') + 1 || headers.length + 1;
          events.getRange(i + 2, spamColNum).setValue(`SPAM (${analysis.confidence}%)`);
          
          Logger.log(`🚫 SPAM detected at row ${i + 2}: ${email} (${analysis.confidence}% confidence)`);
          Logger.log(`   Reason: ${analysis.reason}`);
        } else {
          // 标记为正常
          const spamColNum = headers.indexOf('spam_flag') + 1 || headers.length + 1;
          events.getRange(i + 2, spamColNum).setValue('OK');
        }
        
        checked++;
      } catch (e) {
        Logger.log(`Failed to parse spam detection for row ${i + 2}: ${e.message}`);
      }
    }
    
    Utilities.sleep(4000);
    
    // 每次最多检查 10 条
    if (checked >= 10) break;
  }
  
  Logger.log(`=== Spam Detection Complete ===`);
  Logger.log(`Checked ${checked} submissions`);
  Logger.log(`Detected ${spamDetected.length} spam submissions`);
  
  return spamDetected;
}

// ========== 定时触发器设置 ==========

/**
 * 设置定时触发器
 * 
 * 运行此函数一次即可设置所有定时任务
 * 需要授权访问 Google Sheets 和 UrlFetchApp
 */
function setupTriggers() {
  // 删除现有触发器（避免重复）
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  
  // 每小时分析新提交
  ScriptApp.newTrigger('analyzeAndTagNewSubmissions')
    .timeBased()
    .everyHours(1)
    .create();
  
  Logger.log('✓ Set up trigger: analyzeAndTagNewSubmissions (every 1 hour)');
  
  // 每 2 小时生成回复草稿
  ScriptApp.newTrigger('generateRepliesForSupportRequests')
    .timeBased()
    .everyHours(2)
    .create();
  
  Logger.log('✓ Set up trigger: generateRepliesForSupportRequests (every 2 hours)');
  
  // 每周一早上 9 点生成每周报告
  ScriptApp.newTrigger('generateWeeklyInsights')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();
  
  Logger.log('✓ Set up trigger: generateWeeklyInsights (Monday 9 AM)');
  
  // 每 6 小时检测垃圾邮件
  ScriptApp.newTrigger('detectSpamInRecentSubmissions')
    .timeBased()
    .everyHours(6)
    .create();
  
  Logger.log('✓ Set up trigger: detectSpamInRecentSubmissions (every 6 hours)');
  
  Logger.log('=== All triggers set up successfully! ===');
}

/**
 * 删除所有触发器
 */
function removeTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  Logger.log(`Removed ${triggers.length} triggers`);
}

// ========== 测试函数 ==========

/**
 * 测试 Gemini API 连接
 */
function testGeminiAPI() {
  const response = callGeminiAPI('请用一句话介绍 Google Gemini API。', 0.7);
  if (response) {
    Logger.log('✓ Gemini API connection successful!');
    Logger.log('Response: ' + response);
  } else {
    Logger.log('✗ Gemini API connection failed');
  }
}

/**
 * 测试用户画像分析
 * 
 * 使用方法：将 'test@example.com' 替换为实际的用户邮箱
 */
function testUserProfileAnalysis() {
  const email = 'test@example.com'; // 替换为实际邮箱
  const profile = analyzeUserProfile(email);
  
  if (profile) {
    Logger.log('✓ User profile analysis successful!');
  } else {
    Logger.log('✗ User profile analysis failed');
  }
}

/**
 * 手动运行一次完整的分析流程
 */
function runFullAnalysis() {
  Logger.log('=== Starting Full Analysis ===');
  
  Logger.log('\n1. Analyzing and tagging new submissions...');
  analyzeAndTagNewSubmissions();
  
  Logger.log('\n2. Generating replies for support requests...');
  generateRepliesForSupportRequests();
  
  Logger.log('\n3. Detecting spam...');
  detectSpamInRecentSubmissions();
  
  Logger.log('\n=== Full Analysis Complete ===');
}
