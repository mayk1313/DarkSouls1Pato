import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { toSeconds } from '../lib/format'

const top = (entries, n) => [...entries].sort((a, b) => b.value - a.value).slice(0, n)

export function useData() {
  const causes = ref([])
  const deaths = ref([])
  const episodes = ref([])
  const loading = ref(true)
  const error = ref(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      const results = await Promise.all([
        supabase.from('death_causes').select('*'),
        supabase.from('deaths').select('*'),
        supabase.from('episodes').select('*'),
      ])
      const failed = results.find((r) => r.error)
      if (failed) throw failed.error
      ;[causes.value, deaths.value, episodes.value] = results.map((r) => r.data)
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  const enemies = computed(() => {
    const counts = new Map()
    for (const d of deaths.value) counts.set(d.cause_id, (counts.get(d.cause_id) || 0) + 1)
    return causes.value.map((c) => ({
      ...c,
      name: c.detail ?? c.type,
      deaths: counts.get(c.id) || 0,
    }))
  })

  const deathsByCause = computed(() => {
    const episodesById = new Map(episodes.value.map((episode) => [String(episode.id), episode]))
    const causesById = new Map(causes.value.map((cause) => [cause.id, cause]))
    const grouped = new Map()
    for (const death of deaths.value) {
      const episode = episodesById.get(String(death.episode_id)) ?? {}
      const record = { ...death, episode, cause: causesById.get(death.cause_id) }
      const items = grouped.get(death.cause_id) ?? []
      items.push(record)
      grouped.set(death.cause_id, items)
    }
    return grouped
  })

  const deathRecords = computed(() =>
    [...deathsByCause.value.values()].flat().sort((a, b) => a.id - b.id),
  )

  const stats = computed(() => {
    const byType = new Map()
    for (const e of enemies.value) byType.set(e.type, (byType.get(e.type) || 0) + e.deaths)

    const dying = deaths.value.reduce((sum, d) => {
      const len = toSeconds(d.clip_end) - toSeconds(d.clip_start)
      return d.clip_start && d.clip_end && len > 0 ? sum + len : sum
    }, 0)

    return {
      totalDeaths: deaths.value.length,
      liveSeconds: episodes.value.reduce((sum, e) => sum + toSeconds(e.duration), 0),
      dyingSeconds: dying,
      topCauses: top([...byType].map(([label, value]) => ({ label, value })), 3),
      topEnemies: top(
        enemies.value
          .filter((e) => e.detail)
          .map((e) => ({ label: e.name, value: e.deaths, image: e.image_url })),
        5,
      ),
    }
  })

  return { enemies, stats, deathsByCause, deathRecords, episodes, loading, error, reload: load }
}
