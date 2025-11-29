/**
 * Composable for managing environment variables
 *
 * Behavior:
 * - Prefer client-exposed `import.meta.env` values (checks common Vite prefixes)
 * - Attempt to fetch a `/.env` file at runtime (useful in dev or if you copy .env to public/)
 * - Exposes reactive `serverUrl` and `accessToken` refs and helpers
 */
import { ref } from 'vue'

function parseDotEnv(text) {
  const out = {}
  const lines = text.split(/\r?\n/)
  for (let line of lines) {
    line = line.trim()
    if (!line || line.startsWith('#')) continue
    // support: export KEY=value
    if (line.startsWith('export ')) line = line.replace(/^export\s+/, '')
    const idx = line.indexOf('=')
    if (idx === -1) continue
    let key = line.substring(0, idx).trim()
    let val = line.substring(idx + 1).trim()
    // remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1)
    }
    out[key] = val
  }
  return out
}

export function useEnv() {
  const serverUrl = ref('')
  const accessToken = ref('')
  let parsedEnv = {}

  const getFromImportMeta = (key) => {
    // check exact key, VITE_ prefixed and upper-case variants
    return import.meta.env[key]
      ?? import.meta.env['VITE_' + key]
      ?? import.meta.env[key.toUpperCase()]
      ?? import.meta.env['VITE_' + key.toUpperCase()]
      ?? parsedEnv[key]
      ?? parsedEnv['VITE_' + key]
      ?? parsedEnv[key.toUpperCase()]
      ?? parsedEnv['VITE_' + key.toUpperCase()]
  }

  const get = (key, defaultValue = '') => {
    return getFromImportMeta(key) ?? defaultValue
  }

  const getString = (key, defaultValue = '') => {
    return get(key, defaultValue)
  }

  const getBoolean = (key, defaultValue = false) => {
    const value = get(key)
    if (value === '') return defaultValue
    return value === 'true' || value === '1'
  }

  const getNumber = (key, defaultValue = 0) => {
    const value = get(key)
    if (value === '') return defaultValue
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
  }



  // Try to load /.env at runtime to fill missing values.
  // Note: This only works if a `.env` file is served by the dev server or copied to `public/`.
  const loadEnv = async () => {
    try {
      const res = await fetch('/.env')
      if (!res.ok) return
      const text = await res.text()
      const parsed = parseDotEnv(text)
      // store parsed values so getFromImportMeta can read them later
      parsedEnv = parsed
      // only set when values are empty so import.meta.env has priority
      if (!serverUrl.value) serverUrl.value = parsed.VITE_AGUI_SERVER_URL || parsed.AGUI_SERVER_URL || ''
      if (!accessToken.value) accessToken.value = parsed.VITE_ACCESS_TOKEN || parsed.USER_ACCESS_TOKEN || ''
    } catch (e) {
      // ignore — fetching .env is best-effort
    }
  }

  // kick off loadEnv but don't block (best-effort)
//   loadEnv()

  return {
    get,
    getString,
    getBoolean,
    getNumber,
    serverUrl,
    accessToken,
    loadEnv
  }
}
