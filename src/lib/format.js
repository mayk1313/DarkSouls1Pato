// Converte o interval do Postgres ('04:30:42', '00:10:04.443', '1 day 02:00:00') em segundos
export function toSeconds(interval) {
  const m = /^(?:(\d+) days? )?(\d+):(\d+):(\d+(?:\.\d+)?)$/.exec(interval ?? '')
  if (!m) return 0
  return Number(m[1] || 0) * 86400 + Number(m[2]) * 3600 + Number(m[3]) * 60 + Number(m[4])
}

export function formatDuration(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  const pad = (n) => String(n).padStart(2, '0')
  return h ? `${h}h ${pad(m)}m` : `${m}m ${pad(s)}s`
}
