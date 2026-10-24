<script setup>
import { computed } from 'vue'
import { episodeValue, liveThumbnailUrl, seasonValue } from '../lib/video'

const props = defineProps({ episodes: { type: Array, default: () => [] }, titles: { type: Map, default: () => new Map() }, deaths: { type: Array, default: () => [] } })
const emit = defineEmits(['open'])

const seasons = computed(() => {
  const deathsByEpisode = new Map()
  for (const death of props.deaths) deathsByEpisode.set(String(death.episode_id), (deathsByEpisode.get(String(death.episode_id)) ?? 0) + 1)
  const groups = new Map()
  for (const episode of props.episodes) {
    const season = seasonValue({}, episode)
    const entries = groups.get(season) ?? []
    entries.push({
      ...episode,
      deathCount: deathsByEpisode.get(String(episode.id)) ?? 0,
      thumbnail: episode.thumbnail_url ?? episode.thumbnail ?? liveThumbnailUrl(episode.live_url ?? episode.liveUrl ?? episode.url),
    })
    groups.set(season, entries)
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([season, episodes]) => ({ season, episodes: episodes.sort((a, b) => episodeValue({}, a) - episodeValue({}, b)) }))
})
</script>

<template>
  <section class="episodes-page">
    <header class="section-heading"><div><h2>Episódios</h2></div></header>
    <div v-if="!seasons.length" class="state-message">Nenhum episódio disponível.</div>
    <section v-for="group in seasons" :key="group.season" class="season-group">
      <h3>Temporada {{ group.season }}</h3>
      <div class="episode-grid">
        <button v-for="episode in group.episodes" :key="episode.id" class="episode-card" :aria-label="`Abrir episódio ${episodeValue({}, episode)}`" @click="emit('open', episode)">
          <img v-if="episode.thumbnail" class="episode-thumb" :src="episode.thumbnail" alt="" />
          <div><span class="episode-kicker">EP {{ episodeValue({}, episode) }}</span><h4>{{ titles.get(String(episode.id)) ?? episode.name ?? episode.title ?? `Episódio ${episodeValue({}, episode)}` }}</h4></div>
          <div class="episode-card-footer"><span>{{ episode.deathCount }} {{ episode.deathCount === 1 ? 'morte' : 'mortes' }}</span></div>
        </button>
      </div>
    </section>
  </section>
</template>
