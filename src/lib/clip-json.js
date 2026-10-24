import { deathVideoUrl } from './video'

const DATA_URL_PREFIX = 'data:application/json;charset=utf-8,'

function exportRecord(death) {
  return {
    ...death,
    cause: death.cause ?? null,
    episode: death.episode ?? null,
    video_url: deathVideoUrl(death, death.episode),
  }
}

export function savedClipsExport(deaths) {
  return {
    format: 'pato7s-saved-clips',
    version: 1,
    exported_at: new Date().toISOString(),
    clips: deaths.map(exportRecord),
  }
}

export function clipExport(death) {
  return {
    format: 'pato7s-clip',
    version: 1,
    exported_at: new Date().toISOString(),
    clip: exportRecord(death),
  }
}

export function jsonDataUrl(data) {
  return `${DATA_URL_PREFIX}${encodeURIComponent(JSON.stringify(data, null, 2))}`
}

export function clipJsonFilename(death) {
  return `pato7s-clipe-${death?.id ?? 'sem-id'}.json`
}
