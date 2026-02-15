/**
 * Waitlist collector for 25Maths (Google Apps Script Web App).
 *
 * Setup:
 * 1) Create a Google Sheet.
 * 2) Add Script Property: SPREADSHEET_ID = your sheet id.
 * 3) Deploy as Web App (Execute as: Me, Access: Anyone).
 */

function doPost(e) {
  var params = (e && e.parameter) ? e.parameter : {};

  var emailRaw = (params.email || '').trim();
  var email = emailRaw.toLowerCase();
  var name = (params.name || '').trim();
  var topic = (params.topic || '').trim();
  var moduleName = (params.module || '').trim();
  var lang = (params.lang || '').trim();
  var sourcePage = (params.source_page || '').trim();
  var entryPoint = (params.entry_point || '').trim();
  var product = (params.product || '').trim();
  var ticketSubject = (params.subject || '').trim();
  var message = (params.message || '').trim();
  var persona = (params.persona || '').trim();
  var examBoardInterest = (params.exam_board_interest || '').trim();
  var targetExamSession = (params.target_exam_session || '').trim();
  var consentUpdates = (params.consent_updates || '').trim();
  var subject = (params._subject || '').trim();
  var redirectUrl = normalizeRedirectUrl_((params.redirect_url || 'https://www.25maths.com/thanks.html').trim());
  var now = new Date();
  var nowIso = now.toISOString();

  if (!isValidEmail(email)) {
    return redirectHtml(redirectUrl + '?status=invalid_email');
  }

  var ss = getSpreadsheet_();
  var subscribers = getOrCreateSheet_(ss, 'waitlist_subscribers', [
    'email',
    'first_seen_at',
    'last_seen_at',
    'topics_csv',
    'topics_count',
    'last_topic',
    'last_lang',
    'last_source_page',
    'last_entry_point',
    'submit_count',
    'status'
  ]);

  var events = getOrCreateSheet_(ss, 'waitlist_events', [
    'submitted_at',
    'email',
    'name',
    'topic',
    'module',
    'lang',
    'source_page',
    'entry_point',
    'product',
    'ticket_subject',
    'message',
    'persona',
    'exam_board_interest',
    'target_exam_session',
    'consent_updates',
    'subject',
    'is_new_email',
    'is_new_topic',
    'redirect_url',
    'user_agent'
  ]);

  var upsert = upsertSubscriber_(subscribers, {
    email: email,
    topic: topic,
    lang: lang,
    sourcePage: sourcePage,
    entryPoint: entryPoint,
    nowIso: nowIso
  });

  events.appendRow([
    nowIso,
    safeCell_(email),
    safeCell_(name),
    safeCell_(topic),
    safeCell_(moduleName),
    safeCell_(lang),
    safeCell_(sourcePage),
    safeCell_(entryPoint),
    safeCell_(product),
    safeCell_(ticketSubject),
    safeCell_(message),
    safeCell_(persona),
    safeCell_(examBoardInterest),
    safeCell_(targetExamSession),
    safeCell_(consentUpdates),
    safeCell_(subject),
    upsert.isNewEmail ? '1' : '0',
    upsert.isNewTopic ? '1' : '0',
    redirectUrl,
    (e && e.postData && e.postData.type) ? e.postData.type : ''
  ]);

  return redirectHtml(redirectUrl + '?status=ok');
}

function normalizeRedirectUrl_(url) {
  var fallback = 'https://www.25maths.com/thanks.html';
  if (!url) return fallback;
  if (/^https:\/\/(www\.)?25maths\.com\//i.test(url)) return url;
  return fallback;
}

function safeCell_(value) {
  var text = String(value || '');
  if (/^[=+\-@]/.test(text)) {
    return "'" + text;
  }
  return text;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) {
    throw new Error('Missing Script Property: SPREADSHEET_ID');
  }
  return SpreadsheetApp.openById(id);
}

function getOrCreateSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    var firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    var isEmpty = firstRow.join('').trim() === '';
    if (isEmpty) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  return sheet;
}

function upsertSubscriber_(sheet, input) {
  var lastRow = sheet.getLastRow();
  var isNewEmail = true;
  var isNewTopic = true;

  if (lastRow >= 2) {
    var range = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
    for (var i = 0; i < range.length; i++) {
      if ((range[i][0] || '').toString().toLowerCase() === input.email) {
        isNewEmail = false;

        var existingTopics = (range[i][3] || '').toString()
          .split(',')
          .map(function (t) { return t.trim(); })
          .filter(function (t) { return t; });

        if (existingTopics.indexOf(input.topic) !== -1) {
          isNewTopic = false;
        } else if (input.topic) {
          existingTopics.push(input.topic);
        }

        var submitCount = Number(range[i][9] || 0) + 1;
        var rowIndex = i + 2;

        sheet.getRange(rowIndex, 3, 1, 8).setValues([[
          input.nowIso,
          existingTopics.join(', '),
          existingTopics.length,
          input.topic,
          input.lang,
          input.sourcePage,
          input.entryPoint,
          submitCount
        ]]);

        return { isNewEmail: false, isNewTopic: isNewTopic };
      }
    }
  }

  var topics = input.topic ? [input.topic] : [];

  sheet.appendRow([
    input.email,
    input.nowIso,
    input.nowIso,
    topics.join(', '),
    topics.length,
    input.topic,
    input.lang,
    input.sourcePage,
    input.entryPoint,
    1,
    'active'
  ]);

  return { isNewEmail: isNewEmail, isNewTopic: isNewTopic };
}

function redirectHtml(url) {
  var safeUrl = url || 'https://www.25maths.com/thanks.html';
  var escaped = safeUrl.replace(/"/g, '&quot;');
  var html = '' +
    '<!doctype html>' +
    '<html><head><meta charset="utf-8"><base target="_top"></head>' +
    '<body>' +
    '<script>try{top.location.replace("' + escaped + '");}catch(e){window.location.replace("' + escaped + '");}</script>' +
    '<noscript><meta http-equiv="refresh" content="0; url=' + escaped + '"></noscript>' +
    '<a href="' + escaped + '">Continue</a>' +
    '</body></html>';

  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
