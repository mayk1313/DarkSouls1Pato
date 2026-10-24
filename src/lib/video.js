// rawgit.hack para Codeberg: cb.githack.com usa a origem codeberg.org.
// Troque VITE_CODEBERG_OWNER caso os repositórios estejam em outra conta.
const BRANCH = import.meta.env.VITE_CODEBERG_BRANCH || 'main'

export const REPOSITORIES = {
  1: { owner: 'rato001', repository: 'mouse' },
  2: { owner: 'gato002', repository: 'kitty' },
  3: { owner: 'Pato003', repository: 'ducky' },
  4: { owner: 'Mato004', repository: 'bush' },
  5: { owner: 'jato005', repository: 'jet' },
  6: { owner: 'Fato006', repository: 'fact' },
  7: { owner: 'tato007', repository: 'tact' },
}

function number(value, fallback = 1) {
  if (typeof value === 'number' && value > 0) return value
  if (typeof value === 'string') {
    const direct = Number(value)
    if (direct > 0) return direct
    const suffix = value.match(/(\d+)$/)
    if (suffix) return Number(suffix[1])
  }
  return fallback
}

function scalar(value) {
  return typeof value === 'string' || typeof value === 'number' ? value : undefined
}

export function episodeValue(death, episode = {}) {
  return number(death.episode_number ?? scalar(death.episode) ?? episode.number ?? episode.episode ?? episode.id)
}

export function seasonValue(death, episode = {}) {
  return number(death.season_number ?? death.season ?? episode.season_number ?? episode.season ?? episode.live_id, 1)
}

function deathClipPath(death, episode = {}) {
  const episodeNumber = episodeValue(death, episode)
  const repositoryNumber = number(episode.repository ?? episode.repo ?? death.repository ?? death.repo, episodeNumber)
  const source = REPOSITORIES[repositoryNumber] || REPOSITORIES[episodeNumber]
  const deathPosition = number(death.position ?? death.death_number ?? death.id, 0)
  if (!source || !deathPosition) return null

  return { source, path: `temporada-${seasonValue(death, episode)}/ep-${episodeNumber}/death-${deathPosition}.mp4` }
}

export function deathVideoUrl(death, episode = {}) {
  const clip = deathClipPath(death, episode)
  if (!clip) return ''
  return `https://cb.githack.com/${clip.source.owner}/${clip.source.repository}/raw/branch/${BRANCH}/${clip.path}`
}

export function deathCodebergUrl(death, episode = {}) {
  const clip = deathClipPath(death, episode)
  if (!clip) return ''
  return `https://codeberg.org/${clip.source.owner}/${clip.source.repository}/raw/branch/${BRANCH}/${clip.path}`
}

export function deathLiveUrl(death, episode = {}) {
  return death.live_url ?? death.liveUrl ?? episode.live_url ?? episode.liveUrl ?? episode.url ?? deathVideoUrl(death, episode)
}

export function liveEmbedUrl(liveUrl, start = 0, end, autoplay = true) {
  try {
    const url = new URL(liveUrl)
    const host = url.hostname.replace('www.', '')
    const id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') ?? url.pathname.split('/').filter(Boolean).pop()
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') {
      const startAt = Math.max(0, Math.floor(start))
      const endAt = Number.isFinite(Number(end)) ? `&end=${Math.max(startAt + 1, Math.floor(end))}` : ''
      return `https://www.youtube.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&enablejsapi=1&playsinline=1&start=${startAt}${endAt}`
    }
  } catch { /* URLs de vídeo diretas continuam utilizáveis fora de iframe */ }
  return liveUrl
}

export function liveThumbnailUrl(liveUrl) {
  try {
    const url = new URL(liveUrl)
    const host = url.hostname.replace('www.', '')
    const id = host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v') ?? url.pathname.split('/').filter(Boolean).pop()
    if ((host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be') && id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  } catch { /* episódios sem URL pública usam o card sem imagem */ }
  return ''
}

export function episodeLiveUrl(episode = {}) {
  return episode.live_url ?? episode.liveUrl ?? episode.url ?? ''
}

export async function originalVideoTitle(episode = {}) {
  const liveUrl = episodeLiveUrl(episode)
  if (!liveUrl) return ''
  try {
    const response = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(liveUrl)}`)
    if (!response.ok) return ''
    const data = await response.json()
    return typeof data.title === 'string' ? data.title : ''
  } catch { /* links indisponíveis mantêm o título cadastrado */ }
  return ''
}
