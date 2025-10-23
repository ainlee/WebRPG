// 日誌模組 v1.0
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
}

let currentLogLevel = LogLevel.DEBUG

export function log (message, level = 'INFO') {
  const timestamp = new Date().toISOString()
  const formattedMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`
  switch (level.toUpperCase()) { // eslint-disable-line default-case
    case 'ERROR':
      console.error(formattedMessage) // eslint-disable-line no-console
      break
    case 'WARN':
      console.warn(formattedMessage) // eslint-disable-line no-console
      break
    case 'DEBUG':
      if (currentLogLevel <= LogLevel.DEBUG) {
        // debug等級日誌僅在開發模式輸出
        if (process.env.NODE_ENV === 'development') {
          console.debug(formattedMessage) // eslint-disable-line no-console, no-trailing-spaces
        }
      }
      break
    default:
      // 預設日誌輸出
      console.log(formattedMessage) // eslint-disable-line no-console
  }
}

/**
 * 設定日誌層級
 * @param {'DEBUG'|'INFO'|'WARN'|'ERROR'} level - 要設定的日誌層級
 */
export function setLogLevel (level) {
  currentLogLevel = LogLevel[level.toUpperCase()] || LogLevel.INFO
}

// 單元測試用導出
export const _test = {
  LogLevel,
  currentLogLevel
}