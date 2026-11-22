/**
 * Nghiên cứu ẩn danh — Google Apps Script gắn với một Google Sheet.
 * Dán toàn bộ tệp này vào Extensions > Apps Script của trang tính.
 */

const HEADERS = [
  'timestamp',
  'clientId',
  'day',
  'school',
  'grade',
  'gender',
  'score',
  'level',
  'focus',
  'patience',
  'switchUrge',
  'phone',
  'reasons',
  'plan',
]

const LOCK_TIMEOUT_MS = 30000

function doPost(e) {
  const lock = LockService.getScriptLock()
  try {
    lock.waitLock(LOCK_TIMEOUT_MS)

    const payload = JSON.parse(e.postData.contents)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()

    // Trang tính trống: ghi dòng tiêu đề trước.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS.slice())
    }

    const row = HEADERS.map(function (key) {
      const value = payload ? payload[key] : null
      return value === undefined || value === null ? '' : value
    })
    sheet.appendRow(row)

    return ContentService.createTextOutput('ok')
  } catch (err) {
    return ContentService.createTextOutput('error')
  } finally {
    try {
      lock.releaseLock()
    } catch (err) {
      // Không làm gì thêm nếu khóa chưa được giữ.
    }
  }
}

function doGet(e) {
  const wantsSummary = e && e.parameter && e.parameter.summary

  if (!wantsSummary) {
    return ContentService.createTextOutput('ok')
  }

  try {
    return ContentService
      .createTextOutput(JSON.stringify(buildSummary()))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService.createTextOutput('error')
  }
}

function buildSummary() {
  const records = readRecords()
  const day1Rows = records.filter(function (record) {
    return toNumber(record.day) === 1
  })
  const day7Rows = records.filter(function (record) {
    return toNumber(record.day) === 7
  })

  const day1Scores = scoresOf(day1Rows)
  const day7Scores = scoresOf(day7Rows)

  // Mỗi học sinh: lấy điểm ở dòng day 1 và day 7 mới nhất.
  const latestDay1 = latestScores(records, 1)
  const latestDay7 = latestScores(records, 7)

  const deltas = []
  Object.keys(latestDay1).forEach(function (clientId) {
    if (latestDay7[clientId]) {
      deltas.push(latestDay1[clientId].score - latestDay7[clientId].score)
    }
  })

  return {
    count: records.length,
    day1Count: day1Rows.length,
    day7Count: day7Rows.length,
    avgDay1: meanRounded(day1Scores),
    avgDay7: meanRounded(day7Scores),
    pairs: deltas.length,
    avgDelta: meanRounded(deltas),
  }
}

function readRecords() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet()
  if (sheet.getLastRow() === 0) return []

  const values = sheet.getDataRange().getValues()
  if (!values || values.length === 0) return []

  const firstRow = values[0].map(function (cell) {
    return String(cell).trim()
  })
  const hasHeader = HEADERS.every(function (key) {
    return firstRow.indexOf(key) !== -1
  })

  const keys = hasHeader ? firstRow : HEADERS
  const body = hasHeader ? values.slice(1) : values
  const records = []

  body.forEach(function (row) {
    const isBlank = !row.some(function (cell) {
      return cell !== '' && cell !== null && cell !== undefined
    })
    if (isBlank) return

    const record = {}
    HEADERS.forEach(function (key) {
      let index = keys.indexOf(key)
      if (index < 0) index = HEADERS.indexOf(key)
      record[key] = row[index]
    })
    records.push(record)
  })

  return records
}

function latestScores(records, day) {
  const latest = {}
  records.forEach(function (record, order) {
    if (toNumber(record.day) !== day) return

    const clientId = record.clientId === null || record.clientId === undefined
      ? ''
      : String(record.clientId)
    if (!clientId) return

    const score = toNumber(record.score)
    if (!isFinite(score)) return

    const parsedTime = Date.parse(record.timestamp)
    const time = isFinite(parsedTime) ? parsedTime : order

    const previous = latest[clientId]
    if (!previous || time >= previous.time) {
      latest[clientId] = { score: score, time: time }
    }
  })
  return latest
}

function scoresOf(records) {
  const scores = []
  records.forEach(function (record) {
    const score = toNumber(record.score)
    if (isFinite(score)) scores.push(score)
  })
  return scores
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return NaN
  return Number(value)
}

function meanRounded(values) {
  if (!values.length) return null
  let total = 0
  values.forEach(function (value) {
    total += value
  })
  return Math.round((total / values.length) * 10) / 10
}
