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
  var topic = (params.topic || '').trim();
  var moduleName = (params.module || '').trim();
  var lang = (params.lang || '').trim();
  var sourcePage = (params.source_page || '').trim();
  var entryPoint = (params.entry_point || '').trim();
  var product = (params.product || '').trim();
  var subject = (params._subject || '').trim();
  var redirectUrl = (params.redirect_url || 'https://www.25maths.com/thanks.html').trim();
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
    'topic',
    'module',
    'lang',
    'source_page',
    'entry_point',
    'product',
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
    email,
    topic,
    moduleName,
    lang,
    sourcePage,
    entryPoint,
    product,
    subject,
    upsert.isNewEmail ? '1' : '0',
    upsert.isNewTopic ? '1' : '0',
    redirectUrl,
    (e && e.postData && e.postData.type) ? e.postData.type : ''
  ]);

  return redirectHtml(redirectUrl + '?status=ok');
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
  var html = '' +
    '<!doctype html>' +
    '<html><head><meta charset="utf-8">' +
    '<meta http-equiv="refresh" content="0; url=' + safeUrl + '"></head>' +
    '<body>Redirecting...</body></html>';

  return HtmlService.createHtmlOutput(html);
}
